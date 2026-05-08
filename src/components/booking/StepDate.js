'use client'

import { useMemo } from 'react'
import styles from '@/styles/booking/steps.module.css'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function toLocalISODate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function StepDate({ workingHours, selected, onSelect, onNext, onBack }) {
  // Build a map of closed days: { 0: true, 6: true, ... }
  const closedDays = useMemo(() => {
    const map = {}
    workingHours.forEach((wh) => {
      if (wh.is_closed) map[wh.day_of_week] = true
    })
    return map
  }, [workingHours])

  // Generate the next 30 days
  const days = useMemo(() => {
    const result = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 30; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const dow = d.getDay()
      result.push({
        date: d,
        // Use local date parts to avoid UTC day shift.
        iso: toLocalISODate(d),
        dayLabel: DAY_LABELS[dow],
        dayNum: d.getDate(),
        monthLabel: MONTH_LABELS[d.getMonth()],
        isClosed: !!closedDays[dow],
        isToday: i === 0,
      })
    }
    return result
  }, [closedDays])

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Pick a Date</h2>
        <p className={styles.stepSub}>Choose your preferred day.</p>
      </div>

      <div className={styles.dateStrip}>
        {days.map((d) => (
          <button
            key={d.iso}
            className={`${styles.dateCell} ${d.isClosed ? styles.dateCellClosed : ''
              } ${selected === d.iso ? styles.dateCellSelected : ''}`}
            onClick={() => !d.isClosed && onSelect(d.iso)}
            disabled={d.isClosed}
            title={d.isClosed ? 'Closed' : undefined}
          >
            <span className={styles.dateDayLabel}>{d.dayLabel}</span>
            <span className={styles.dateDayNum}>{d.dayNum}</span>
            <span className={styles.dateMonth}>{d.monthLabel}</span>
            {d.isClosed && <span className={styles.dateClosed}>—</span>}
          </button>
        ))}
      </div>

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