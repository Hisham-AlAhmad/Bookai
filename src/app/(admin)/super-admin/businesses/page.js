import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import AdminClient from '@/components/admin/AdminClient'

export const metadata = {
  title: 'Businesses — Super Admin',
}

async function getPlatformData() {
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

  const monthlyRaw = await prisma.booking.groupBy({
    by: ['business_id'],
    where: { created_at: { gte: startOfMonth } },
    _count: { _all: true },
  })

  const monthlyMap = Object.fromEntries(
    monthlyRaw.map((row) => [row.business_id, row._count._all])
  )

  const enrichedBusinesses = businesses.map((b) => ({
    id: b.id,
    slug: b.slug,
    name: b.name,
    city: b.city,
    category: b.category,
    plan: b.plan,
    active: b.active,
    logo_url: b.logo_url,
    phone: b.phone,
    created_at: b.created_at,
    totalBookings: b._count.bookings,
    monthlyBookings: monthlyMap[b.id] ?? 0,
    staffCount: b._count.staff,
    serviceCount: b._count.services,
  }))

  const [totalBusinesses, totalActive, totalBookingsThisMonth] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { active: true } }),
    prisma.booking.count({ where: { created_at: { gte: startOfMonth } } }),
  ])

  return {
    businesses: enrichedBusinesses,
    stats: { totalBusinesses, totalActive, totalBookingsThisMonth },
  }
}

export default async function SuperAdminBusinessesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.role !== 'superadmin') redirect('/login')

  const data = await getPlatformData()

  return <AdminClient initialData={data} />
}
