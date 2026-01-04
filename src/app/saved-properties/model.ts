import { prisma } from '@/lib/prisma';
import { getProfileController } from '../profile/model';

export async function getSavedProperties() {
    try {
        const { data: user, error, status } = await getProfileController();

        if (error || !user) {
            return { error: error || 'User not found', status: status || 404 };
        }

        const userData = user as any;

        if (!userData.Tenant) {
            return { error: 'Tenant profile not found. Please set your role to Tenant in /profile', status: 404 };
        }

        const savedProperties = await prisma.savedProperty.findMany({
            where: { tenantId: userData.Tenant.id },
            orderBy: { savedAt: 'desc' },
            include: {
                Property: {
                    include: {
                        PropertyImage: {
                            where: { isPrimary: true },
                            take: 1
                        },
                        Landlord: {
                            include: {
                                User: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                        profilePicture: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return { data: savedProperties, status: 200 };

    } catch (error) {
        console.error('Error fetching saved properties:', error);
        return { error: 'Internal Server Error', status: 500 };
    }
}

export async function addPropertyToSaved(propertyId: string) {
    try {
        const { data: user, error, status } = await getProfileController();

        if (error || !user) {
            return { error: error || 'User not found', status: status || 404 };
        }

        const userData = user as any;

        if (!userData.Tenant) {
            return { error: 'Tenant profile not found', status: 404 };
        }

        // Check if property exists
        const property = await prisma.property.findUnique({
            where: { id: propertyId }
        });

        if (!property) {
            return { error: 'Property not found', status: 404 };
        }

        // Check if already saved
        const existingSaved = await prisma.savedProperty.findUnique({
            where: {
                tenantId_propertyId: {
                    tenantId: userData.Tenant.id,
                    propertyId
                }
            }
        });

        if (existingSaved) {
            return { error: 'Property already saved', status: 400 };
        }

        const savedProperty = await prisma.savedProperty.create({
            data: {
                tenantId: userData.Tenant.id,
                propertyId
            },
            include: {
                Property: {
                    include: {
                        PropertyImage: {
                            where: { isPrimary: true },
                            take: 1
                        },
                        Landlord: {
                            include: {
                                User: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                        profilePicture: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return { data: savedProperty, status: 201 };

    } catch (error) {
        console.error('Error adding property to saved:', error);
        return { error: 'Internal Server Error', status: 500 };
    }
}

export async function removePropertyFromSaved(propertyId: string) {
    try {
        const { data: user, error, status } = await getProfileController();

        if (error || !user) {
            return { error: error || 'User not found', status: status || 404 };
        }

        const userData = user as any;

        if (!userData.Tenant) {
            return { error: 'Tenant profile not found', status: 404 };
        }

        const savedProperty = await prisma.savedProperty.findUnique({
            where: {
                tenantId_propertyId: {
                    tenantId: userData.Tenant.id,
                    propertyId
                }
            }
        });

        if (!savedProperty) {
            return { error: 'Saved property not found', status: 404 };
        }

        await prisma.savedProperty.delete({
            where: {
                tenantId_propertyId: {
                    tenantId: userData.Tenant.id,
                    propertyId
                }
            }
        });

        return { status: 200 };

    } catch (error) {
        console.error('Error removing property from saved:', error);
        return { error: 'Internal Server Error', status: 500 };
    }
}

export async function isPropertySaved(propertyId: string) {
    try {
        const { data: user, error } = await getProfileController();

        if (error || !user) {
            return false;
        }

        const userData = user as any;

        if (!userData.Tenant) {
            return false;
        }

        const savedProperty = await prisma.savedProperty.findUnique({
            where: {
                tenantId_propertyId: {
                    tenantId: userData.Tenant.id,
                    propertyId
                }
            }
        });

        return !!savedProperty;

    } catch (error) {
        console.error('Error checking if property is saved:', error);
        return false;
    }
}

export async function getSavedPropertyCount() {
    try {
        const { data: user, error } = await getProfileController();

        if (error || !user) {
            return 0;
        }

        const userData = user as any;

        if (!userData.Tenant) {
            return 0;
        }

        const count = await prisma.savedProperty.count({
            where: { tenantId: userData.Tenant.id }
        });

        return count;

    } catch (error) {
        console.error('Error getting saved property count:', error);
        return 0;
    }
}
