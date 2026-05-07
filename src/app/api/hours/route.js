import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] // day_of_week uses Sunday=0..Saturday=6; list order is Monday-first

// GET /api/hours
// Returns the 7 working_hours rows for the authenticated user's business.
// If a row doesn't exist yet it returns a sensible default (open 09:00–18:00).
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const businessId = session.user.businessId

    const rows = await prisma.workingHours.findMany({
        where: { business_id: businessId },
        orderBy: { day_of_week: 'asc' },
    })

    // Build a full 7-day map, filling in defaults for any missing days
    const rowMap = Object.fromEntries(rows.map((r) => [r.day_of_week, r]))

    const hours = WEEK_ORDER.map((day) =>
        rowMap[day]
            ? rowMap[day]
            : {
                id: null,
                business_id: businessId,
                day_of_week: day,
                open_at: '09:00',
                close_at: '18:00',
                is_closed: day === 0, // Sunday closed by default
            }
    )

    return NextResponse.json({ hours })
}

// PATCH /api/hours
// Body: { hours: [ { day_of_week, open_at, close_at, is_closed }, … ] }
// Upserts all 7 rows in parallel using the unique (business_id, day_of_week) constraint.
export async function PATCH(req) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const role = session.user.role
    if (!['owner', 'manager'].includes(role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const businessId = session.user.businessId

    let body
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { hours } = body

    if (!Array.isArray(hours) || hours.length !== 7) {
        return NextResponse.json(
            { error: 'Expected exactly 7 working-hour entries' },
            { status: 400 }
        )
    }

    // Validate each entry
    for (const entry of hours) {
        const { day_of_week, open_at, close_at, is_closed } = entry

        if (typeof day_of_week !== 'number' || day_of_week < 0 || day_of_week > 6) {
            return NextResponse.json(
                { error: `Invalid day_of_week: ${day_of_week}` },
                { status: 400 }
            )
        }

        if (!is_closed) {
            const timeRe = /^\d{2}:\d{2}$/
            if (!timeRe.test(open_at) || !timeRe.test(close_at)) {
                return NextResponse.json(
                    { error: `Invalid time format for day ${day_of_week}` },
                    { status: 400 }
                )
            }
        }
    }

    // Upsert all 7 rows in parallel
    const upserts = hours.map(({ day_of_week, open_at, close_at, is_closed }) =>
        prisma.workingHours.upsert({
            where: {
                business_id_day_of_week: {
                    business_id: businessId,
                    day_of_week,
                },
            },
            update: {
                open_at: is_closed ? '09:00' : open_at,
                close_at: is_closed ? '18:00' : close_at,
                is_closed,
            },
            create: {
                business_id: businessId,
                day_of_week,
                open_at: is_closed ? '09:00' : open_at,
                close_at: is_closed ? '18:00' : close_at,
                is_closed,
            },
        })
    )

    try {
        const updated = await Promise.all(upserts)
        return NextResponse.json({ hours: updated })
    } catch (err) {
        console.error('[PATCH /api/hours]', err)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
}