import { prisma } from '@/lib/prisma';
import { clerkClient } from "@clerk/nextjs/server";

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
        Landlord: true, // Fetch Landlord but without User (User no longer has profile info)
        Review: {
          take: 5,
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            Tenant: true // Fetch Tenant info
          }
        }
      }
    });

    if (!property) return null;

    // Collect User IDs (Landlord + Reviewers)
    const userIds = new Set<string>();
    if (property.landlordId) userIds.add(property.landlordId);
    
    if (property.Review) {
        property.Review.forEach(r => {
            if (r.tenantId) userIds.add(r.tenantId);
        });
    }

    // Fetch from Clerk
    const client = await clerkClient();
    const users = await client.users.getUserList({ userId: Array.from(userIds), limit: 20 });
    const userMap = new Map(users.data.map(u => [u.id, u]));

    // Hydrate Landlord User
    const landlordUser = userMap.get(property.landlordId);
    const hydratedLandlord = property.Landlord ? {
        ...property.Landlord,
        User: {
            firstName: landlordUser?.firstName || 'Landlord',
            lastName: landlordUser?.lastName || '',
            profilePicture: landlordUser?.imageUrl || null,
            createdAt: landlordUser?.createdAt ? new Date(landlordUser.createdAt) : new Date(),
        }
    } : null;

    // Hydrate Reviews
    const hydratedReviews = property.Review.map(r => {
        const tenantUser = userMap.get(r.tenantId);
        return {
            ...r,
            Tenant: {
                ...r.Tenant,
                User: {
                    firstName: tenantUser?.firstName || 'User',
                    lastName: tenantUser?.lastName || '',
                    profilePicture: tenantUser?.imageUrl || null
                }
            }
        };
    });

    return {
        ...property,
        Landlord: hydratedLandlord,
        Review: hydratedReviews
    };

  } catch (error) {
    console.error("Error fetching property:", error);
    return null;
  }
}
