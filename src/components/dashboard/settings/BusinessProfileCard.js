"use client"

import { useState } from 'react'
import styles from '@/styles/dashboard/settings.module.css'
import PhoneCountrySelect from '@/components/shared/PhoneCountrySelect'
import { BuildingIcon, GlobeIcon, WarnIcon } from './SettingsIcons'
import { CATEGORY_LABELS } from './SettingsConstants'
import {
  formatInternationalNumber,
  formatNationalNumber,
  getDefaultDialCode,
  getPhoneCountryOptions,
  getPhonePlaceholder,
  splitPhoneNumber,
} from '@/lib/phone'

export default function BusinessProfileCard({ form, slug, slugChanged, onUpdateField }) {
  const bioLength = form.bio?.length ?? 0
  const initialPhone = splitPhoneNumber(form.phone || '', getDefaultDialCode())
  const [phoneCountry, setPhoneCountry] = useState(initialPhone.dialCode)
  const [phoneNumber, setPhoneNumber] = useState(
    formatNationalNumber(initialPhone.dialCode, initialPhone.nationalNumber)
  )
  const phoneOptions = getPhoneCountryOptions(phoneCountry)
  const phonePlaceholder = getPhonePlaceholder(phoneCountry)

  function handlePhoneCountryChange(nextCode) {
    setPhoneCountry(nextCode)
    setPhoneNumber(formatNationalNumber(nextCode, phoneNumber))
    onUpdateField('phone', formatInternationalNumber(nextCode, phoneNumber))
  }

  function handlePhoneNumberChange(value) {
    const nextNumber = formatNationalNumber(phoneCountry, value)
    setPhoneNumber(nextNumber)
    onUpdateField('phone', formatInternationalNumber(phoneCountry, nextNumber))
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}><BuildingIcon /></div>
        <div className={styles.cardHeaderText}>
          <p className={styles.cardTitle}>Business Profile</p>
          <p className={styles.cardSubtitle}>Shown to customers on your public booking page</p>
        </div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.formGrid}>

          <div className={`${styles.field} ${styles.formGridFull}`}>
            <label className={styles.label}>Business Name</label>
            <input
              type="text"
              className={styles.input}
              value={form.name}
              onChange={(e) => onUpdateField('name', e.target.value)}
              placeholder="e.g. Tony's Barber Shop"
            />
            <div className={styles.slugPreview}>
              <GlobeIcon />
              <span className={styles.slugDomain}>bookai.app/</span>
              <span className={styles.slugValue}>{slug || '…'}</span>
            </div>
            {slugChanged && (
              <div className={styles.slugWarning}>
                <WarnIcon />
                Your public booking URL will change. Share the new link with your customers after saving.
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Category</label>
            <select
              className={`${styles.input} ${styles.select}`}
              value={form.category}
              onChange={(e) => onUpdateField('category', e.target.value)}
            >
              {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>City</label>
            <input
              type="text"
              className={styles.input}
              value={form.city}
              onChange={(e) => onUpdateField('city', e.target.value)}
              placeholder="e.g. Beirut"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Phone Number</label>
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
                className={`${styles.input} ${styles.phoneInput}`}
                value={phoneNumber}
                onChange={(e) => handlePhoneNumberChange(e.target.value)}
                placeholder={phonePlaceholder}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Address</label>
            <input
              type="text"
              className={styles.input}
              value={form.address}
              onChange={(e) => onUpdateField('address', e.target.value)}
              placeholder="e.g. Mar Mikhael, Beirut"
            />
          </div>

          <div className={`${styles.field} ${styles.formGridFull}`}>
            <div className={styles.fieldMeta}>
              <label className={styles.label}>Bio</label>
              <span className={`${styles.charCount} ${bioLength > 280 ? styles.charCountWarn : ''}`}>
                {bioLength} / 300
              </span>
            </div>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              value={form.bio}
              onChange={(e) => onUpdateField('bio', e.target.value)}
              placeholder="Tell customers what makes your business special…"
              maxLength={300}
            />
          </div>

        </div>
      </div>
    </div>
  )
}
