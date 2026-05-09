'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import BookingsHeader from './BookingsHeader'
import BookingsFilters from './BookingsFilters'
import CalendarView from './CalendarView'
import ListView from './ListView'
import BookingSlideOver from './BookingSlideOver'
import styles from '@/styles/dashboard/bookings.module.css'

const POLL_INTERVAL_MS = 30_000
const SLIDE_CLOSE_MS = 250

export default function BookingsClient({ initialBookings, staffList, role }) {
  const [view, setView] = useState('calendar')
  const [bookings, setBookings] = useState(initialBookings)
  const [filters, setFilters] = useState({ status: '', from: '', to: '', staffId: '' })
  const [selected, setSelected] = useState(null)   // booking in slide-over
  const [bookingCount, setBookingCount] = useState(0) // total bookings for selected customer
  const [slideOpen, setSlideOpen] = useState(false)
  const [slideClosing, setSlideClosing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState(Date.now())
  const [loading, setLoading] = useState(false)

  const closeTimer = useRef(null)
  const pollTimer = useRef(null)
  const canManage = ['owner', 'manager'].includes(role)

  // ── Fetch bookings from API ─────────────────────────────────────────────
  const fetchBookings = useCallback(async (activeFilters = filters) => {
    const params = new URLSearchParams({ limit: '200' })
    if (activeFilters.status) params.set('status', activeFilters.status)
    if (activeFilters.from) params.set('from', activeFilters.from)
    if (activeFilters.to) params.set('to', activeFilters.to)
    if (activeFilters.staffId) params.set('staffId', activeFilters.staffId)

    try {
      const res = await fetch(`/api/bookings?${params}`)
      const data = await res.json()
      if (res.ok) {
        setBookings(data.bookings)
        setLastRefreshed(Date.now())
      }
    } catch {
      // Silent fail for background poll
    }
  }, [filters])

  // ── Poll every 30 seconds ───────────────────────────────────────────────
  useEffect(() => {
    pollTimer.current = setInterval(() => fetchBookings(), POLL_INTERVAL_MS)
    return () => clearInterval(pollTimer.current)
  }, [fetchBookings])

  // ── Re-fetch whenever filters change ────────────────────────────────────
  async function handleFilterChange(newFilters) {
    setFilters(newFilters)
    setLoading(true)
    await fetchBookings(newFilters)
    setLoading(false)
  }

  // ── Slide-over open / close ─────────────────────────────────────────────
  async function openSlideOver(booking) {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
    setSelected(booking)
    setSlideClosing(false)
    setSlideOpen(true)

    // Fetch customer booking count for the CustomerCard
    try {
      const res = await fetch(`/api/customers/${booking.customer.id}`)
      const data = await res.json()
      if (res.ok) setBookingCount(data.bookingCount ?? 0)
    } catch {
      setBookingCount(0)
    }
  }

  function closeSlideOver() {
    if (slideClosing) return
    setSlideClosing(true)
    closeTimer.current = setTimeout(() => {
      setSlideOpen(false)
      setSlideClosing(false)
      setSelected(null)
    }, SLIDE_CLOSE_MS)
  }

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current) }, [])

  // ── Status update from slide-over ────────────────────────────────────────
  function handleStatusUpdate(updatedBooking) {
    setBookings((prev) => {
      const updatedCustomerId = updatedBooking.customer?.id

      return prev.map((booking) => {
        if (booking.id === updatedBooking.id) return updatedBooking
        if (updatedCustomerId && booking.customer?.id === updatedCustomerId) {
          return { ...booking, customer: updatedBooking.customer }
        }
        return booking
      })
    })
    setSelected(updatedBooking)
  }

  // ── Delete from slide-over ───────────────────────────────────────────────
  function handleDelete(deletedId) {
    setBookings((prev) => prev.filter((b) => b.id !== deletedId))
    closeSlideOver()
  }

  // ── Filtered bookings for list view ─────────────────────────────────────
  // (Calendar always shows the full fetched set scoped to the visible week)
  const displayedBookings = bookings

  return (
    <div className={styles.page}>
      <BookingsHeader
        view={view}
        onViewChange={setView}
        totalCount={bookings.length}
        lastRefreshed={lastRefreshed}
      />

      <BookingsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        staffList={staffList}
      />

      {loading && (
        <div className={styles.loadingBar}>
          <span className={styles.loadingSpinner} />
          Loading…
        </div>
      )}

      {!loading && view === 'calendar' && (
        <CalendarView
          bookings={displayedBookings}
          onBookingClick={openSlideOver}
        />
      )}

      {!loading && view === 'list' && (
        <ListView
          bookings={displayedBookings}
          onBookingClick={openSlideOver}
        />
      )}

      {slideOpen && selected && (
        <BookingSlideOver
          booking={selected}
          bookingCount={bookingCount}
          isClosing={slideClosing}
          onClose={closeSlideOver}
          onStatusUpdate={handleStatusUpdate}
          onDelete={handleDelete}
          canManage={canManage}
        />
      )}
    </div>
  )
}