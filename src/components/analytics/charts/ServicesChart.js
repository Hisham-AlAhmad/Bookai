'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import ChartCard from './ChartCard'
import styles from '@/styles/analytics/chart-card.module.css'

const ACCENT_COLORS = [
  '#c8a96e',
  '#e8c98a',
  '#a07840',
  '#d4b87e',
  '#8a6530',
  '#f0d8a0',
]

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{payload[0].payload.name}</p>
      <p className={styles.tooltipValue}>{payload[0].value} bookings</p>
    </div>
  )
}

/**
 * ServicesChart
 *
 * Bar chart showing the most popular services by booking count.
 *
 * @param {{ data: Array<{name:string, count:number}>, loading?: boolean }} props
 */
export default function ServicesChart({ data, loading = false }) {
  const isEmpty = !loading && (!data || data.length === 0)

  return (
    <ChartCard
      title="Most Popular Services"
      subtitle="By total bookings"
      loading={loading}
      empty={isEmpty}
      height={260}
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data || []}
          margin={{ top: 8, right: 16, left: -12, bottom: 0 }}
          barSize={28}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#aaa', fontFamily: 'Arial' }}
            axisLine={false}
            tickLine={false}
            interval={0}
            tickFormatter={(v) => (v.length > 12 ? v.slice(0, 12) + '…' : v)}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#aaa', fontFamily: 'Arial' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200,169,110,0.06)' }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {(data || []).map((_, i) => (
              <Cell key={i} fill={ACCENT_COLORS[i % ACCENT_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}