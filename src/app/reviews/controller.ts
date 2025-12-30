import { PrismaClient, Review } from "@/generated/prisma/client";

// Use a global variable to prevent multiple instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Get reviews for a specific property
 */
export async function getPropertyReviews(propertyId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        propertyId: propertyId,
      },
      include: {
        Tenant: {
            include: {
                User: {
                    select: {
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                    }
                }
            }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return reviews;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

/**
 * Check if a user can review a property.
 * Rules:
 * 1. Must have a confirmed/completed booking for this property.
 * 2. Must not have already reviewed this booking.
 */
export async function checkReviewEligibility(userId: string, propertyId: string) {
    try {
        // Find tenancy for this user
        const tenant = await prisma.tenant.findUnique({
            where: { userId: userId },
        });

        if (!tenant) return { eligible: false, message: "User is not a tenant." };

        // Find a completed booking for this property by this tenant that doesn't have a review
        const booking = await prisma.booking.findFirst({
            where: {
                propertyId: propertyId,
                tenantId: tenant.tenantId,
                status: "COMPLETED", // Assuming 'COMPLETED' is the status for a past valid booking
                Review: {
                    is: null // Ensure no review exists for this booking
                }
            }
        });

        if (booking) {
            return { eligible: true, bookingId: booking.bookingId };
        } else {
             // Check if they have reviewed all their completed bookings
             const completedBookings = await prisma.booking.count({
                where: {
                    propertyId: propertyId,
                    tenantId: tenant.tenantId,
                    status: "COMPLETED"
                }
             });
             
             if (completedBookings === 0) {
                 return { eligible: false, message: "No completed bookings found for this property." };
             }
             
             return { eligible: false, message: "You have already reviewed your stay(s)." };
        }

    } catch (error) {
        console.error("Error checking review eligibility:", error);
        return { eligible: false, message: "Server error checking eligibility." };
    }
}

/**
 * Create a new review
 */
export async function createReview(data: {
    propertyId: string;
    userId: string;
    rating: number;
    reviewText?: string;
    bookingId: string;
}) {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { userId: data.userId }
        });

        if (!tenant) throw new Error("Tenant not found");

        const review = await prisma.review.create({
            data: {
                propertyId: data.propertyId,
                tenantId: tenant.tenantId,
                bookingId: data.bookingId,
                rating: data.rating,
                reviewText: data.reviewText,
            }
        });
        
        // Update property average rating (optional but good for performance)
        // We can do this async or here. For simplicity, let's recalculate.
        await updatePropertyRating(data.propertyId);

        return review;
    } catch (error) {
        console.error("Error creating review:", error);
        throw error;
    }
}

async function updatePropertyRating(propertyId: string) {
    const aggregations = await prisma.review.aggregate({
        where: { propertyId: propertyId },
        _avg: { rating: true },
        _count: { rating: true },
    });
    
    const newAverage = aggregations._avg.rating || 0;
    const newCount = aggregations._count.rating || 0;

    await prisma.property.update({
        where: { propertyId: propertyId },
        data: {
            averageRating: newAverage,
            totalReviews: newCount,
        }
    });
}
