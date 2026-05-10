"use client"

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import BusinessCard from './BusinessCard'
import BusinessFilters from './BusinessFilters'
import styles from '@/styles/home/home.module.css'

export default function BusinessGrid({ businesses, cities, page = 1, totalPages = 1, limit = 12 }) {
    const [selectedCategories, setSelectedCategories] = useState([])
    const [selectedCity, setSelectedCity] = useState('')
    const [search, setSearch] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()

    const filtered = useMemo(() => {
        return businesses.filter((b) => {
            const matchCategory =
                selectedCategories.length === 0 || selectedCategories.includes(b.category)
            const matchCity = !selectedCity || b.city === selectedCity
            const matchSearch =
                !search ||
                b.name.toLowerCase().includes(search.toLowerCase()) ||
                (b.bio && b.bio.toLowerCase().includes(search.toLowerCase())) ||
                (b.city && b.city.toLowerCase().includes(search.toLowerCase()))

            return matchCategory && matchCity && matchSearch
        })
    }, [businesses, selectedCategories, selectedCity, search])

    function toggleCategory(cat) {
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        )
    }

    function clearFilters() {
        setSelectedCategories([])
        setSelectedCity('')
        setSearch('')
    }

    const hasActiveFilters =
        selectedCategories.length > 0 || selectedCity || search

    return (
        <section className={styles.gridSection}>
            <BusinessFilters
                cities={cities}
                selectedCategories={selectedCategories}
                selectedCity={selectedCity}
                search={search}
                onToggleCategory={toggleCategory}
                onCityChange={setSelectedCity}
                onSearchChange={setSearch}
                onClear={clearFilters}
                hasActiveFilters={hasActiveFilters}
            />

            {filtered.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                        </svg>
                    </div>
                    <h3 className={styles.emptyTitle}>No businesses found</h3>
                    <p className={styles.emptyText}>
                        Try adjusting your filters or search to find what you&apos;re looking for.
                    </p>
                    {hasActiveFilters && (
                        <button className={styles.emptyClearBtn} onClick={clearFilters}>
                            Clear all filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <p className={styles.resultsCount}>
                        {filtered.length} {filtered.length === 1 ? 'business' : 'businesses'} found
                        {hasActiveFilters && (
                            <button className={styles.inlineClearBtn} onClick={clearFilters}>
                                Clear filters
                            </button>
                        )}
                    </p>
                    <div className={styles.grid}>
                        {filtered.map((business) => (
                            <BusinessCard key={business.slug} business={business} />
                        ))}
                    </div>
                    {/* Pagination */}
                    <div className={styles.paginationWrap}>
                        <div className={styles.pagination}>
                            <button
                                className={styles.pageButton}
                                onClick={() => goToPage(Math.max(1, page - 1))}
                                disabled={page <= 1}
                            >
                                Prev
                            </button>

                            {renderPageButtons(page, totalPages).map((p) => (
                                <button
                                    key={p}
                                    className={p === page ? `${styles.pageButton} ${styles.pageButtonActive}` : styles.pageButton}
                                    onClick={() => goToPage(p)}
                                    aria-current={p === page ? 'page' : undefined}
                                >
                                    {p}
                                </button>
                            ))}

                            <button
                                className={styles.pageButton}
                                onClick={() => goToPage(Math.min(totalPages, page + 1))}
                                disabled={page >= totalPages}
                            >
                                Next
                            </button>
                        </div>
                        <div className={styles.pageInfo}>
                            Page {page} of {totalPages}
                        </div>
                    </div>
                </>
            )}
        </section>
    )

    function goToPage(p) {
        const params = new URLSearchParams(searchParams ? searchParams.toString() : '')
        if (p === 1) params.delete('page')
        else params.set('page', String(p))
        params.set('limit', String(limit))
        router.push(`${window.location.pathname}?${params.toString()}`)
    }

    function renderPageButtons(current, total) {
        const out = []
        const maxButtons = 5
        let start = Math.max(1, current - Math.floor(maxButtons / 2))
        let end = Math.min(total, start + maxButtons - 1)
        if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1)
        for (let i = start; i <= end; i++) out.push(i)
        return out
    }
}