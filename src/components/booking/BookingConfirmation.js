import { formatUtcTime } from '@/lib/time'
import styles from '@/styles/booking/booking-confirmation.module.css'

export default function BookingConfirmation({ booking, service }) {
  function formatTime(iso) {
    return formatUtcTime(iso, '12')
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.iconWrap}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
          <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h2 className={styles.title}>You're booked!</h2>
      <p className={styles.subtitle}>
        We'll send you an SMS reminder 1 hour before your appointment.
      </p>

      <div className={styles.card}>
        <div className={styles.row}>
          <span className={styles.label}>Service</span>
          <span className={styles.value}>{service?.name}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Date</span>
          <span className={styles.value}>{formatDate(booking.starts_at)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Time</span>
          <span className={styles.value}>
            {formatTime(booking.starts_at)} — {formatTime(booking.ends_at)}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Status</span>
          <span className={styles.statusBadge}>Pending Confirmation</span>
        </div>
      </div>

      <p className={styles.note}>
        Booking #{booking.id.slice(0, 8).toUpperCase()}
      </p>
    </div>
  )
}