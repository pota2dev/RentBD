import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    // Get tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: userId }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant profile not found' }, { status: 404 });
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Check if already saved
    const existingSaved = await prisma.savedProperty.findUnique({
      where: {
        tenantId_propertyId: {
          tenantId: tenant.id,
          propertyId
        }
      }
    });

    if (existingSaved) {
      return NextResponse.json({ error: 'Property already saved' }, { status: 400 });
    }

    const savedProperty = await prisma.savedProperty.create({
      data: {
        tenantId: tenant.id,
        propertyId
      },
      include: {
        Property: {
          include: {
            PropertyImage: true,
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

    return NextResponse.json(savedProperty, { status: 201 });
  } catch (error) {
    console.error('Error saving property:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: userId }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant profile not found' }, { status: 404 });
    }

    const savedProperties = await prisma.savedProperty.findMany({
      where: { tenantId: tenant.id },
      orderBy: { savedAt: 'desc' },
      include: {
        Property: {
          include: {
            PropertyImage: true,
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

    return NextResponse.json(savedProperties);
  } catch (error) {
    console.error('Error fetching saved properties:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
