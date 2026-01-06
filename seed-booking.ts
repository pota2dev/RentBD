
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const userId = "user_37rgQqTtYyN5ALlzBPPNyqD9X9t";
    const propertyId = "08204f84-337b-4aec-9951-9ea97bbe18cc";

    console.log(`Seeding booking for User: ${userId} and Property: ${propertyId}`);

    // 1. Ensure User exists
    // Using upsert to match the recent User schema changes (only id and auth id)
    const user = await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
            id: userId,
            supabaseAuthId: `auth_${userId}`, // Dummy auth ID for seeding
        }
    });
    console.log("User upserted:", user.id);

    // 2. Ensure Tenant profile exists
    const tenant = await prisma.tenant.upsert({
        where: { id: userId },
        update: {},
        create: {
            id: userId,
            bio: "Seeded Tenant for Booking"
        }
    });
    console.log("Tenant profile upserted:", tenant.id);

    // 3. Create a Booking
    const checkIn = new Date();
    const checkOut = new Date();
    checkOut.setDate(checkIn.getDate() + 7); // 1 week stay

    const booking = await prisma.booking.create({
        data: {
            propertyId: propertyId,
            tenantId: userId,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            totalPrice: 15000.00, // Arbitrary price
            status: "COMPLETED", // Set to COMPLETED so they can review it immediately
        }
    });
    console.log("Booking created successfully with ID:", booking.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
