// Mock data for testing - Frontend only
export interface Booking {
  id: string;
  checkInDate: string | Date;
  checkOutDate: string | Date;
  status: string;
  numberOfGuests?: number;
  totalPrice: number;
  Tenant: {
    User: {
      firstName?: string;
      lastName?: string;
      email: string;
      profilePicture?: string;
    };
  };
}

export interface AvailabilityWindow {
  id: string;
  startDate: string | Date;
  endDate: string | Date;
  isAvailable: boolean;
  priceOverride: number | null;
}

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'booking-1',
    checkInDate: new Date(2026, 0, 10),
    checkOutDate: new Date(2026, 0, 17),
    status: 'CONFIRMED',
    numberOfGuests: 2,
    totalPrice: 3500,
    Tenant: {
      User: {
        firstName: 'Rajib',
        lastName: 'Hasan',
        email: 'rajib@example.com',
        profilePicture: '/placeholder-avatar.jpg'
      }
    }
  },
  {
    id: 'booking-2',
    checkInDate: new Date(2026, 0, 20),
    checkOutDate: new Date(2026, 0, 27),
    status: 'ACCEPTED',
    numberOfGuests: 3,
    totalPrice: 4200,
    Tenant: {
      User: {
        firstName: 'Nasrin',
        lastName: 'Akter',
        email: 'nasrin@example.com',
        profilePicture: '/placeholder-avatar.jpg'
      }
    }
  },
  {
    id: 'booking-3',
    checkInDate: new Date(2026, 1, 5),
    checkOutDate: new Date(2026, 1, 12),
    status: 'PENDING',
    numberOfGuests: 2,
    totalPrice: 3500,
    Tenant: {
      User: {
        firstName: 'Karim',
        lastName: 'Khan',
        email: 'karim@example.com',
        profilePicture: '/placeholder-avatar.jpg'
      }
    }
  },
  {
    id: 'booking-4',
    checkInDate: new Date(2026, 1, 15),
    checkOutDate: new Date(2026, 1, 22),
    status: 'CONFIRMED',
    numberOfGuests: 4,
    totalPrice: 5600,
    Tenant: {
      User: {
        firstName: 'Salma',
        lastName: 'Islam',
        email: 'salma@example.com',
        profilePicture: '/placeholder-avatar.jpg'
      }
    }
  }
];

const MOCK_AVAILABILITY_WINDOWS: AvailabilityWindow[] = [
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

export function getPropertyBookings(propertyId: string) {
  return { data: MOCK_BOOKINGS, status: 200 };
}

export function getPropertyAvailability(propertyId: string) {
  return { data: MOCK_AVAILABILITY_WINDOWS, status: 200 };
}
