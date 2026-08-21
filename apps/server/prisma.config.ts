import process from 'node:process'
import { defineConfig } from 'prisma/config'

try {
  process.loadEnvFile?.()
}
catch {
  // Ignore if .env file is missing
}

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'bun prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://surfgxds:surfgxds@localhost:5432/surfgxds_dev?schema=public',
  },
})
