import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SuperAdminPlaceholder from '@/components/admin/SuperAdminPlaceholder'

export const metadata = {
  title: 'Users — Super Admin',
}

export default async function SuperAdminUsersPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'superadmin') redirect('/login')

  return (
    <SuperAdminPlaceholder
      title="Users"
      subtitle="Manage platform staff and tenant roles."
      description={{
        title: 'User management is coming soon',
        body: 'We will surface staff roles, access controls, and audit history here for super admins.',
      }}
    />
  )
}
