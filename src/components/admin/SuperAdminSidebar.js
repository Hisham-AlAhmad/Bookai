'use client'

import AppSidebar from '@/components/shared/AppSidebar'

const NAV_ITEMS = [
  {
    href: '/super-admin',
    label: 'Dashboard',
    exact: true,
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
    href: '/super-admin/businesses',
    label: 'Businesses',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-6 9 6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v9h14v-9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 19v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/super-admin/users',
    label: 'Users',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="7" r="4" />
        <path d="M2 21v-2a7 7 0 0 1 14 0v2" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/super-admin/plans',
    label: 'Plans',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
      </svg>
    ),
  },
  {
    href: '/super-admin/analytics',
    label: 'Analytics',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 21h18" />
        <path d="M3 10h4v11H3z" />
        <path d="M10 6h4v15h-4z" />
        <path d="M17 3h4v18h-4z" />
      </svg>
    ),
  },
  {
    href: '/super-admin/settings',
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M4.93 4.93a10 10 0 0 0 0 14.14" />
        <path d="M12 2v2M12 20v2M2 12H4M20 12h2" />
      </svg>
    ),
  },
]

export default function SuperAdminSidebar({ session }) {
  const badge = {
    label: 'Super Admin',
    value: 'Platform',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M12 3l8 4v5c0 5-3.5 9.5-8 9.5S4 17 4 12V7l8-4z" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  }

  return (
    <AppSidebar
      session={session}
      navItems={NAV_ITEMS}
      badge={badge}
    />
  )
}
