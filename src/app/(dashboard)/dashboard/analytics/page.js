import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'

export const metadata = {
  title: 'Analytics — Bookai',
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.role !== 'owner') redirect('/dashboard')

  return (
    <AnalyticsDashboard
      subtitle={`Insights for your business this month.`}
    />
  )
}