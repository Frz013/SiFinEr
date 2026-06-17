import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['income', 'expense']).optional(),
  color: z.string().optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  await db()
    .update(categories)
    .set(parsed.data)
    .where(
      and(
        eq(categories.id, Number(id)),
        eq(categories.userId, session.user.id)
      )
    )

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await db()
    .delete(categories)
    .where(
      and(
        eq(categories.id, Number(id)),
        eq(categories.userId, session.user.id)
      )
    )

  return NextResponse.json({ success: true })
}
