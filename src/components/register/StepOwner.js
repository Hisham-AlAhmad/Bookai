'use client'

import { useState } from 'react'
import styles from '@/styles/register.module.css'

export default function StepOwner({ form, onChange, onSubmit, onBack, submitting, error }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  function set(field, value) {
    onChange((prev) => ({ ...prev, [field]: value }))
  }

  const passwordMatch = form.password && form.confirmPassword
    ? form.password === form.confirmPassword
    : null

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit()
  }

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Owner Account</h2>
        <p className={styles.stepSub}>Create your login credentials. You'll use these to access the dashboard.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.ownerForm}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Full Name *</label>
          <input
            type="text"
            className={styles.fieldInput}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Your full name"
            required
            autoComplete="name"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Email Address *</label>
          <input
            type="email"
            className={styles.fieldInput}
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Password *</label>
          <div className={styles.passwordRow}>
            <input
              type={showPassword ? 'text' : 'password'}
              className={styles.fieldInput}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="Min 8 characters"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {form.password && form.password.length < 8 && (
            <p className={styles.fieldHint}>Password must be at least 8 characters.</p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Confirm Password *</label>
          <div className={styles.passwordRow}>
            <input
              type={showConfirm ? 'text' : 'password'}
              className={[
                styles.fieldInput,
                passwordMatch === false ? styles.fieldInputError : '',
                passwordMatch === true ? styles.fieldInputSuccess : '',
              ]
                .filter(Boolean)
                .join(' ')}
              value={form.confirmPassword}
              onChange={(e) => set('confirmPassword', e.target.value)}
              placeholder="Repeat your password"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {passwordMatch === false && (
            <p className={styles.fieldError}>Passwords do not match.</p>
          )}
          {passwordMatch === true && (
            <p className={styles.fieldSuccess}>Passwords match.</p>
          )}
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={styles.actions}>
          <button type="button" className={styles.btnSecondary} onClick={onBack} disabled={submitting}>
            Back
          </button>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={
              submitting ||
              !form.name.trim() ||
              !form.email.trim() ||
              form.password.length < 8 ||
              form.password !== form.confirmPassword
            }
          >
            {submitting ? (
              <>
                <span className={styles.spinnerSmall} />
                Creating account...
              </>
            ) : (
              <>
                Create My Account
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}