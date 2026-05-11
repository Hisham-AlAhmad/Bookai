'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import BusinessProfileCard from '@/components/dashboard/settings/BusinessProfileCard'
import BusinessEditHeader from './BusinessEditHeader'
import BusinessEditToast from './BusinessEditToast'
import BusinessPlanStatusCard from './BusinessPlanStatusCard'
import settingsStyles from '@/styles/dashboard/settings.module.css'
import styles from '@/styles/admin/business-edit.module.css'

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

function normalizeValue(value) {
  return value ?? ''
}

export default function BusinessEditClient({ business }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: business.name ?? '',
    category: business.category ?? 'other',
    city: normalizeValue(business.city),
    phone: normalizeValue(business.phone),
    address: normalizeValue(business.address),
    bio: normalizeValue(business.bio),
    plan: business.plan ?? 'free',
    active: Boolean(business.active),
  })

  const [snapshot, setSnapshot] = useState({
    name: business.name ?? '',
    category: business.category ?? 'other',
    city: normalizeValue(business.city),
    phone: normalizeValue(business.phone),
    address: normalizeValue(business.address),
    bio: normalizeValue(business.bio),
    plan: business.plan ?? 'free',
    active: Boolean(business.active),
    slug: business.slug,
  })

  const [slug, setSlug] = useState(business.slug)
  const [slugChanged, setSlugChanged] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [error, setError] = useState('')
  const [suspendConfirmed, setSuspendConfirmed] = useState(false)

  const showSuspendWarning = snapshot.active && !form.active
  const needsSuspendConfirm = showSuspendWarning && !suspendConfirmed

  const hasChanges = useMemo(() => {
    return (
      form.name !== snapshot.name ||
      form.category !== snapshot.category ||
      form.city !== snapshot.city ||
      form.phone !== snapshot.phone ||
      form.address !== snapshot.address ||
      form.bio !== snapshot.bio ||
      form.plan !== snapshot.plan ||
      form.active !== snapshot.active
    )
  }, [form, snapshot])

  const showToast = useCallback((type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const updateField = useCallback(
    (field, value) => {
      if (error) setError('')
      setForm((prev) => {
        const next = { ...prev, [field]: value }
        if (field === 'name') {
          const derived = deriveSlug(value)
          setSlug(derived)
          setSlugChanged(derived !== snapshot.slug)
        }
        return next
      })
    },
    [error, snapshot.slug]
  )

  const handlePlanChange = (value) => {
    updateField('plan', value)
  }

  const handleStatusChange = (nextActive) => {
    updateField('active', nextActive)
    if (nextActive) setSuspendConfirmed(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!hasChanges || saving) return

    if (!form.name.trim() || form.name.trim().length < 2) {
      setError('Business name must be at least 2 characters.')
      return
    }

    if (needsSuspendConfirm) {
      setError('Please confirm the suspension before saving.')
      return
    }

    setSaving(true)

    try {
      const res = await fetch(`/api/admin/businesses/${business.id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          city: form.city,
          phone: form.phone,
          address: form.address,
          bio: form.bio,
          plan: form.plan,
          active: form.active,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to save changes.')

      const updated = data.business
      const nextSnapshot = {
        name: updated.name ?? '',
        category: updated.category ?? 'other',
        city: normalizeValue(updated.city),
        phone: normalizeValue(updated.phone),
        address: normalizeValue(updated.address),
        bio: normalizeValue(updated.bio),
        plan: updated.plan ?? 'free',
        active: Boolean(updated.active),
        slug: updated.slug,
      }

      setSnapshot(nextSnapshot)
      setForm((prev) => ({
        ...prev,
        name: nextSnapshot.name,
        category: nextSnapshot.category,
        city: nextSnapshot.city,
        phone: nextSnapshot.phone,
        address: nextSnapshot.address,
        bio: nextSnapshot.bio,
        plan: nextSnapshot.plan,
        active: nextSnapshot.active,
      }))
      setSlug(updated.slug)
      setSlugChanged(false)
      setSuspendConfirmed(false)
      showToast('success', 'Business updated successfully.')
      setTimeout(() => {
        router.push(`/${updated.slug || business.slug}`)
      }, 700)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
      showToast('error', err.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className={settingsStyles.page} onSubmit={handleSubmit}>
      <BusinessEditHeader
        businessName={form.name}
        saving={saving}
        disabled={!hasChanges || needsSuspendConfirm}
      />

      <BusinessEditToast toast={toast} />

      <div className={styles.metaRow}>
        <span className={styles.metaPill}>
          Business ID: <strong>{business.id.slice(0, 8).toUpperCase()}</strong>
        </span>
        <span className={styles.metaPill}>
          Created: <strong>{new Date(business.created_at).toLocaleDateString('en-GB')}</strong>
        </span>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          {error}
        </div>
      )}

      <BusinessProfileCard
        form={form}
        slug={slug}
        slugChanged={slugChanged}
        onUpdateField={updateField}
      />

      <BusinessPlanStatusCard
        plan={form.plan}
        active={form.active}
        onPlanChange={handlePlanChange}
        onStatusChange={handleStatusChange}
        showSuspendWarning={showSuspendWarning}
        suspendConfirmed={suspendConfirmed}
        onSuspendConfirm={setSuspendConfirmed}
      />
    </form>
  )
}
