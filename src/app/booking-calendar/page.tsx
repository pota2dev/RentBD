import { getPropertyBookings, getPropertyAvailability } from './model';
import BookingCalendarView from './view';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Mock bookings data
const MOCK_BOOKINGS = [
  {
    id: 'booking-1',
    checkInDate: new Date(2026, 0, 10),
    checkOutDate: new Date(2026, 0, 17),
    status: 'CONFIRMED',
    numberOfGuests: 2,
    totalPrice: 3500,
    Tenant: { User: { firstName: 'Rajib', lastName: 'Hasan', email: 'rajib@example.com', profilePicture: '/placeholder-avatar.jpg' } }
  },
  {
    id: 'booking-2',
    checkInDate: new Date(2026, 0, 20),
    checkOutDate: new Date(2026, 0, 27),
    status: 'ACCEPTED',
    numberOfGuests: 3,
    totalPrice: 4200,
    Tenant: { User: { firstName: 'Nasrin', lastName: 'Akter', email: 'nasrin@example.com', profilePicture: '/placeholder-avatar.jpg' } }
  },
  {
    id: 'booking-3',
    checkInDate: new Date(2026, 1, 5),
    checkOutDate: new Date(2026, 1, 12),
    status: 'PENDING',
    numberOfGuests: 2,
    totalPrice: 3500,
    Tenant: { User: { firstName: 'Karim', lastName: 'Khan', email: 'karim@example.com', profilePicture: '/placeholder-avatar.jpg' } }
  },
  {
    id: 'booking-4',
    checkInDate: new Date(2026, 1, 15),
    checkOutDate: new Date(2026, 1, 22),
    status: 'CONFIRMED',
    numberOfGuests: 4,
    totalPrice: 5600,
    Tenant: { User: { firstName: 'Salma', lastName: 'Islam', email: 'salma@example.com', profilePicture: '/placeholder-avatar.jpg' } }
  }
];

const MOCK_AVAILABILITY = [
  {
    id: 'avail-1',
    startDate: new Date(2026, 0, 1),
    endDate: new Date(2026, 0, 9),
    isAvailable: true,
    priceOverride: null
  },
  {
    id: 'avail-2',
    startDate: new Date(2026, 0, 28),
    endDate: new Date(2026, 1, 4),
    isAvailable: false,
    priceOverride: null
  },
  {
    id: 'avail-3',
    startDate: new Date(2026, 1, 23),
    endDate: new Date(2026, 2, 10),
    isAvailable: true,
    priceOverride: 2800
  }
];

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BookingCalendarPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const propertyId = (searchParams.propertyId as string) || 'mock-property-1';
  const propertyTitle = 'Luxury Apartment in Gulshan';

  return (
    <BookingCalendarView
      propertyId={propertyId}
      propertyTitle={propertyTitle}
      bookings={MOCK_BOOKINGS}
      availabilityWindows={MOCK_AVAILABILITY}
    />
  );
}
