import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import StaffClient from '@/components/dashboard/staff/StaffClient'
import { redirect } from 'next/navigation'

async function getStaff(businessId) {
  return prisma.staff.findMany({
    where: { business_id: businessId },
    include: {
      services: {
        include: { service: { select: { id: true, name: true } } },
      },
    },
    orderBy: { created_at: 'asc' },
  })
}

async function getServices(businessId) {
  return prisma.service.findMany({
    where: { business_id: businessId, active: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

export default async function StaffPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const allowedRoles = ['owner', 'manager']
  if (!allowedRoles.includes(session.user.role)) {
    redirect('/dashboard')
  }
  const [staff, services] = await Promise.all([
    getStaff(session.user.businessId),
    getServices(session.user.businessId),
  ])

  return (
    <StaffClient
      initialStaff={staff}
      services={services}
      role={session.user.role}
      currentUserId={session.user.id}
    />
  )
}