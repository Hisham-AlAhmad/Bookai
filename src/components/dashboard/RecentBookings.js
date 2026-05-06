import styles from '@/styles/dashboard/recent-bookings.module.css'

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#e8a020' },
  confirmed: { label: 'Confirmed', color: '#22c55e' },
  cancelled: { label: 'Cancelled', color: '#ef4444' },
  no_show:   { label: 'No-show',   color: '#8b5cf6' },
}

const VIA_CONFIG = {
  voice:     { label: 'Voice', icon: '🎙' },
  form:      { label: 'Form',  icon: '📋' },
  whatsapp:  { label: 'WA',    icon: '💬' },
}

export default function RecentBookings({ bookings }) {
  if (!bookings.length) {
    return (
      <div className={styles.empty}>
        <p>No bookings yet. Share your booking page to get started.</p>
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
            <th>Date & Time</th>
            <th>Via</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => {
            const status = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending
            const via = VIA_CONFIG[b.booked_via] || VIA_CONFIG.form

            return (
              <tr key={b.id} className={styles.row}>
                <td>
                  <div className={styles.customer}>
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
                <td className={styles.staffName}>{b.staff.name}</td>
                <td className={styles.dateTime}>
                  {new Date(b.starts_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short'
                  })}
                  <span className={styles.time}>
                    {new Date(b.starts_at).toLocaleTimeString('en-GB', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </td>
                <td>
                  <span className={styles.viaBadge} title={via.label}>
                    {via.icon}
                  </span>
                </td>
                <td>
                  <span
                    className={styles.statusBadge}
                    style={{ '--status-color': status.color }}
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