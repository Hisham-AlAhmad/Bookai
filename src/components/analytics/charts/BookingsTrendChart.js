'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import ChartCard from './ChartCard'
import { formatChartDate } from '@/lib/analytics/transforms'
import styles from '@/styles/analytics/chart-card.module.css'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      <p className={styles.tooltipValue}>{payload[0].value} bookings</p>
    </div>
  )
}

/**
 * BookingsTrendChart
 *
 * Line chart showing bookings per day over the last 30 days.
 *
 * @param {{ data: Array<{date:string, count:number}>, loading?: boolean }} props
 */
export default function BookingsTrendChart({ data, loading = false }) {
  const isEmpty = !loading && (!data || data.length === 0)

  const formatted = (data || []).map((d) => ({
    ...d,
    label: formatChartDate(d.date),
  }))

  // Only show every ~5th tick label to avoid clutter
  const tickFormatter = (value, index) => (index % 5 === 0 ? value : '')

  return (
    <ChartCard
      title="Bookings Trend"
      subtitle="Last 30 days"
      loading={loading}
      empty={isEmpty}
      height={260}
    >
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={formatted} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" vertical={false} />
          <XAxis
            dataKey="label"
            tickFormatter={tickFormatter}
            tick={{ fontSize: 11, fill: '#aaa', fontFamily: 'Arial' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#aaa', fontFamily: 'Arial' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#c8a96e"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#c8a96e', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}