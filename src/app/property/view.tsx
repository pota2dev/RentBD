'use client';

import { 
  Building2, 
  MapPin, 
  Users, 
  BedDouble, 
  Bath, 
  Star, 
  Wifi, 
  Car, 
  Utensils 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"; // Need to check if available, if not use <hr> or div
// Assuming Separator is not in list, using div with border-b

// Using any for now to avoid complex type importation issues from Prisma generated types
// In a real scenario, we should infer this from the controller's return type
interface PropertyViewProps {
  property: any;
}

export default function PropertyView({ property }: PropertyViewProps) {
  if (!property) return null;

  const {
    title,
    description,
    address,
    city,
    state,
    pricePerNight,
    bedrooms,
    bathrooms,
    maxGuests,
    averageRating,
    totalReviews,
    PropertyImage,
    PropertyAmenity,
    Landlord,
    Review
  } = property;

  const primaryImage = PropertyImage?.find((img: any) => img.isPrimary) || PropertyImage?.[0];
  const otherImages = PropertyImage?.filter((img: any) => img.imageId !== primaryImage?.imageId) || [];

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Title and Location */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <div className="flex items-center text-gray-600">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{address}, {city}, {state}</span>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 rounded-xl overflow-hidden h-[400px]">
        <div className="md:col-span-2 h-full relative group">
          <img 
            src={primaryImage?.imageUrl || "/placeholder-house.jpg"} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="md:col-span-2 grid grid-cols-2 gap-4 h-full">
          {otherImages.slice(0, 4).map((img: any, idx: number) => (
             <div key={img.imageId} className="relative h-full overflow-hidden group">
               <img 
                 src={img.imageUrl} 
                 alt={`Property image ${idx + 2}`} 
                 className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
               />
             </div>
          ))}
          {[...Array(Math.max(0, 4 - otherImages.length))].map((_, idx) => (
             <div key={`placeholder-${idx}`} className="bg-gray-100 flex items-center justify-center text-gray-400">
               <Building2 className="h-8 w-8 opacity-20" />
             </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Key Stats */}
          <div className="flex justify-between items-center py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
                 <Users className="h-5 w-5 text-gray-500" />
                 <span>{maxGuests} Guests</span>
            </div>
            <div className="flex items-center gap-2">
                 <BedDouble className="h-5 w-5 text-gray-500" />
                 <span>{bedrooms} Bedrooms</span>
            </div>
            <div className="flex items-center gap-2">
                 <Bath className="h-5 w-5 text-gray-500" />
                 <span>{bathrooms} Bathrooms</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-4">About this place</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="text-xl font-semibold mb-4">What this place offers</h2>
            <div className="grid grid-cols-2 gap-4">
              {PropertyAmenity?.map((amenity: any) => (
                <div key={amenity.amenityId} className="flex items-center gap-2 text-gray-700">
                  <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center">
                    {amenity.amenityName.toLowerCase().includes('wifi') ? <Wifi className="h-4 w-4" /> :
                     amenity.amenityName.toLowerCase().includes('pdf') ? <Car className="h-4 w-4" /> :
                     <Star className="h-4 w-4" />}
                  </div>
                  <span>{amenity.amenityName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Preview */}
          {Review && Review.length > 0 && (
              <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 mr-1 fill-current" />
                      {averageRating.toFixed(1)} · {totalReviews} Reviews
                  </h2>
                  <div className="space-y-4">
                      {Review.map((review: any) => (
                          <div key={review.reviewId} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                  <Avatar className="h-8 w-8">
                                      <AvatarImage src={review.Tenant.User.profilePicture} />
                                      <AvatarFallback>{review.Tenant.User.firstName?.[0]}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                      <p className="font-medium text-sm">{review.Tenant.User.firstName} {review.Tenant.User.lastName}</p>
                                      <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                                  </div>
                              </div>
                              <p className="text-gray-700 text-sm">{review.reviewText || "No comment."}</p>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* Landlord Info */}
          {Landlord && (
             <div className="border-t pt-8">
               <h2 className="text-xl font-semibold mb-4">Hosted by {Landlord.User.firstName}</h2>
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                     <AvatarImage src={Landlord.User.profilePicture} />
                     <AvatarFallback>{Landlord.User.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">{Landlord.businessName || `${Landlord.User.firstName} ${Landlord.User.lastName}`}</p>
                    <p className="text-gray-500 text-sm mb-2">Joined {new Date(Landlord.User.createdAt).getFullYear()}</p>
                    <p className="text-gray-700 text-sm">{Landlord.bio}</p>
                  </div>
                </div>
             </div>
          )}
        </div>

        {/* Right Column: Pricing & Booking */}
        <div className="md:col-span-1">
          <Card className="sticky top-24 shadow-lg border-gray-200">
            <CardHeader>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-2xl font-bold">${pricePerNight}</span>
                <span className="text-gray-500 mb-1">/ night</span>
              </div>
              <CardDescription>
                {maxGuests} guests maximum
              </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                   <div className="grid grid-cols-2 rounded-md border border-gray-300 overflow-hidden">
                       <div className="p-3 border-r border-gray-300">
                           <label className="text-xs font-bold uppercase block text-gray-600">Check-in</label>
                           <span className="text-sm text-gray-400">Add date</span>
                       </div>
                       <div className="p-3">
                           <label className="text-xs font-bold uppercase block text-gray-600">Check-out</label>
                           <span className="text-sm text-gray-400">Add date</span>
                       </div>
                   </div>
                   
                   <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-6">
                       Reserve
                   </Button>
                   
                   <p className="text-center text-xs text-gray-500">You won't be charged yet</p>
               </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 border-t pt-4">
                 <div className="w-full flex justify-between text-sm">
                     <span className="underline decoration-dotted">${pricePerNight} x 5 nights</span>
                     <span>${Number(pricePerNight) * 5}</span>
                 </div>
                 <div className="w-full flex justify-between text-sm">
                     <span className="underline decoration-dotted">Cleaning fee</span>
                     <span>$50</span>
                 </div>
                 <div className="w-full flex justify-between text-sm font-bold pt-2 border-t mt-2">
                     <span>Total</span>
                     <span>${(Number(pricePerNight) * 5) + 50}</span>
                 </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
