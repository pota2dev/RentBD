import prisma from '../lib/prisma';
import type { User, Prisma } from '../../app/generated/prisma';

export const createUser = async (data: Prisma.UserCreateInput): Promise<User> => {
    return await prisma.user.create({
        data,
    });
};

export const findUserById = async (userId: string): Promise<User | null> => {
    return await prisma.user.findUnique({
        where: { userId },
    });
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
    return await prisma.user.findUnique({
        where: { email },
    });
};

export const getAllUsers = async (): Promise<User[]> => {
    return await prisma.user.findMany();
};
