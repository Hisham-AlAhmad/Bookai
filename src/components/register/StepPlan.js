import { PLAN_CONFIG } from '@/components/register/RegisterConstants'
import styles from '@/styles/register.module.css'

export default function StepPlan({ selected, onSelect, onNext }) {
  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Choose Your Plan</h2>
        <p className={styles.stepSub}>Start free, upgrade any time. No credit card required for the Free plan.</p>
      </div>

      <div className={styles.planGrid}>
        {Object.entries(PLAN_CONFIG).map(([key, plan]) => (
          <button
            key={key}
            type="button"
            className={[
              styles.planCard,
              selected === key ? styles.planCardSelected : '',
              plan.highlight ? styles.planCardHighlight : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onSelect(key)}
          >
            {plan.badge && (
              <span className={styles.planBadge}>{plan.badge}</span>
            )}

            <div className={styles.planCardHeader}>
              <p className={styles.planName}>{plan.name}</p>
              <div className={styles.planPrice}>
                <span className={styles.planAmount}>{plan.price}</span>
                {plan.period && <span className={styles.planPeriod}>{plan.period}</span>}
              </div>
              <p className={styles.planTagline}>{plan.tagline}</p>
            </div>

            <ul className={styles.planFeatures}>
              {plan.features.map((f) => (
                <li key={f} className={styles.planFeatureItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            {selected === key && (
              <div className={styles.planSelectedBadge}>Selected</div>
            )}
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={onNext}>
          Continue with {PLAN_CONFIG[selected]?.name}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}