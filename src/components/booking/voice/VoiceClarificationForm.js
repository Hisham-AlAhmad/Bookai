'use client'

import { useState } from 'react'
import styles from '@/styles/booking/voice-button.module.css'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function toLocalISODate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * VoiceClarificationForm
 *
 * Shown when the AI extracted intent has low confidence.
 * Pre-fills what was understood and asks user to confirm/complete.
 *
 * Props:
 *   intent     — the partial intent from OpenRouter
 *   services   — list of available services [{ id, name, duration_mins, price_usd }]
 *   hint       — optional hint string from the API
 *   onConfirm(refinedIntent) — called with the confirmed intent
 *   onCancel() — resets the voice flow
 */
export default function VoiceClarificationForm({ intent, services, hint, onConfirm, onCancel }) {
  const [serviceId, setServiceId] = useState(
    intent?.resolvedServiceId ||
    services.find((s) => s.name.toLowerCase() === intent?.service?.toLowerCase())?.id ||
    ''
  )
  const [date, setDate] = useState(intent?.preferredDate || '')

  // Generate next 14 days for the quick date strip
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return {
      iso: toLocalISODate(d),
      dayLabel: DAY_LABELS[d.getDay()],
      dayNum: d.getDate(),
      monthLabel: MONTH_LABELS[d.getMonth()],
    }
  })

  const canConfirm = serviceId && date

  return (
    <div className={styles.clarifyWrap}>
      <div className={styles.clarifyHeader}>
        <div className={styles.clarifyIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className={styles.clarifyTitle}>Just a couple of details</p>
          <p className={styles.clarifySubtitle}>
            {hint || "We heard you! Let's confirm a few things before booking."}
          </p>
        </div>
      </div>

      {/* What we understood */}
      {intent?.service && (
        <div className={styles.understoodBadge}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          We heard: <strong>"{intent.service}"</strong>
        </div>
      )}

      {/* Service selector */}
      <div className={styles.clarifyField}>
        <label className={styles.clarifyLabel}>Service</label>
        <div className={styles.serviceChips}>
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`${styles.serviceChip} ${serviceId === s.id ? styles.serviceChipActive : ''}`}
              onClick={() => setServiceId(s.id)}
            >
              <span className={styles.serviceChipName}>{s.name}</span>
              <span className={styles.serviceChipMeta}>{s.duration_mins}m{s.price_usd ? ` · $${Number(s.price_usd).toFixed(0)}` : ''}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date quick-pick strip */}
      <div className={styles.clarifyField}>
        <label className={styles.clarifyLabel}>Date</label>
        <div className={styles.dateStrip}>
          {days.map((d) => (
            <button
              key={d.iso}
              type="button"
              className={`${styles.dateChip} ${date === d.iso ? styles.dateChipActive : ''}`}
              onClick={() => setDate(d.iso)}
            >
              <span className={styles.dateChipDay}>{d.dayLabel}</span>
              <span className={styles.dateChipNum}>{d.dayNum}</span>
              <span className={styles.dateChipMonth}>{d.monthLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.clarifyActions}>
        <button type="button" className={styles.clarifyCancel} onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className={styles.clarifyConfirm}
          disabled={!canConfirm}
          onClick={() =>
            onConfirm({
              ...intent,
              resolvedServiceId: serviceId,
              resolvedServiceName: services.find((s) => s.id === serviceId)?.name,
              preferredDate: date,
            })
          }
        >
          Find available slots
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}