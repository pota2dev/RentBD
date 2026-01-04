import SavedPropertiesView from './view';

// Mock data for testing - Frontend only
const MOCK_SAVED_PROPERTIES = [
  {
    id: 'saved-1',
    propertyId: 'prop-1',
    savedAt: new Date('2026-01-03').toISOString(),
    Property: {
      id: 'prop-1',
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
      PropertyImage: [{ id: 'img-1', imageUrl: '/placeholder-property.jpg', isPrimary: true }],
      Landlord: { User: { firstName: 'Ahmed', lastName: 'Khan', profilePicture: '/placeholder-avatar.jpg' } }
    }
  },
  {
    id: 'saved-2',
    propertyId: 'prop-2',
    savedAt: new Date('2026-01-01').toISOString(),
    Property: {
      id: 'prop-2',
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
      PropertyImage: [{ id: 'img-2', imageUrl: '/placeholder-property.jpg', isPrimary: true }],
      Landlord: { User: { firstName: 'Hassan', lastName: 'Bin Rashid', profilePicture: '/placeholder-avatar.jpg' } }
    }
  },
  {
    id: 'saved-3',
    propertyId: 'prop-3',
    savedAt: new Date('2025-12-28').toISOString(),
    Property: {
      id: 'prop-3',
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
      PropertyImage: [{ id: 'img-3', imageUrl: '/placeholder-property.jpg', isPrimary: true }],
      Landlord: { User: { firstName: 'Muhammad', lastName: 'Ali', profilePicture: '/placeholder-avatar.jpg' } }
    }
  },
  {
    id: 'saved-4',
    propertyId: 'prop-4',
    savedAt: new Date('2025-12-20').toISOString(),
    Property: {
      id: 'prop-4',
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
      PropertyImage: [{ id: 'img-4', imageUrl: '/placeholder-property.jpg', isPrimary: true }],
      Landlord: { User: { firstName: 'Fatima', lastName: 'Ahmed', profilePicture: '/placeholder-avatar.jpg' } }
    }
  }
];

export const metadata = {
  title: 'Saved Properties | RentBD',
  description: 'View and manage your saved properties and watchlist'
};

export default function SavedPropertiesPage() {
  return <SavedPropertiesView savedProperties={MOCK_SAVED_PROPERTIES} />;
}
