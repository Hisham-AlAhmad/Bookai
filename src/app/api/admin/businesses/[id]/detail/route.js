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
 * GET /api/admin/businesses/[id]/detail
 * Returns staff list, service list, and last 10 bookings for a business.
 * Superadmin only.
 */
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  const guard = requireSuperAdmin(session)
  if (guard) return guard

  const { id } = params

  const [staff, services, bookings] = await Promise.all([
    prisma.staff.findMany({
      where: { business_id: id },
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
        phone: true,
        active: true,
        can_login: true,
      },
      orderBy: { created_at: 'asc' },
    }),

    prisma.service.findMany({
      where: { business_id: id },
      select: {
        id: true,
        name: true,
        duration_mins: true,
        price_usd: true,
        active: true,
      },
      orderBy: { name: 'asc' },
    }),

    prisma.booking.findMany({
      where: { business_id: id },
      orderBy: { starts_at: 'desc' },
      take: 10,
      include: {
        customer: { select: { name: true, phone: true } },
        service: { select: { name: true } },
        staff: { select: { name: true } },
      },
    }),
  ])

  return NextResponse.json({ staff, services, bookings })
}