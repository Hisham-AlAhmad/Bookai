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
 * Fix: The closing animation now mirrors the opening animation by using a
 * dedicated `closing` state that applies the exit CSS class before removing
 * the overlay from the DOM (via a setTimeout matching the animation duration).
 *
 * Props:
 *   businessId      — string
 *   services        — [{ id, name, duration_mins, price_usd }]
 *   onSlotSelected(slot, intent) — called with the chosen slot + intent
 */

// Must match the animation duration defined in voice-button.module.css
const CLOSE_ANIMATION_MS = 280

export default function VoiceBookingTrigger({ businessId, services, onSlotSelected }) {
  // 'closed' | 'open' | 'closing'
  const [phase, setPhase] = useState('closed')

  const open = useCallback(() => {
    setPhase('open')
  }, [])

  /**
   * Trigger the exit animation, then unmount the overlay after it completes.
   * This gives the CSS animation time to play before the element is removed.
   */
  const close = useCallback(() => {
    setPhase('closing')
    setTimeout(() => {
      setPhase('closed')
    }, CLOSE_ANIMATION_MS)
  }, [])

  const handleSlotSelected = useCallback((slot, intent) => {
    // Close first (with animation), then notify parent
    setPhase('closing')
    setTimeout(() => {
      setPhase('closed')
      onSlotSelected(slot, intent)
    }, CLOSE_ANIMATION_MS)
  }, [onSlotSelected])

  // Click on the dim backdrop → close with animation
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) close()
  }, [close])

  const isVisible = phase === 'open' || phase === 'closing'

  return (
    <>
      {/* Floating pill trigger */}
      <button
        className={styles.floatingTrigger}
        onClick={open}
        aria-label="Book with voice"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6" strokeLinecap="round" />
        </svg>
        Book with voice
      </button>

      {/* Modal overlay — only mounted while open or closing */}
      {isVisible && (
        <div
          className={`${styles.overlay} ${phase === 'closing' ? styles.overlayClosing : ''}`}
          onClick={handleBackdropClick}
          aria-modal="true"
          role="dialog"
          aria-label="Voice booking"
        >
          <div
            className={`${styles.overlayPanel} ${phase === 'closing' ? styles.overlayPanelClosing : ''}`}
          >
            <VoiceBookingFlow
              businessId={businessId}
              services={services}
              onSlotSelected={handleSlotSelected}
              onClose={close}
            />
          </div>
        </div>
      )}
    </>
  )
}