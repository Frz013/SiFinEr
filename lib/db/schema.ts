import { text, real, integer, sqliteTable, index } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  initialBalance: real('initial_balance').default(0),
  currency: text('currency').default('IDR'),
  autoBackupEnabled: integer('auto_backup_enabled').default(0),
  autoBackupDay: integer('auto_backup_day').default(0),
  lastBackupAt: integer('last_backup_at'),
  createdAt: integer('created_at').notNull(),
})

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  color: text('color').notNull().default('#FACC15'),
})

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  description: text('description'),
  date: integer('date').notNull(),
  createdAt: integer('created_at').notNull(),
}, (table) => ({
  userDateIdx: index('idx_transactions_user_date').on(table.userId, table.date),
}))
