'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import styles from '@/styles/login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Invalid email or password.')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.shell}>
        <section className={styles.brandPanel}>
          <div className={styles.brandTop}>
            <div className={styles.brandMark}>B</div>
            <div className={styles.brandCopy}>
              <p className={styles.brandName}>Bookai</p>
              <p className={styles.brandCaption}>Smart booking for businesses</p>
            </div>
          </div>

          <h1 className={styles.headline}>Effortless bookings. Happier customers.</h1>
          <p className={styles.description}>
            Fast scheduling and simple tools for busy businesses.
          </p>

          <div className={styles.highlightGrid}>
            <div className={styles.highlightCard}>
              <span className={styles.highlightLabel}>Fast</span>
              <p className={styles.highlightValue}>Quick bookings</p>
              <p className={styles.highlightText}>Save time with one-click scheduling.</p>
            </div>
            <div className={styles.highlightCard}>
              <span className={styles.highlightLabel}>Reliable</span>
              <p className={styles.highlightValue}>Clear schedules</p>
              <p className={styles.highlightText}>Less confusion, fewer double-books.</p>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardBadge}>Secure access</span>
            <h2 className={styles.title}>Sign in</h2>
            <p className={styles.subtitle}>Use your Bookai admin credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && <p className={styles.error} role="alert">{error}</p>}

            <button
              type="submit"
              className={styles.button}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className={styles.helpText}>Need access? Contact your administrator.</p>
        </section>
      </div>
    </div>
  )
}