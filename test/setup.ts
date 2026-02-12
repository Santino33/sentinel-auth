import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

process.env.SMTP_HOST = '';

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
