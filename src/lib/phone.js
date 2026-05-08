const PHONE_COUNTRIES = [
  { iso: 'LB', name: 'Lebanon', dialCode: '961', format: 'XX XXX XXX', example: '70 000 000' },
  { iso: 'AE', name: 'UAE', dialCode: '971', format: 'XX XXX XXXX', example: '50 123 4567' },
  { iso: 'SA', name: 'Saudi Arabia', dialCode: '966', format: 'XX XXX XXXX', example: '50 123 4567' },
  { iso: 'QA', name: 'Qatar', dialCode: '974', format: 'XXXX XXXX', example: '3312 3456' },
  { iso: 'KW', name: 'Kuwait', dialCode: '965', format: 'XXXX XXXX', example: '5123 4567' },
  { iso: 'JO', name: 'Jordan', dialCode: '962', format: 'XX XXX XXXX', example: '79 012 3456' },
  { iso: 'EG', name: 'Egypt', dialCode: '20', format: 'XXX XXX XXXX', example: '100 123 4567' },
  { iso: 'US', name: 'US/Canada', dialCode: '1', format: 'XXX XXX XXXX', example: '415 555 0123' },
]

const DEFAULT_DIAL_CODE = '961'

function normalizeDigits(value) {
  return String(value || '').replace(/\D/g, '')
}

function groupDigits(value, size) {
  const groups = []
  for (let i = 0; i < value.length; i += size) {
    groups.push(value.slice(i, i + size))
  }
  return groups
}

function getCountryByDialCode(dialCode) {
  return PHONE_COUNTRIES.find((country) => country.dialCode === dialCode)
}

function getFormatParts(format) {
  return format.split(' ').map((part) => part.length)
}

export function getDefaultDialCode() {
  return DEFAULT_DIAL_CODE
}

export function getPhoneDigits(value) {
  return normalizeDigits(value)
}

export function getPhoneCountryOptions(activeDialCode) {
  const options = [...PHONE_COUNTRIES]
  if (activeDialCode && !options.some((country) => country.dialCode === activeDialCode)) {
    options.unshift({
      iso: 'OTHER',
      name: 'Other',
      dialCode: activeDialCode,
      format: 'XXX XXX XXX',
      example: '',
    })
  }
  return options
}

export function getPhonePlaceholder(dialCode) {
  const country = getCountryByDialCode(dialCode)
  return country?.example || 'Phone number'
}

export function formatNationalNumber(dialCode, value) {
  const digits = normalizeDigits(value)
  if (!digits) return ''

  const country = getCountryByDialCode(dialCode)
  if (!country?.format) return groupDigits(digits, 3).join(' ')

  const parts = getFormatParts(country.format)
  const maxLength = parts.reduce((total, length) => total + length, 0)
  const core = digits.slice(0, maxLength)
  const groups = []

  let index = 0
  for (const length of parts) {
    const chunk = core.slice(index, index + length)
    if (chunk) groups.push(chunk)
    index += length
  }

  return groups.join(' ')
}

export function formatInternationalNumber(dialCode, value) {
  const digits = normalizeDigits(value)
  if (!digits) return ''

  const formattedNational = formatNationalNumber(dialCode, digits)
  if (!dialCode) return formattedNational

  return `+${dialCode} ${formattedNational}`.trim()
}

export function splitPhoneNumber(value, fallbackDialCode = DEFAULT_DIAL_CODE) {
  const digits = normalizeDigits(value)
  if (!digits) {
    return { dialCode: fallbackDialCode, nationalNumber: '' }
  }

  const sorted = [...PHONE_COUNTRIES].sort(
    (a, b) => b.dialCode.length - a.dialCode.length
  )
  const match = sorted.find((country) => digits.startsWith(country.dialCode))
  if (match) {
    return {
      dialCode: match.dialCode,
      nationalNumber: digits.slice(match.dialCode.length),
    }
  }

  if (digits.startsWith(fallbackDialCode)) {
    return {
      dialCode: fallbackDialCode,
      nationalNumber: digits.slice(fallbackDialCode.length),
    }
  }

  const dialGuessLength = Math.min(3, digits.length)
  return {
    dialCode: digits.slice(0, dialGuessLength),
    nationalNumber: digits.slice(dialGuessLength),
  }
}
