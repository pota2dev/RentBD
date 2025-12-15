import { PrismaClient } from "@/generated/prisma/client";
const prisma = new PrismaClient();

async function seed() {
    prisma.landlord.create({
        data: {
            
        }
    })
}
