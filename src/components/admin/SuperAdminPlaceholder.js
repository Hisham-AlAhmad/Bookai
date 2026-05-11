import adminStyles from '@/styles/admin/admin.module.css'
import styles from '@/styles/admin/super-admin.module.css'

export default function SuperAdminPlaceholder({ title, subtitle, description }) {
  return (
    <div className={adminStyles.page}>
      <div className={adminStyles.pageHeader}>
        <div>
          <p className={adminStyles.eyebrow}>Super Admin</p>
          <h1 className={adminStyles.pageTitle}>{title}</h1>
          {subtitle && <p className={adminStyles.pageSubtitle}>{subtitle}</p>}
        </div>
      </div>

      <div className={styles.placeholderCard}>
        <h2 className={styles.placeholderTitle}>{description.title}</h2>
        <p className={styles.placeholderText}>{description.body}</p>
      </div>
    </div>
  )
}
