'use client'

import { useState } from 'react'
import styles from '@/styles/dashboard/service-modal.module.css'

export default function ServiceModal({ service, onClose, onSaved }) {
  const isEdit = Boolean(service)

  const [form, setForm] = useState({
    name: service?.name || '',
    description: service?.description || '',
    duration_mins: service?.duration_mins || 30,
    price_usd: service?.price_usd ? Number(service.price_usd) : '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('Service name is required.')
      return
    }
    if (!form.duration_mins || Number(form.duration_mins) < 1) {
      setError('Duration must be at least 1 minute.')
      return
    }

    setLoading(true)

    const url = isEdit ? `/api/services/${service.id}` : '/api/services'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        duration_mins: Number(form.duration_mins),
        price_usd: form.price_usd !== '' ? Number(form.price_usd) : null,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Something went wrong.')
      return
    }

    const saved = await res.json()
    onSaved(saved, isEdit)
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEdit ? 'Edit Service' : 'Add Service'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Service Name *</label>
            <input
              className={styles.input}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Haircut & Beard Trim"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Short description shown on the booking page..."
              rows={3}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Duration (minutes) *</label>
              <input
                className={styles.input}
                type="number"
                min="5"
                step="5"
                value={form.duration_mins}
                onChange={(e) => set('duration_mins', e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Price (USD)</label>
              <input
                className={styles.input}
                type="number"
                min="0"
                step="0.5"
                value={form.price_usd}
                onChange={(e) => set('price_usd', e.target.value)}
                placeholder="Leave blank if free"
              />
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}