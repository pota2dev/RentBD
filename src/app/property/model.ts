import { prisma } from '@/lib/prisma';

export async function getPropertyById(propertyId: string) {
  try {
    const property = await prisma.property.findUnique({
      where: {
        id: propertyId,
      },
        include: {
        Availability: true, 
        Booking: {
          take: 5,
        },
        PropertyImage: {
          orderBy: {
            displayOrder: 'asc',
          }
        },
        PropertyAmenity: true,
        Landlord: {
          include: {
            User: {
              select: {
                firstName: true,
                lastName: true,
                profilePicture: true,
                createdAt: true,
              }
            }
          }
        },
        Review: {
          take: 5,
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            Tenant: {
              include: {
                User: {
                  select: {
                    firstName: true,
                    lastName: true,
                    profilePicture: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return property;
  } catch (error) {
    console.error("Error fetching property:", error);
    return null;
  }
}
