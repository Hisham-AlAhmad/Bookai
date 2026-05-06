import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import ServicesClient from '@/components/dashboard/services/ServicesClient'
import { redirect } from 'next/navigation'

async function getServices(businessId) {
  return prisma.service.findMany({
    where: { business_id: businessId },
    orderBy: { created_at: 'asc' },
  })
}

export default async function ServicesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const allowedRoles = ['owner', 'manager']
  if (!allowedRoles.includes(session.user.role)) {
    redirect('/dashboard')
  }
  const services = await getServices(session.user.businessId)

  return (
    <ServicesClient
      initialServices={services}
      role={session.user.role}
    />
  )
}