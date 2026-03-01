import { reset, seed } from 'drizzle-seed'
import { db, sql } from './connections.ts'
import { schema } from './schema/index.ts'

// Exclude audioChunks from seeding as drizzle-seed doesn't support vector columns
const { audioChunks: _, ...seedSchema } = schema

await reset(db, schema)
await seed(db, seedSchema).refine((f) => {
  return {
    rooms: {
      count: 20,
      columns: {
        name: f.companyName(),
        description: f.loremIpsum(),
      },
    },
    questions: {
      count: 20,
    },
  }
})

await sql.end()

// biome-ignore lint/suspicious/noConsole: only used in dev
console.log('Database seeded')
