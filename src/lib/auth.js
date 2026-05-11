import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from './prisma'

export const authOptions = {
  session: {
    strategy: 'jwt',
  },

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const staff = await prisma.staff.findUnique({
          where: { email: credentials.email },
          include: { business: true },
        })

        if (!staff || !staff.can_login || !staff.password_hash) return null
        if (!staff.active) return null

        const isValid = await bcrypt.compare(credentials.password, staff.password_hash)
        if (!isValid) return null

        return {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          role: staff.role,
          businessId: staff.business_id || null,
          businessSlug: staff.business?.slug || null,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On sign in, user object is available — persist extra fields to token
      if (user) {
        token.id = user.id
        token.role = user.role
        token.businessId = user.businessId
        token.businessSlug = user.businessSlug
      }
      return token
    },

    async session({ session, token }) {
      // Expose token fields to the client-side session object
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.businessId = token.businessId
        session.user.businessSlug = token.businessSlug
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },
}