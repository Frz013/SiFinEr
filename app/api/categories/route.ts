import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await db()
    .select()
    .from(categories)
    .where(eq(categories.userId, session.user.id))
    .orderBy(desc(categories.id))

  return NextResponse.json(data)
}

const CreateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['income', 'expense']),
  color: z.string().default('#FACC15'),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const [row] = await db()
    .insert(categories)
    .values({
      ...parsed.data,
      userId: session.user.id,
    })
    .returning()

  return NextResponse.json(row, { status: 201 })
}
