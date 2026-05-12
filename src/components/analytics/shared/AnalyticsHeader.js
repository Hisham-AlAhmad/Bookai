import styles from '@/styles/analytics/analytics-page.module.css'

/**
 * AnalyticsHeader
 *
 * Reusable page header for any analytics view.
 */
export default function AnalyticsHeader({ title = 'Analytics', subtitle, eyebrow }) {
  return (
    <div className={styles.pageHeader}>
      <div>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
      </div>
      <div className={styles.headerMeta}>
        <span className={styles.dateBadge}>
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </span>
      </div>
    </div>
  )
}