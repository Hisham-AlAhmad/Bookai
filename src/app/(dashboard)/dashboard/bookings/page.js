import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import BookingsClient from '@/components/dashboard/bookings/BookingsClient'

export const metadata = {
  title: 'Bookings — Bookai',
}

async function getInitialBookings(businessId) {
  const bookings = await prisma.booking.findMany({
    where: { business_id: businessId },
    orderBy: { starts_at: 'desc' },
    take: 100,
    include: {
      customer: { select: { id: true, name: true, phone: true, no_show_count: true } },
      service:  { select: { id: true, name: true, duration_mins: true, price_usd: true } },
      staff:    { select: { id: true, name: true } },
    },
  })
  return bookings
}

async function getStaffList(businessId) {
  return prisma.staff.findMany({
    where: { business_id: businessId, active: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

export default async function BookingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const [initialBookings, staffList] = await Promise.all([
    getInitialBookings(session.user.businessId),
    getStaffList(session.user.businessId),
  ])

  return (
    <BookingsClient
      initialBookings={initialBookings}
      staffList={staffList}
      role={session.user.role}
    />
  )
}