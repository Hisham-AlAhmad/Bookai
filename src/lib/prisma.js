import { PrismaClient } from '@prisma/client'

// In development, Next.js hot-reloads the server on every change.
// Without this, each reload creates a new PrismaClient instance
// and you'll quickly run out of database connections.
// Storing it on globalThis makes it persist across reloads.
// In production this isn't an issue since the server only starts once.

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query'], // Remove this in production — it logs every SQL query to the terminal
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma