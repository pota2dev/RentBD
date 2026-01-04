import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId } = await params;

    const tenant = await prisma.tenant.findUnique({
      where: { id: userId }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant profile not found' }, { status: 404 });
    }

    const savedProperty = await prisma.savedProperty.findUnique({
      where: {
        tenantId_propertyId: {
          tenantId: tenant.id,
          propertyId
        }
      }
    });

    if (!savedProperty) {
      return NextResponse.json({ error: 'Saved property not found' }, { status: 404 });
    }

    await prisma.savedProperty.delete({
      where: {
        tenantId_propertyId: {
          tenantId: tenant.id,
          propertyId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting saved property:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId } = await params;

    const tenant = await prisma.tenant.findUnique({
      where: { id: userId }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant profile not found' }, { status: 404 });
    }

    const savedProperty = await prisma.savedProperty.findUnique({
      where: {
        tenantId_propertyId: {
          tenantId: tenant.id,
          propertyId
        }
      }
    });

    return NextResponse.json({ isSaved: !!savedProperty });
  } catch (error) {
    console.error('Error checking if property is saved:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
