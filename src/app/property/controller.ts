import { PrismaClient } from "@/generated/prisma/client";

// Use a global variable to prevent multiple instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function getPropertyById(propertyId: string) {
  try {
    const property = await prisma.property.findUnique({
      where: {
        propertyId: propertyId,
      },
      include: {
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
