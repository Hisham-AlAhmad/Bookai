'use client'

import { useEffect, useId, useRef, useState } from 'react'
import styles from '@/styles/shared/phone-country-select.module.css'

export default function PhoneCountrySelect({
  value,
  options,
  onChange,
  className = '',
  variant = 'staff',
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const listId = useId()

  useEffect(() => {
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  function handleToggle() {
    setOpen((prev) => !prev)
  }

  function handleSelect(nextValue) {
    onChange(nextValue)
    setOpen(false)
  }

  const current = options.find((country) => country.dialCode === value)
  const displayValue = current?.dialCode || value

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${className}`}
      data-variant={variant}
      data-open={open}
    >
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
      >
        <span className={styles.triggerValue}>+{displayValue}</span>
        <svg
          className={styles.triggerIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className={styles.list} role="listbox" id={listId}>
          {options.map((country) => {
            const selected = country.dialCode === value
            return (
              <button
                key={country.dialCode}
                type="button"
                className={`${styles.option} ${selected ? styles.optionActive : ''}`}
                onClick={() => handleSelect(country.dialCode)}
                role="option"
                aria-selected={selected}
              >
                <span className={styles.optionCode}>+{country.dialCode}</span>
                <span className={styles.optionName}>{country.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
