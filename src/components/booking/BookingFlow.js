'use client'

import { useState, useEffect } from 'react'
import StepServices from './StepServices'
import StepStaff from './StepStaff'
import StepDate from './StepDate'
import StepSlots from './StepSlots'
import StepCustomer from './StepCustomer'
import BookingConfirmation from './BookingConfirmation'
import styles from '@/styles/booking/booking-flow.module.css'

const STEPS = ['Service', 'Staff', 'Date', 'Time', 'Your Info']

export default function BookingFlow({ businessSlug, businessId, workingHours, services = [], externalSlotSelection = null }) {
  const [step, setStep] = useState(0)
  // Highest step the user has legitimately reached; used to lock future steps.
  const [maxStep, setMaxStep] = useState(0)
  const [selections, setSelections] = useState({
    service: null,   // { id, name, duration_mins, price_usd }
    staff: null,     // { id, name } or null (no preference)
    date: null,      // "YYYY-MM-DD"
    slot: null,      // { starts_at, ends_at }
    customer: null,  // { name, phone }
  })
  const [confirmed, setConfirmed] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function select(key, value) {
    setSelections((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  // Clear downstream selections whenever the user goes back or jumps to an earlier step.
  function resetAfterStep(stepIndex) {
    setSelections((prev) => {
      const nextSelections = { ...prev }

      if (stepIndex < 1) nextSelections.staff = null
      if (stepIndex < 2) nextSelections.date = null
      if (stepIndex < 3) nextSelections.slot = null
      if (stepIndex < 4) nextSelections.customer = null

      return nextSelections
    })
  }

  // Jump to a reachable step and lock everything after it.
  function goToStep(targetStep, { clearError = true } = {}) {
    if (targetStep === step) return
    resetAfterStep(targetStep)
    setStep(targetStep)
    setMaxStep(targetStep)
    if (clearError) setError('')
  }

  function next() {
    setStep((s) => {
      const nextStep = Math.min(s + 1, STEPS.length - 1)
      resetAfterStep(nextStep)
      setMaxStep((m) => Math.max(m, nextStep))
      return nextStep
    })
  }

  function back() {
    setStep((s) => {
      const prevStep = Math.max(s - 1, 0)
      resetAfterStep(prevStep)
      setMaxStep(prevStep)
      return prevStep
    })
    setError('')
  }

  async function handleConfirm(customerData) {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          serviceId: selections.service.id,
          staffId: selections.staff?.id || null,
          starts_at: selections.slot.starts_at,
          ends_at: selections.slot.ends_at,
          customerName: customerData.name,
          customerPhone: customerData.phone,
          customerNote: customerData.note || '',
          booked_via: 'form',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.alternatives) {
          // Slot was taken — show alternatives
          setError('That slot was just taken. Pick one of these instead:')
          goToStep(3, { clearError: false }) // go back to time step
          return
        }
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      setConfirmed(data.booking)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Respond to externally-provided slot selections (e.g. from voice trigger).
  useEffect(() => {
    const handle = (selection) => {
      const { slot, intent } = selection || {}
      if (!slot && !intent) return

      const resolvedService = (intent?.resolvedServiceId && services?.find(s => s.id === intent.resolvedServiceId))
        || (intent?.resolvedServiceId ? { id: intent.resolvedServiceId, name: intent?.resolvedServiceName } : null)

      if (resolvedService) select('service', resolvedService)

      if (intent?.preferredDate) select('date', intent.preferredDate)
      else if (slot?.starts_at) select('date', slot.starts_at.slice(0, 10))

      if (slot) select('slot', slot)

      setMaxStep(4)
      setStep(4)
    }

    // prop-based external selection
    if (externalSlotSelection) handle(externalSlotSelection)

    // also support window-level custom event 'voice-slot-selected' for ease of integration
    function onWindowEvent(e) {
      handle(e.detail)
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('voice-slot-selected', onWindowEvent)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('voice-slot-selected', onWindowEvent)
      }
    }
  }, [externalSlotSelection, services])

  // ── Confirmed state ──────────────────────────────
  if (confirmed) {
    return <BookingConfirmation booking={confirmed} service={selections.service} />
  }

  return (
    <div className={styles.card}>

      {/* Progress stepper */}
      <div className={styles.stepper}>
        {STEPS.map((label, i) => {
          const isUnlocked = i <= maxStep

          return (
            <div key={label} className={styles.stepItem}>
              <div
                className={`${styles.stepDot} ${i < step
                  ? styles.stepDone
                  : i === step
                    ? styles.stepActive
                    : styles.stepPending
                  }`}
                role={isUnlocked ? 'button' : undefined}
                tabIndex={isUnlocked ? 0 : -1}
                aria-disabled={!isUnlocked}
                onClick={() => {
                  if (!isUnlocked) return
                  goToStep(i)
                }}
                onKeyDown={(event) => {
                  if (!isUnlocked) return
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    goToStep(i)
                  }
                }}
              >
                {i < step ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span className={`${styles.stepLabel} ${i === step ? styles.stepLabelActive : ''}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <div className={styles.stepContent}>

        {step === 0 && (
          <StepServices
            businessSlug={businessSlug}
            selected={selections.service}
            onSelect={(s) => { select('service', s); select('staff', null); select('date', null); select('slot', null) }}
            onNext={next}
          />
        )}

        {step === 1 && (
          <StepStaff
            serviceId={selections.service?.id}
            selected={selections.staff}
            onSelect={(s) => { select('staff', s); select('date', null); select('slot', null) }}
            onNext={next}
            onBack={back}
          />
        )}

        {step === 2 && (
          <StepDate
            workingHours={workingHours}
            selected={selections.date}
            onSelect={(d) => { select('date', d); select('slot', null) }}
            onNext={next}
            onBack={back}
          />
        )}

        {step === 3 && (
          <StepSlots
            businessId={businessId}
            serviceId={selections.service?.id}
            staffId={selections.staff?.id || null}
            date={selections.date}
            selected={selections.slot}
            onSelect={(sl) => select('slot', sl)}
            onNext={next}
            onBack={back}
          />
        )}

        {step === 4 && (
          <StepCustomer
            selections={selections}
            onConfirm={handleConfirm}
            onBack={back}
            loading={loading}
            error={error}
          />
        )}

      </div>
    </div>
  )
}