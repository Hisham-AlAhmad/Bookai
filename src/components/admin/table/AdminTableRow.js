import Link from 'next/link'
import styles from '@/styles/admin/table.module.css'

const PLAN_META = {
  free: { label: 'Free', color: '#888', bg: 'rgba(136,136,136,0.1)' },
  starter: { label: 'Starter', color: '#6e9ecf', bg: 'rgba(110,158,207,0.1)' },
  pro: { label: 'Pro', color: '#c8a96e', bg: 'rgba(200,169,110,0.12)' },
}

const CATEGORY_LABELS = {
  barbershop: 'Barbershop',
  salon: 'Salon',
  clinic: 'Clinic',
  tutor: 'Tutor',
  mechanic: 'Mechanic',
  other: 'Other',
}

export default function AdminTableRow({
  business,
  isSelected,
  onToggleActive,
  onDelete,
  onRowClick,
}) {
  const plan = PLAN_META[business.plan] ?? PLAN_META.free

  function handleSuspend(e) {
    e.stopPropagation()
    onToggleActive(business)
  }

  function handleDelete(e) {
    e.stopPropagation()
    onDelete(business)
  }

  return (
    <tr
      className={`${styles.row} ${isSelected ? styles.rowSelected : ''} ${!business.active ? styles.rowSuspended : ''}`}
      onClick={() => onRowClick(business)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onRowClick(business) }}
    >
      {/* Business name + slug */}
      <td>
        <div className={styles.nameCell}>
          <div className={styles.avatar}>
            {business.logo_url ? (
              <img src={business.logo_url} alt={business.name} className={styles.avatarImg} />
            ) : (
              <span className={styles.avatarFallback}>
                {business.name[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className={styles.businessName}>{business.name}</p>
            <p className={styles.businessSlug}>/{business.slug}</p>
          </div>
        </div>
      </td>

      {/* Plan */}
      <td>
        <span
          className={styles.planBadge}
          style={{ color: plan.color, background: plan.bg }}
        >
          {plan.label}
        </span>
      </td>

      {/* City */}
      <td className={styles.cityCell}>{business.city || <span className={styles.none}>—</span>}</td>

      {/* Bookings */}
      <td>
        <div className={styles.bookingStats}>
          <span className={styles.bookingTotal}>{business.totalBookings.toLocaleString()}</span>
          <span className={styles.bookingMonthly}>+{business.monthlyBookings} this month</span>
        </div>
      </td>

      {/* Staff */}
      <td className={styles.staffCount}>{business.staffCount}</td>

      {/* Status */}
      <td>
        <span className={`${styles.statusBadge} ${business.active ? styles.statusActive : styles.statusSuspended}`}>
          {business.active ? 'Active' : 'Suspended'}
        </span>
      </td>

      {/* Actions */}
      <td>
        <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
          <a
            href={`/${business.slug}`}
            target="_blank"
            rel="noreferrer"
            className={styles.actionBtn}
            title="View public page"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>

          <Link
            href={`/super-admin/businesses/${business.id}/edit`}
            className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
            title="Edit business"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" strokeLinecap="round" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          <button
            className={`${styles.actionBtn} ${business.active ? styles.actionBtnSuspend : styles.actionBtnActivate}`}
            onClick={handleSuspend}
            title={business.active ? 'Suspend business' : 'Reactivate business'}
          >
            {business.active ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )}
          </button>

          <button
            className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
            onClick={handleDelete}
            title="Delete business"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}