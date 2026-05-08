'use client'

import { useEffect, useId, useState } from 'react'
import { formatUtcTime } from '@/lib/time'
import styles from '@/styles/dashboard/recent-bookings.module.css'

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#e8a020' },
  confirmed: { label: 'Confirmed', color: '#22c55e' },
  cancelled: { label: 'Cancelled', color: '#ef4444' },
  no_show: { label: 'No-show', color: '#8b5cf6' },
}

const VIA_CONFIG = {
  voice: { label: 'Voice', icon: '🎙' },
  form: { label: 'Form', icon: '📋' },
}

export default function RecentBookings({ bookings }) {
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

  function toggleTimeFormat() {
    setTimeFormat((current) => (current === '24' ? '12' : '24'))
  }

  const dateOptions = { day: 'numeric', month: 'short', timeZone: 'UTC' }

  function renderTimeToggle() {
    return (
      <div className={styles.timeToggleRow}>
        <span className={styles.timeToggleText}>Time format</span>
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
    )
  }

  if (!bookings.length) {
    return (
      <div className={styles.wrapper}>
        {renderTimeToggle()}
        <div className={styles.empty}>
          <p>No bookings yet. Share your booking page to get started.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      {renderTimeToggle()}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Service</th>
              <th>Staff</th>
              <th>Date & Time</th>
              <th>Via</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const status = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending
              const via = VIA_CONFIG[b.booked_via] || VIA_CONFIG.form

              return (
                <tr key={b.id} className={styles.row}>
                  <td>
                    <div className={styles.customer}>
                      <div className={styles.customerAvatar}>
                        {b.customer.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className={styles.customerName}>{b.customer.name}</p>
                        <p className={styles.customerPhone}>{b.customer.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.serviceName}>{b.service.name}</span>
                    {b.service.price_usd && (
                      <span className={styles.servicePrice}>${Number(b.service.price_usd).toFixed(0)}</span>
                    )}
                  </td>
                  <td className={styles.staffName}>{b.staff.name}</td>
                  <td className={styles.dateTime}>
                    {new Date(b.starts_at).toLocaleDateString('en-GB', dateOptions)}
                    <span className={styles.time}>
                      {formatUtcTime(b.starts_at, timeFormat)}
                    </span>
                  </td>
                  <td>
                    <span className={styles.viaBadge} title={via.label}>
                      {via.icon}
                    </span>
                  </td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{ '--status-color': status.color }}
                    >
                      {status.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}