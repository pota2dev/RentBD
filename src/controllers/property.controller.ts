import * as propertyModel from '../models/property.model';
import type { Prisma } from '../../app/generated/prisma';

export const listProperties = async () => {
    try {
        return await propertyModel.getAllProperties();
    } catch (error) {
        throw error;
    }
};

export const getPropertyDetails = async (propertyId: string) => {
    try {
        const property = await propertyModel.getPropertyById(propertyId);
        if (!property) {
            throw new Error('Property not found');
        }
        return property;
    } catch (error) {
        throw error;
    }
};

export const addNewProperty = async (data: Prisma.PropertyCreateInput) => {
    try {
        return await propertyModel.createProperty(data);
    } catch (error) {
        throw error;
    }
};
