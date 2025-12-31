import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
    createProperty, 
    updateProperty, 
    deleteProperty, 
    getOwnedProperties,
    getLandlordId
} from '../../manage-properties/model';
import { prisma } from '@/lib/prisma'; // Still needed for the default GET generic listing if not owner mode

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        // Allow public access for listing? If so, remove strict auth check for default mode.
        // But for 'owner' mode, auth is required.
        
        const { searchParams } = new URL(req.url);
        const ownerMode = searchParams.get('mode') === 'owner';

        if (ownerMode) {
             if (!userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
             }
             const { data, error, status } = await getOwnedProperties();
             if (error) {
                 return NextResponse.json({ error }, { status });
             }
             return NextResponse.json(data, { status });
        }

        // Default: List all active properties (for browsing)
        // Ideally this should be in src/app/property/model.ts as getAllProperties()
        // For now, keeping it here is fine as it's a general query.
        
        const properties = await prisma.property.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                PropertyImage: {
                    where: { isPrimary: true }
                }
            }
        });
        return NextResponse.json(properties);

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

        const data = await req.json();
        const { data: property, error, status } = await createProperty(data, userId);

        if (error) {
            return NextResponse.json({ error }, { status });
        }

        return NextResponse.json(property, { status });
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
        const { id } = data;
        
        if (!id) {
            return NextResponse.json({ error: 'Property ID required' }, { status: 400 });
        }
        
        const { data: updated, error, status } = await updateProperty(id, data, userId);

        if (error) {
            return NextResponse.json({ error }, { status });
        }

        return NextResponse.json(updated, { status });
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

        const { success, error, status } = await deleteProperty(propertyId, userId);

        if (error) {
            return NextResponse.json({ error }, { status });
        }

        return NextResponse.json({ success }, { status });
    } catch (error) {
        console.error('Error deleting property:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
