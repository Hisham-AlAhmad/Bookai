'use client'

import { useMemo, useState } from 'react'
import PhoneCountrySelect from '@/components/shared/PhoneCountrySelect'
import {
  formatInternationalNumber,
  formatNationalNumber,
  getDefaultDialCode,
  getPhoneCountryOptions,
  getPhonePlaceholder,
  splitPhoneNumber,
} from '@/lib/phone'
import { CATEGORY_LABELS } from '@/components/register/RegisterConstants'
import styles from '@/styles/register.module.css'

function deriveSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export default function StepBusiness({ form, onChange, onNext, onBack }) {
  const [error, setError] = useState('')

  const initialPhone = splitPhoneNumber(form.phone || '', getDefaultDialCode())
  const [phoneCountry, setPhoneCountry] = useState(initialPhone.dialCode)
  const [phoneNumber, setPhoneNumber] = useState(
    formatNationalNumber(initialPhone.dialCode, initialPhone.nationalNumber)
  )
  const phoneOptions = getPhoneCountryOptions(phoneCountry)
  const phonePlaceholder = getPhonePlaceholder(phoneCountry)

  const slug = useMemo(() => deriveSlug(form.name || ''), [form.name])
  const bioLength = form.bio?.length ?? 0

  function set(field, value) {
    onChange((prev) => ({ ...prev, [field]: value }))
  }

  function handlePhoneCountryChange(nextCode) {
    setPhoneCountry(nextCode)
    const formatted = formatNationalNumber(nextCode, phoneNumber)
    setPhoneNumber(formatted)
    set('phone', formatInternationalNumber(nextCode, formatted))
  }

  function handlePhoneChange(value) {
    const formatted = formatNationalNumber(phoneCountry, value)
    setPhoneNumber(formatted)
    set('phone', formatInternationalNumber(phoneCountry, formatted))
  }

  function handleNext() {
    if (!form.name.trim()) {
      setError('Business name is required.')
      return
    }
    if (form.name.trim().length < 2) {
      setError('Business name must be at least 2 characters.')
      return
    }
    if (!form.category.trim()) {
      setError('Category is required.')
      return
    }
    if (!form.city.trim()) {
      setError('City is required.')
      return
    }
    if (!form.address.trim()) {
      setError('Address is required.')
      return
    }
    if (!phoneNumber.trim()) {
      setError('Phone number is required.')
      return
    }
    setError('')
    onNext()
  }

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Business Profile</h2>
        <p className={styles.stepSub}>This information will appear on your public booking page.</p>
      </div>

      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.formGridFull}`}>
          <label className={styles.fieldLabel}>Business Name *</label>
          <input
            type="text"
            className={styles.fieldInput}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Tony's Barber Shop"
            autoComplete="organization"
          />
          {slug && (
            <div className={styles.slugPreview}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className={styles.slugDomain}>bookai.app/</span>
              <span className={styles.slugValue}>{slug}</span>
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Category *</label>
          <select
            className={`${styles.fieldInput} ${styles.fieldSelect}`}
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
          >
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>City *</label>
          <input
            type="text"
            className={styles.fieldInput}
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
            placeholder="e.g. Beirut"
          />
        </div>

        <div className={`${styles.field} ${styles.formGridFull}`}>
          <label className={styles.fieldLabel}>Address *</label>
          <input
            type="text"
            className={styles.fieldInput}
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="e.g. Mar Mikhael, Beirut"
          />
        </div>

        <div className={`${styles.field} ${styles.formGridFull}`}>
          <label className={styles.fieldLabel}>Phone Number *</label>
          <div className={styles.phoneRow}>
            <PhoneCountrySelect
              value={phoneCountry}
              options={phoneOptions}
              onChange={handlePhoneCountryChange}
              className={styles.phoneCountry}
              variant="booking"
            />
            <input
              type="tel"
              className={`${styles.fieldInput} ${styles.phoneInput}`}
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder={phonePlaceholder}
              autoComplete="tel-national"
            />
          </div>
        </div>

        <div className={`${styles.field} ${styles.formGridFull}`}>
          <div className={styles.fieldMeta}>
            <label className={styles.fieldLabel}>Bio</label>
            <span className={`${styles.charCount} ${bioLength > 280 ? styles.charCountWarn : ''}`}>
              {bioLength} / 300
            </span>
          </div>
          <textarea
            className={`${styles.fieldInput} ${styles.fieldTextarea}`}
            value={form.bio}
            onChange={(e) => set('bio', e.target.value)}
            placeholder="Tell customers what makes your business special…"
            rows={3}
            maxLength={300}
          />
        </div>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      <div className={styles.actions}>
        <button className={styles.btnSecondary} onClick={onBack}>Back</button>
        <button className={styles.btnPrimary} onClick={handleNext}>
          Continue
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}