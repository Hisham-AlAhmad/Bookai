/**
 * lib/analytics/transforms/index.js
 *
 * Pure data-transformation utilities.
 * No framework dependencies — reusable for any context.
 */

/**
 * Fills in missing dates in a bookings-per-day array
 * so charts render a continuous line rather than sparse dots.
 *
 * @param {Array<{date: string, count: number}>} data
 * @param {number} [days=30]
 * @returns {Array<{date: string, count: number}>}
 */
export function fillMissingDays(data, days = 30) {
  const map = Object.fromEntries(data.map((d) => [d.date, d.count]))
  const result = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const iso = d.toLocaleDateString('en-CA') // YYYY-MM-DD
    result.push({ date: iso, count: map[iso] ?? 0 })
  }

  return result
}

/**
 * Formats a date string for chart display.
 * "2026-05-11" → "May 11"
 *
 * @param {string} dateStr
 * @returns {string}
 */
export function formatChartDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Formats a currency value for display.
 *
 * @param {number} value
 * @returns {string}
 */
export function formatRevenue(value) {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`
  }
  return `$${value.toFixed(0)}`
}

/**
 * Formats a percentage value safely.
 *
 * @param {number} value
 * @param {number} [decimals=1]
 * @returns {string}
 */
export function formatPercent(value, decimals = 1) {
  if (!isFinite(value) || isNaN(value)) return '0%'
  return `${value.toFixed(decimals)}%`
}

/**
 * Calculates month-over-month trend as a percentage change.
 * Returns null when previous month is 0 (cannot divide).
 *
 * @param {number} current
 * @param {number} previous
 * @returns {{ direction: 'up'|'down'|'flat', percent: number } | null}
 */
export function calcTrend(current, previous) {
  if (previous === 0) return null
  const pct = ((current - previous) / previous) * 100
  const direction = pct > 0.5 ? 'up' : pct < -0.5 ? 'down' : 'flat'
  return { direction, percent: Math.abs(pct) }
}

/**
 * Sorts an array of { name, count } descending by count.
 *
 * @param {Array<{name: string, count: number}>} data
 * @returns {Array<{name: string, count: number}>}
 */
export function sortDesc(data) {
  return [...data].sort((a, b) => b.count - a.count)
}