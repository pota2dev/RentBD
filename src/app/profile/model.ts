import { NextRequest, NextResponse } from 'next/server';
import { UserRole, PrismaClient } from '@prisma/client';
import { auth, currentUser } from '@clerk/nextjs/server';

import { prisma } from '@/lib/prisma';


export interface ProfileData {
    userId: string;
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
}



// --- Service Logic (Co-located) ---

const getUserProfile = async (userId: string) => {
    return await prisma.user.findUnique({
        where: { userId },
        include: {
            Tenant: true,
            Landlord: true,
        },
    });
};

const getProfileByEmail = async (email: string) => {
    return await prisma.user.findUnique({
        where: { email },
        include: {
            Tenant: true,
            Landlord: true,
        },
    });
};

const createProfile = async (data: {
    userId: string;
    email: string;
    supabaseAuthId: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
}) => {
    return await prisma.user.create({
        data: {
            userId: data.userId,
            email: data.email,
            supabaseAuthId: data.supabaseAuthId,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role || UserRole.TENANT,
            // Create the specific profile based on role
            ...(data.role === UserRole.LANDLORD
                ? { Landlord: { create: { landlordId: crypto.randomUUID() } } }
                : { Tenant: { create: { tenantId: crypto.randomUUID() } } }
            )
        },
        include: {
            Tenant: true,
            Landlord: true,
        }
    });
};

const updateTenantProfile = async (userId: string, data: {
    bio?: string;
    occupation?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
}) => {
    // Update User common fields
    const user = await prisma.user.update({
        where: { userId },
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            Tenant: {
                update: {
                    bio: data.bio,
                    occupation: data.occupation,
                }
            }
        },
        include: {
            Tenant: true,
        }
    });
    return user;
};

const updateLandlordProfile = async (userId: string, data: {
    bio?: string;
    businessName?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
}) => {
    // Update User common fields
    const user = await prisma.user.update({
        where: { userId },
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            Landlord: {
                update: {
                    bio: data.bio,
                    businessName: data.businessName,
                }
            }
        },
        include: {
            Landlord: true,
        }
    });
    return user;
};

const switchUserRole = async (userId: string, newRole: UserRole) => {
    return await prisma.user.update({
        where: { userId },
        data: {
            role: newRole,
            ...(newRole === UserRole.LANDLORD ? {
                Landlord: {
                    upsert: {
                        create: { landlordId: crypto.randomUUID() },
                        update: {}
                    }
                }
            } : {}),
            ...(newRole === UserRole.TENANT ? {
                Tenant: {
                    upsert: {
                        create: { tenantId: crypto.randomUUID() },
                        update: {}
                    }
                }
            } : {})
        },
        include: { Tenant: true, Landlord: true }
    });
};

// --- Controller Logic ---

// Helper to get authenticated user
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

        const user = await getUserProfile(userId);

        if (!user) {
            console.log('Profile not found by ID, checking Clerk data...');
            
            try {
                const clerkUser = await currentUser();
                
                if (!clerkUser) {
                    return { error: 'Clerk user not found', status: 404 };
                }

                const email = clerkUser.emailAddresses[0]?.emailAddress;
                if (!email) {
                    return { error: 'No email found for user', status: 400 };
                }

                // Check if user exists by email (handle legacy/migration cases)
                const existingUserByEmail = await getProfileByEmail(email);

                if (existingUserByEmail) {
                    console.log(`User found by email ${email} but ID mismatch. Returning existing user.`);
                    return { data: existingUserByEmail, status: 200 };
                }

                // Create new user if not found
                console.log('Creating new user from Clerk data...');
                const newUser = await createProfile({
                    userId: userId,
                    email: email,
                    supabaseAuthId: userId, // Using Clerk ID as auth ID
                    firstName: clerkUser.firstName || '',
                    lastName: clerkUser.lastName || '',
                    role: UserRole.TENANT // Default role
                });
                return { data: newUser, status: 200 };
            } catch (createError: unknown) {
                console.error('Error creating user from Clerk data:', createError);
                
                // Handle concurrency/race conditions or unique violations gracefully
                // Prisma error code handling needs type narrowing
                if (typeof createError === 'object' && createError !== null && 'code' in createError && (createError as { code: string }).code === 'P2002') {
                    return { error: 'User with this email already exists', status: 409 };
                }
                
                const errorMessage = createError instanceof Error ? createError.message : String(createError);
                return { error: `Failed to create user profile: ${errorMessage}`, status: 500 };
            }
        }

        return { data: user, status: 200 };
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
        const { role, ...data } = body;

        let existingUser = await getUserProfile(userId);
        
        if (!existingUser) {
            // Try fallback by email if ID mismatch
             try {
                const clerkUser = await currentUser();
                if (clerkUser) {
                    const email = clerkUser.emailAddresses[0]?.emailAddress;
                    if (email) {
                        existingUser = await getProfileByEmail(email);
                    }
                }
            } catch (err) {
                console.error('Error fetching clerk user in update:', err);
            }
        }
        
        if (!existingUser) {
            return { error: 'User not found', status: 404 };
        }

        // Use the DB user ID, not the Auth ID (in case of mismatch)
        const dbUserId = existingUser.userId;

        // Handle Role Switching
        if (role && role !== existingUser.role) {
             console.log(`Switching role from ${existingUser.role} to ${role}`);
             if (role === UserRole.TENANT || role === UserRole.LANDLORD) {
                 // Update role and ensure profile exists
                 existingUser = await switchUserRole(dbUserId, role);
             }
        }

        if (!existingUser) {
             return { error: 'User not found after role switch', status: 500 };
        }

        let updatedUser;
        if (existingUser.role === UserRole.TENANT) {
            updatedUser = await updateTenantProfile(dbUserId, data);
        } else if (existingUser.role === UserRole.LANDLORD) {
            updatedUser = await updateLandlordProfile(dbUserId, data);
        } else {
            updatedUser = existingUser;
        }

        return { data: updatedUser, status: 200 };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { error: 'Internal Server Error', status: 500 };
    }
};
