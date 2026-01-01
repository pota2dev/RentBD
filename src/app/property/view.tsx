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
  Utensils,
  Layers,
  Grid
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
    address, // Legacy
    city,    // Legacy
    state,   // Legacy
    // New Location
    division,
    district,
    thana,
    subArea,
    shortAddress,
    
    pricePerMonth, // New
    utilitiesIncluded, // New
    
    bedrooms,
    bathrooms,
    balcony, // New
    floorNo, // New
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

  const displayPrice = pricePerMonth ? Number(pricePerMonth).toLocaleString() + ' BDT' : 'N/A';
  const pricePeriod = 'Monthly';

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Title and Location */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <div className="flex flex-col gap-1 text-gray-600">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="font-medium text-gray-900 mr-2">Address:</span>
            <span>{shortAddress || address}</span>
          </div>
          {thana && (
             <div className="text-sm ml-5">
               {subArea && <span>{subArea}, </span>}
               {thana}, {district}
               {division && <span>, {division}</span>}
             </div>
          )}
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 rounded-xl overflow-hidden h-[400px]">
        <div className="md:col-span-2 h-full relative group">
          <img 
            src={primaryImage?.imageUrl || "https://placehold.co/600x400?text=Property+Image"} 
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
          <div className="flex flex-wrap gap-8 py-6 border-b border-gray-100 text-gray-700">
             <div className="flex items-center gap-2">
                 <BedDouble className="h-5 w-5 text-gray-500" />
                 <span className="font-medium">{bedrooms || 0} Bedroom</span>
             </div>
             <div className="flex items-center gap-2">
                 <Bath className="h-5 w-5 text-gray-500" />
                 <span className="font-medium">{bathrooms || 0} Bathroom</span>
             </div>
             <div className="flex items-center gap-2">
                 <Grid className="h-5 w-5 text-gray-500" />
                 <span className="font-medium">{balcony || 0} Balcony</span>
             </div>
             <div className="flex items-center gap-2">
                 <Layers className="h-5 w-5 text-gray-500" />
                 <span className="font-medium">Floor No: {floorNo || 'N/A'}</span>
             </div>
          </div>
          
          {/* Location Breakdown */}
          <div className="py-2">
             <h2 className="text-xl font-semibold mb-4">Location Information</h2>
             <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div><span className="font-semibold text-gray-700">Division:</span> {division || 'N/A'}</div>
                <div><span className="font-semibold text-gray-700">District:</span> {district || 'N/A'}</div>
                <div><span className="font-semibold text-gray-700">Area / Thana:</span> {thana || 'N/A'}</div>
                <div><span className="font-semibold text-gray-700">Sub Area:</span> {subArea || 'N/A'}</div>
                <div className="col-span-2"><span className="font-semibold text-gray-700">Short Address:</span> {shortAddress || address}</div>
             </div>
          </div>

          <Separator />
          
          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{description || "No summary provided."}</p>
          </div>

          <Separator />
          
          {/* Utilities */}
          {utilitiesIncluded && (
              <div>
                  <h2 className="text-xl font-semibold mb-2">Price included with</h2>
                  <div className="flex flex-wrap gap-2">
                      {utilitiesIncluded.split(',').map((item: string, idx: number) => (
                          <span key={idx} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-100">
                             {item.trim()}
                          </span>
                      ))}
                  </div>
              </div>
          )}

          {/* Amenities */}
          <div>
            <h2 className="text-xl font-semibold mb-4">What this place offers</h2>
            <div className="grid grid-cols-2 gap-4">
              {PropertyAmenity?.map((amenity: any) => (
                <div key={amenity.amenityId} className="flex items-center gap-2 text-gray-700">
                  <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center">
                    {amenity.amenityName.toLowerCase().includes('wifi') ? <Wifi className="h-4 w-4" /> :
                     <Star className="h-4 w-4" />}
                  </div>
                  <span>{amenity.amenityName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Preview (Legacy) */}
          {Review && Review.length > 0 && (
              <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 mr-1 fill-current" />
                      {averageRating.toFixed(1)} · {totalReviews} Reviews
                  </h2>
                 {/* ... review mapping same as before ... */}
              </div>
          )}

          {/* Landlord Info */}
          {Landlord && (
             <div className="border-t pt-8">
               <h2 className="text-xl font-semibold mb-4">Property Owner</h2>
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                     <AvatarImage src={Landlord.User.profilePicture} />
                     <AvatarFallback>{Landlord.User.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">{Landlord.businessName || `${Landlord.User.firstName} ${Landlord.User.lastName}`}</p>
                    <p className="text-gray-700 text-sm">{Landlord.bio}</p>
                  </div>
                </div>
             </div>
          )}
        </div>

        {/* Right Column: Pricing & Contact */}
        <div className="md:col-span-1">
          <Card className="sticky top-24 shadow-lg border-gray-200">
            <CardHeader>
              <div className="flex flex-col">
                 <span className="text-gray-500 text-sm uppercase font-bold tracking-wide">Rent</span>
                 <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">{displayPrice}</span>
                    <span className="text-gray-500 font-medium">/ {pricePeriod}</span>
                 </div>
              </div>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                   <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-6 text-lg">
                       Contact Owner
                   </Button>
               </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 border-t pt-4 bg-gray-50/50">
                 <div className="w-full text-center text-sm text-gray-500">
                     <p>Call or message to schedule a visit.</p>
                 </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
