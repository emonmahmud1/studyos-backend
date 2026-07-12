import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './prisma/schema',
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    // @ts-ignore
    seed: 'ts-node prisma/seeds/index.ts',
  },
});
