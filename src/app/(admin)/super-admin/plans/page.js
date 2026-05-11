import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SuperAdminPlaceholder from '@/components/admin/SuperAdminPlaceholder'

export const metadata = {
  title: 'Plans — Super Admin',
}

export default async function SuperAdminPlansPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'superadmin') redirect('/login')

  return (
    <SuperAdminPlaceholder
      title="Plans"
      subtitle="Review plan distribution and upgrade paths."
      description={{
        title: 'Plan controls are on the way',
        body: 'This space will include plan analytics, upgrade conversions, and overrides.',
      }}
    />
  )
}
