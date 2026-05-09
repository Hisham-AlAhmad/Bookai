import { formatUtcTime } from '@/lib/time'
import { STATUS_META } from './BookingCard'
import { MicIcon, FormIcon } from './BookingsIcons'
import styles from '@/styles/dashboard/bookings.module.css'

const VIA_META = {
  voice: { icon: <MicIcon />, label: 'Voice' },
  form:  { icon: '📋', label: 'Form' },
  // form:  { icon: <FormIcon />, label: 'Form' },
}

export default function ListView({ bookings, onBookingClick }) {
  if (!bookings.length) {
    return (
      <div className={styles.emptyState}>
        <p>No bookings match your filters.</p>
      </div>
    )
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Service</th>
            <th>Staff</th>
            <th>Date / Time</th>
            <th>Via</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => {
            const status = STATUS_META[b.status] || STATUS_META.pending
            const via    = VIA_META[b.booked_via] || VIA_META.form
            const startsAt = new Date(b.starts_at)

            return (
              <tr
                key={b.id}
                className={styles.tableRow}
                onClick={() => onBookingClick(b)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onBookingClick(b) }}
              >
                <td>
                  <div className={styles.customerCell}>
                    <div className={styles.customerAvatar}>
                      {b.customer.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className={styles.customerName}>{b.customer.name}</p>
                      <p className={styles.customerPhone}>{b.customer.phone}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={styles.serviceName}>{b.service.name}</span>
                  {b.service.price_usd && (
                    <span className={styles.servicePrice}>${Number(b.service.price_usd).toFixed(0)}</span>
                  )}
                </td>
                <td className={styles.staffCell}>{b.staff.name}</td>
                <td>
                  <span className={styles.dateCell}>
                    {startsAt.toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', timeZone: 'UTC',
                    })}
                  </span>
                  <span className={styles.timeCell}>
                    {formatUtcTime(b.starts_at, '12')}
                  </span>
                </td>
                <td>
                  <span className={styles.viaCell} title={via.label}>
                    {via.icon}
                  </span>
                </td>
                <td>
                  <span
                    className={styles.statusBadge}
                    style={{ '--status-color': status.color, '--status-bg': status.bg }}
                  >
                    {status.label}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}