import 'dotenv/config';
import { PrismaClient } from './src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany();
        console.log('Users:', users);
    } catch (err) {
        console.error('Error fetching users:', err);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
