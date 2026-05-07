import styles from '@/styles/dashboard/hours.module.css'
import { InfoIcon } from './HoursIcons'

export default function HoursInfoStrip() {
    return (
        <div className={styles.infoStrip}>
            <InfoIcon />
            <span>Changes take effect immediately on your public booking page once saved.</span>
        </div>
    )
}
