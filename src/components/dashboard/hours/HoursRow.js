import styles from '@/styles/dashboard/hours.module.css'

export default function HoursRow({ row, day, onUpdateDay, onToggleDay }) {
    const { day_of_week, open_at, close_at, is_closed } = row

    return (
        <div className={`${styles.dayRow} ${is_closed ? styles.closedRow : ''}`}>
            <div className={styles.dayLabel}>
                <span className={styles.dayName}>{day.full}</span>
                <span className={styles.dayShort}>{day.short}</span>
                {is_closed && <span className={styles.closedBadge}>Closed</span>}
            </div>

            <div className={styles.timeGroup}>
                <span className={styles.timeLabel}>Opens at</span>
                <input
                    type="time"
                    className={styles.timeInput}
                    value={open_at}
                    disabled={is_closed}
                    onChange={(e) => onUpdateDay(day_of_week, 'open_at', e.target.value)}
                    aria-label={`${day.full} opening time`}
                />
            </div>

            <div className={styles.timeGroup}>
                <span className={styles.timeLabel}>Closes at</span>
                <input
                    type="time"
                    className={styles.timeInput}
                    value={close_at}
                    disabled={is_closed}
                    onChange={(e) => onUpdateDay(day_of_week, 'close_at', e.target.value)}
                    aria-label={`${day.full} closing time`}
                />
            </div>

            <div className={styles.statusCol}>
                <label className={styles.toggle} aria-label={`Toggle ${day.full} open/closed`}>
                    <input
                        type="checkbox"
                        checked={!is_closed}
                        onChange={() => onToggleDay(day_of_week)}
                    />
                    <span className={styles.toggleTrack} />
                </label>
            </div>
        </div>
    )
}
