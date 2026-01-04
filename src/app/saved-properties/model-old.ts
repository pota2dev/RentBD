// Mock data for testing - Frontend only
export interface SavedPropertyData {
  id: string;
  propertyId: string;
  savedAt: string;
  Property: {
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
    PropertyImage: Array<{
      id: string;
      imageUrl: string;
      isPrimary: boolean;
    }>;
    Landlord: {
      User: {
        firstName?: string;
        lastName?: string;
        profilePicture?: string;
      };
    };
  };
}

const MOCK_SAVED_PROPERTIES: SavedPropertyData[] = [
  {
    id: 'saved-1',
    propertyId: 'prop-1',
    savedAt: new Date('2026-01-03').toISOString(),
    Property: {
      id: 'prop-1',
      title: 'Modern Apartment in Gulshan',
      description: 'Luxury apartment with great amenities and modern design',
      address: '123 Main Street',
      city: 'Dhaka',
      district: 'Gulshan',
      bedrooms: 3,
      bathrooms: 2,
      pricePerMonth: 2500,
      averageRating: 4.8,
      totalReviews: 24,
      PropertyImage: [
        {
          id: 'img-1',
          imageUrl: '/placeholder-property.jpg',
          isPrimary: true
        }
      ],
      Landlord: {
        User: {
          firstName: 'Ahmed',
          lastName: 'Khan',
          profilePicture: '/placeholder-avatar.jpg'
        }
      }
    }
  },
  {
    id: 'saved-2',
    propertyId: 'prop-2',
    savedAt: new Date('2026-01-01').toISOString(),
    Property: {
      id: 'prop-2',
      title: 'Premium Penthouse in Gulshan',
      description: 'Top floor with panoramic city views and luxury amenities',
      address: '654 Maple Drive',
      city: 'Dhaka',
      district: 'Gulshan',
      bedrooms: 4,
      bathrooms: 3,
      pricePerMonth: 5500,
      averageRating: 4.9,
      totalReviews: 35,
      PropertyImage: [
        {
          id: 'img-2',
          imageUrl: '/placeholder-property.jpg',
          isPrimary: true
        }
      ],
      Landlord: {
        User: {
          firstName: 'Hassan',
          lastName: 'Bin Rashid',
          profilePicture: '/placeholder-avatar.jpg'
        }
      }
    }
  },
  {
    id: 'saved-3',
    propertyId: 'prop-3',
    savedAt: new Date('2025-12-28').toISOString(),
    Property: {
      id: 'prop-3',
      title: 'Spacious Family Home in Dhanmondi',
      description: 'Large home with beautiful garden and spacious rooms',
      address: '789 Elm Street',
      city: 'Dhaka',
      district: 'Dhanmondi',
      bedrooms: 5,
      bathrooms: 3,
      pricePerMonth: 4500,
      averageRating: 4.9,
      totalReviews: 42,
      PropertyImage: [
        {
          id: 'img-3',
          imageUrl: '/placeholder-property.jpg',
          isPrimary: true
        }
      ],
      Landlord: {
        User: {
          firstName: 'Muhammad',
          lastName: 'Ali',
          profilePicture: '/placeholder-avatar.jpg'
        }
      }
    }
  },
  {
    id: 'saved-4',
    propertyId: 'prop-4',
    savedAt: new Date('2025-12-20').toISOString(),
    Property: {
      id: 'prop-4',
      title: 'Cozy Studio in Banani',
      description: 'Perfect for single professionals near metro station',
      address: '456 Oak Avenue',
      city: 'Dhaka',
      district: 'Banani',
      bedrooms: 1,
      bathrooms: 1,
      pricePerMonth: 1200,
      averageRating: 4.5,
      totalReviews: 18,
      PropertyImage: [
        {
          id: 'img-4',
          imageUrl: '/placeholder-property.jpg',
          isPrimary: true
        }
      ],
      Landlord: {
        User: {
          firstName: 'Fatima',
          lastName: 'Ahmed',
          profilePicture: '/placeholder-avatar.jpg'
        }
      }
    }
  }
];

export async function getSavedProperties() {
  return { data: MOCK_SAVED_PROPERTIES, status: 200 };
}

export async function addPropertyToSaved(propertyId: string) {
  return { 
    data: MOCK_SAVED_PROPERTIES[0], 
    status: 201 
  };
}

export async function removePropertyFromSaved(propertyId: string) {
  return { status: 200 };
}

export async function isPropertySaved(propertyId: string) {
  return true;
}

export async function getSavedPropertyCount() {
  return MOCK_SAVED_PROPERTIES.length;
}
