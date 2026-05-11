import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import BusinessEditClient from '@/components/admin/businesses/BusinessEditClient'

export const metadata = {
  title: 'Edit Business — Super Admin',
}

export default async function SuperAdminBusinessEditPage({ params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'superadmin') redirect('/login')

  const business = await prisma.business.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      city: true,
      address: true,
      phone: true,
      bio: true,
      plan: true,
      active: true,
      created_at: true,
    },
  })

  if (!business) redirect('/super-admin/businesses')

  return <BusinessEditClient business={business} />
}
