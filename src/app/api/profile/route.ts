import { NextRequest } from 'next/server';
import { userController } from '../../../controller/user.controller';

export async function GET(req: NextRequest) {
    return await userController.getProfile(req);
}

export async function PATCH(req: NextRequest) {
    return await userController.updateProfile(req);
}
