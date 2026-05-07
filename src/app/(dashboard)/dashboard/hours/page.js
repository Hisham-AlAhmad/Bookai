import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import WorkingHoursClient from '@/components/dashboard/hours/WorkingHoursClient'

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

// Fetch working hours server-side, filling defaults for missing rows
async function getWorkingHours(businessId) {
    const rows = await prisma.workingHours.findMany({
        where: { business_id: businessId },
        orderBy: { day_of_week: 'asc' },
    })

    const rowMap = Object.fromEntries(rows.map((r) => [r.day_of_week, r]))

    return WEEK_ORDER.map((day) =>
        rowMap[day]
            ? {
                day_of_week: rowMap[day].day_of_week,
                open_at: rowMap[day].open_at,
                close_at: rowMap[day].close_at,
                is_closed: rowMap[day].is_closed,
            }
            : {
                day_of_week: day,
                open_at: '09:00',
                close_at: '18:00',
                is_closed: day === 0, // Sunday closed by default
            }
    )
}

export const metadata = {
    title: 'Working Hours — Bookai',
}

export default async function WorkingHoursPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const role = session.user.role
    if (!['owner', 'manager'].includes(role)) redirect('/dashboard')

    const initialHours = await getWorkingHours(session.user.businessId)

    return <WorkingHoursClient initialHours={initialHours} />
}