import { NextResponse } from 'next/server';
import { getPropertyById } from '../controller';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
  }

  const property = await getPropertyById(id);

  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }

  return NextResponse.json(property);
}
