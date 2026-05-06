'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from '@/styles/dashboard/header.module.css'

const PAGE_META = [
  {
    match: '/dashboard',
    exact: true,
    title: 'Overview',
  },
  {
    match: '/dashboard/bookings',
    title: 'Bookings',
  },
  {
    match: '/dashboard/staff',
    title: 'Staff',
  },
  {
    match: '/dashboard/services',
    title: 'Services',
  },
  {
    match: '/dashboard/hours',
    title: 'Working Hours',
  },
  {
    match: '/dashboard/analytics',
    title: 'Analytics',
  },
  {
    match: '/dashboard/settings',
    title: 'Settings',
  },
]

const ACTIONS = [
  {
    match: '/dashboard/bookings',
    href: '/dashboard/services',
    label: 'Manage services',
  },
  {
    match: '/dashboard/services',
    href: '/dashboard/staff',
    label: 'Manage staff',
  },
  {
    match: '/dashboard/staff',
    href: '/dashboard/bookings',
    label: 'Manage bookings',
  },
]

const DEFAULT_META = {
  title: 'Dashboard',
}

const DEFAULT_ACTION = {
  href: '/dashboard/bookings',
  label: 'Manage bookings',
}

function findMatch(pathname, entries, fallback) {
  const exactMatch = entries.find((entry) => entry.exact && pathname === entry.match)
  if (exactMatch) return exactMatch

  let bestMatch = null
  entries.forEach((entry) => {
    if (entry.exact) return
    if (!pathname.startsWith(entry.match)) return
    if (!bestMatch || entry.match.length > bestMatch.match.length) {
      bestMatch = entry
    }
  })

  return bestMatch || fallback
}

function formatRole(role) {
  if (!role) return ''
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export default function Header({ user }) {
  const pathname = usePathname()
  const meta = findMatch(pathname, PAGE_META, DEFAULT_META)
  const action = findMatch(pathname, ACTIONS, DEFAULT_ACTION)
  const role = formatRole(user?.role)
  const businessSlug = user?.businessSlug

  return (
    <header className={styles.headerBar}>
      <div className={styles.headerInner}>
        <div className={styles.left}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{meta.title}</h1>
            {role && <span className={styles.roleBadge}>{role}</span>}
          </div>
        </div>

        <div className={styles.right}>
          {businessSlug && (
            <Link
              className={styles.ghostButton}
              href={`/${businessSlug}`}
              target="_blank"
              rel="noreferrer"
            >
              Public page
            </Link>
          )}
          {action && (
            <Link className={styles.primaryButton} href={action.href}>
              {action.label}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
