'use client'

import { useState, useCallback } from 'react'
import VoiceBookingFlow from './VoiceBookingFlow'
import styles from '@/styles/booking/voice-button.module.css'

/**
 * VoiceBookingTrigger
 *
 * Renders the floating "Book with voice" pill on the public booking page.
 * When tapped it opens the VoiceBookingFlow in a modal overlay.
 * When a slot is selected it calls onSlotSelected so the parent can jump
 * directly to the StepCustomer step with the slot pre-filled.
 *
 * Props:
 *   businessId      — string
 *   services        — [{ id, name, duration_mins, price_usd }]
 *   onSlotSelected(slot, intent) — called with the chosen slot + intent
 */
export default function VoiceBookingTrigger({ businessId, services, onSlotSelected }) {
  const [open, setOpen] = useState(false)

  const handleSlotSelected = useCallback((slot, intent) => {
    setOpen(false)
    onSlotSelected(slot, intent)
  }, [onSlotSelected])

  return (
    <>
      {/* Floating pill */}
      <button
        className={styles.floatingTrigger}
        onClick={() => setOpen(true)}
        aria-label="Book with voice"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6" strokeLinecap="round" />
        </svg>
        Book with voice
      </button>

      {/* Modal overlay */}
      {open && (
        <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div className={styles.overlayPanel}>
            <VoiceBookingFlow
              businessId={businessId}
              services={services}
              onSlotSelected={handleSlotSelected}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}