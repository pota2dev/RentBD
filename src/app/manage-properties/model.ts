import { PrismaClient } from '@/generated/prisma/client';
import { getProfileController } from '../profile/model';

const prisma = new PrismaClient();

export async function getOwnedProperties() {
    try {
        // Reuse the profile controller which handles:
        // 1. Auth check via Clerk
        // 2. DB User lookup
        // 3. Auto-sync from Clerk if user missing in DB
        const { data: user, error, status } = await getProfileController();

        if (error || !user) {
             return { error: error || 'User not found', status: status || 404 };
        }

        // Type assertion to access Landlord relation
        const userData = user as any;

        if (!userData.Landlord) {
             return { error: 'Landlord profile not found. Please set your role to Landlord in /profile', status: 404 };
        }

        const properties = await prisma.property.findMany({
            where: { landlordId: userData.Landlord.landlordId },
            orderBy: { createdAt: 'desc' },
            include: {
                PropertyImage: true
            }
        });

        return { data: properties, status: 200 };

    } catch (error) {
        console.error('Error fetching owned properties:', error);
        return { error: 'Internal Server Error', status: 500 };
    }
}
