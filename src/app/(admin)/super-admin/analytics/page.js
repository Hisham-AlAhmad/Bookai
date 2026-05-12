import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'

export const metadata = {
  title: 'Platform Analytics — Bookai Admin',
}

/**
 * Super Admin platform-wide analytics page.
 * Reuses AnalyticsDashboard with scope="platform"
 * so the API returns aggregated, cross-business data.
 */
export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'superadmin') redirect('/admin')

  return (
    <AnalyticsDashboard
      scope="platform"
      title="Platform Analytics"
      subtitle="Real-time insights across all businesses on the platform."
      eyebrow="Super Admin"
    />
  )
}