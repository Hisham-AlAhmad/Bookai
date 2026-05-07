'use client'

import { useState, useCallback } from 'react'
import styles from '@/styles/dashboard/hours.module.css'
import HoursHeader from './HoursHeader'
import HoursToast from './HoursToast'
import HoursTable from './HoursTable'

export default function WorkingHoursClient({ initialHours }) {
    const [hours, setHours] = useState(initialHours)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState(null) // { type: 'success'|'error', message }

    const showToast = useCallback((type, message) => {
        setToast({ type, message })
        setTimeout(() => setToast(null), 3500)
    }, [])

    const updateDay = useCallback((dayIndex, field, value) => {
        setHours((prev) =>
            prev.map((row) =>
                row.day_of_week === dayIndex ? { ...row, [field]: value } : row
            )
        )
    }, [])

    const handleToggle = useCallback((dayIndex) => {
        setHours((prev) =>
            prev.map((row) =>
                row.day_of_week === dayIndex
                    ? { ...row, is_closed: !row.is_closed }
                    : row
            )
        )
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/hours', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hours }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to save')
            }

            showToast('success', 'Working hours saved successfully')
        } catch (err) {
            showToast('error', err.message || 'Something went wrong')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className={styles.page}>
            <HoursHeader saving={saving} onSave={handleSave} />
            <HoursToast toast={toast} />
            <HoursTable hours={hours} onUpdateDay={updateDay} onToggleDay={handleToggle} />
        </div>
    )
}
