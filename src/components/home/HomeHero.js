import styles from '@/styles/home/home.module.css'

export default function HomeHero({ totalCount }) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          {totalCount} businesses live on Bookai
        </div>
        <h1 className={styles.heroTitle}>
          Book the best<br />
          <span className={styles.heroTitleAccent}>near you.</span>
        </h1>
        <p className={styles.heroSub}>
          Discover top-rated barbershops, salons, clinics, tutors, and more.
          Book an appointment in seconds — no account needed.
        </p>
      </div>
      <div className={styles.heroGlow} aria-hidden="true" />
    </section>
  )
}