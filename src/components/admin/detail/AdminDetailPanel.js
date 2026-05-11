'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatUtcTime } from '@/lib/time'
import styles from '@/styles/admin/detail.module.css'

const PLAN_META = {
  free: { label: 'Free', color: '#888' },
  starter: { label: 'Starter', color: '#6e9ecf' },
  pro: { label: 'Pro', color: '#c8a96e' },
}

const STATUS_COLORS = {
  pending: '#e8a020',
  confirmed: '#22c55e',
  cancelled: '#ef4444',
  no_show: '#8b5cf6',
}

const ROLE_COLORS = {
  owner: '#c8a96e',
  manager: '#6e9ecf',
  staff: '#888',
}

export default function AdminDetailPanel({
  business,
  isClosing,
  onClose,
  onToggleActive,
  onDelete,
}) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!business) return
    let mounted = true
    setLoading(true)
    setError('')
    setDetail(null)

    fetch(`/api/admin/businesses/${business.id}/detail`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load details')
        return r.json()
      })
      .then((data) => { if (mounted) setDetail(data) })
      .catch((err) => { if (mounted) setError(err.message) })
      .finally(() => { if (mounted) setLoading(false) })

    return () => { mounted = false }
  }, [business.id])

  const plan = PLAN_META[business.plan] ?? PLAN_META.free

  return (
    <>
      <div
        className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ''}`}
        onClick={onClose}
      />
      <aside className={`${styles.panel} ${isClosing ? styles.panelClosing : ''}`}>

        {/* Header */}
        <div className={styles.panelHeader}>
          <div className={styles.panelHeaderLeft}>
            <div className={styles.panelAvatar}>
              {business.logo_url
                ? <img src={business.logo_url} alt={business.name} className={styles.panelAvatarImg} />
                : <span>{business.name[0]?.toUpperCase()}</span>
              }
            </div>
            <div>
              <p className={styles.panelEyebrow}>Business Detail</p>
              <h2 className={styles.panelTitle}>{business.name}</h2>
              <p className={styles.panelSlug}>/{business.slug}</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className={styles.panelBody}>

          {/* Meta */}
          <div className={styles.metaRow}>
            <span
              className={styles.planBadge}
              style={{ color: plan.color, background: `${plan.color}18` }}
            >
              {plan.label}
            </span>
            <span className={`${styles.statusBadge} ${business.active ? styles.statusActive : styles.statusSuspended}`}>
              {business.active ? 'Active' : 'Suspended'}
            </span>
            {business.city && <span className={styles.cityBadge}>{business.city}</span>}
          </div>

          {/* Info grid */}
          <div className={styles.infoGrid}>
            {business.phone && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Phone</span>
                <span className={styles.infoValue}>{business.phone}</span>
              </div>
            )}
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Category</span>
              <span className={styles.infoValue} style={{ textTransform: 'capitalize' }}>{business.category}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Total Bookings</span>
              <span className={styles.infoValue}>{business.totalBookings.toLocaleString()}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>This Month</span>
              <span className={styles.infoValue}>{business.monthlyBookings.toLocaleString()}</span>
            </div>
          </div>

          {/* Loading / Error */}
          {loading && (
            <div className={styles.loadingWrap}>
              <span className={styles.spinner} />
              Loading details…
            </div>
          )}
          {error && <div className={styles.errorBanner}>{error}</div>}

          {detail && (
            <>
              {/* Staff */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  Staff
                  <span className={styles.sectionCount}>{detail.staff.length}</span>
                </h3>
                {detail.staff.length === 0 ? (
                  <p className={styles.emptyText}>No staff members.</p>
                ) : (
                  <div className={styles.staffList}>
                    {detail.staff.map((s) => (
                      <div key={s.id} className={`${styles.staffRow} ${!s.active ? styles.staffRowInactive : ''}`}>
                        <div className={styles.staffAvatar}>
                          {s.name[0]?.toUpperCase()}
                        </div>
                        <div className={styles.staffInfo}>
                          <p className={styles.staffName}>{s.name}</p>
                          {s.email && <p className={styles.staffEmail}>{s.email}</p>}
                        </div>
                        <span
                          className={styles.roleBadge}
                          style={{ color: ROLE_COLORS[s.role] ?? '#888' }}
                        >
                          {s.role}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Services */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  Services
                  <span className={styles.sectionCount}>{detail.services.length}</span>
                </h3>
                {detail.services.length === 0 ? (
                  <p className={styles.emptyText}>No services configured.</p>
                ) : (
                  <div className={styles.serviceList}>
                    {detail.services.map((svc) => (
                      <div key={svc.id} className={`${styles.serviceRow} ${!svc.active ? styles.serviceRowInactive : ''}`}>
                        <div className={styles.serviceInfo}>
                          <p className={styles.serviceName}>{svc.name}</p>
                          <p className={styles.serviceMeta}>{svc.duration_mins} min</p>
                        </div>
                        {svc.price_usd && (
                          <span className={styles.servicePrice}>
                            ${Number(svc.price_usd).toFixed(0)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Recent bookings */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  Recent Bookings
                  <span className={styles.sectionCount}>last 10</span>
                </h3>
                {detail.bookings.length === 0 ? (
                  <p className={styles.emptyText}>No bookings yet.</p>
                ) : (
                  <div className={styles.bookingList}>
                    {detail.bookings.map((b) => (
                      <div key={b.id} className={styles.bookingRow}>
                        <div className={styles.bookingLeft}>
                          <p className={styles.bookingCustomer}>{b.customer.name}</p>
                          <p className={styles.bookingMeta}>
                            {b.service.name} · {b.staff.name}
                          </p>
                        </div>
                        <div className={styles.bookingRight}>
                          <p className={styles.bookingTime}>
                            {new Date(b.starts_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              timeZone: 'UTC',
                            })}
                            {' · '}
                            {formatUtcTime(b.starts_at, '12')}
                          </p>
                          <span
                            className={styles.bookingStatus}
                            style={{ color: STATUS_COLORS[b.status] ?? '#888' }}
                          >
                            {b.status.replace('_', '-')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* Actions */}
          <div className={styles.panelActions}>
            <a
              href={`/${business.slug}`}
              target="_blank"
              rel="noreferrer"
              className={styles.panelActionBtn}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              View Public Page
            </a>

            <Link
              href={`/super-admin/businesses/${business.id}/edit`}
              className={`${styles.panelActionBtn} ${styles.panelActionBtnEdit}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" strokeLinecap="round" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Edit Business
            </Link>

            <button
              className={`${styles.panelActionBtn} ${business.active ? styles.panelActionBtnSuspend : styles.panelActionBtnActivate}`}
              onClick={() => onToggleActive(business)}
            >
              {business.active ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                  Suspend Business
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Reactivate Business
                </>
              )}
            </button>

            <button
              className={`${styles.panelActionBtn} ${styles.panelActionBtnDelete}`}
              onClick={() => onDelete(business)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              Delete Business
            </button>
          </div>

        </div>
      </aside>
    </>
  )
}