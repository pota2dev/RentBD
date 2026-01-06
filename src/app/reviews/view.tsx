"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Star, Edit2, Trash2, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Review {
  id: string;
  rating: number;
  reviewText: string | null;
  createdAt: Date | string;
  tenantId: string; // Ensure tenantId is available for ownership check
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
  currentUserId?: string;
  isOwner: boolean;
}

export default function ReviewsView({ propertyId, initialReviews, currentUserId, isOwner }: ReviewsViewProps) {
  // ... existing state
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [userReview, setUserReview] = useState<Review | null>(null);
  
  const [isEligible, setIsEligible] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [eligibilityMessage, setEligibilityMessage] = useState("");

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editReviewId, setEditReviewId] = useState<string | null>(null);

  const [submissionStatus, setSubmissionStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Calculate stats
  const averageRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";
    
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: reviews.filter(r => r.rating === star).length,
      percentage: reviews.length ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
  }));

  // Check if user already has a review
  useEffect(() => {
    if (currentUserId && reviews.length > 0) {
        // Find review where tenantId matches currentUserId
        const myReview = reviews.find(r => r.tenantId === currentUserId);
        if (myReview) {
            setUserReview(myReview);
        } else {
            setUserReview(null);
        }
    }
  }, [currentUserId, reviews]);

  const checkEligibility = async () => {
      if (!currentUserId || userReview || isOwner) return; // Don't check if already reviewed or owner 
      try {
          const res = await fetch(`/reviews/api?id=${propertyId}&userId=${currentUserId}&checkEligibility=true`);
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

  useEffect(() => {
     checkEligibility();
  }, [currentUserId, propertyId, userReview, isOwner]);

  const handleSubmit = async () => {
      setSubmissionStatus(null);
      if (!rating) {
          setSubmissionStatus({ type: 'error', message: "Please select a rating to submit." });
          return;
      }
      
      setIsSubmitting(true);
      try {
          let url = "/reviews/api";
          let method = "POST";
          let body = {};

          if (isEditing && editReviewId) {
             method = "PUT";
             body = {
                reviewId: editReviewId,
                userId: currentUserId,
                rating,
                reviewText
             };
          } else {
             if (!bookingId) {
                 setSubmissionStatus({ type: 'error', message: "No valid booking found." });
                 return;
             }
             body = {
                propertyId,
                userId: currentUserId,
                rating,
                reviewText,
                bookingId
            };
          }

          const res = await fetch(url, {
              method: method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body)
          });
          
          if (!res.ok) throw new Error("Failed to submit");
          
          setSubmissionStatus({ 
              type: 'success', 
              message: isEditing ? "Review updated successfully!" : "Review submitted successfully!" 
          });
          
          // Slight delay to show success message before reload
          setTimeout(() => {
              window.location.reload(); 
          }, 1500);
          
      } catch (error) {
          console.error(error);
          setSubmissionStatus({ type: 'error', message: "An error occurred while submitting your review. Please try again." });
      } finally {
          setIsSubmitting(false);
      }
  };

  // ... handleEdit and handleCancelEdit remain same but clear status
  const handleEdit = (review: Review) => {
      setSubmissionStatus(null);
      setRating(review.rating);
      setReviewText(review.reviewText || "");
      setIsEditing(true);
      setEditReviewId(review.id);
  };

  const handleCancelEdit = () => {
    setSubmissionStatus(null);
    setIsEditing(false);
    setEditReviewId(null);
    setRating(0);
    setReviewText("");
  };

  const handleDelete = async (reviewId: string) => {
      if (!confirm("Are you sure you want to delete your review?")) return;
      try {
          const res = await fetch(`/reviews/api?id=${reviewId}&userId=${currentUserId}`, {
              method: "DELETE"
          });
          if (!res.ok) throw new Error("Failed to delete");
          window.location.reload();
      } catch (error) {
          console.error(error);
          alert("Failed to delete review"); // Using alert here as it is a destructive action confirm fallback, or user preference
      }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Stats & User Action */}
        <div className="lg:col-span-4 space-y-8">
            {/* Rating Card */}
            <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm sticky top-8">
                {/* ... existing CardHeader and CardContent */}
                <CardHeader className="pb-4">
                    <CardTitle className="text-5xl font-extrabold flex items-center gap-3 text-gray-900">
                        <Star className="w-10 h-10 fill-yellow-400 text-yellow-400" />
                        {averageRating}
                    </CardTitle>
                    <CardDescription className="text-lg font-medium text-gray-500">{reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {ratingCounts.map((item) => (
                        <div key={item.star} className="flex items-center gap-3 text-sm group">
                            <span className="w-4 font-medium text-gray-600">{item.star}</span>
                            <div className="h-3 flex-1 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-yellow-400 rounded-full transition-all duration-500 ease-out group-hover:bg-yellow-500" 
                                    style={{ width: `${item.percentage}%` }} 
                                />
                            </div>
                            <span className="w-8 text-gray-400 text-right">{item.count}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Write/Edit Review Section */}
            {!isOwner && (
                <Card className={`border-none shadow-md ${isEditing ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                    <CardHeader>
                        <CardTitle>{isEditing ? "Edit Your Review" : (userReview ? "Your Review" : "Write a Review")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {submissionStatus && (
                            <Alert variant={submissionStatus.type === 'error' ? "destructive" : "default"} className={submissionStatus.type === 'success' ? "border-green-500 text-green-700 bg-green-50" : ""}>
                                {submissionStatus.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                <AlertTitle>{submissionStatus.type === 'error' ? "Error" : "Success"}</AlertTitle>
                                <AlertDescription>
                                    {submissionStatus.message}
                                </AlertDescription>
                            </Alert>
                        )}

                        {userReview && !isEditing ? (
                             <div className="text-center p-4 bg-green-50 rounded-xl space-y-3 border border-green-100">
                                <p className="text-green-700 font-medium">You've reviewed this property.</p>
                                <div className="flex gap-2 justify-center">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(userReview)} className="hover:text-primary hover:border-primary">
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleDelete(userReview.id)} className="hover:text-destructive hover:border-destructive text-destructive">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </Button>
                                </div>
                             </div>
                        ) : (
                            <>
                                {isEligible || isEditing ? (
                                    <div className="space-y-6">
                                        <div className="flex gap-2 justify-center">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setRating(star)}
                                                    className={`p-1 transition-all duration-200 hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                                                >
                                                    <Star className={`w-8 h-8 ${rating >= star ? 'fill-current' : ''}`} />
                                                </button>
                                            ))}
                                        </div>
                                        <Textarea 
                                            placeholder="What did you like or dislike? How was the location?" 
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            className="min-h-[120px] resize-none text-base bg-gray-50 focus:bg-white transition-colors"
                                        />
                                        <div className="flex gap-2">
                                            {isEditing && (
                                                <Button variant="ghost" className="flex-1" onClick={handleCancelEdit}>
                                                    Cancel
                                                </Button>
                                            )}
                                            <Button className="flex-1 font-bold" onClick={handleSubmit} disabled={isSubmitting}>
                                                {isSubmitting ? "Saving..." : (isEditing ? "Update Review" : "Post Review")}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground text-sm py-2">
                                        {currentUserId ? (
                                            <p>{eligibilityMessage || "Checking eligibility..."}</p>
                                        ) : (
                                            <div className="space-y-3">
                                                <p>Log in to share your experience.</p>
                                                <Button className="w-full font-semibold" asChild>
                                                    <a href="/sign-in?redirect_url=/reviews">Sign In to Review</a>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>

        {/* Right Column: Reviews List */}
        <div className="lg:col-span-8 space-y-8">
             {/* ... existing reviews list */}
             <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Guest Reviews</h2>
            {reviews.length === 0 ? (
                <div className="text-center py-20 px-4 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <Star className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
                    <p className="text-gray-500 mt-1">Be the first to share your experience staying here.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reviews.map((review) => (
                        <Card key={review.id} className={`border-none shadow-sm hover:shadow-md transition-shadow duration-300 ${review.tenantId === currentUserId ? 'ring-2 ring-primary/20 bg-primary/5' : 'bg-white'}`}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex gap-4 items-center">
                                        <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                                            <AvatarImage src={review.Tenant.User.profilePicture || ""} className="object-cover"/>
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                {review.Tenant.User.firstName?.[0] || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-bold text-gray-900 flex items-center gap-2">
                                                {review.Tenant.User.firstName} {review.Tenant.User.lastName}
                                                {review.tenantId === currentUserId && (
                                                    <span className="text-[10px] uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">You</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 font-medium mt-0.5">
                                                {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star 
                                                key={i} 
                                                className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} 
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-700 leading-relaxed text-base">
                                    {review.reviewText}
                                </p>
                                
                                {review.tenantId === currentUserId && !isEditing && (
                                    <div className="mt-4 pt-4 border-t flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {/* Action buttons */}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
