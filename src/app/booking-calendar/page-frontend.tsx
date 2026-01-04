import BookingCalendarView from './view';
import { getPropertyBookings, getPropertyAvailability } from './model-frontend';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata = {
  title: 'Booking Calendar | RentBD',
  description: 'Manage property bookings and availability'
};

export default async function BookingCalendarPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const propertyId = searchParams.propertyId as string || 'mock-property-1';
  const propertyTitle = 'Luxury Apartment in Gulshan';

  try {
    const bookingsResult = getPropertyBookings(propertyId);
    const availabilityResult = getPropertyAvailability(propertyId);

    const serializedBookings = bookingsResult.data?.map((b: any) => ({
      ...b,
      totalPrice: Number(b.totalPrice)
    })) || [];

    const serializedAvailability = availabilityResult.data?.map((a: any) => ({
      ...a,
      priceOverride: a.priceOverride ? Number(a.priceOverride) : null
    })) || [];

    return (
      <BookingCalendarView
        propertyId={propertyId}
        propertyTitle={propertyTitle}
        bookings={serializedBookings}
        availabilityWindows={serializedAvailability}
      />
    );
  } catch (error) {
    console.error('Error loading booking calendar:', error);
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <h1 className="text-xl font-semibold text-gray-500">Error loading calendar. Please try again.</h1>
      </div>
    );
  }
}
