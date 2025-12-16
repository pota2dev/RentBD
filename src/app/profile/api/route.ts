import { NextRequest, NextResponse } from 'next/server';
import { getProfileController, updateProfileController } from '../controller';

export async function GET(req: NextRequest) {
    const { data, error, status } = await getProfileController();
    if (error) {
        return NextResponse.json({ error, details: data }, { status });
    }
    return NextResponse.json(data, { status });
}

export async function PATCH(req: NextRequest) {
    const { data, error, status } = await updateProfileController(req);
    if (error) {
        return NextResponse.json({ error }, { status });
    }
    return NextResponse.json(data, { status });
}
