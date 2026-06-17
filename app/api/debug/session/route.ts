import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  const userId = session?.user?.id

  let dbUser = null
  if (userId) {
    const [u] = await db().select().from(users).where(eq(users.id, userId))
    dbUser = u || null
  }

  return NextResponse.json({
    sessionUserId: userId,
    sessionUser: session?.user,
    dbUser,
    allUsers: await db().select({ id: users.id, email: users.email }).from(users),
  })
}
