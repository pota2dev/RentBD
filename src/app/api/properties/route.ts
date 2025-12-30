import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// Helper to get Landlord ID
async function getLandlordId(userId: string) {
    const user = await prisma.user.findUnique({
        where: { userId },
        include: { Landlord: true },
    });
    return user?.Landlord?.landlordId;
}

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const ownerMode = searchParams.get('mode') === 'owner';

        if (ownerMode) {
             const landlordId = await getLandlordId(userId);
             if (!landlordId) {
                 return NextResponse.json({ error: 'User is not a landlord' }, { status: 403 });
             }

             const properties = await prisma.property.findMany({
                 where: { landlordId },
                 orderBy: { createdAt: 'desc' }
             });
             return NextResponse.json(properties);
        }

        // Default: List all active properties (for browsing) // Or maybe just owner's depending on requirement
        // The user request said "Create a route that will display the propeties the user owns".
        // So this API needs to support that.
        // I will default to returning owner properties if no params provided?
        // Let's stick to explicit 'mode=owner' for safety, or check logic.
        
        // Actually for this task, we mainly need the 'owner' list.
        // Let's implement generic get if needed later, but focusing on user request:
        
        const landlordId = await getLandlordId(userId);
        if (landlordId) {
             const properties = await prisma.property.findMany({
                 where: { landlordId },
                 orderBy: { createdAt: 'desc' }
             });
             return NextResponse.json(properties);
        } else {
            return NextResponse.json([]); // Return empty if not landlord
        }

    } catch (error) {
        console.error('Error fetching properties:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const landlordId = await getLandlordId(userId);
        if (!landlordId) {
             return NextResponse.json({ error: 'You must be a landlord to list properties. Please update your profile.' }, { status: 403 });
        }

        const data = await req.json();

        const property = await prisma.property.create({
            data: {
                propertyId: crypto.randomUUID(),
                landlordId,
                title: data.title,
                description: data.description,
                type: data.type,
                address: data.address,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                pricePerNight: data.pricePerNight,
                bedrooms: data.bedrooms,
                bathrooms: data.bathrooms,
                maxGuests: data.maxGuests,
                status: 'DRAFT', // Default to active or draft? Let's say DRAFT or PENDING_APPROVAL based on schema. Schema default is DRAFT.
                updatedAt: new Date(),
            }
        });

        return NextResponse.json(property, { status: 201 });
    } catch (error) {
        console.error('Error creating property:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        const { propertyId, ...updates } = data;

        if (!propertyId) {
            return NextResponse.json({ error: 'Property ID required' }, { status: 400 });
        }

        // Verify ownership
        const property = await prisma.property.findUnique({
            where: { propertyId },
            include: { Landlord: true }
        });

        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        if (property.Landlord.userId !== userId) {
             return NextResponse.json({ error: 'Unauthorized to edit this property' }, { status: 403 });
        }

        const updated = await prisma.property.update({
            where: { propertyId },
            data: {
                title: updates.title,
                description: updates.description,
                type: updates.type,
                address: updates.address,
                city: updates.city,
                state: updates.state,
                zipCode: updates.zipCode,
                pricePerNight: updates.pricePerNight,
                bedrooms: updates.bedrooms,
                bathrooms: updates.bathrooms,
                maxGuests: updates.maxGuests,
                updatedAt: new Date(),
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating property:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const propertyId = searchParams.get('id');

        if (!propertyId) {
            return NextResponse.json({ error: 'Property ID required' }, { status: 400 });
        }

        // Verify ownership
        const property = await prisma.property.findUnique({
             where: { propertyId },
             include: { Landlord: true }
        });

        if (!property) {
             return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        if (property.Landlord.userId !== userId) {
             return NextResponse.json({ error: 'Unauthorized to delete this property' }, { status: 403 });
        }

        // Hard delete or soft delete? Schema has CASCADE onDelete for relations usually.
        // User asked to "Delete a property".
        await prisma.property.delete({
            where: { propertyId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting property:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
