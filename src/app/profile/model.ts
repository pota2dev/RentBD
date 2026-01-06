import { NextRequest } from 'next/server';
import { UserRole } from '@prisma/client';
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';

import { prisma } from '@/lib/prisma';

export interface ProfileData {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    role: 'TENANT' | 'LANDLORD' | 'ADMIN';
    Tenant?: {
        bio: string | null;
        occupation: string | null;
    };
    Landlord?: {
        bio: string | null;
        businessName: string | null;
    };
    subscriptionPlan?: string;
    imageUrl?: string;
}

const getUserProfile = async (userId: string) => {
    return await prisma.user.findUnique({
        where: { id: userId },
        include: {
            Tenant: true,
            Landlord: true,
        },
    });
};

const createProfile = async (userId: string, email: string, role: UserRole = UserRole.TENANT) => {
    // initialize Clerk metadata if needed
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
        publicMetadata: {
            role: role
        }
    });

    return await prisma.user.upsert({
        where: { id: userId },
        create: {
            id: userId,
            supabaseAuthId: userId,
            ...(role === UserRole.LANDLORD
                ? { Landlord: { create: {} } }
                : { Tenant: { create: {} } }
            )
        },
        update: {},
        include: {
            Tenant: true,
            Landlord: true,
        }
    });
};

const updateTenantProfile = async (userId: string, data: {
    bio?: string;
    occupation?: string;
}) => {
    return await prisma.user.update({
        where: { id: userId },
        data: {
            Tenant: {
                upsert: {
                    create: {
                        bio: data.bio,
                        occupation: data.occupation,
                    },
                    update: {
                        bio: data.bio,
                        occupation: data.occupation,
                    }
                }
            }
        },
        include: { Tenant: true }
    });
};

const updateLandlordProfile = async (userId: string, data: {
    bio?: string;
    businessName?: string;
}) => {
    return await prisma.user.update({
        where: { id: userId },
        data: {
            Landlord: {
                upsert: {
                    create: {
                        bio: data.bio,
                        businessName: data.businessName,
                    },
                    update: {
                        bio: data.bio,
                        businessName: data.businessName,
                    }
                }
            }
        },
        include: { Landlord: true }
    });
};

const switchUserRole = async (userId: string, newRole: UserRole) => {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
        publicMetadata: {
            role: newRole
        }
    });

    return await prisma.user.update({
        where: { id: userId },
        data: {
            ...(newRole === UserRole.LANDLORD ? {
                Landlord: {
                    upsert: {
                        create: {},
                        update: {}
                    }
                }
            } : {}),
            ...(newRole === UserRole.TENANT ? {
                Tenant: {
                    upsert: {
                        create: {},
                        update: {}
                    }
                }
            } : {})
        },
        include: { Tenant: true, Landlord: true }
    });
};

const getAuthenticatedUserId = async (): Promise<string | null> => {
    const { userId } = await auth();
    return userId;
};

export const getProfileController = async () => {
    try {
        const userId = await getAuthenticatedUserId();
        if (!userId) {
            return { error: 'Unauthorized', status: 401 };
        }

        const clerkUser = await currentUser();
        if (!clerkUser) {
            return { error: 'Clerk user not found', status: 404 };
        }

        let user = await getUserProfile(userId);

        if (!user) {
            console.log('Creating new user from Clerk data...');
            const email = clerkUser.emailAddresses[0]?.emailAddress || '';
            const role = (clerkUser.publicMetadata.role as UserRole) || UserRole.TENANT;
            
            try {
                user = await createProfile(userId, email, role);
            } catch (createError) {
                console.error('Error creating user:', createError);
                 // Handle race condition if user created in parallel
                 user = await getUserProfile(userId);
                 if (!user) {
                     return { error: 'Failed to create user profile', status: 500 };
                 }
            }
        }

        const { has } = await auth();
        const isPro = has ? has({ plan: "pro" }) : false;
        const subscriptionPlan = isPro ? 'pro' : 'free';
        
        const role = (clerkUser.publicMetadata.role as 'TENANT' | 'LANDLORD' | 'ADMIN') || 'TENANT';

        const profileData: ProfileData = {
            id: user.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            phoneNumber: clerkUser.phoneNumbers[0]?.phoneNumber || null,
            imageUrl: clerkUser.imageUrl,
            role: role,
            subscriptionPlan,
            Tenant: user.Tenant ? {
                bio: user.Tenant.bio,
                occupation: user.Tenant.occupation
            } : undefined,
            Landlord: user.Landlord ? {
                bio: user.Landlord.bio,
                businessName: user.Landlord.businessName
            } : undefined
        };

        return { data: profileData, status: 200 };
    } catch (error) {
        console.error('Error fetching profile:', error);
        return { 
            error: 'Internal Server Error', 
            details: error instanceof Error ? error.message : String(error),
            status: 500 
        };
    }
};

export const updateProfileController = async (req: NextRequest) => {
    try {
        const userId = await getAuthenticatedUserId();
        if (!userId) {
            return { error: 'Unauthorized', status: 401 };
        }
        
        const body = await req.json();
        const { role, firstName, lastName, phoneNumber, ...data } = body;

        // Update Clerk Data (Name, Phone)
        const client = await clerkClient();
        if (firstName || lastName) {
             await client.users.updateUser(userId, {
                 firstName: firstName,
                 lastName: lastName,
             });
        }
        // Note: Updating phone number via API usually requires verification flows or specific permissions. 
        // We will skip updating phone number directly here to avoid complex error handling if not configured.
        // If needed, we would use client.phoneNumbers.create or similar, but typically users verify phones.
        
        // Handle Role Switching
        let currentRole = role;
        const clerkUser = await client.users.getUser(userId);
        const existingRole = clerkUser.publicMetadata.role as UserRole;
        
        if (role && role !== existingRole) {
             console.log(`Switching role from ${existingRole} to ${role}`);
             if (role === UserRole.TENANT || role === UserRole.LANDLORD) {
                 await switchUserRole(userId, role);
                 currentRole = role;
             }
        } else {
            currentRole = existingRole || UserRole.TENANT;
        }

        // Update DB Data (Bio, Occupation, Business)
        let updatedDbUser;
        if (currentRole === UserRole.TENANT) {
            updatedDbUser = await updateTenantProfile(userId, {
                bio: data.bio,
                occupation: data.occupation
            });
        } else if (currentRole === UserRole.LANDLORD) {
            updatedDbUser = await updateLandlordProfile(userId, {
                bio: data.bio, // Using same field name from form
                businessName: data.businessName
            });
        }

        // Return combined data
        // We re-fetch or construct the response
        const finalClerkUser = await client.users.getUser(userId); // Get fresh data
        const responseData: ProfileData = {
            id: userId,
            email: finalClerkUser.emailAddresses[0]?.emailAddress || '',
            firstName: finalClerkUser.firstName,
            lastName: finalClerkUser.lastName,
            phoneNumber: finalClerkUser.phoneNumbers[0]?.phoneNumber || null,
            imageUrl: finalClerkUser.imageUrl,
            role: currentRole,
            Tenant: (updatedDbUser as any)?.Tenant ? { bio: (updatedDbUser as any).Tenant.bio, occupation: (updatedDbUser as any).Tenant.occupation } : undefined,
            Landlord: (updatedDbUser as any)?.Landlord ? { bio: (updatedDbUser as any).Landlord.bio, businessName: (updatedDbUser as any).Landlord.businessName } : undefined
        };

        return { data: responseData, status: 200 };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { error: 'Internal Server Error', status: 500 };
    }
};
