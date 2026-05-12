import styles from '@/styles/analytics/analytics-page.module.css'

/**
 * AnalyticsError — shown when the API call fails.
 */
export default function AnalyticsError({ message, onRetry }) {
  return (
    <div className={styles.errorWrap}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
      </svg>
      <p className={styles.errorText}>{message || 'Failed to load analytics data.'}</p>
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}