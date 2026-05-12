'use client'

import styles from '@/styles/analytics/kpi-card.module.css'

/**
 * KpiCard
 *
 * Reusable analytics KPI card.
 * Accepts any metric label, formatted value, icon, accent colour, and optional trend.
 *
 * Props:
 *   label   — e.g. "Bookings this month"
 *   value   — pre-formatted string e.g. "$1.2k" or "34"
 *   icon    — React node (SVG)
 *   accent  — CSS colour string
 *   trend   — { direction: 'up'|'down'|'flat', percent: number } | null
 *   loading — boolean skeleton mode
 */
export default function KpiCard({ label, value, icon, accent, trend, loading = false }) {
  if (loading) {
    return (
      <div className={styles.card} style={{ '--accent': accent || '#c8a96e' }}>
        <div className={styles.iconWrap}>
          <div className={styles.iconSkeleton} />
        </div>
        <div className={styles.body}>
          <div className={styles.skeletonLine} style={{ width: '60%' }} />
          <div className={styles.skeletonValue} />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.card} style={{ '--accent': accent }}>
      <div className={styles.iconWrap}>{icon}</div>
      <div className={styles.body}>
        <p className={styles.label}>{label}</p>
        <p className={styles.value}>{value}</p>
        {trend && trend.direction !== 'flat' && (
          <p className={`${styles.trend} ${styles[`trend_${trend.direction}`]}`}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.percent.toFixed(1)}% vs last month
          </p>
        )}
      </div>
      <div className={styles.glow} />
    </div>
  )
}