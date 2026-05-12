'use client'

import { useAnalytics } from '@/lib/analytics/useAnalytics'
import KpiStrip from '@/components/analytics/cards/KpiStrip'
import BookingsTrendChart from '@/components/analytics/charts/BookingsTrendChart'
import ServicesChart from '@/components/analytics/charts/ServicesChart'
import StaffChart from '@/components/analytics/charts/StaffChart'
import FlaggedCustomersTable from '@/components/analytics/tables/FlaggedCustomersTable'
import AnalyticsHeader from '@/components/analytics/shared/AnalyticsHeader'
import AnalyticsError from '@/components/analytics/shared/AnalyticsError'
import styles from '@/styles/analytics/analytics-page.module.css'

/**
 * AnalyticsDashboard
 *
 * The main client-side analytics dashboard shell.
 * Reusable — accepts an optional `scope` for super admin platform view.
 *
 * @param {{ scope?: 'platform', title?: string, subtitle?: string, eyebrow?: string }} props
 */
export default function AnalyticsDashboard({
  scope,
  title = 'Analytics',
  subtitle = 'Insights for your business this month.',
  eyebrow,
}) {
  const { loading, error, kpis, charts, flaggedCustomers, refetch } = useAnalytics({ scope })

  return (
    <div className={styles.page}>
      <AnalyticsHeader title={title} subtitle={subtitle} eyebrow={eyebrow} />

      {error ? (
        <AnalyticsError message={error} onRetry={refetch} />
      ) : (
        <>
          {/* KPI strip */}
          <KpiStrip kpis={kpis} loading={loading} />

          {/* Charts row */}
          <div className={styles.chartsRow}>
            <div className={styles.chartFull}>
              <BookingsTrendChart
                data={charts?.bookingsPerDay}
                loading={loading}
              />
            </div>
          </div>

          <div className={styles.chartsGrid}>
            <ServicesChart
              data={charts?.bookingsPerService}
              loading={loading}
            />
            <StaffChart
              data={charts?.bookingsPerStaff}
              loading={loading}
            />
          </div>

          {/* No-show table */}
          <FlaggedCustomersTable
            customers={flaggedCustomers || []}
            loading={loading}
          />
        </>
      )}
    </div>
  )
}