import Link from 'next/link'
import styles from '@/styles/register.module.css'

export default function RegisterLayout({ children }) {
  return (
    <div className={styles.wrapper}>
      <aside className={styles.brandPanel}>
        <div className={styles.brandTop}>
          <img
            src="/logos/logo-rectangle-dark.png"
            alt="Bookai"
            className={styles.brandLogo}
          />
          <p className={styles.brandCaption}>Smart booking for businesses</p>
        </div>

        <div className={styles.brandBody}>
          <h1 className={styles.headline}>Start accepting bookings in minutes.</h1>
          <p className={styles.description}>
            Set up your public booking page, manage your team, and let customers book 24/7 — with or without voice.
          </p>

          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Public booking page with your branding
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Voice booking powered by AI
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              SMS reminders sent automatically
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Analytics, staff management & more
            </li>
          </ul>
        </div>

        <p className={styles.loginPrompt}>
          Already have an account?{' '}
          <Link href="/login" className={styles.loginLink}>Sign in</Link>
        </p>
      </aside>

      <main className={styles.formPanel}>
        {children}
      </main>
    </div>
  )
}