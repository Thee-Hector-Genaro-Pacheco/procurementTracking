import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

// Ensure Prisma Client is only instantiated once
const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (globalForPrisma.prisma) {
  prisma = globalForPrisma.prisma;
} else {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }
}

export default prisma;
