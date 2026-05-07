import styles from '@/styles/dashboard/hours.module.css'
import { SaveIcon } from './HoursIcons'

export default function HoursHeader({ saving, onSave }) {
    return (
        <div className={styles.header}>
            <div className={styles.headerLeft}>
                <h1 className={styles.title}>Working Hours</h1>
                <p className={styles.subtitle}>
                    Set your business hours — these control which time slots appear on your booking page.
                </p>
            </div>
            <button className={styles.saveBtn} onClick={onSave} disabled={saving}>
                <SaveIcon />
                {saving ? 'Saving…' : 'Save Changes'}
            </button>
        </div>
    )
}
