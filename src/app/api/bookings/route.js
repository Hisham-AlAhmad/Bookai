import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

/**
 * GET /api/bookings
 * Paginated, filterable bookings for the session's business.
 *
 * Query params:
 *   page       - page number (default 1)
 *   limit      - page size (default 50)
 *   status     - filter by status (pending|confirmed|cancelled|no_show)
 *   from       - ISO date string (starts_at >= from)
 *   to         - ISO date string (starts_at <= to)
 *   staffId    - filter by staff member
 */
export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page   = Math.max(1, parseInt(searchParams.get('page')  || '1', 10))
  const limit  = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
  const status  = searchParams.get('status')
  const from    = searchParams.get('from')
  const to      = searchParams.get('to')
  const staffId = searchParams.get('staffId')

  const where = { business_id: session.user.businessId }

  if (status && ['pending', 'confirmed', 'cancelled', 'no_show'].includes(status)) {
    where.status = status
  }

  if (from || to) {
    where.starts_at = {}
    if (from) where.starts_at.gte = new Date(from)
    if (to)   where.starts_at.lte = new Date(to)
  }

  if (staffId) where.staff_id = staffId

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { starts_at: 'desc' },
      skip:  (page - 1) * limit,
      take:  limit,
      include: {
        customer: { select: { id: true, name: true, phone: true, no_show_count: true } },
        service:  { select: { id: true, name: true, duration_mins: true, price_usd: true } },
        staff:    { select: { id: true, name: true } },
      },
    }),
    prisma.booking.count({ where }),
  ])

  return NextResponse.json({
    bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}