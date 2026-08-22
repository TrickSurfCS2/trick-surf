import { resolve } from 'node:path'
import process from 'node:process'
import prisma from '../src/prisma'
import { logger } from '../src/utils/logger'

const __dirname = resolve('prisma')

interface SeedFile {
  name: string
  path: string
}

const seedFiles: SeedFile[] = [
  { name: 'user', path: 'sql/user.sql' },
  { name: 'user-permission', path: 'sql/user-permission.sql' },
  { name: 'map', path: 'sql/map.sql' },
  { name: 'trigger', path: 'sql/trigger.sql' },
  { name: 'trick', path: 'sql/trick.sql' },
  { name: 'route', path: 'sql/route.sql' },
  { name: 'complete', path: 'sql/complete.sql' },
]

async function run() {
  logger.info('✨ Run seeds')

  try {
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0')
  }
  catch {
    // Ignore if not supported
  }

  for (const seedFile of seedFiles) {
    try {
      const file = Bun.file(resolve(__dirname, seedFile.path))
      const sql = await file.text()
      const queries = sql
        .split(';')
        .map(q => q.replace(/^\s*--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim())
        .filter(Boolean)

      for (const query of queries) {
        await prisma.$executeRawUnsafe(query)
      }
      logger.info(`✅ Seed completed: ${seedFile.name}`)
    }
    catch (e) {
      logger.error(e, `❌ Seed failed: ${seedFile.name}`)
    }
  }

  try {
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1')
  }
  catch {
    // Ignore if not supported
  }

  logger.info('✨ All seeds finished')
  await prisma.$disconnect()
}

run().catch((e) => {
  logger.error(e, '❌ Seed fatal error')
  process.exit(1)
})
