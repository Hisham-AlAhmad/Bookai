import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

function requireSuperAdmin(session) {
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (session.user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

/**
 * GET /api/admin/businesses
 * Returns every business with aggregate booking counts.
 * Superadmin only.
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  const guard = requireSuperAdmin(session)
  if (guard) return guard

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const businesses = await prisma.business.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      _count: {
        select: {
          staff: true,
          services: { where: { active: true } },
          bookings: true,
        },
      },
    },
  })

  // Fetch per-business booking counts for this month in one query
  const monthlyRaw = await prisma.booking.groupBy({
    by: ['business_id'],
    where: { created_at: { gte: startOfMonth } },
    _count: { _all: true },
  })

  const monthlyMap = Object.fromEntries(
    monthlyRaw.map((row) => [row.business_id, row._count._all])
  )

  const result = businesses.map((b) => ({
    id: b.id,
    slug: b.slug,
    name: b.name,
    city: b.city,
    category: b.category,
    plan: b.plan,
    active: b.active,
    logo_url: b.logo_url,
    cover_url: b.cover_url,
    phone: b.phone,
    bio: b.bio,
    created_at: b.created_at,
    totalBookings: b._count.bookings,
    monthlyBookings: monthlyMap[b.id] ?? 0,
    staffCount: b._count.staff,
    serviceCount: b._count.services,
  }))

  // Platform-wide stats
  const [totalBusinesses, totalActive, totalBookingsThisMonth] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { active: true } }),
    prisma.booking.count({ where: { created_at: { gte: startOfMonth } } }),
  ])

  return NextResponse.json({
    businesses: result,
    stats: {
      totalBusinesses,
      totalActive,
      totalBookingsThisMonth,
    },
  })
}