import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SuperAdminPlaceholder from '@/components/admin/SuperAdminPlaceholder'

export const metadata = {
  title: 'Analytics — Super Admin',
}

export default async function SuperAdminAnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'superadmin') redirect('/login')

  return (
    <SuperAdminPlaceholder
      title="Analytics"
      subtitle="Track platform growth and adoption."
      description={{
        title: 'Analytics dashboards are coming soon',
        body: 'We will add KPI trends, cohort views, and funnel analytics for platform performance.',
      }}
    />
  )
}
