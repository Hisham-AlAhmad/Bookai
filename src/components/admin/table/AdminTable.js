'use client'

import { useEffect, useMemo, useState } from 'react'
import AdminTableRow from './AdminTableRow'
import styles from '@/styles/admin/table.module.css'

const PLAN_ORDER = { free: 0, starter: 1, pro: 2 }

const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Newest first' },
  { value: 'created_asc', label: 'Oldest first' },
  { value: 'bookings_desc', label: 'Most bookings' },
  { value: 'name_asc', label: 'Name A–Z' },
  { value: 'plan_desc', label: 'Plan (highest)' },
]

const PAGE_SIZE = 8

function sortBusinesses(list, key) {
  const copy = [...list]
  switch (key) {
    case 'created_asc':
      return copy.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    case 'bookings_desc':
      return copy.sort((a, b) => b.totalBookings - a.totalBookings)
    case 'name_asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    case 'plan_desc':
      return copy.sort((a, b) => (PLAN_ORDER[b.plan] ?? 0) - (PLAN_ORDER[a.plan] ?? 0))
    default: // created_desc
      return copy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }
}

export default function AdminTable({
  businesses,
  onToggleActive,
  onDelete,
  onRowClick,
  selectedId,
}) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('created_desc')
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const filteredList = businesses.filter((b) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q) ||
        (b.city ?? '').toLowerCase().includes(q)
      const matchesPlan = !planFilter || b.plan === planFilter
      const matchesStatus =
        !statusFilter ||
        (statusFilter === 'active' ? b.active : !b.active)
      return matchesSearch && matchesPlan && matchesStatus
    })

    return sortBusinesses(filteredList, sortKey)
  }, [businesses, planFilter, search, sortKey, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const startIndex = (page - 1) * PAGE_SIZE
  const endIndex = Math.min(startIndex + PAGE_SIZE, filtered.length)
  const pagedBusinesses = filtered.slice(startIndex, endIndex)

  useEffect(() => {
    setPage(1)
  }, [search, planFilter, statusFilter])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const hasFilters = search || planFilter || statusFilter
  const hasResults = filtered.length > 0
  const showingRange = hasResults
    ? `Showing ${startIndex + 1}-${endIndex} of ${filtered.length} businesses`
    : `0 of ${businesses.length} businesses`

  return (
    <div className={styles.section}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by name, slug, or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearSearch} onClick={() => setSearch('')} aria-label="Clear">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        <div className={styles.filters}>
          <select
            className={styles.filterSelect}
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="">All plans</option>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
          </select>

          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            className={styles.filterSelect}
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className={styles.resultsRow}>
        <span className={styles.resultsCount}>
          {showingRange}
        </span>
        {hasFilters && (
          <button
            className={styles.clearFilters}
            onClick={() => { setSearch(''); setPlanFilter(''); setStatusFilter('') }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <p>No businesses match your filters.</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Business</th>
                <th>Plan</th>
                <th>City</th>
                <th>Bookings</th>
                <th>Staff</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedBusinesses.map((b) => (
                <AdminTableRow
                  key={b.id}
                  business={b}
                  isSelected={b.id === selectedId}
                  onToggleActive={onToggleActive}
                  onDelete={onDelete}
                  onRowClick={onRowClick}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasResults && (
        <div className={styles.paginationWrap}>
          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              Prev
            </button>

            {renderPageButtons(page, totalPages).map((p) => (
              <button
                key={p}
                className={
                  p === page
                    ? `${styles.pageButton} ${styles.pageButtonActive}`
                    : styles.pageButton
                }
                onClick={() => setPage(p)}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            ))}

            <button
              className={styles.pageButton}
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
          <div className={styles.pageInfo}>
            Page {page} of {totalPages}
          </div>
        </div>
      )}
    </div>
  )

  function renderPageButtons(current, total) {
    const out = []
    const maxButtons = 5
    let start = Math.max(1, current - Math.floor(maxButtons / 2))
    let end = Math.min(total, start + maxButtons - 1)
    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1)
    }
    for (let i = start; i <= end; i += 1) out.push(i)
    return out
  }
}