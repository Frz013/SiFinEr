import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const SettingsSchema = z.object({
  name: z.string().min(1).optional(),
  currency: z.enum(['IDR', 'USD', 'EUR', 'SGD']).optional(),
  initialBalance: z.number().optional(),
  autoBackupEnabled: z.number().optional(),
  autoBackupDay: z.number().min(0).max(6).optional(),
})

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = SettingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  await db()
    .update(users)
    .set(parsed.data)
    .where(eq(users.id, session.user.id))

  return NextResponse.json({ success: true })
}
