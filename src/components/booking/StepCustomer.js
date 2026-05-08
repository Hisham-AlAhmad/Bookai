'use client'

import { useState } from 'react'
import { formatUtcTime } from '@/lib/time'
import styles from '@/styles/booking/steps.module.css'

export default function StepCustomer({ selections, onConfirm, onBack, loading, error }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')

  function formatTime(iso) {
    return formatUtcTime(iso, '12')
  }

  function formatDate(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    onConfirm({ name: name.trim(), phone: phone.trim(), note: note.trim() })
  }

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Your Details</h2>
        <p className={styles.stepSub}>Almost done — just your name and phone number.</p>
      </div>

      {/* Booking summary */}
      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Service</span>
          <span className={styles.summaryValue}>{selections.service?.name}</span>
        </div>
        {selections.staff && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Staff</span>
            <span className={styles.summaryValue}>{selections.staff.name}</span>
          </div>
        )}
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Date</span>
          <span className={styles.summaryValue}>{formatDate(selections.date)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Time</span>
          <span className={styles.summaryValue}>
            {formatTime(selections.slot?.starts_at)} — {formatTime(selections.slot?.ends_at)}
          </span>
        </div>
        {selections.service?.price_usd && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Price</span>
            <span className={styles.summaryValue}>${Number(selections.service.price_usd).toFixed(0)}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Full Name</label>
          <input
            type="text"
            className={styles.fieldInput}
            placeholder="Ahmad Khalil"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Phone Number</label>
          <input
            type="tel"
            className={styles.fieldInput}
            placeholder="+961 71 000 000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            autoComplete="tel"
          />
          <span className={styles.fieldHint}>We'll send your reminder here.</span>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Note (optional)</label>
          <textarea
            className={styles.fieldTextarea}
            placeholder="e.g. fade on the sides, bring reference photo..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={styles.actions}>
          <button type="button" className={styles.btnSecondary} onClick={onBack}>
            Back
          </button>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={loading || !name.trim() || !phone.trim()}
          >
            {loading ? (
              <>
                <span className={styles.spinnerSmall} />
                Booking...
              </>
            ) : (
              <>
                Confirm Booking
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