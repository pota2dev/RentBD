import prisma from '../lib/prisma';
import type { Property, Prisma } from '../../app/generated/prisma';

export const createProperty = async (data: Prisma.PropertyCreateInput): Promise<Property> => {
    return await prisma.property.create({
        data,
    });
};

export const getPropertyById = async (propertyId: string): Promise<Property | null> => {
    return await prisma.property.findUnique({
        where: { propertyId },
        include: {
            images: true,
            amenities: true,
            landlord: true,
        },
    });
};

export const getAllProperties = async (): Promise<Property[]> => {
    return await prisma.property.findMany({
        include: {
            images: true,
            amenities: true,
        },
    });
};
