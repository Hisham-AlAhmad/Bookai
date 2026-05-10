import Link from 'next/link'
import styles from '@/styles/home/home.module.css'

export default function HomeNav() {
  return (
    <header className={styles.nav}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.navBrand}>
          <img
            src="/logos/logo-rectangle-light.png"
            alt="Bookai"
            className={styles.navLogo}
          />
        </Link>

        <nav className={styles.navLinks}>
          <Link href="/login" className={styles.navLinkGhost}>
            Sign in
          </Link>
          <Link href="/register" className={styles.navLinkPrimary}>
            Register your business
          </Link>
        </nav>
      </div>
    </header>
  )
}