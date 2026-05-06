'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import styles from '@/styles/dashboard/sidebar.module.css'

const NAV_ITEMS = [
    {
        href: '/dashboard',
        label: 'Overview',
        exact: true,
        roles: ['owner', 'manager', 'staff'],
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
        ),
    },
    {
        href: '/dashboard/bookings',
        label: 'Bookings',
        roles: ['owner', 'manager', 'staff'],
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        href: '/dashboard/staff',
        label: 'Staff',
        roles: ['owner', 'manager'],
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="7" r="4" />
                <path d="M2 21v-2a7 7 0 0 1 14 0v2" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
    {
        href: '/dashboard/services',
        label: 'Services',
        roles: ['owner', 'manager'],
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
        ),
    },
    {
        href: '/dashboard/hours',
        label: 'Working Hours',
        roles: ['owner', 'manager'],
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        href: '/dashboard/analytics',
        label: 'Analytics',
        roles: ['owner'],
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 21h18M3 10h4v11H3zM10 6h4v15h-4zM17 3h4v18h-4z" />
            </svg>
        ),
    },
    {
        href: '/dashboard/settings',
        label: 'Settings',
        roles: ['owner'],
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                <path d="M12 2v2M12 20v2M2 12H4M20 12h2" />
            </svg>
        ),
    },
]

export default function Sidebar({ session }) {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const role = session?.user?.role

    const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role))

    function isActive(item) {
        if (item.exact) return pathname === item.href
        return pathname.startsWith(item.href)
    }

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile toggle button */}
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

                {/* Logo area */}
                <div className={styles.logoArea}>
                    <div className={styles.logoMark}>B</div>
                    {!collapsed && <span className={styles.logoText}>Bookai</span>}
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

                {/* Business badge */}
                {!collapsed && session?.user?.businessSlug && (
                    <div className={styles.businessBadge}>
                        <span className={styles.businessBadgeGlow} aria-hidden="true" />
                        <span className={styles.businessBadgeIcon} aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                <path d="M3 9l9-6 9 6" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5 10v9h14v-9" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9 19v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <div className={styles.businessBadgeInfo}>
                            <span className={styles.businessBadgeLabel}>Business</span>
                            <span className={styles.businessBadgeName}>
                                {session.user.businessSlug}
                            </span>
                        </div>
                    </div>
                )}

                {/* Navigation */}
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

                {/* User footer */}
                <div className={styles.userFooter}>
                    <div className={styles.userAvatar}>
                        {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    {!collapsed && (
                        <div className={styles.userInfo}>
                            <p className={styles.userName}>{session?.user?.name}</p>
                            <p className={styles.userRole}>{role}</p>
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