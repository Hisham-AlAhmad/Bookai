'use client'

import styles from '@/styles/analytics/flagged-table.module.css'

/**
 * FlaggedCustomersTable
 *
 * Displays customers with repeated no-shows.
 * Reusable — works for business-level or platform-level data.
 *
 * @param {{
 *   customers: Array<{id:string, name:string, phone:string, noShowCount:number, lastSeen:string|null}>,
 *   loading?: boolean
 * }} props
 */
export default function FlaggedCustomersTable({ customers, loading = false }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>No-Show Flagged Customers</p>
          <p className={styles.subtitle}>Customers with 2 or more no-shows</p>
        </div>
        {!loading && customers.length > 0 && (
          <span className={styles.countBadge}>{customers.length} customers</span>
        )}
      </div>

      {loading ? (
        <div className={styles.skeletonWrap}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonRow}>
              <div className={styles.skeletonAvatar} />
              <div className={styles.skeletonLines}>
                <div className={styles.skeletonLine} style={{ width: '45%' }} />
                <div className={styles.skeletonLine} style={{ width: '30%' }} />
              </div>
              <div className={styles.skeletonBadge} />
            </div>
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <p className={styles.emptyTitle}>All clear!</p>
          <p className={styles.emptyText}>No customers with repeated no-shows.</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>No-Shows</th>
                <th>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className={styles.row}>
                  <td>
                    <div className={styles.nameCell}>
                      <div className={styles.avatar}>{c.name[0]?.toUpperCase()}</div>
                      <span className={styles.name}>{c.name}</span>
                    </div>
                  </td>
                  <td className={styles.phone}>{c.phone}</td>
                  <td>
                    <span
                      className={styles.badge}
                      data-severity={c.noShowCount >= 5 ? 'high' : c.noShowCount >= 3 ? 'medium' : 'low'}
                    >
                      {c.noShowCount}
                    </span>
                  </td>
                  <td className={styles.lastSeen}>
                    {c.lastSeen
                      ? new Date(c.lastSeen).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}