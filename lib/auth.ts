import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || !account) return false

      const now = Math.floor(Date.now() / 1000)

      await db()
        .insert(users)
        .values({
          id: account.providerAccountId,
          email: user.email,
          name: user.name ?? null,
          avatarUrl: user.image ?? null,
          createdAt: now,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: { name: user.name, avatarUrl: user.image },
        })

      return true
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      session.user.accessToken = token.accessToken as string
      session.user.refreshToken = token.refreshToken as string
      return session
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
  },
})

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      accessToken?: string
      refreshToken?: string
    }
  }
}

