import styles from '@/styles/dashboard/settings.module.css'
import { SaveIcon } from './SettingsIcons'

export default function SettingsHeader({ saving, uploading, onSave }) {
  return (
    <div className={styles.pageHeader}>
      <div>
        <p className={styles.eyebrow}>Owner</p>
        <h1 className={styles.pageTitle}>Business Settings</h1>
        <p className={styles.pageSubtitle}>Manage your public profile, plan, and booking page.</p>
      </div>
      <button className={styles.saveBtn} onClick={onSave} disabled={saving || uploading}>
        <SaveIcon />
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )
}
