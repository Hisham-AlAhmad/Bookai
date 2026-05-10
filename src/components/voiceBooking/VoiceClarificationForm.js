'use client'

import { useState } from 'react'
import styles from '@/styles/booking/voice-booking.module.css'

/**
 * VoiceClarificationForm
 * Shown when confidence is low or the AI couldn't parse a full booking.
 * Pre-populates whatever was understood and lets the user correct the rest.
 */
export default function VoiceClarificationForm({ result, onSubmit, onRetry, loading }) {
  const [form, setForm] = useState({
    service: result?.service || '',
    staff: result?.staff || '',
    date: result?.date || '',
    time: result?.time || '',
    name: result?.name || '',
    phone: result?.phone || '',
  })

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className={styles.clarifyCard} role="dialog" aria-label="Clarify your booking">
      {/* Header */}
      <div className={styles.clarifyHeader}>
        <div className={`${styles.resultIconWrap} ${styles.resultIconWrapAmber}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h3 className={styles.resultTitle}>Almost there!</h3>
          <p className={styles.resultSub}>Help us fill in the details</p>
        </div>
      </div>

      {/* Original transcript echo */}
      {result?.rawTranscript && (
        <div className={styles.resultTranscript}>
          <span className={styles.resultTranscriptIcon} aria-hidden="true">"</span>
          <p className={styles.resultTranscriptText}>{result.rawTranscript}</p>
        </div>
      )}

      <form className={styles.clarifyForm} onSubmit={handleSubmit}>
        <div className={styles.clarifyGrid}>
          <div className={styles.clarifyField}>
            <label className={styles.clarifyLabel}>Service</label>
            <input
              className={styles.clarifyInput}
              value={form.service}
              onChange={(e) => set('service', e.target.value)}
              placeholder="e.g. Haircut"
            />
          </div>

          <div className={styles.clarifyField}>
            <label className={styles.clarifyLabel}>Staff (optional)</label>
            <input
              className={styles.clarifyInput}
              value={form.staff}
              onChange={(e) => set('staff', e.target.value)}
              placeholder="e.g. Ahmad"
            />
          </div>

          <div className={styles.clarifyField}>
            <label className={styles.clarifyLabel}>Date</label>
            <input
              className={styles.clarifyInput}
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              placeholder="e.g. Friday"
            />
          </div>

          <div className={styles.clarifyField}>
            <label className={styles.clarifyLabel}>Time</label>
            <input
              className={styles.clarifyInput}
              value={form.time}
              onChange={(e) => set('time', e.target.value)}
              placeholder="e.g. 3pm"
            />
          </div>

          <div className={styles.clarifyField}>
            <label className={styles.clarifyLabel}>Your name</label>
            <input
              className={styles.clarifyInput}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ahmad Khalil"
              required
            />
          </div>

          <div className={styles.clarifyField}>
            <label className={styles.clarifyLabel}>Phone number</label>
            <input
              className={styles.clarifyInput}
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+961 70 000 000"
              type="tel"
              required
            />
          </div>
        </div>

        <div className={styles.resultActions}>
          <button
            type="button"
            className={styles.resultRetryBtn}
            onClick={onRetry}
            disabled={loading}
          >
            Try again
          </button>
          <button
            type="submit"
            className={styles.resultConfirmBtn}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className={styles.processingSpinner} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
                Booking…
              </>
            ) : (
              <>
                Confirm booking
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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