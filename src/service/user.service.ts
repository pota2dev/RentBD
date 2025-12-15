import { PrismaClient, UserRole } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export const getUserProfile = async (userId: string) => {
    return await prisma.user.findUnique({
        where: { userId },
        include: {
            Tenant: true,
            Landlord: true,
        },
    });
};

export const getProfileByEmail = async (email: string) => {
    return await prisma.user.findUnique({
        where: { email },
        include: {
            Tenant: true,
            Landlord: true,
        },
    });
};

export const createProfile = async (data: {
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

export const updateTenantProfile = async (userId: string, data: {
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

export const updateLandlordProfile = async (userId: string, data: {
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
