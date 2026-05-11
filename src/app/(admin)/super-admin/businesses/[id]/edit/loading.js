import settingsStyles from '@/styles/dashboard/settings.module.css'
import styles from '@/styles/admin/business-edit.module.css'

export default function Loading() {
  return (
    <div className={settingsStyles.page}>
      <div className={styles.skeletonCard}>
        <div className={styles.skeletonStack}>
          <div className={`${styles.skeletonLine} ${styles.skeletonLineLg}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonLineMd}`} style={{ width: '60%' }} />
        </div>
      </div>

      <div className={styles.skeletonCard}>
        <div className={styles.skeletonStack}>
          <div className={`${styles.skeletonLine} ${styles.skeletonLineMd}`} style={{ width: '45%' }} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
        </div>
      </div>

      <div className={styles.skeletonCard}>
        <div className={styles.skeletonStack}>
          <div className={`${styles.skeletonLine} ${styles.skeletonLineMd}`} style={{ width: '55%' }} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
        </div>
      </div>
    </div>
  )
}
