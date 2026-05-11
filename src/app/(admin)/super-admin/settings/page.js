import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SuperAdminPlaceholder from '@/components/admin/SuperAdminPlaceholder'

export const metadata = {
  title: 'Settings — Super Admin',
}

export default async function SuperAdminSettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'superadmin') redirect('/login')

  return (
    <SuperAdminPlaceholder
      title="Settings"
      subtitle="Platform configuration and overrides."
      description={{
        title: 'Settings panel is being prepared',
        body: 'Global defaults, system toggles, and platform preferences will live here.',
      }}
    />
  )
}
