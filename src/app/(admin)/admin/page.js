import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Super Admin — Bookai',
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.role !== 'superadmin') redirect('/login')

  redirect('/super-admin/businesses')
}