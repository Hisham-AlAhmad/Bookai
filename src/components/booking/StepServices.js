'use client'

import { useEffect, useState } from 'react'
import styles from '@/styles/booking/steps.module.css'

export default function StepServices({ businessSlug, selected, onSelect, onNext }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await fetch(`/api/services?slug=${businessSlug}`)
        const data = await response.json()
        setServices(data.services || [])
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [businessSlug])

  if (loading) {
    return (
      <div className={styles.step}>
        <div className={styles.stepHeader}>
          <h2 className={styles.stepTitle}>Choose a Service</h2>
          <p className={styles.stepSub}>What can we help you with today?</p>
        </div>

        <div className={styles.serviceGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.serviceCard} aria-hidden>
              <div className={styles.serviceCardInner}>
                <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: '62%', height: 18 }} />
                <div className={styles.skeletonMeta} style={{ marginTop: 6 }}>
                  <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: '26%', height: 12 }} />
                  <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: '18%', height: 12 }} />
                </div>
                <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: '78%', height: 12, marginTop: 6 }} />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <div className={styles.skeletonBtn} />
        </div>
      </div>
    )
  }
  if (!services.length) return <div className={styles.empty}>No services available yet.</div>

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Choose a Service</h2>
        <p className={styles.stepSub}>What can we help you with today?</p>
      </div>

      <div className={styles.serviceGrid}>
        {services.map((s) => (
          <button
            key={s.id}
            className={`${styles.serviceCard} ${selected?.id === s.id ? styles.serviceCardSelected : ''}`}
            onClick={() => onSelect(s)}
          >
            <div className={styles.serviceCardInner}>
              <span className={styles.serviceName}>{s.name}</span>
              <div className={styles.serviceMeta}>
                <span className={styles.serviceDuration}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 3" strokeLinecap="round" />
                  </svg>
                  {s.duration_mins} min
                </span>
                {s.price_usd && (
                  <span className={styles.servicePrice}>
                    ${Number(s.price_usd).toFixed(0)}
                  </span>
                )}
              </div>
              {s.description && (
                <p className={styles.serviceDesc}>{s.description}</p>
              )}
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