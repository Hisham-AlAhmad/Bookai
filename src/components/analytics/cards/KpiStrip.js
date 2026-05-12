'use client'

import KpiCard from './KpiCard'
import { calcTrend, formatRevenue, formatPercent } from '@/lib/analytics/transforms'
import styles from '@/styles/analytics/kpi-strip.module.css'

const ICONS = {
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    </svg>
  ),
  dollar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v2m0 8v2M8.5 10.5A3.5 3.5 0 0112 8.5c1.93 0 3.5 1.12 3.5 2.5S14 13 12 13s-3.5 1.12-3.5 2.5S10.07 18 12 18c1.93 0 3.5-1.12 3.5-2.5" strokeLinecap="round" />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
    </svg>
  ),
  mic: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6" strokeLinecap="round" />
    </svg>
  ),
}

/**
 * KpiStrip
 *
 * Renders the standard 4-card KPI overview strip.
 * Fully reusable — pass kpis or null for loading state.
 *
 * @param {{ kpis: import('@/lib/analytics/types').KPIs | null, loading?: boolean }} props
 */
export default function KpiStrip({ kpis, loading = false }) {
  const bookingsTrend = kpis
    ? calcTrend(kpis.totalBookings, kpis.prevMonthBookings ?? 0)
    : null

  const revenueTrend = kpis
    ? calcTrend(kpis.estimatedRevenue, kpis.prevMonthRevenue ?? 0)
    : null

  return (
    <div className={styles.strip}>
      <KpiCard
        label="Bookings this month"
        value={loading ? '' : String(kpis?.totalBookings ?? 0)}
        icon={ICONS.calendar}
        accent="#c8a96e"
        trend={bookingsTrend}
        loading={loading}
      />
      <KpiCard
        label="Estimated revenue"
        value={loading ? '' : formatRevenue(kpis?.estimatedRevenue ?? 0)}
        icon={ICONS.dollar}
        accent="#6ecf9e"
        trend={revenueTrend}
        loading={loading}
      />
      <KpiCard
        label="No-show rate"
        value={loading ? '' : formatPercent(kpis?.noShowRate ?? 0)}
        icon={ICONS.alert}
        accent="#cf6e6e"
        trend={null}
        loading={loading}
      />
      <KpiCard
        label="Voice bookings"
        value={loading ? '' : formatPercent(kpis?.voiceBookingRate ?? 0)}
        icon={ICONS.mic}
        accent="#6e9ecf"
        trend={null}
        loading={loading}
      />
    </div>
  )
}