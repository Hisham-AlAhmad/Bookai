import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import BusinessSettingsClient from '@/components/dashboard/settings/BusinessSettingsClient'

export const metadata = {
  title: 'Settings — Bookai',
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Settings is owner-only
  if (session.user.role !== 'owner') redirect('/dashboard')

  const business = await prisma.business.findUnique({
    where: { id: session.user.businessId },
    select: {
      id: true,
      name: true,
      slug: true,
      logo_url: true,
      cover_url: true,
      phone: true,
      address: true,
      city: true,
      category: true,
      bio: true,
      plan: true,
    },
  })

  if (!business) redirect('/dashboard')

  return <BusinessSettingsClient business={business} />
}