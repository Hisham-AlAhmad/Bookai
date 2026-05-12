/**
 * lib/analytics/services/index.js
 *
 * Server-side analytics queries.
 * All queries accept a businessId so they can be scoped
 * to a single tenant OR used for platform-wide aggregation
 * (businessId = null → no tenant filter).
 */

import prisma from '@/lib/prisma'

/**
 * Returns monthly KPI numbers.
 *
 * @param {string|null} businessId  — null = platform-wide
 * @param {Date} [now]
 */
export async function fetchKpis(businessId, now = new Date()) {
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfPrevMonth = startOfMonth

  const baseWhere = businessId ? { business_id: businessId } : {}

  const [
    totalBookings,
    noShowCount,
    voiceCount,
    revenueBookings,
    prevMonthTotal,
    prevMonthRevenue,
  ] = await Promise.all([
    // Total this month
    prisma.booking.count({
      where: { ...baseWhere, created_at: { gte: startOfMonth } },
    }),

    // No-shows this month
    prisma.booking.count({
      where: { ...baseWhere, status: 'no_show', created_at: { gte: startOfMonth } },
    }),

    // Voice bookings this month
    prisma.booking.count({
      where: { ...baseWhere, booked_via: 'voice', created_at: { gte: startOfMonth } },
    }),

    // Revenue: sum confirmed booking service prices this month
    prisma.booking.findMany({
      where: {
        ...baseWhere,
        status: { in: ['confirmed'] },
        created_at: { gte: startOfMonth },
      },
      select: { service: { select: { price_usd: true } } },
    }),

    // Previous month total for trend
    prisma.booking.count({
      where: {
        ...baseWhere,
        created_at: { gte: startOfPrevMonth, lt: endOfPrevMonth },
      },
    }),

    // Previous month revenue for trend
    prisma.booking.findMany({
      where: {
        ...baseWhere,
        status: { in: ['confirmed'] },
        created_at: { gte: startOfPrevMonth, lt: endOfPrevMonth },
      },
      select: { service: { select: { price_usd: true } } },
    }),
  ])

  const estimatedRevenue = revenueBookings.reduce(
    (sum, b) => sum + (Number(b.service?.price_usd) || 0),
    0
  )

  const prevMonthEstimatedRevenue = prevMonthRevenue.reduce(
    (sum, b) => sum + (Number(b.service?.price_usd) || 0),
    0
  )

  const noShowRate = totalBookings > 0
    ? (noShowCount / totalBookings) * 100
    : 0

  const voiceBookingRate = totalBookings > 0
    ? (voiceCount / totalBookings) * 100
    : 0

  return {
    totalBookings,
    estimatedRevenue,
    noShowRate,
    voiceBookingRate,
    prevMonthBookings: prevMonthTotal,
    prevMonthRevenue: prevMonthEstimatedRevenue,
  }
}

/**
 * Returns bookings per day for the last N days.
 *
 * @param {string|null} businessId
 * @param {number} [days=30]
 */
export async function fetchBookingsPerDay(businessId, days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const baseWhere = businessId ? { business_id: businessId } : {}

  // Count bookings by their scheduled start date (`starts_at`) so charts
  // reflect appointment days rather than when the booking record was created.
  const bookings = await prisma.booking.findMany({
    where: { ...baseWhere, starts_at: { gte: since } },
    select: { starts_at: true },
  })

  const map = {}
  for (const b of bookings) {
    const key = b.starts_at.toLocaleDateString('en-CA')
    map[key] = (map[key] || 0) + 1
  }

  return Object.entries(map).map(([date, count]) => ({ date, count }))
}

/**
 * Returns bookings per service (all time or scoped).
 *
 * @param {string|null} businessId
 */
export async function fetchBookingsPerService(businessId) {
  const baseWhere = businessId ? { business_id: businessId } : {}

  const grouped = await prisma.booking.groupBy({
    by: ['service_id'],
    where: baseWhere,
    _count: { _all: true },
  })

  if (!grouped.length) return []

  const serviceIds = grouped.map((g) => g.service_id)
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, name: true },
  })

  const nameMap = Object.fromEntries(services.map((s) => [s.id, s.name]))

  return grouped.map((g) => ({
    name: nameMap[g.service_id] || 'Unknown',
    count: g._count._all,
  }))
}

/**
 * Returns bookings per staff member.
 *
 * @param {string|null} businessId
 */
export async function fetchBookingsPerStaff(businessId) {
  const baseWhere = businessId ? { business_id: businessId } : {}

  const grouped = await prisma.booking.groupBy({
    by: ['staff_id'],
    where: baseWhere,
    _count: { _all: true },
  })

  if (!grouped.length) return []

  const staffIds = grouped.map((g) => g.staff_id)
  const staffMembers = await prisma.staff.findMany({
    where: { id: { in: staffIds } },
    select: { id: true, name: true },
  })

  const nameMap = Object.fromEntries(staffMembers.map((s) => [s.id, s.name]))

  return grouped.map((g) => ({
    name: nameMap[g.staff_id] || 'Unknown',
    count: g._count._all,
  }))
}

/**
 * Returns customers with no_show_count >= threshold.
 *
 * @param {string|null} businessId
 * @param {number} [threshold=2]
 */
export async function fetchFlaggedCustomers(businessId, threshold = 2) {
  if (businessId) {
    // Scope to customers who have bookings with this business
    const bookings = await prisma.booking.findMany({
      where: { business_id: businessId, status: 'no_show' },
      select: { customer_id: true },
      distinct: ['customer_id'],
    })

    const customerIds = bookings.map((b) => b.customer_id)
    if (!customerIds.length) return []

    const customers = await prisma.customer.findMany({
      where: {
        id: { in: customerIds },
        no_show_count: { gte: threshold },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        no_show_count: true,
        last_seen: true,
      },
      orderBy: { no_show_count: 'desc' },
    })

    return customers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      noShowCount: c.no_show_count,
      lastSeen: c.last_seen ? c.last_seen.toISOString() : null,
    }))
  }

  // Platform-wide
  const customers = await prisma.customer.findMany({
    where: { no_show_count: { gte: threshold } },
    select: {
      id: true,
      name: true,
      phone: true,
      no_show_count: true,
      last_seen: true,
    },
    orderBy: { no_show_count: 'desc' },
    take: 50,
  })

  return customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    noShowCount: c.no_show_count,
    lastSeen: c.last_seen ? c.last_seen.toISOString() : null,
  }))
}