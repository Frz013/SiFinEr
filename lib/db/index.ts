import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'

function getClient() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  })
}

export function getDb() {
  return drizzle(getClient(), { schema })
}

// Export a singleton for convenience (will be initialized on first use)
let _db: ReturnType<typeof drizzle> | null = null
export function db() {
  if (!_db) {
    _db = drizzle(getClient(), { schema })
  }
  return _db
}
