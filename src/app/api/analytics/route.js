import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import {
  fetchKpis,
  fetchBookingsPerDay,
  fetchBookingsPerService,
  fetchBookingsPerStaff,
  fetchFlaggedCustomers,
} from '@/lib/analytics/services'
import { fillMissingDays, sortDesc } from '@/lib/analytics/transforms'

/**
 * GET /api/analytics
 *
 * Returns all analytics data for the authenticated business owner.
 * Super admins can optionally pass ?scope=platform to get platform-wide data.
 */
export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isSuperAdmin = session.user.role === 'superadmin'
  const { searchParams } = new URL(req.url)
  const scope = searchParams.get('scope')

  // Determine which business to scope to
  let businessId = session.user.businessId

  if (isSuperAdmin && scope === 'platform') {
    businessId = null // platform-wide
  } else if (!businessId) {
    return NextResponse.json({ error: 'No business associated with account' }, { status: 403 })
  }

  if (!isSuperAdmin && session.user.role !== 'owner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const [kpis, rawPerDay, rawPerService, rawPerStaff, flaggedCustomers] =
      await Promise.all([
        fetchKpis(businessId),
        fetchBookingsPerDay(businessId, 30),
        fetchBookingsPerService(businessId),
        fetchBookingsPerStaff(businessId),
        fetchFlaggedCustomers(businessId, 2),
      ])

    return NextResponse.json({
      kpis,
      charts: {
        bookingsPerDay: fillMissingDays(rawPerDay, 30),
        bookingsPerService: sortDesc(rawPerService),
        bookingsPerStaff: sortDesc(rawPerStaff),
      },
      flaggedCustomers,
    })
  } catch (err) {
    console.error('[GET /api/analytics]', err)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}