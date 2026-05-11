'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import styles from '@/styles/dashboard/sidebar.module.css'

function formatRole(role) {
  if (!role) return ''
  if (role === 'superadmin') return 'Super Admin'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export default function AppSidebar({
  session,
  navItems,
  badge,
  logoFull = '/logos/logo-rectangle-dark.png',
  logoCompact = '/logos/logo-icon.png',
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const role = session?.user?.role

  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', collapsed)

    return () => {
      document.body.classList.remove('sidebar-collapsed')
    }
  }, [collapsed])

  const visibleItems = navItems.filter((item) => !item.roles || item.roles.includes(role))

  function isActive(item) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <>
      {mobileOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <button
        className={styles.mobileToggle}
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
        </svg>
      </button>

      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.logoArea}>
          <img
            src={collapsed ? logoCompact : logoFull}
            alt="Bookai"
            className={styles.logoImage}
          />
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {collapsed
                ? <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                : <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              }
            </svg>
          </button>
        </div>

        {!collapsed && badge && (
          <div className={styles.businessBadge}>
            <span className={styles.businessBadgeGlow} aria-hidden="true" />
            <span className={styles.businessBadgeIcon} aria-hidden="true">
              {badge.icon}
            </span>
            <div className={styles.businessBadgeInfo}>
              <span className={styles.businessBadgeLabel}>{badge.label}</span>
              <span className={styles.businessBadgeName}>{badge.value}</span>
            </div>
          </div>
        )}

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {visibleItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navItem} ${isActive(item) ? styles.navItemActive : ''}`}
                  title={collapsed ? item.label : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                  {isActive(item) && <span className={styles.activeIndicator} />}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.userFooter}>
          <div className={styles.userAvatar}>
            {session?.user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className={styles.userInfo}>
              <p className={styles.userName}>{session?.user?.name}</p>
              <p className={styles.userRole}>{formatRole(role)}</p>
            </div>
          )}
          <button
            className={styles.signOutBtn}
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Sign out"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
              <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  )
}
