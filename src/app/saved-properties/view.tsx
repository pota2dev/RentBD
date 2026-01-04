'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Bed, Bath, Trash2, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PropertyImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
}

interface Landlord {
  User: {
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  };
}

interface Property {
  id: string;
  title: string;
  description?: string;
  address: string;
  city: string;
  district?: string;
  bedrooms?: number;
  bathrooms?: number;
  pricePerMonth?: number;
  averageRating: number;
  totalReviews: number;
  PropertyImage: PropertyImage[];
  Landlord: Landlord;
}

interface SavedProperty {
  id: string;
  propertyId: string;
  savedAt: string | Date;
  Property: Property;
}

interface SavedPropertiesViewProps {
  savedProperties: SavedProperty[];
}

export default function SavedPropertiesView({ savedProperties }: SavedPropertiesViewProps) {
  const [properties, setProperties] = useState<SavedProperty[]>(savedProperties);
  const [selectedProperty, setSelectedProperty] = useState<SavedProperty | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRemove = async (savedPropertyId: string, propertyId: string) => {
    if (!confirm('Are you sure you want to remove this property from your saved list?')) return;

    setIsDeleting(true);
    try {
      // Mock deletion - just remove from state
      setProperties(properties.filter(p => p.id !== savedPropertyId));
      setSelectedProperty(null);
      alert('Property removed from saved list!');
    } catch (error) {
      console.error('Error removing property:', error);
      alert('Error removing property');
    } finally {
      setIsDeleting(false);
    }
  };

  const getPrimaryImage = (property: Property) => {
    return property.PropertyImage[0]?.imageUrl || '/placeholder-property.jpg';
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Properties</h1>
        <p className="text-gray-600">
          {properties.length === 0 
            ? 'You haven\'t saved any properties yet.' 
            : `You have ${properties.length} saved propert${properties.length === 1 ? 'y' : 'ies'}`}
        </p>
      </div>

      {properties.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <Heart className="w-12 h-12 mx-auto text-gray-300" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Properties</h3>
              <p className="text-gray-600 mb-6">Start saving properties to build your watchlist</p>
              <Link href="/property-search">
                <Button>Browse Properties</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((saved) => {
            const property = saved.Property;
            const primaryImage = getPrimaryImage(property);
            const landlord = property.Landlord.User;
            
            return (
              <Card
                key={saved.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setSelectedProperty(saved)}
              >
                {/* Property Image */}
                <div className="relative overflow-hidden bg-gray-200 h-48">
                  <img
                    src={primaryImage}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  {property.averageRating > 0 && (
                    <div className="absolute bottom-3 left-3 bg-white rounded-lg px-3 py-1 flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-sm">{property.averageRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-600">({property.totalReviews})</span>
                    </div>
                  )}
                </div>

                {/* Property Details */}
                <CardContent className="pt-4">
                  {/* Title & Location */}
                  <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
                    {property.title}
                  </h3>
                  <div className="flex items-start gap-1 mb-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {property.address}, {property.city}
                      {property.district && `, ${property.district}`}
                    </p>
                  </div>

                  {/* Property Features */}
                  <div className="flex gap-4 mb-4 text-sm text-gray-600">
                    {property.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  {property.pricePerMonth && (
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <p className="text-2xl font-bold text-gray-900">
                        ${Number(property.pricePerMonth).toLocaleString()}
                        <span className="text-sm font-normal text-gray-600">/month</span>
                      </p>
                    </div>
                  )}

                  {/* Landlord Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={landlord.profilePicture || ''} />
                        <AvatarFallback>
                          {landlord.firstName?.charAt(0)}{landlord.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-xs">
                        <p className="font-medium text-gray-900">
                          {landlord.firstName} {landlord.lastName}
                        </p>
                        <p className="text-gray-500">Landlord</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(saved.id, property.id);
                      }}
                      disabled={isDeleting}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Saved Date */}
                  <p className="text-xs text-gray-500 mt-3">
                    Saved {new Date(saved.savedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: new Date(saved.savedAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                    })}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Property Detail Modal */}
      {selectedProperty && (
        <Dialog open={!!selectedProperty} onOpenChange={() => setSelectedProperty(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedProperty.Property.title}</DialogTitle>
              <DialogDescription>
                {selectedProperty.Property.address}, {selectedProperty.Property.city}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Image */}
              <img
                src={getPrimaryImage(selectedProperty.Property)}
                alt={selectedProperty.Property.title}
                className="w-full h-64 object-cover rounded-lg"
              />

              {/* Description */}
              {selectedProperty.Property.description && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600 text-sm">{selectedProperty.Property.description}</p>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-3 gap-4">
                {selectedProperty.Property.bedrooms && (
                  <div className="text-center">
                    <Bed className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                    <p className="text-sm font-medium">{selectedProperty.Property.bedrooms} Bedrooms</p>
                  </div>
                )}
                {selectedProperty.Property.bathrooms && (
                  <div className="text-center">
                    <Bath className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                    <p className="text-sm font-medium">{selectedProperty.Property.bathrooms} Bathrooms</p>
                  </div>
                )}
                {selectedProperty.Property.averageRating > 0 && (
                  <div className="text-center">
                    <Star className="w-6 h-6 mx-auto text-yellow-400 mb-2 fill-yellow-400" />
                    <p className="text-sm font-medium">{selectedProperty.Property.averageRating.toFixed(1)} Rating</p>
                  </div>
                )}
              </div>

              {/* Price */}
              {selectedProperty.Property.pricePerMonth && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-3xl font-bold text-gray-900">
                    ${Number(selectedProperty.Property.pricePerMonth).toLocaleString()}
                    <span className="text-base font-normal text-gray-600">/month</span>
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Link href={`/property?id=${selectedProperty.Property.id}`} className="flex-1">
                  <Button className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Full Details
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleRemove(selectedProperty.id, selectedProperty.Property.id);
                    setSelectedProperty(null);
                  }}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove from Saved
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
