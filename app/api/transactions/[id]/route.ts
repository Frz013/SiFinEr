import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { transactions, categories } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const UpdateSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(['income', 'expense']).optional(),
  categoryId: z.number().nullable().optional(),
  description: z.string().optional(),
  date: z.number().optional(),
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
    .update(transactions)
    .set(parsed.data)
    .where(
      and(
        eq(transactions.id, Number(id)),
        eq(transactions.userId, session.user.id)
      )
    )

  // Fetch updated row with category info
  const [result] = await db()
    .select({
      id: transactions.id,
      userId: transactions.userId,
      amount: transactions.amount,
      type: transactions.type,
      categoryId: transactions.categoryId,
      description: transactions.description,
      date: transactions.date,
      createdAt: transactions.createdAt,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.id, Number(id)))

  return NextResponse.json(result)
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
    .delete(transactions)
    .where(
      and(
        eq(transactions.id, Number(id)),
        eq(transactions.userId, session.user.id)
      )
    )

  return NextResponse.json({ success: true })
}
