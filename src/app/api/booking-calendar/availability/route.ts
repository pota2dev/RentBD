import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { propertyId, startDate, endDate, isAvailable, priceOverride } = body;

    // Verify landlord owns the property
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { landlordId: true }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const landlord = await prisma.landlord.findUnique({
      where: { id: userId }
    });

    if (property.landlordId !== landlord?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const availability = await prisma.availability.create({
      data: {
        propertyId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isAvailable,
        priceOverride: priceOverride ? new Decimal(priceOverride) : null
      }
    });

    return NextResponse.json(availability, { status: 201 });
  } catch (error) {
    console.error('Error creating availability:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const availability = await prisma.availability.findMany({
      where: { propertyId },
      orderBy: { startDate: 'asc' }
    });

    const serialized = availability.map(a => ({
      ...a,
      priceOverride: a.priceOverride ? Number(a.priceOverride) : null
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
