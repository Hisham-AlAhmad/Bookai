'use client'

import { useState } from 'react'
import styles from '@/styles/dashboard/staff-slideover.module.css'
import PhoneCountrySelect from '@/components/shared/PhoneCountrySelect'
import {
  formatInternationalNumber,
  formatNationalNumber,
  getPhoneCountryOptions,
  getPhonePlaceholder,
  splitPhoneNumber,
} from '@/lib/phone'

export default function StaffSlideOver({
  member,
  services,
  onClose,
  onSaved,
  isClosing = false,
  currentUserId,
  isOwner,
}) {
  const isEdit = Boolean(member)
  const isSelfOwner = isOwner && member?.id === currentUserId

  const initialPhone = splitPhoneNumber(member?.phone || '')
  const [phoneCountry, setPhoneCountry] = useState(initialPhone.dialCode)
  const [phoneNumber, setPhoneNumber] = useState(
    formatNationalNumber(initialPhone.dialCode, initialPhone.nationalNumber)
  )
  const phoneOptions = getPhoneCountryOptions(phoneCountry)
  const phonePlaceholder = getPhonePlaceholder(phoneCountry)

  const [form, setForm] = useState({
    name: member?.name || '',
    bio: member?.bio || '',
    role: member?.role || 'staff',
    can_login: member?.can_login || false,
    email: member?.email || '',
    password: '',
    service_ids: member?.services?.map((ss) => ss.service.id) || [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleService(id) {
    setForm((prev) => {
      const has = prev.service_ids.includes(id)
      return {
        ...prev,
        service_ids: has
          ? prev.service_ids.filter((s) => s !== id)
          : [...prev.service_ids, id],
      }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('Name is required.')
      return
    }
    if (form.can_login && !form.email.trim()) {
      setError('Email is required when login is enabled.')
      return
    }

    setLoading(true)

    const url = isEdit ? `/api/staff/${member.id}` : '/api/staff'
    const method = isEdit ? 'PATCH' : 'POST'

    const payload = {
      ...form,
      phone: formatInternationalNumber(phoneCountry, phoneNumber) || '',
    }
    if (!payload.password) delete payload.password

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
      <div
        className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ''}`}
        onClick={onClose}
      />
      <aside className={`${styles.panel} ${isClosing ? styles.panelClosing : ''}`}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>{isEdit ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Full Name *</label>
            <input
              className={styles.input}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Ahmad Khalil"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Phone</label>
            <div className={styles.phoneRow}>
              <PhoneCountrySelect
                value={phoneCountry}
                options={phoneOptions}
                onChange={(nextCode) => {
                  setPhoneCountry(nextCode)
                  setPhoneNumber(formatNationalNumber(nextCode, phoneNumber))
                }}
                className={styles.phoneCountry}
                variant="staff"
              />
              <input
                className={`${styles.input} ${styles.phoneInput}`}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatNationalNumber(phoneCountry, e.target.value))}
                placeholder={phonePlaceholder}
                type="tel"
                autoComplete="tel-national"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Role</label>
            <select
              className={styles.select}
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="owner">Owner</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Bio</label>
            <textarea
              className={styles.textarea}
              value={form.bio}
              onChange={(e) => set('bio', e.target.value)}
              placeholder="Short bio or specialty..."
              rows={3}
            />
          </div>

          {services.length > 0 && (
            <div className={styles.field}>
              <label className={styles.label}>Services</label>
              <p className={styles.hint}>Leave all unselected to assign all services.</p>
              <div className={styles.serviceGrid}>
                {services.map((svc) => {
                  const checked = form.service_ids.includes(svc.id)
                  return (
                    <label key={svc.id} className={`${styles.serviceCheck} ${checked ? styles.serviceCheckActive : ''}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleService(svc.id)}
                        hidden
                      />
                      {svc.name}
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          <div className={styles.divider} />

          <div className={styles.field}>
            <label className={styles.toggleLabel}>
              <span>Dashboard Login</span>
              <button
                type="button"
                className={`${styles.toggle} ${form.can_login ? styles.toggleOn : styles.toggleOff}`}
                onClick={() => {
                  if (!isSelfOwner) set('can_login', !form.can_login)
                }}
                disabled={isSelfOwner}
              >
                <span className={styles.toggleThumb} />
              </button>
            </label>
            <p className={styles.hint}>
              {isSelfOwner
                ? 'Owner accounts must keep dashboard access enabled.'
                : 'Allow this person to log into the dashboard.'}
            </p>
          </div>

          {form.can_login && (
            <>
              <div className={styles.field}>
                <label className={styles.label}>Email *</label>
                <input
                  className={styles.input}
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="staff@example.com"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{isEdit ? 'New Password' : 'Password *'}</label>
                <input
                  className={styles.input}
                  type="password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder={isEdit ? 'Leave blank to keep current' : 'Min 8 characters'}
                />
              </div>
            </>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </form>
      </aside>
    </>
  )
}