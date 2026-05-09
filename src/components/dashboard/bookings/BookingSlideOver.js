'use client'

import { useState, useEffect } from 'react'
import { formatUtcTime } from '@/lib/time'
import { STATUS_META } from './BookingCard'
import CustomerCard from './CustomerCard'
import { CloseIcon, CheckIcon, AlertIcon, TrashIcon, MicIcon, FormIcon } from './BookingsIcons'
import styles from '@/styles/dashboard/booking-slideover.module.css'

const VIA_META = {
  voice: { icon: <MicIcon />, label: 'Voice' },
  form: { icon: <FormIcon />, label: 'Form' },
}

export default function BookingSlideOver({
  booking,
  bookingCount,
  onClose,
  isClosing,
  onStatusUpdate,
  onDelete,
  canManage,
}) {
  const [actionLoading, setActionLoading] = useState(null) // 'confirm'|'noshow'|'cancel'|'delete'
  const [error, setError] = useState('')
  const [fullBooking, setFullBooking] = useState(null)
  const [loadingFull, setLoadingFull] = useState(false)

  if (!booking) return null

  const status = STATUS_META[booking.status] || STATUS_META.pending
  const via = VIA_META[booking.booked_via] || VIA_META.form

  async function updateStatus(newStatus) {
    setActionLoading(newStatus)
    setError('')
    try {
      const id = (fullBooking && fullBooking.id) || booking.id
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')

      onStatusUpdate(data.booking)
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this booking? It will be marked as cancelled and removed from the schedule.')) return
    setActionLoading('delete')
    setError('')
    try {
      const id = (fullBooking && fullBooking.id) || booking.id
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete')
      onDelete(booking.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    let mounted = true
    async function fetchFull() {
      if (!booking || !booking.id) return
      setLoadingFull(true)
      try {
        const res = await fetch(`/api/bookings/${booking.id}`)
        if (!res.ok) throw new Error('Failed to fetch booking')
        const data = await res.json()
        if (mounted) setFullBooking(data.booking || data)
      } catch (err) {
        // ignore - we'll fall back to provided booking
      } finally {
        if (mounted) setLoadingFull(false)
      }
    }
    fetchFull()
    return () => { mounted = false }
  }, [booking])

  const displayBooking = fullBooking || booking
  const startsAt = displayBooking.starts_at ? new Date(displayBooking.starts_at) : null
  const endsAt = displayBooking.ends_at ? new Date(displayBooking.ends_at) : null
  const isCancelled = booking.status === 'cancelled'

  return (
    <>
      <div
        className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ''}`}
        onClick={onClose}
      />
      <aside className={`${styles.panel} ${isClosing ? styles.panelClosing : ''}`}>

        {/* Header */}
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.panelEyebrow}>Booking Details</p>
            <h2 className={styles.panelTitle}>{booking.customer.name}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className={styles.panelBody}>

          {/* Status bar */}
          <div
            className={styles.statusBar}
            style={{ '--status-color': status.color, '--status-bg': status.bg }}
          >
            <span className={styles.statusBarDot} />
            <span className={styles.statusBarLabel}>{status.label}</span>
            <span className={styles.statusBarVia} title={via.label}>{via.icon}</span>
          </div>

          {/* Core info */}
          <div className={styles.infoGrid}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Service</span>
              <span className={styles.infoValue}>{displayBooking?.service?.name || '—'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Staff</span>
              <span className={styles.infoValue}>{displayBooking?.staff?.name || '—'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Date</span>
              <span className={styles.infoValue}>
                {startsAt
                  ? startsAt.toLocaleDateString('en-GB', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  })
                  : '—'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Time</span>
              <span className={styles.infoValue}>
                {displayBooking?.starts_at && displayBooking?.ends_at
                  ? `${formatUtcTime(displayBooking.starts_at, '12')} – ${formatUtcTime(
                    displayBooking.ends_at,
                    '12'
                  )}`
                  : '—'}
              </span>
            </div>
            {booking.service.price_usd && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Price</span>
                <span className={styles.infoValue}>${Number(booking.service.price_usd).toFixed(0)}</span>
              </div>
            )}
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Booking ID</span>
              <span className={`${styles.infoValue} ${styles.infoMono}`}>
                #{booking.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Customer note */}
          {booking.customer_note && (
            <div className={styles.noteWrap}>
              <p className={styles.noteLabel}>Customer Note</p>
              <p className={styles.noteText}>{booking.customer_note}</p>
            </div>
          )}

          {/* Customer card */}
          <CustomerCard
            customer={booking.customer}
            bookingCount={bookingCount}
          />

          {/* Cancellation info */}
          {isCancelled && booking.cancellation_reason && (
            <div className={styles.cancelInfo}>
              <p className={styles.cancelInfoLabel}>Cancellation reason</p>
              <p className={styles.cancelInfoText}>{booking.cancellation_reason}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className={styles.errorBanner}>
              <AlertIcon />
              {error}
            </div>
          )}

          {/* Status actions */}
          {canManage && !isCancelled && (
            <div className={styles.actions}>
              <p className={styles.actionsLabel}>Update status</p>
              <div className={styles.actionButtons}>

                {booking.status !== 'confirmed' && (
                  <button
                    className={`${styles.actionBtn} ${styles.actionBtnConfirm}`}
                    onClick={() => updateStatus('confirmed')}
                    disabled={!!actionLoading}
                  >
                    <CheckIcon />
                    {actionLoading === 'confirmed' ? 'Saving…' : 'Confirm'}
                  </button>
                )}

                {booking.status !== 'no_show' && (
                  <button
                    className={`${styles.actionBtn} ${styles.actionBtnNoShow}`}
                    onClick={() => updateStatus('no_show')}
                    disabled={!!actionLoading}
                  >
                    <AlertIcon />
                    {actionLoading === 'no_show' ? 'Saving…' : 'Mark No-Show'}
                  </button>
                )}

                {booking.status !== 'cancelled' && (
                  <button
                    className={`${styles.actionBtn} ${styles.actionBtnCancel}`}
                    onClick={() => updateStatus('cancelled')}
                    disabled={!!actionLoading}
                  >
                    {actionLoading === 'cancelled' ? 'Saving…' : 'Cancel Booking'}
                  </button>
                )}

              </div>
            </div>
          )}

          {/* Delete */}
          {canManage && (
            <div className={styles.dangerZone}>
              <button
                className={styles.deleteBtn}
                onClick={handleDelete}
                disabled={!!actionLoading}
              >
                <TrashIcon />
                {actionLoading === 'delete' ? 'Deleting…' : 'Delete Booking'}
              </button>
              <p className={styles.deleteHint}>
                Marks as cancelled and frees the time slot. History is preserved.
              </p>
            </div>
          )}

        </div>
      </aside>
    </>
  )
}