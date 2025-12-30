"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface Review {
  reviewId: string;
  rating: number;
  reviewText: string | null;
  createdAt: Date | string;
  Tenant: {
    User: {
      firstName: string | null;
      lastName: string | null;
      profilePicture: string | null;
    };
  };
}

interface ReviewsViewProps {
  propertyId: string;
  initialReviews: Review[];
  currentUserId?: string; // Optional: Pass if available server-side, else we might need client-side auth
}

export default function ReviewsView({ propertyId, initialReviews, currentUserId }: ReviewsViewProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isEligible, setIsEligible] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eligibilityMessage, setEligibilityMessage] = useState("");
  const [userId, setUserId] = useState(currentUserId || ""); // For dev/testing if no auth context
  
  // Calculate stats
  const averageRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";
    
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: reviews.filter(r => r.rating === star).length,
      percentage: reviews.length ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
  }));

  const checkEligibility = async () => {
      if (!userId) return;
      try {
          const res = await fetch(`/reviews/api?id=${propertyId}&userId=${userId}&checkEligibility=true`);
          const data = await res.json();
          if (data.eligible) {
              setIsEligible(true);
              setBookingId(data.bookingId);
              setEligibilityMessage("");
          } else {
              setIsEligible(false);
              setBookingId(null);
              setEligibilityMessage(data.message || "Not eligible to review.");
          }
      } catch (err) {
          console.error("Failed to check eligibility", err);
      }
  };

  // Simulating getting user ID from local storage or input for now if not passed
  // In a real app, useAuth() from Clerk or similar
  useEffect(() => {
      // For testing purposes, let's allow setting UserID manually if not provided
     if (userId) {
         checkEligibility();
     }
  }, [userId, propertyId]);

  const handleSubmit = async () => {
      if (!rating) return alert("Please select a rating");
      if (!bookingId) return alert("No valid booking found"); // Should not happen if confirmed eligible
      
      setIsSubmitting(true);
      try {
          const res = await fetch("/reviews/api", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  propertyId,
                  userId,
                  rating,
                  reviewText,
                  bookingId
              })
          });
          
          if (!res.ok) throw new Error("Failed to submit");
          
          const newReview = await res.json();
          // Optimistically update or re-fetch. Since newReview might lack relations, we might need to manually construct the shape or re-fetch.
          // For simplicity, let's just reload the page or re-fetch reviews. 
          // But we can also append if we returned the full structure from the API.
          // The API returns the raw Prisma result, which doesn't have the Tenant included usually unless we explicitly include it in the create query return.
          // Let's just alert and reload for MVP robustness.
          alert("Review submitted!");
          window.location.reload(); 
          
      } catch (error) {
          console.error(error);
          alert("Error submitting review");
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Rating Summary */}
        <div className="md:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-4xl font-bold flex items-center gap-2">
                        <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                        {averageRating}
                    </CardTitle>
                    <CardDescription>{reviews.length} Reviews</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {ratingCounts.map((item) => (
                        <div key={item.star} className="flex items-center gap-2 text-sm">
                            <span className="w-3">{item.star}</span>
                            <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400" style={{ width: `${item.percentage}%` }} />
                            </div>
                            <span className="w-6 text-muted-foreground text-right">{item.count}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Write Review Section */}
             <Card>
                <CardHeader>
                    <CardTitle>Write a Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!userId && (
                         <div className="text-sm text-muted-foreground mb-4">
                            <p>Enter User ID to check eligibility (Dev Mode):</p>
                            <input 
                                className="border p-1 rounded w-full mt-1" 
                                value={userId} 
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="User ID UUID" 
                            />
                        </div>
                    )}
                    
                    {isEligible ? (
                        <div className="space-y-4">
                            <div className="flex gap-1 justify-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`p-1 transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                    >
                                        <Star className={`w-8 h-8 ${rating >= star ? 'fill-current' : ''}`} />
                                    </button>
                                ))}
                            </div>
                            <Textarea 
                                placeholder="Share your experience..." 
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                            />
                            <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? "Posting..." : "Post Review"}
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground text-sm">
                            {userId ? (
                                <p>{eligibilityMessage}</p>
                            ) : (
                                <p>Please log in to write a review.</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Reviews List */}
        <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-semibold">Reviews</h2>
            {reviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    No reviews yet. Be the first to review!
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.reviewId} className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    <Avatar>
                                        <AvatarImage src={review.Tenant.User.profilePicture || ""} />
                                        <AvatarFallback>{review.Tenant.User.firstName?.[0] || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold">
                                            {review.Tenant.User.firstName} {review.Tenant.User.lastName}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex bg-secondary px-2 py-1 rounded-md">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star 
                                            key={i} 
                                            className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                                {review.reviewText}
                            </p>
                            <Separator />
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
