import styles from '@/styles/dashboard/bookings.module.css'
import { UserIcon } from './BookingsIcons'

/**
 * Calculates a customer risk level from no-show stats.
 * Returns: 'low' | 'medium' | 'high'
 */
function getRiskLevel(noShowCount, totalBookings) {
  if (totalBookings === 0) return 'low'
  const rate = noShowCount / totalBookings
  if (rate >= 0.5 || noShowCount >= 3) return 'high'
  if (rate >= 0.25 || noShowCount >= 2) return 'medium'
  return 'low'
}

const RISK_META = {
  low:    { label: 'Reliable',         color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  medium: { label: 'Occasional No-show', color: '#e8a020', bg: 'rgba(232,160,32,0.1)' },
  high:   { label: 'Frequent No-show', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
}

export default function CustomerCard({ customer, bookingCount }) {
  if (!customer) return null

  const risk = getRiskLevel(customer.no_show_count, bookingCount)
  const riskMeta = RISK_META[risk]
  const noShowRate = bookingCount > 0
    ? Math.round((customer.no_show_count / bookingCount) * 100)
    : 0

  return (
    <div className={styles.customerCardWrap}>
      <div className={styles.customerCardHeader}>
        <div className={styles.customerCardAvatar}>
          {customer.name[0].toUpperCase()}
        </div>
        <div className={styles.customerCardInfo}>
          <p className={styles.customerCardName}>{customer.name}</p>
          <p className={styles.customerCardPhone}>{customer.phone}</p>
        </div>
        <span
          className={styles.riskBadge}
          style={{ color: riskMeta.color, background: riskMeta.bg }}
        >
          {riskMeta.label}
        </span>
      </div>

      <div className={styles.customerCardStats}>
        <div className={styles.customerStat}>
          <span className={styles.customerStatValue}>{bookingCount}</span>
          <span className={styles.customerStatLabel}>Total bookings</span>
        </div>
        <div className={styles.customerStat}>
          <span
            className={styles.customerStatValue}
            style={{ color: customer.no_show_count > 0 ? '#ef4444' : '#22c55e' }}
          >
            {customer.no_show_count}
          </span>
          <span className={styles.customerStatLabel}>No-shows</span>
        </div>
        <div className={styles.customerStat}>
          <span
            className={styles.customerStatValue}
            style={{ color: noShowRate >= 25 ? '#ef4444' : '#333' }}
          >
            {noShowRate}%
          </span>
          <span className={styles.customerStatLabel}>No-show rate</span>
        </div>
      </div>
    </div>
  )
}