import styles from '@/styles/dashboard/hours.module.css'
import HoursInfoStrip from './HoursInfoStrip'
import HoursRow from './HoursRow'

const DAY_NAMES = [
    { full: 'Sunday', short: 'SUN' },
    { full: 'Monday', short: 'MON' },
    { full: 'Tuesday', short: 'TUE' },
    { full: 'Wednesday', short: 'WED' },
    { full: 'Thursday', short: 'THU' },
    { full: 'Friday', short: 'FRI' },
    { full: 'Saturday', short: 'SAT' },
]

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]


export default function HoursTable({ hours, onUpdateDay, onToggleDay }) {
    const hoursByDay = new Map(hours.map((row) => [row.day_of_week, row]))

    return (
        <div className={styles.card}>
            <div className={styles.tableHead}>
                <span>Day</span>
                <span>Opens at</span>
                <span>Closes at</span>
                <span className={styles.statusCol}>Open</span>
            </div>

            {WEEK_ORDER.map((dayIndex) => {
                const row = hoursByDay.get(dayIndex)
                if (!row) return null

                const day = DAY_NAMES[row.day_of_week] || { full: 'Day', short: 'DAY' }

                return (
                    <HoursRow
                        key={row.day_of_week}
                        row={row}
                        day={day}
                        onUpdateDay={onUpdateDay}
                        onToggleDay={onToggleDay}
                    />
                )
            })}

            <HoursInfoStrip />
        </div>
    )
}
