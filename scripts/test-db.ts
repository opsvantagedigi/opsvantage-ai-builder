import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        const start = Date.now();
        await prisma.$connect();
        console.log(`Connected in ${Date.now() - start}ms`);

        const projectCount = await prisma.project.count();
        console.log(`Connection successful. Found ${projectCount} projects.`);

        await prisma.$disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Database connection failed:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();
