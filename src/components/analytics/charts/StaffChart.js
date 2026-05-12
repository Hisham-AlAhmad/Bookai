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

const STAFF_COLORS = [
  '#6e9ecf',
  '#8ab4df',
  '#4a7aab',
  '#a0c4ef',
  '#2a5a8b',
  '#c0d8ef',
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
 * StaffChart
 *
 * Bar chart showing bookings per staff member.
 *
 * @param {{ data: Array<{name:string, count:number}>, loading?: boolean }} props
 */
export default function StaffChart({ data, loading = false }) {
  const isEmpty = !loading && (!data || data.length === 0)

  return (
    <ChartCard
      title="Staff Performance"
      subtitle="Bookings handled per staff member"
      loading={loading}
      empty={isEmpty}
      height={260}
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data || []}
          margin={{ top: 8, right: 16, left: -12, bottom: 0 }}
          barSize={28}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#aaa', fontFamily: 'Arial' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            tick={{ fontSize: 11, fill: '#555', fontFamily: 'Arial' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (v.length > 11 ? v.slice(0, 11) + '…' : v)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(110,158,207,0.06)' }} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {(data || []).map((_, i) => (
              <Cell key={i} fill={STAFF_COLORS[i % STAFF_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}