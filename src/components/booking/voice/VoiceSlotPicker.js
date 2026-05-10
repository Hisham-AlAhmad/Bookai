'use client'

import { formatUtcTime } from '@/lib/time'
import styles from '@/styles/booking/voice-button.module.css'

/**
 * VoiceSlotPicker
 *
 * Shown when we have high-confidence intent + available slots.
 * Customer picks a slot then continues to the customer info step.
 *
 * Props:
 *   intent      — resolved intent (resolvedServiceName, preferredDate)
 *   slots       — [{ starts_at, ends_at }]
 *   date        — "YYYY-MM-DD"
 *   service     — { name, duration_mins, price_usd }
 *   onSelect(slot) — called when user picks a slot
 *   onBack()    — restart the voice flow
 */
export default function VoiceSlotPicker({ intent, slots, date, service, onSelect, onBack }) {
  const dateLabel = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long',
      })
    : ''

  return (
    <div className={styles.slotPickerWrap}>
      <div className={styles.slotPickerHeader}>
        <div className={styles.slotPickerIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className={styles.slotPickerTitle}>{intent?.resolvedServiceName || service?.name}</p>
          <p className={styles.slotPickerSubtitle}>{dateLabel}</p>
        </div>
      </div>

      {slots.length === 0 ? (
        <div className={styles.slotPickerEmpty}>
          <p>No slots available on this day.</p>
          <button className={styles.slotPickerBack} onClick={onBack}>Try another date</button>
        </div>
      ) : (
        <>
          <p className={styles.slotPickerHint}>Pick a time:</p>
          <div className={styles.slotGrid}>
            {slots.map((slot) => (
              <button
                key={slot.starts_at}
                className={styles.slotPill}
                onClick={() => onSelect(slot)}
              >
                {formatUtcTime(slot.starts_at, '12')}
              </button>
            ))}
          </div>
        </>
      )}

      <button className={styles.slotPickerBack} onClick={onBack}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
          <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Start over
      </button>
    </div>
  )
}