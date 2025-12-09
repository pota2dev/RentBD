import * as userModel from '../models/user.model';
import type { Prisma } from '../../app/generated/prisma';

export const registerUser = async (data: Prisma.UserCreateInput) => {
    try {
        const existingUser = await userModel.findUserByEmail(data.email);
        if (existingUser) {
            throw new Error('User already exists');
        }
        return await userModel.createUser(data);
    } catch (error) {
        throw error;
    }
};

export const getUserProfile = async (userId: string) => {
    try {
        const user = await userModel.findUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (error) {
        throw error;
    }
};
