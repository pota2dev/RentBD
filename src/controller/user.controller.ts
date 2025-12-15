import { NextRequest, NextResponse } from 'next/server';
import { 
    getUserProfile, 
    createProfile, 
    updateTenantProfile, 
    updateLandlordProfile 
} from '@/service/user.service';
import { UserRole } from '@/generated/prisma/enums';

import { auth } from '@clerk/nextjs/server';

// Helper to get authenticated user
const getAuthenticatedUserId = async (): Promise<string | null> => {
    const { userId } = await auth();
    return userId;
};

export const getProfile = async (req: NextRequest) => {
    try {
        const userId = await getAuthenticatedUserId();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await getUserProfile(userId);

        if (!user) {
            // Auto-create mock user for testing purposes
            console.log('Mock user not found, creating new one...');
            try {
                const newUser = await createProfile({
                    userId: userId,
                    email: 'mock@example.com',
                    supabaseAuthId: 'mock-supabase-id',
                    firstName: 'Guest',
                    lastName: 'User',
                    role: UserRole.TENANT
                });
                return NextResponse.json(newUser);
            } catch (createError) {
                console.error('Error creating mock user:', createError);
                return NextResponse.json({ error: 'Failed to create mock user' }, { status: 500 });
            }
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
};

export const updateProfile = async (req: NextRequest) => {
    try {
        const userId = await getAuthenticatedUserId();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await req.json();
        const { role, ...data } = body;

        // Determine existing role or usage
        // For simplicity, we assume the frontend sends the right fields for the user's role
        // But we should verify valid role update requests.

        const existingUser = await getUserProfile(userId);
        if (!existingUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let updatedUser;
        if (existingUser.role === UserRole.TENANT) {
            updatedUser = await updateTenantProfile(userId, data);
        } else if (existingUser.role === UserRole.LANDLORD) {
            updatedUser = await updateLandlordProfile(userId, data);
        } else {
            // Handle ADMIN or other cases if needed
            updatedUser = existingUser;
        }

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
};
