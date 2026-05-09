import styles from '@/styles/dashboard/settings.module.css'
import { CheckIcon, SparkleIcon } from './SettingsIcons'
import { PLAN_FEATURES } from './SettingsConstants'

export default function PlanCard({ currentPlan }) {
  const planBadgeClass =
    currentPlan === 'pro' ? styles.planBadgePro :
    currentPlan === 'starter' ? styles.planBadgeStarter :
    styles.planBadgeFree

  const planLabel =
    currentPlan === 'pro' ? 'Pro' :
    currentPlan === 'starter' ? 'Starter' :
    'Free'

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}><SparkleIcon /></div>
        <div className={styles.cardHeaderText}>
          <p className={styles.cardTitle}>Plan</p>
          <p className={styles.cardSubtitle}>Upgrade to unlock more features</p>
        </div>
      </div>
      <div className={styles.cardBody}>

        <div className={styles.planCurrent}>
          <span className={`${styles.planBadge} ${planBadgeClass}`}>{planLabel}</span>
          <span className={styles.planCurrentLabel}>
            You are on the <strong>{planLabel}</strong> plan.
          </span>
        </div>

        {currentPlan !== 'pro' && (
          <div className={styles.planGrid}>

            {currentPlan === 'free' && (
              <div className={styles.planCard}>
                <p className={styles.planCardName}>Starter</p>
                <div className={styles.planCardPrice}>
                  <span className={styles.planCardAmount}>$15</span>
                  <span className={styles.planCardPeriod}>/month</span>
                </div>
                <ul className={styles.planCardFeatures}>
                  {PLAN_FEATURES.starter.map((feature) => (
                    <li key={feature}><CheckIcon />{feature}</li>
                  ))}
                </ul>
                <button className={`${styles.planUpgradeBtn} ${styles.planUpgradeBtnStarter}`}>
                  Upgrade to Starter
                </button>
              </div>
            )}

            <div className={`${styles.planCard} ${styles.planCardPro}`}>
              <div className={styles.planCardGlow} />
              <p className={styles.planCardName}>Pro</p>
              <div className={styles.planCardPrice}>
                <span className={styles.planCardAmount}>$40</span>
                <span className={styles.planCardPeriod}>/month</span>
              </div>
              <ul className={styles.planCardFeatures}>
                {PLAN_FEATURES.pro.map((feature) => (
                  <li key={feature}><CheckIcon />{feature}</li>
                ))}
              </ul>
              <button className={`${styles.planUpgradeBtn} ${styles.planUpgradeBtnPro}`}>
                Upgrade to Pro
              </button>
            </div>

          </div>
        )}

        {currentPlan === 'pro' && (
          <p style={{ fontSize: '0.88rem', color: '#aaa' }}>
            You&apos;re on the highest plan. Thank you for supporting Bookai!
          </p>
        )}

      </div>
    </div>
  )
}
