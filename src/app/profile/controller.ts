import { NextRequest, NextResponse } from 'next/server';
import { 
    getUserProfile, 
    getProfileByEmail,
    createProfile, 
    updateTenantProfile, 
    updateLandlordProfile 
} from '@/service/user.service';
import { UserRole } from '@/generated/prisma/client';
import { auth, currentUser } from '@clerk/nextjs/server';

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
            } catch (createError: any) {
                console.error('Error creating user from Clerk data:', createError);
                
                // Handle concurrency/race conditions or unique violations gracefully
                if (createError.code === 'P2002') {
                    return { error: 'User with this email already exists', status: 409 };
                }
                
                return { error: `Failed to create user profile: ${createError.message}`, status: 500 };
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
