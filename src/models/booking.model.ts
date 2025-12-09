import prisma from '../lib/prisma';
import type { Booking, Prisma } from '../../app/generated/prisma';

export const createBooking = async (data: Prisma.BookingCreateInput): Promise<Booking> => {
    return await prisma.booking.create({
        data,
    });
};

export const getBookingById = async (bookingId: string): Promise<Booking | null> => {
    return await prisma.booking.findUnique({
        where: { bookingId },
        include: {
            property: true,
            tenant: true,
        },
    });
};
