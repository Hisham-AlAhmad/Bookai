'use client'

import { useMemo, useState } from 'react'
import BookingCard from './BookingCard'
import { ChevronLeftIcon, ChevronRightIcon } from './BookingsIcons'
import styles from '@/styles/dashboard/bookings.module.css'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getWeekStart(date) {
  const d = new Date(date)
  // Start week on Monday (0 = Monday)
  const dayIndex = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - dayIndex)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`
}

export default function CalendarView({ bookings, onBookingClick }) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [weekStart])

  const bookingsByDay = useMemo(() => {
    const map = {}
    weekDays.forEach((d) => {
      map[localDateKey(d)] = []
    })

    bookings.forEach((b) => {
      const startsAt = new Date(b.starts_at)
      // Use local date key for consistent day grouping (avoid UTC offset shift)
      const dateKey = localDateKey(startsAt)
      if (map[dateKey] !== undefined) {
        map[dateKey].push(b)
      }
    })

    // Sort each day's bookings by start time
    Object.values(map).forEach((arr) => arr.sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)))

    return map
  }, [bookings, weekDays])

  function prevWeek() { setWeekStart((d) => addDays(d, -7)) }
  function nextWeek() { setWeekStart((d) => addDays(d, 7)) }
  function goToday() { setWeekStart(getWeekStart(new Date())) }

  const monthLabel = (() => {
    const months = [...new Set(weekDays.map((d) => MONTH_LABELS[d.getMonth()]))]
    return months.join(' / ')
  })()

  const yearLabel = weekDays[0].getFullYear()
  const today = new Date()

  return (
    <div className={styles.calendarWrap}>
      {/* Calendar nav */}
      <div className={styles.calendarNav}>
        <div className={styles.calendarNavLeft}>
          <button className={styles.calNavBtn} onClick={prevWeek} title="Previous week">
            <ChevronLeftIcon />
          </button>
          <button className={styles.calNavBtn} onClick={nextWeek} title="Next week">
            <ChevronRightIcon />
          </button>
          <button className={styles.todayBtn} onClick={goToday}>Today</button>
        </div>
        <span className={styles.calendarTitle}>
          {monthLabel} {yearLabel}
        </span>
        <span /> {/* spacer */}
      </div>

      {/* Calendar grid */}
      <div className={styles.calendarGrid}>
        {weekDays.map((day, i) => {
          const dateKey = localDateKey(day)
          const dayBookings = bookingsByDay[dateKey] || []
          const isToday = isSameDay(day, today)

          return (
            <div
              key={dateKey}
              className={`${styles.calendarCol} ${isToday ? styles.calendarColToday : ''}`}
            >
              <div className={styles.calendarColHeader}>
                <span className={styles.calDayLabel}>{DAY_LABELS[day.getDay()]}</span>
                <span className={`${styles.calDayNum} ${isToday ? styles.calDayNumToday : ''}`}>
                  {day.getDate()}
                </span>
                {dayBookings.length > 0 && (
                  <span className={styles.calDayCount}>{dayBookings.length}</span>
                )}
              </div>

              <div className={styles.calendarColBody}>
                {dayBookings.length === 0 ? (
                  <div className={styles.calEmptyDay} />
                ) : (
                  dayBookings.map((b) => (
                    <BookingCard key={b.id} booking={b} onClick={onBookingClick} />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}