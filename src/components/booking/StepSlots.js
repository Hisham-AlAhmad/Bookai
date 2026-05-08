'use client'

import { useEffect, useId, useState } from 'react'
import { formatUtcTime } from '@/lib/time'
import styles from '@/styles/booking/steps.module.css'

export default function StepSlots({ businessId, serviceId, staffId, date, selected, onSelect, onNext, onBack }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeFormat, setTimeFormat] = useState('12')
  const toggleId = useId()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedFormat = window.localStorage.getItem('bookingTimeFormat')
    if (savedFormat === '12' || savedFormat === '24') {
      setTimeFormat(savedFormat)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('bookingTimeFormat', timeFormat)
  }, [timeFormat])

  useEffect(() => {
    if (!date || !serviceId) return
    const loadSlots = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch('/api/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId, serviceId, staffId, date }),
        })
        const data = await response.json()
        if (data.error) { setError(data.error); return }
        setSlots(data.slots || [])
      } catch {
        setError('Could not load slots. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadSlots()
  }, [businessId, serviceId, staffId, date])

  function formatTime(isoString) {
    return formatUtcTime(isoString, timeFormat)
  }

  function toggleTimeFormat() {
    setTimeFormat((current) => (current === '24' ? '12' : '24'))
  }

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Pick a Time</h2>
        <p className={styles.stepSub}>
          Available slots on{' '}
          <strong>
            {new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
          </strong>
        </p>
        <div className={styles.timeToggleRow}>
          <span className={styles.timeToggleText}>Switch between 24/12 hrs format</span>
          <div className={styles.timeToggleControl}>
            <input
              id={toggleId}
              type="checkbox"
              className={styles.timeToggleInput}
              checked={timeFormat === '12'}
              onChange={toggleTimeFormat}
              aria-label="Toggle time format"
            />
            <label htmlFor={toggleId} className={styles.timeToggle}>
              <span className={styles.timeToggleLabel}>24</span>
              <span className={styles.timeToggleSwitch}>
                <span className={styles.timeToggleCircle} />
              </span>
              <span className={styles.timeToggleLabel}>12</span>
            </label>
          </div>
        </div>
      </div>

      {loading && (
        <div className={styles.loading}>
          <span className={styles.spinner} />
          Checking availability...
        </div>
      )}

      {!loading && error && (
        <div className={styles.errorBox}>{error}</div>
      )}

      {!loading && !error && !slots.length && (
        <div className={styles.empty}>
          No available slots on this day. Please pick a different date.
        </div>
      )}

      {!loading && !error && slots.length > 0 && (
        <div className={styles.slotGrid}>
          {slots.map((slot) => (
            <button
              key={slot.starts_at}
              className={`${styles.slotPill} ${selected?.starts_at === slot.starts_at ? styles.slotPillSelected : ''
                }`}
              onClick={() => onSelect(slot)}
            >
              {formatTime(slot.starts_at)}
            </button>
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <button className={styles.btnSecondary} onClick={onBack}>Back</button>
        <button
          className={styles.btnPrimary}
          onClick={onNext}
          disabled={!selected}
        >
          Continue
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}