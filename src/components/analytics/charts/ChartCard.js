'use client'

import styles from '@/styles/analytics/chart-card.module.css'

/**
 * ChartCard
 *
 * Reusable shell for any chart.
 * Handles title, subtitle, loading skeleton, empty state, and the card frame.
 *
 * Props:
 *   title     — string
 *   subtitle  — string (optional)
 *   loading   — boolean
 *   empty     — boolean (data is loaded but has 0 items)
 *   children  — chart content
 *   height    — number (px, default 260)
 */
export default function ChartCard({
  title,
  subtitle,
  loading = false,
  empty = false,
  children,
  height = 260,
}) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <p className={styles.title}>{title}</p>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      <div className={styles.body} style={{ minHeight: height }}>
        {loading ? (
          <div className={styles.skeleton} style={{ height }} />
        ) : empty ? (
          <div className={styles.empty} style={{ height }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 21h18M3 10h4v11H3zM10 6h4v15h-4zM17 3h4v18h-4z" />
            </svg>
            <p>No data yet</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}