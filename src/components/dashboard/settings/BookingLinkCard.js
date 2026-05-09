import styles from '@/styles/dashboard/settings.module.css'
import { CheckIcon, CopyIcon, GlobeIcon, InfoIcon } from './SettingsIcons'

export default function BookingLinkCard({ slug, copied, onCopy }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}><GlobeIcon /></div>
        <div className={styles.cardHeaderText}>
          <p className={styles.cardTitle}>Booking Link</p>
          <p className={styles.cardSubtitle}>Share this link with your customers</p>
        </div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.dangerSection}>
          <button
            className={`${styles.copyLinkBtn} ${copied ? styles.copyLinkBtnCopied : ''}`}
            onClick={onCopy}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? 'Copied!' : `bookai.app/${slug}`}
          </button>
          <div className={styles.dangerNote}>
            <InfoIcon />
            Changing your business name will update your public URL. Make sure to share the new link with your customers after saving.
          </div>
        </div>
      </div>
    </div>
  )
}
