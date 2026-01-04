'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Bed, Bath, Star, Filter, ChevronDown, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Property {
  id: string;
  title: string;
  description?: string;
  address: string;
  city: string;
  district?: string;
  bedrooms?: number;
  bathrooms?: number;
  pricePerMonth: number;
  averageRating: number;
  totalReviews: number;
  imageUrl: string;
  landlordName: string;
  landlordImage?: string;
  createdAt: string;
  relevanceScore?: number;
}

// Mock data for testing
const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Modern Apartment in Gulshan',
    description: 'Luxury apartment with great amenities',
    address: '123 Main Street',
    city: 'Dhaka',
    district: 'Gulshan',
    bedrooms: 3,
    bathrooms: 2,
    pricePerMonth: 2500,
    averageRating: 4.8,
    totalReviews: 24,
    imageUrl: '/placeholder-property.jpg',
    landlordName: 'Ahmed Khan',
    landlordImage: '/placeholder-avatar.jpg',
    createdAt: new Date('2025-12-15').toISOString(),
    relevanceScore: 95
  },
  {
    id: '2',
    title: 'Cozy Studio in Banani',
    description: 'Perfect for single professionals',
    address: '456 Oak Avenue',
    city: 'Dhaka',
    district: 'Banani',
    bedrooms: 1,
    bathrooms: 1,
    pricePerMonth: 1200,
    averageRating: 4.5,
    totalReviews: 18,
    imageUrl: '/placeholder-property.jpg',
    landlordName: 'Fatima Ahmed',
    landlordImage: '/placeholder-avatar.jpg',
    createdAt: new Date('2026-01-02').toISOString(),
    relevanceScore: 88
  },
  {
    id: '3',
    title: 'Spacious Family Home in Dhanmondi',
    description: 'Large home with garden',
    address: '789 Elm Street',
    city: 'Dhaka',
    district: 'Dhanmondi',
    bedrooms: 5,
    bathrooms: 3,
    pricePerMonth: 4500,
    averageRating: 4.9,
    totalReviews: 42,
    imageUrl: '/placeholder-property.jpg',
    landlordName: 'Muhammad Ali',
    landlordImage: '/placeholder-avatar.jpg',
    createdAt: new Date('2025-11-20').toISOString(),
    relevanceScore: 92
  },
  {
    id: '4',
    title: 'Budget Apartment in Mirpur',
    description: 'Affordable and comfortable',
    address: '321 Pine Road',
    city: 'Dhaka',
    district: 'Mirpur',
    bedrooms: 2,
    bathrooms: 1,
    pricePerMonth: 800,
    averageRating: 4.2,
    totalReviews: 12,
    imageUrl: '/placeholder-property.jpg',
    landlordName: 'Noor Jahan',
    landlordImage: '/placeholder-avatar.jpg',
    createdAt: new Date('2026-01-03').toISOString(),
    relevanceScore: 75
  },
  {
    id: '5',
    title: 'Premium Penthouse in Gulshan',
    description: 'Top floor with panoramic views',
    address: '654 Maple Drive',
    city: 'Dhaka',
    district: 'Gulshan',
    bedrooms: 4,
    bathrooms: 3,
    pricePerMonth: 5500,
    averageRating: 4.9,
    totalReviews: 35,
    imageUrl: '/placeholder-property.jpg',
    landlordName: 'Hassan Bin Rashid',
    landlordImage: '/placeholder-avatar.jpg',
    createdAt: new Date('2025-10-10').toISOString(),
    relevanceScore: 98
  },
  {
    id: '6',
    title: 'Charming House in Mohakhali',
    description: 'Close to metro station',
    address: '987 Cedar Lane',
    city: 'Dhaka',
    district: 'Mohakhali',
    bedrooms: 2,
    bathrooms: 2,
    pricePerMonth: 1800,
    averageRating: 4.3,
    totalReviews: 9,
    imageUrl: '/placeholder-property.jpg',
    landlordName: 'Ayesha Khan',
    landlordImage: '/placeholder-avatar.jpg',
    createdAt: new Date('2026-01-01').toISOString(),
    relevanceScore: 82
  }
];

type SortOption = 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest';
type ViewType = 'grid' | 'list';

export default function PropertySearchView() {
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [bedroomFilter, setBedroomFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort properties
  const filteredAndSortedProperties = useMemo(() => {
    let filtered = MOCK_PROPERTIES.filter(property => {
      // Search query filter
      const matchesSearch =
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.toLowerCase().includes(searchQuery.toLowerCase());

      // Price range filter
      const matchesPrice = property.pricePerMonth >= priceRange.min && property.pricePerMonth <= priceRange.max;

      // District filter
      const matchesDistrict = !selectedDistrict || property.district === selectedDistrict;

      // Bedroom filter
      const matchesBedrooms = !bedroomFilter || property.bedrooms?.toString() === bedroomFilter;

      return matchesSearch && matchesPrice && matchesDistrict && matchesBedrooms;
    });

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.pricePerMonth - b.pricePerMonth;
        case 'price-high':
          return b.pricePerMonth - a.pricePerMonth;
        case 'rating':
          return b.averageRating - a.averageRating || b.totalReviews - a.totalReviews;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'relevance':
        default:
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
      }
    });

    return sorted;
  }, [searchQuery, priceRange, selectedDistrict, bedroomFilter, sortBy]);

  const districts = Array.from(new Set(MOCK_PROPERTIES.map(p => p.district).filter(Boolean))) as string[];
  const bedroomOptions = Array.from(new Set(MOCK_PROPERTIES.map(p => p.bedrooms).filter(Boolean))).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Property</h1>
          <p className="text-gray-600">Search and filter from our extensive property listings</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
            <div className="bg-white rounded-lg p-6 sticky top-4 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <Input
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <option value="">All Districts</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </Select>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                <Select value={bedroomFilter} onValueChange={setBedroomFilter}>
                  <option value="">All Bedrooms</option>
                  {bedroomOptions.map(beds => (
                    <option key={beds} value={beds?.toString()}>{beds} Bedroom{beds !== 1 ? 's' : ''}</option>
                  ))}
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range: ${priceRange.min} - ${priceRange.max}
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-600">Min Price</label>
                    <Input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                      placeholder="Min"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Max Price</label>
                    <Input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 10000 })}
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchQuery('');
                  setPriceRange({ min: 0, max: 10000 });
                  setSelectedDistrict('');
                  setBedroomFilter('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="bg-white rounded-lg p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">
                  Found <span className="font-semibold">{filteredAndSortedProperties.length}</span> properties
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Sort by:</label>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <option value="relevance">Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rating</option>
                    <option value="newest">Newest</option>
                  </Select>
                </div>

                {/* View Toggle */}
                <div className="flex gap-2 border rounded-lg p-1">
                  <Button
                    variant={viewType === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewType('grid')}
                    className="px-3"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewType === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewType('list')}
                    className="px-3"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                {/* Filter Toggle (Mobile) */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Properties Grid/List */}
            {filteredAndSortedProperties.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-600 text-center mb-4">No properties match your criteria</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setPriceRange({ min: 0, max: 10000 });
                      setSelectedDistrict('');
                      setBedroomFilter('');
                    }}
                  >
                    Clear Filters and Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : viewType === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAndSortedProperties.map((property) => (
                  <Card
                    key={property.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden bg-gray-200 h-48">
                      <img
                        src={property.imageUrl}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {property.averageRating > 0 && (
                        <div className="absolute bottom-3 left-3 bg-white rounded-lg px-2 py-1 flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-sm">{property.averageRating.toFixed(1)}</span>
                          <span className="text-xs text-gray-600">({property.totalReviews})</span>
                        </div>
                      )}
                    </div>

                    <CardContent className="pt-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                        {property.title}
                      </h3>

                      <div className="flex items-start gap-1 mb-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {property.address}, {property.city}
                        </p>
                      </div>

                      <div className="flex gap-4 mb-4 text-sm text-gray-600">
                        {property.bedrooms && (
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            <span>{property.bedrooms}</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            <span>{property.bathrooms}</span>
                          </div>
                        )}
                      </div>

                      <div className="mb-4 pb-4 border-b border-gray-200">
                        <p className="text-2xl font-bold text-gray-900">
                          ${property.pricePerMonth.toLocaleString()}
                          <span className="text-sm font-normal text-gray-600">/month</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={property.landlordImage} />
                            <AvatarFallback>{property.landlordName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="text-xs">
                            <p className="font-medium text-gray-900">{property.landlordName}</p>
                            <p className="text-gray-500">Landlord</p>
                          </div>
                        </div>
                        <Link href={`/property?id=${property.id}`}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedProperties.map((property) => (
                  <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                          <img
                            src={property.imageUrl}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                              {property.title}
                            </h3>
                            <div className="flex items-center gap-1 mb-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <p className="text-sm text-gray-600">
                                {property.address}, {property.city}
                                {property.district && `, ${property.district}`}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{property.description}</p>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex gap-6 text-sm">
                              {property.bedrooms && (
                                <div className="flex items-center gap-1">
                                  <Bed className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">{property.bedrooms} Bed{property.bedrooms !== 1 ? 's' : ''}</span>
                                </div>
                              )}
                              {property.bathrooms && (
                                <div className="flex items-center gap-1">
                                  <Bath className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">{property.bathrooms} Bath</span>
                                </div>
                              )}
                              {property.averageRating > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-gray-600">{property.averageRating.toFixed(1)} ({property.totalReviews})</span>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900">
                                ${property.pricePerMonth.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-600">/month</p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={property.landlordImage} />
                              <AvatarFallback>{property.landlordName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="text-xs">
                              <p className="font-medium text-gray-900">{property.landlordName}</p>
                            </div>
                          </div>
                          <Link href={`/property?id=${property.id}`}>
                            <Button size="sm">View Details</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
