'use client'

import { useState, useCallback, useRef } from 'react'
import VoiceButton from './VoiceButton'
import VoiceTranscriptBubble from './VoiceTranscriptBubble'
import VoiceClarificationForm from './VoiceClarificationForm'
import VoiceSlotPicker from './VoiceSlotPicker'
import styles from '@/styles/booking/voice-button.module.css'

/**
 * VoiceBookingFlow
 *
 * Top-level orchestrator for the voice booking experience.
 * Manages the full state machine:
 *
 *   idle → listening → processing → (high: slots) | (low: clarify) → slot-picker → done
 *
 * When a slot is selected it calls onSlotSelected(slot, intent)
 * so the parent BookingFlow can jump to the customer info step.
 *
 * Props:
 *   businessId     — string
 *   services       — [{ id, name, duration_mins, price_usd }]
 *   onSlotSelected(slot, intent) — called when user picks a slot
 *   onClose()      — called when user dismisses the voice panel
 */
export default function VoiceBookingFlow({ businessId, services, onSlotSelected, onClose }) {
  // State machine: 'idle' | 'listening' | 'processing' | 'clarify' | 'slots' | 'error'
  const [phase, setPhase] = useState('idle')
  const [transcript, setTranscript] = useState('')
  const [intent, setIntent] = useState(null)
  const [slots, setSlots] = useState([])
  const [date, setDate] = useState('')
  const [service, setService] = useState(null)
  const [hint, setHint] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // -- Handle transcript from Web Speech API --------------------------------
  const handleTranscript = useCallback(async (text) => {
    setTranscript(text)
    setPhase('processing')
    setErrorMsg('')

    try {
      const res = await fetch('/api/voice-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, businessId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong. Please try again.')
        setPhase('error')
        return
      }

      if (data.confidence === 'high') {
        setIntent(data.intent)
        setSlots(data.slots || [])
        setDate(data.date || '')
        setService(data.service || null)
        setPhase('slots')
      } else {
        // low confidence
        setIntent(data.intent || {})
        setHint(data.hint || '')
        setPhase('clarify')
      }
    } catch {
      setErrorMsg('Network error. Please check your connection.')
      setPhase('error')
    }
  }, [businessId])

  // -- Clarification form confirmed -> re-query availability ----------------
  const handleClarifyConfirm = useCallback(async (refinedIntent) => {
    if (!refinedIntent.resolvedServiceId || !refinedIntent.preferredDate) return

    setPhase('processing')
    setIntent(refinedIntent)

    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          serviceId: refinedIntent.resolvedServiceId,
          staffId: null,
          date: refinedIntent.preferredDate,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to fetch availability.')
        setPhase('error')
        return
      }

      const matchedService = services.find((s) => s.id === refinedIntent.resolvedServiceId)
      setSlots(data.slots || [])
      setDate(refinedIntent.preferredDate)
      setService(matchedService || null)
      setPhase('slots')
    } catch {
      setErrorMsg('Network error. Please check your connection.')
      setPhase('error')
    }
  }, [businessId, services])

  // -- Reset to idle --------------------------------------------------------
  const reset = useCallback(() => {
    setPhase('idle')
    setTranscript('')
    setIntent(null)
    setSlots([])
    setDate('')
    setService(null)
    setHint('')
    setErrorMsg('')
  }, [])

  // -- Slot selected --------------------------------------------------------
  const handleSlotSelect = useCallback((slot) => {
    onSlotSelected(slot, intent)
  }, [intent, onSlotSelected])

  return (
    <div className={styles.flowWrap}>
      {/* Header */}
      <div className={styles.flowHeader}>
        <div className={styles.flowHeaderLeft}>
          <div className={styles.flowHeaderDot} />
          <span className={styles.flowHeaderTitle}>Voice Booking</span>
        </div>
        <button className={styles.flowClose} onClick={onClose} aria-label="Close voice booking">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Idle or listening — show mic button + bubble */}
      {(phase === 'idle' || phase === 'listening') && (
        <div className={styles.flowBody}>
          <p className={styles.flowHint}>
            Tap the mic and say something like:<br />
            <em>"Book a haircut for Friday afternoon"</em>
          </p>
          <VoiceButton
            onTranscript={handleTranscript}
            disabled={false}
          />
          {(transcript || phase === 'listening') && (
            <VoiceTranscriptBubble transcript={transcript} state={phase} />
          )}
        </div>
      )}

      {/* Processing */}
      {phase === 'processing' && (
        <div className={styles.flowBody}>
          {transcript && (
            <VoiceTranscriptBubble transcript={transcript} state="processing" />
          )}
          <div className={styles.processingRow}>
            <span className={styles.spinner} />
            <span className={styles.processingText}>Understanding your request…</span>
          </div>
        </div>
      )}

      {/* Error */}
      {phase === 'error' && (
        <div className={styles.flowBody}>
          <div className={styles.errorBox}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
            </svg>
            {errorMsg}
          </div>
          <button className={styles.retryBtn} onClick={reset}>Try again</button>
        </div>
      )}

      {/* Clarification form */}
      {phase === 'clarify' && (
        <div className={styles.flowBody}>
          {transcript && (
            <VoiceTranscriptBubble transcript={transcript} state="done" />
          )}
          <VoiceClarificationForm
            intent={intent}
            services={services}
            hint={hint}
            onConfirm={handleClarifyConfirm}
            onCancel={reset}
          />
        </div>
      )}

      {/* Slot picker */}
      {phase === 'slots' && (
        <div className={styles.flowBody}>
          {transcript && (
            <VoiceTranscriptBubble transcript={transcript} state="done" />
          )}
          <VoiceSlotPicker
            intent={intent}
            slots={slots}
            date={date}
            service={service}
            onSelect={handleSlotSelect}
            onBack={reset}
          />
        </div>
      )}
    </div>
  )
}