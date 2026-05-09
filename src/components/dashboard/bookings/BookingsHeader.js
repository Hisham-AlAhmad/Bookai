'use client'

import styles from '@/styles/dashboard/bookings.module.css'
import { CalendarIcon, ListIcon, RefreshIcon } from './BookingsIcons'

export default function BookingsHeader({ view, onViewChange, totalCount, lastRefreshed }) {
  const secondsAgo = lastRefreshed
    ? Math.round((Date.now() - lastRefreshed) / 1000)
    : null

  return (
    <div className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>Bookings</h1>
        <p className={styles.pageSubtitle}>
          {totalCount} total
          {secondsAgo !== null && (
            <span className={styles.refreshBadge}>
              <RefreshIcon />
              Updated {secondsAgo < 5 ? 'just now' : `${secondsAgo}s ago`}
            </span>
          )}
        </p>
      </div>

      <div className={styles.viewToggle}>
        <button
          className={`${styles.viewBtn} ${view === 'calendar' ? styles.viewBtnActive : ''}`}
          onClick={() => onViewChange('calendar')}
          title="Calendar view"
        >
          <CalendarIcon />
          <span>Calendar</span>
        </button>
        <button
          className={`${styles.viewBtn} ${view === 'list' ? styles.viewBtnActive : ''}`}
          onClick={() => onViewChange('list')}
          title="List view"
        >
          <ListIcon />
          <span>List</span>
        </button>
      </div>
    </div>
  )
}