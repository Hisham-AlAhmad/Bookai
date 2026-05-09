import { formatUtcTime } from '@/lib/time'
import styles from '@/styles/dashboard/bookings.module.css'

const STATUS_META = {
  pending:   { color: '#e8a020', bg: 'rgba(232,160,32,0.12)',  label: 'Pending' },
  confirmed: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   label: 'Confirmed' },
  cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'Cancelled' },
  no_show:   { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  label: 'No-show' },
}

export default function BookingCard({ booking, onClick }) {
  const meta = STATUS_META[booking.status] || STATUS_META.pending

  return (
    <button
      className={styles.bookingCard}
      style={{
        '--card-accent': meta.color,
        '--card-bg': meta.bg,
      }}
      onClick={() => onClick(booking)}
    >
      <span className={styles.bookingCardTime}>
        {formatUtcTime(booking.starts_at, '12')} – {formatUtcTime(booking.ends_at, '12')}
      </span>
      <span className={styles.bookingCardCustomer}>{booking.customer.name}</span>
      <span className={styles.bookingCardService}>{booking.service.name}</span>
      <span
        className={styles.bookingCardStatus}
        style={{ color: meta.color, background: meta.bg }}
      >
        {meta.label}
      </span>
    </button>
  )
}

export { STATUS_META }