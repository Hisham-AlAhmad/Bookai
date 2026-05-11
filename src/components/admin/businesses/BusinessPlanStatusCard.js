import settingsStyles from '@/styles/dashboard/settings.module.css'
import styles from '@/styles/admin/business-edit.module.css'
import { SparkleIcon, WarnIcon } from '@/components/dashboard/settings/SettingsIcons'

const PLAN_LABELS = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
}

export default function BusinessPlanStatusCard({
  plan,
  active,
  onPlanChange,
  onStatusChange,
  showSuspendWarning,
  suspendConfirmed,
  onSuspendConfirm,
}) {
  return (
    <div className={settingsStyles.card}>
      <div className={settingsStyles.cardHeader}>
        <div className={settingsStyles.cardIcon}><SparkleIcon /></div>
        <div>
          <p className={settingsStyles.cardTitle}>Plan & Status</p>
          <p className={settingsStyles.cardSubtitle}>Control access, billing tier, and visibility.</p>
        </div>
      </div>
      <div className={settingsStyles.cardBody}>
        <div className={styles.statusGrid}>
          <div className={settingsStyles.field}>
            <label className={settingsStyles.label}>Plan</label>
            <select
              className={`${settingsStyles.input} ${settingsStyles.select}`}
              value={plan}
              onChange={(e) => onPlanChange(e.target.value)}
            >
              {Object.entries(PLAN_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <p className={styles.helperText}>Plan changes take effect immediately.</p>
          </div>

          <div className={settingsStyles.field}>
            <label className={settingsStyles.label}>Status</label>
            <select
              className={`${settingsStyles.input} ${settingsStyles.select}`}
              value={active ? 'active' : 'suspended'}
              onChange={(e) => onStatusChange(e.target.value === 'active')}
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <p className={styles.helperText}>Suspended businesses cannot accept new bookings.</p>
          </div>
        </div>

        {showSuspendWarning && (
          <div className={styles.warningBanner}>
            <div className={styles.warningCheck}>
              <WarnIcon />
              Suspended businesses are hidden from public discovery and booking.
            </div>
            <label className={styles.warningCheck}>
              <input
                type="checkbox"
                checked={suspendConfirmed}
                onChange={(e) => onSuspendConfirm(e.target.checked)}
              />
              I understand this business will be suspended.
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
