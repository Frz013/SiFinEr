export interface User {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  initialBalance: number
  currency: string
  autoBackupEnabled: number
  autoBackupDay: number
  lastBackupAt: number | null
  createdAt: number
}

export interface Category {
  id: number
  userId: string
  name: string
  type: 'income' | 'expense'
  color: string
}

export interface Transaction {
  id: number
  userId: string
  amount: number
  type: 'income' | 'expense'
  categoryId: number | null
  description: string | null
  date: number
  createdAt: number
  categoryName: string | null
  categoryColor: string | null
}

export type TransactionWithCategory = Transaction

export interface CreateTransactionInput {
  amount: number
  type: 'income' | 'expense'
  categoryId: number | null
  description?: string
  date: number
}

export interface CreateCategoryInput {
  name: string
  type: 'income' | 'expense'
  color: string
}

export interface ExportData {
  version: string
  exportedAt: number
  user: Pick<User, 'currency' | 'initialBalance'>
  categories: Category[]
  transactions: Transaction[]
}

export interface Summary {
  totalIncome: number
  totalExpense: number
  balance: number
  period: string
  transactionCount: number
}
