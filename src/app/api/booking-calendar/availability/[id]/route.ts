import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get availability window
    const availability = await prisma.availability.findUnique({
      where: { id },
      include: { Property: { select: { landlordId: true } } }
    });

    if (!availability) {
      return NextResponse.json({ error: 'Availability window not found' }, { status: 404 });
    }

    const landlord = await prisma.landlord.findUnique({
      where: { id: userId }
    });

    if (availability.Property.landlordId !== landlord?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.availability.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting availability:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Get availability window
    const availability = await prisma.availability.findUnique({
      where: { id },
      include: { Property: { select: { landlordId: true } } }
    });

    if (!availability) {
      return NextResponse.json({ error: 'Availability window not found' }, { status: 404 });
    }

    const landlord = await prisma.landlord.findUnique({
      where: { id: userId }
    });

    if (availability.Property.landlordId !== landlord?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updateData: any = {};
    if (body.startDate) updateData.startDate = new Date(body.startDate);
    if (body.endDate) updateData.endDate = new Date(body.endDate);
    if (body.isAvailable !== undefined) updateData.isAvailable = body.isAvailable;
    if (body.priceOverride !== null && body.priceOverride !== undefined) {
      updateData.priceOverride = body.priceOverride;
    }

    const updated = await prisma.availability.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      ...updated,
      priceOverride: updated.priceOverride ? Number(updated.priceOverride) : null
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
