import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { transactions, categories } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await db()
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
    .where(eq(transactions.userId, session.user.id))
    .orderBy(desc(transactions.date))

  return NextResponse.json(data)
}

const CreateSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  categoryId: z.number().nullable(),
  description: z.string().optional(),
  date: z.number(),
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

  const now = Math.floor(Date.now() / 1000)
  const [row] = await db()
    .insert(transactions)
    .values({
      ...parsed.data,
      userId: session.user.id,
      createdAt: now,
    })
    .returning()

  // Fetch with category info
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
    .where(eq(transactions.id, row.id))

  return NextResponse.json(result, { status: 201 })
}
