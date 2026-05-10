'use client'

import styles from '@/styles/home/home.module.css'

const CATEGORIES = [
  { value: 'barbershop', label: 'Barbershop' },
  { value: 'salon', label: 'Salon' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'tutor', label: 'Tutor' },
  { value: 'mechanic', label: 'Mechanic' },
  { value: 'other', label: 'Other' },
]

export default function BusinessFilters({
  cities,
  selectedCategories,
  selectedCity,
  search,
  onToggleCategory,
  onCityChange,
  onSearchChange,
  onClear,
  hasActiveFilters,
}) {
  return (
    <div className={styles.filters}>
      {/* Search */}
      <div className={styles.searchWrap}>
        <svg
          className={styles.searchIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search businesses…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <button className={styles.searchClear} onClick={() => onSearchChange('')} aria-label="Clear search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <div className={styles.filterRow}>
        {/* Category chips */}
        <div className={styles.categoryChips}>
          {CATEGORIES.map((cat) => {
            const active = selectedCategories.includes(cat.value)
            return (
              <button
                key={cat.value}
                className={`${styles.categoryChip} ${active ? styles.categoryChipActive : ''}`}
                onClick={() => onToggleCategory(cat.value)}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* City filter */}
        {cities.length > 0 && (
          <div className={styles.citySelectWrap}>
            <svg
              className={styles.cityIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <select
              className={styles.citySelect}
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
            >
              <option value="">All cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        )}

        {hasActiveFilters && (
          <button className={styles.clearAllBtn} onClick={onClear}>
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}