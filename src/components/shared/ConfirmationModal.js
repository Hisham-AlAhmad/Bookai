'use client'

import { useEffect, useId, useState } from 'react'
import styles from '@/styles/shared/confirmation-modal.module.css'

export default function ConfirmationModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  variant = 'warning',
  onConfirm,
  onCancel,
  loading = false,
  error = '',
  success = '',
  requireConfirmation = false,
  confirmationLabel = 'I understand the consequences of this action.',
}) {
  const [acknowledged, setAcknowledged] = useState(false)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    if (open) setAcknowledged(false)
  }, [open])

  if (!open) return null

  const isConfirmDisabled = loading || (requireConfirmation && !acknowledged)
  const isCancelDisabled = loading
  const variantClass = styles[variant] || styles.warning

  return (
    <>
      <div
        className={styles.overlay}
        onClick={isCancelDisabled ? undefined : onCancel}
      />
      <div
        className={`${styles.modal} ${variantClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className={styles.accent} />
        <div className={styles.header}>
          <div>
            <p className={styles.kicker}>Confirmation</p>
            <h2 id={titleId} className={styles.title}>{title}</h2>
            <p id={descId} className={styles.message}>{message}</p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onCancel}
            disabled={isCancelDisabled}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {requireConfirmation && (
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
            />
            <span>{confirmationLabel}</span>
          </label>
        )}

        {error && <div className={styles.errorBanner}>{error}</div>}
        {success && <div className={styles.successBanner}>{success}</div>}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={isCancelDisabled}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`${styles.confirmBtn} ${styles[`confirm${variant}`] || ''}`}
            onClick={onConfirm}
            disabled={isConfirmDisabled}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  )
}
