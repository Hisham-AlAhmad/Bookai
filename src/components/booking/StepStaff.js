'use client'

import { useEffect, useState } from 'react'
import styles from '@/styles/booking/steps.module.css'

export default function StepStaff({ serviceId, selected, onSelect, onNext, onBack }) {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!serviceId) return
    const loadStaff = async () => {
      try {
        const response = await fetch(`/api/staff?serviceId=${serviceId}`)
        const data = await response.json()
        setStaff(data.staff || [])
      } finally {
        setLoading(false)
      }
    }

    loadStaff()
  }, [serviceId])

  if (loading) return <div className={styles.loading}><span className={styles.spinner} />Loading staff...</div>
  if (!staff.length) return <div className={styles.empty}>No staff available for this service.</div>

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Choose Your Staff</h2>
        <p className={styles.stepSub}>Pick who you'd like to work with, or leave it to us.</p>
      </div>

      <div className={styles.staffList}>
        {/* No preference option */}
        <button
          className={`${styles.staffCard} ${selected === null ? styles.staffCardSelected : ''}`}
          onClick={() => onSelect(null)}
        >
          <div className={styles.staffAvatar} style={{ background: '#f0ede6', color: '#999' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className={styles.staffInfo}>
            <span className={styles.staffName}>No Preference</span>
            <span className={styles.staffRole}>Any available staff</span>
          </div>
          {selected === null && (
            <div className={styles.selectedCheck}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </button>

        {staff.map((s) => (
          <button
            key={s.id}
            className={`${styles.staffCard} ${selected?.id === s.id ? styles.staffCardSelected : ''}`}
            onClick={() => onSelect(s)}
          >
            <div className={styles.staffAvatar}>
              {s.avatar_url ? (
                <img src={s.avatar_url} alt={s.name} />
              ) : (
                s.name[0].toUpperCase()
              )}
            </div>
            <div className={styles.staffInfo}>
              <span className={styles.staffName}>{s.name}</span>
              <span className={styles.staffRole}>{s.role}</span>
            </div>
            {selected?.id === s.id && (
              <div className={styles.selectedCheck}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button className={styles.btnSecondary} onClick={onBack}>Back</button>
        <button
          className={styles.btnPrimary}
          onClick={onNext}
          disabled={selected === undefined}
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