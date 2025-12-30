import { NextRequest, NextResponse } from "next/server";
import { getPropertyReviews, checkReviewEligibility, createReview } from "../controller";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const propertyId = searchParams.get("id");
  const userId = searchParams.get("userId"); // Optional: to check eligibility
  const checkEligibility = searchParams.get("checkEligibility") === "true";

  if (!propertyId) {
    return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
  }

  if (checkEligibility && userId) {
      const eligibility = await checkReviewEligibility(userId, propertyId);
      return NextResponse.json(eligibility);
  }

  const reviews = await getPropertyReviews(propertyId);
  return NextResponse.json(reviews);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { propertyId, userId, rating, reviewText, bookingId } = body;

        if (!propertyId || !userId || !rating || !bookingId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const review = await createReview({
            propertyId,
            userId,
            rating,
            reviewText,
            bookingId
        });

        return NextResponse.json(review);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
    }
}
