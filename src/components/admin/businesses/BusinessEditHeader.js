import settingsStyles from '@/styles/dashboard/settings.module.css'
import styles from '@/styles/admin/business-edit.module.css'
import { SaveIcon } from '@/components/dashboard/settings/SettingsIcons'

export default function BusinessEditHeader({ businessName, saving, disabled }) {
  return (
    <div className={settingsStyles.pageHeader}>
      <div>
        <p className={settingsStyles.eyebrow}>Super Admin</p>
        <h1 className={settingsStyles.pageTitle}>{businessName || 'Edit Business'}</h1>
        <p className={settingsStyles.pageSubtitle}>Update core profile details, plan, and status.</p>
      </div>
      <div className={styles.headerActions}>
        <a className={styles.backLink} href="/super-admin/businesses">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to businesses
        </a>
        <button className={settingsStyles.saveBtn} type="submit" disabled={saving || disabled}>
          <SaveIcon />
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
