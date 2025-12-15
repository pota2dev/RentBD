import { NextRequest } from 'next/server';
import { getProfile, updateProfile } from '../../../controller/user.controller';

export async function GET(req: NextRequest) {
    return await getProfile(req);
}

export async function PATCH(req: NextRequest) {
    return await updateProfile(req);
}
