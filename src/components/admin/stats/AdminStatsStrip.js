import styles from '@/styles/admin/stats.module.css'

const STATS = [
  {
    key: 'totalBusinesses',
    label: 'Total Businesses',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-6 9 6v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    accent: '#c8a96e',
  },
  {
    key: 'totalActive',
    label: 'Active Businesses',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
        <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    accent: '#22c55e',
  },
  {
    key: 'totalBookingsThisMonth',
    label: 'Bookings This Month',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
      </svg>
    ),
    accent: '#6e9ecf',
  },
]

export default function AdminStatsStrip({ stats }) {
  return (
    <div className={styles.strip}>
      {STATS.map(({ key, label, icon, accent }) => (
        <div key={key} className={styles.card} style={{ '--accent': accent }}>
          <div className={styles.iconWrap}>{icon}</div>
          <div className={styles.body}>
            <p className={styles.label}>{label}</p>
            <p className={styles.value}>{(stats[key] ?? 0).toLocaleString()}</p>
          </div>
          <div className={styles.glow} />
        </div>
      ))}
    </div>
  )
}