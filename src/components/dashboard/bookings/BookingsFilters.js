'use client'

import styles from '@/styles/dashboard/bookings.module.css'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No-show' },
]

export default function BookingsFilters({ filters, onFilterChange, staffList }) {
  function set(key, value) {
    onFilterChange({ ...filters, [key]: value })
  }

  function handleReset() {
    onFilterChange({ status: '', from: '', to: '', staffId: '' })
  }

  const hasActiveFilters = filters.status || filters.from || filters.to || filters.staffId

  return (
    <div className={styles.filtersBar}>
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>From</label>
        <input
          type="date"
          className={styles.filterInput}
          value={filters.from}
          onChange={(e) => set('from', e.target.value)}
        />
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>To</label>
        <input
          type="date"
          className={styles.filterInput}
          value={filters.to}
          onChange={(e) => set('to', e.target.value)}
        />
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Status</label>
        <select
          className={styles.filterSelect}
          value={filters.status}
          onChange={(e) => set('status', e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {staffList.length > 1 && (
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Staff</label>
          <select
            className={styles.filterSelect}
            value={filters.staffId}
            onChange={(e) => set('staffId', e.target.value)}
          >
            <option value="">All staff</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {hasActiveFilters && (
        <button className={styles.resetBtn} onClick={handleReset}>
          Clear filters
        </button>
      )}
    </div>
  )
}