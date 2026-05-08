const padTime = (value) => String(value).padStart(2, '0')

export function formatUtcTime(value, format = '12') {
    if (!value) return ''
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return ''

    const hours = date.getUTCHours()
    const minutes = date.getUTCMinutes()

    if (format === '12') {
        const period = hours >= 12 ? 'pm' : 'am'
        const displayHours = hours % 12 || 12
        return `${padTime(displayHours)}:${padTime(minutes)} ${period}`
    }

    return `${padTime(hours)}:${padTime(minutes)}`
}
