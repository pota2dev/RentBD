import { prisma } from '@/lib/prisma';

export async function getPropertyAvailability(propertyId: string) {
    try {
        const availability = await prisma.availability.findMany({
            where: { propertyId },
            orderBy: { startDate: 'asc' }
        });

        return { data: availability, status: 200 };
    } catch (error) {
        console.error('Error fetching availability:', error);
        return { error: 'Failed to fetch availability', status: 500 };
    }
}

export async function getPropertyBookings(propertyId: string) {
    try {
        const bookings = await prisma.booking.findMany({
            where: { propertyId },
            orderBy: { checkInDate: 'asc' },
            include: {
                Tenant: {
                    include: {
                        User: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                profilePicture: true
                            }
                        }
                    }
                }
            }
        });

        return { data: bookings, status: 200 };
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return { error: 'Failed to fetch bookings', status: 500 };
    }
}

export async function createAvailabilityWindow(
    propertyId: string,
    startDate: Date,
    endDate: Date,
    isAvailable: boolean,
    priceOverride?: number,
) {
    try {
        const availability = await prisma.availability.create({
            data: {
                propertyId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isAvailable,
                priceOverride: priceOverride ? priceOverride : null
            }
        });

        return { data: availability, status: 201 };
    } catch (error) {
        console.error('Error creating availability window:', error);
        return { error: 'Failed to create availability window', status: 500 };
    }
}

export async function updateAvailabilityWindow(
    availabilityId: string,
    data: {
        startDate?: Date;
        endDate?: Date;
        isAvailable?: boolean;
        priceOverride?: number | null;
    }
) {
    try {
        const updateData: any = {};
        
        if (data.startDate) updateData.startDate = new Date(data.startDate);
        if (data.endDate) updateData.endDate = new Date(data.endDate);
        if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;
        if (data.priceOverride !== null && data.priceOverride !== undefined) {
            updateData.priceOverride = data.priceOverride;
        }

        const availability = await prisma.availability.update({
            where: { id: availabilityId },
            data: updateData
        });

        return { data: availability, status: 200 };
    } catch (error) {
        console.error('Error updating availability window:', error);
        return { error: 'Failed to update availability window', status: 500 };
    }
}

export async function deleteAvailabilityWindow(availabilityId: string) {
    try {
        await prisma.availability.delete({
            where: { id: availabilityId }
        });

        return { status: 200 };
    } catch (error) {
        console.error('Error deleting availability window:', error);
        return { error: 'Failed to delete availability window', status: 500 };
    }
}

export async function checkPropertyAvailability(
    propertyId: string,
    checkInDate: Date,
    checkOutDate: Date
): Promise<boolean> {
    try {
        // Check if dates conflict with any bookings
        const conflictingBooking = await prisma.booking.findFirst({
            where: {
                propertyId,
                AND: [
                    { checkInDate: { lt: new Date(checkOutDate) } },
                    { checkOutDate: { gt: new Date(checkInDate) } }
                ],
                status: {
                    in: ['PENDING', 'ACCEPTED', 'CONFIRMED']
                }
            }
        });

        return !conflictingBooking;
    } catch (error) {
        console.error('Error checking availability:', error);
        return false;
    }
}

export async function getPropertyAvailabilityForTenant(propertyId: string) {
    try {
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            select: {
                pricePerMonth: true,
                Availability: {
                    orderBy: { startDate: 'asc' }
                },
                Booking: {
                    where: {
                        status: {
                            in: ['PENDING', 'ACCEPTED', 'CONFIRMED']
                        }
                    },
                    orderBy: { checkInDate: 'asc' }
                }
            }
        });

        if (!property) {
            return { error: 'Property not found', status: 404 };
        }

        return { data: property, status: 200 };
    } catch (error) {
        console.error('Error fetching property availability for tenant:', error);
        return { error: 'Failed to fetch availability', status: 500 };
    }
}
