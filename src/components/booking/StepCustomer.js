'use client'

import { useState } from 'react'
import { formatUtcTime } from '@/lib/time'
import PhoneCountrySelect from '@/components/shared/PhoneCountrySelect'
import {
  formatInternationalNumber,
  formatNationalNumber,
  getDefaultDialCode,
  getPhoneCountryOptions,
  getPhoneDigits,
  getPhonePlaceholder,
} from '@/lib/phone'
import styles from '@/styles/booking/steps.module.css'

export default function StepCustomer({ selections, onConfirm, onBack, loading, error }) {
  const [name, setName] = useState('')
  const [phoneCountry, setPhoneCountry] = useState(getDefaultDialCode())
  const [phoneNumber, setPhoneNumber] = useState('')
  const [note, setNote] = useState('')
  const phoneOptions = getPhoneCountryOptions(phoneCountry)
  const phoneDigits = getPhoneDigits(phoneNumber)
  const phonePlaceholder = getPhonePlaceholder(phoneCountry)

  function formatTime(iso) {
    return formatUtcTime(iso, '12')
  }

  function formatDate(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !phoneDigits) return
    onConfirm({
      name: name.trim(),
      phone: formatInternationalNumber(phoneCountry, phoneNumber),
      note: note.trim(),
    })
  }

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Your Details</h2>
        <p className={styles.stepSub}>Almost done — just your name and phone number.</p>
      </div>

      {/* Booking summary */}
      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Service</span>
          <span className={styles.summaryValue}>{selections.service?.name}</span>
        </div>
        {selections.staff && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Staff</span>
            <span className={styles.summaryValue}>{selections.staff.name}</span>
          </div>
        )}
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Date</span>
          <span className={styles.summaryValue}>{formatDate(selections.date)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Time</span>
          <span className={styles.summaryValue}>
            {formatTime(selections.slot?.starts_at)} — {formatTime(selections.slot?.ends_at)}
          </span>
        </div>
        {selections.service?.price_usd && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Price</span>
            <span className={styles.summaryValue}>${Number(selections.service.price_usd).toFixed(0)}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Full Name</label>
          <input
            type="text"
            className={styles.fieldInput}
            placeholder="Ahmad Khalil"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Phone Number</label>
          <div className={styles.phoneRow}>
            <PhoneCountrySelect
              value={phoneCountry}
              options={phoneOptions}
              onChange={(nextCode) => {
                setPhoneCountry(nextCode)
                setPhoneNumber(formatNationalNumber(nextCode, phoneNumber))
              }}
              className={styles.phoneCountry}
              variant="booking"
            />
            <input
              type="tel"
              className={`${styles.fieldInput} ${styles.phoneInput}`}
              placeholder={phonePlaceholder}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(formatNationalNumber(phoneCountry, e.target.value))}
              required
              autoComplete="tel-national"
            />
          </div>
          <span className={styles.fieldHint}>We'll send your reminder here.</span>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Note (optional)</label>
          <textarea
            className={styles.fieldTextarea}
            placeholder="e.g. fade on the sides, bring reference photo..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={styles.actions}>
          <button type="button" className={styles.btnSecondary} onClick={onBack}>
            Back
          </button>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={loading || !name.trim() || !phoneDigits}
          >
            {loading ? (
              <>
                <span className={styles.spinnerSmall} />
                Booking...
              </>
            ) : (
              <>
                Confirm Booking
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}