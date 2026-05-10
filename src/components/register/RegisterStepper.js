import styles from '@/styles/register.module.css'

export default function RegisterStepper({ steps, currentStep }) {
  return (
    <div className={styles.stepper}>
      {steps.map((label, i) => {
        const isDone = i < currentStep
        const isActive = i === currentStep

        return (
          <div key={label} className={styles.stepItem}>
            <div
              className={[
                styles.stepDot,
                isDone ? styles.stepDone : '',
                isActive ? styles.stepActive : '',
                !isDone && !isActive ? styles.stepPending : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isDone ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <span
              className={[
                styles.stepLabel,
                isActive ? styles.stepLabelActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div className={[styles.stepLine, isDone ? styles.stepLineDone : ''].filter(Boolean).join(' ')} />
            )}
          </div>
        )
      })}
    </div>
  )
}