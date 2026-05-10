import Image from 'next/image'
import Link from 'next/link'
import styles from '@/styles/home/business-card.module.css'

const CATEGORY_META = {
  barbershop: { label: 'Barbershop', color: '#c8a96e' },
  salon: { label: 'Salon', color: '#6e9ecf' },
  clinic: { label: 'Clinic', color: '#6ecf9e' },
  tutor: { label: 'Tutor', color: '#a96ec8' },
  mechanic: { label: 'Mechanic', color: '#cf9e6e' },
  other: { label: 'Business', color: '#888' },
}

export default function BusinessCard({ business }) {
  const meta = CATEGORY_META[business.category] || CATEGORY_META.other
  const fallbackLetter = business.name?.[0]?.toUpperCase() || 'B'
  const bioSnippet = business.bio
    ? business.bio.length > 90
      ? business.bio.slice(0, 90).trimEnd() + '…'
      : business.bio
    : null

  return (
    <Link href={`/${business.slug}`} className={styles.card}>
      <div className={styles.cardTop}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          {business.logo_url ? (
            <Image
              src={business.logo_url}
              alt={`${business.name} logo`}
              width={56}
              height={56}
              loading="lazy"
              className={styles.logoImg}
            />
          ) : (
            <div className={styles.logoFallback} style={{ '--accent': meta.color }}>
              {fallbackLetter}
            </div>
          )}
        </div>

        {/* Category badge */}
        <span
          className={styles.categoryBadge}
          style={{ '--cat-color': meta.color }}
        >
          {meta.label}
        </span>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.businessName}>{business.name}</h3>

        {business.city && (
          <div className={styles.cityRow}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <span>{business.city}</span>
          </div>
        )}

        {bioSnippet && (
          <p className={styles.bio}>{bioSnippet}</p>
        )}
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.bookCta}>
          Book now
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <div className={styles.cardGlow} style={{ '--accent': meta.color }} aria-hidden="true" />
    </Link>
  )
}