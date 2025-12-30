import 'dotenv/config';
import { PrismaClient, PropertyType } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create a User (who will be the landlord)
  const userId = 'seed-user-landlord-1';
  
  // Clean up if exists
  await prisma.property.deleteMany();
  await prisma.landlord.deleteMany();
  await prisma.user.deleteMany({ where: { userId } });

  const user = await prisma.user.create({
    data: {
      userId: userId,
      supabaseAuthId: 'seed-auth-id-1',
      email: 'landlord@rentbd.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'LANDLORD',
      verificationStatus: 'VERIFIED',
    }
  });

  console.log('Created user:', user.userId);

  // 2. Create Landlord profile
  const landlord = await prisma.landlord.create({
    data: {
      landlordId: 'seed-landlord-1',
      userId: user.userId,
      businessName: 'Premium Rentals',
      bio: 'Providing luxury apartments since 2020.',
    }
  });

  console.log('Created landlord:', landlord.landlordId);

  // 3. Create a Property
  const property = await prisma.property.create({
    data: {
      propertyId: 'seed-property-1',
      landlordId: landlord.landlordId,
      title: 'Luxury Oceanview Apartment',
      description: 'Experience the ultimate relaxation in this stunning oceanview apartment. Features modern amenities, spacious rooms, and breathtaking sunset views.',
      type: 'APARTMENT',
      address: '123 Coastal Highway',
      city: 'Cox\'s Bazar',
      state: 'Chittagong',
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 4,
      status: 'ACTIVE',
      updatedAt: new Date(),
      PropertyImage: {
        create: [
          {
            imageId: 'seed-image-1',
            imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', // Valid placeholder
            isPrimary: true,
          },
          {
            imageId: 'seed-image-2',
            imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
            isPrimary: false,
          }
        ]
      },
      PropertyAmenity: {
        create: [
            { amenityId: 'seed-amenity-1', amenityName: 'WiFi', amenityType: 'General'},
            { amenityId: 'seed-amenity-2', amenityName: 'Pool', amenityType: 'Luxury'}
        ]
      }
    }
  });

  console.log('Created property:', property.propertyId);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
