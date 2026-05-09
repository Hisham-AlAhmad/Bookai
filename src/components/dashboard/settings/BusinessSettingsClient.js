'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { genUploader } from 'uploadthing/client'
import styles from '@/styles/dashboard/settings.module.css'
import SettingsHeader from './SettingsHeader'
import SettingsToast from './SettingsToast'
import BrandAssetsCard from './BrandAssetsCard'
import BusinessProfileCard from './BusinessProfileCard'
import PlanCard from './PlanCard'
import BookingLinkCard from './BookingLinkCard'

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

const uploader = genUploader({ url: '/api/uploadthing', package: '@uploadthing/react' })

export default function BusinessSettingsClient({ business }) {
  const originalSlug = business.slug

  const [form, setForm] = useState({
    name: business.name ?? '',
    category: business.category ?? 'other',
    city: business.city ?? '',
    phone: business.phone ?? '',
    address: business.address ?? '',
    bio: business.bio ?? '',
  })

  const [coverUrl, setCoverUrl] = useState(business.cover_url ?? null)
  const [logoUrl, setLogoUrl] = useState(business.logo_url ?? null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(null)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null)
  const [pendingCoverFile, setPendingCoverFile] = useState(null)
  const [pendingLogoFile, setPendingLogoFile] = useState(null)
  const [slug, setSlug] = useState(business.slug)
  const [slugChanged, setSlugChanged] = useState(false)

  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState(null)

  const coverInputRef = useRef(null)
  const logoInputRef = useRef(null)

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl)
    }
  }, [coverPreviewUrl])

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl)
    }
  }, [logoPreviewUrl])

  const showToast = useCallback((type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const updateField = useCallback(
    (field, value) => {
      setForm((prev) => {
        const next = { ...prev, [field]: value }
        if (field === 'name') {
          const derived = deriveSlug(value)
          setSlug(derived)
          setSlugChanged(derived !== originalSlug)
        }
        return next
      })
    },
    [originalSlug]
  )

  const handleImageSelect = useCallback(
    (file, type) => {
      if (!file) return
      const previewUrl = URL.createObjectURL(file)

      if (type === 'cover') {
        setPendingCoverFile(file)
        setCoverPreviewUrl(previewUrl)
      } else {
        setPendingLogoFile(file)
        setLogoPreviewUrl(previewUrl)
      }
    },
    []
  )

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast('error', 'Business name is required')
      return
    }

    setSaving(true)
    try {
      let nextCoverUrl
      let nextLogoUrl

      if (pendingCoverFile) {
        setUploadingCover(true)
        try {
          const [upload] = await uploader.uploadFiles('imageUploader', { files: [pendingCoverFile] })
          nextCoverUrl = upload?.ufsUrl || upload?.url
          if (!nextCoverUrl) throw new Error('Cover upload failed')
        } finally {
          setUploadingCover(false)
        }
      }

      if (pendingLogoFile) {
        setUploadingLogo(true)
        try {
          const [upload] = await uploader.uploadFiles('imageUploader', { files: [pendingLogoFile] })
          nextLogoUrl = upload?.ufsUrl || upload?.url
          if (!nextLogoUrl) throw new Error('Logo upload failed')
        } finally {
          setUploadingLogo(false)
        }
      }

      const payload = { ...form }
      if (nextCoverUrl !== undefined) payload.cover_url = nextCoverUrl
      if (nextLogoUrl !== undefined) payload.logo_url = nextLogoUrl

      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to save')

      if (nextCoverUrl !== undefined) {
        setCoverUrl(nextCoverUrl)
        setPendingCoverFile(null)
        setCoverPreviewUrl(null)
      }

      if (nextLogoUrl !== undefined) {
        setLogoUrl(nextLogoUrl)
        setPendingLogoFile(null)
        setLogoPreviewUrl(null)
      }

      setSlug(data.business.slug)
      setSlugChanged(false)
      showToast('success', 'Settings saved successfully')
    } catch (err) {
      showToast('error', err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyLink = () => {
    const url = `https://bookai.app/${slug}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const isUploading = uploadingCover || uploadingLogo

  return (
    <div className={styles.page}>
      <SettingsHeader saving={saving} uploading={isUploading} onSave={handleSave} />
      <SettingsToast toast={toast} />

      <BrandAssetsCard
        coverUrl={coverPreviewUrl || coverUrl}
        logoUrl={logoPreviewUrl || logoUrl}
        uploadingCover={uploadingCover}
        uploadingLogo={uploadingLogo}
        coverInputRef={coverInputRef}
        logoInputRef={logoInputRef}
        onImageSelect={handleImageSelect}
        businessName={form.name}
      />

      <BusinessProfileCard
        form={form}
        slug={slug}
        slugChanged={slugChanged}
        onUpdateField={updateField}
      />

      <PlanCard currentPlan={business.plan} />

      <BookingLinkCard
        slug={slug}
        copied={copied}
        onCopy={handleCopyLink}
      />
    </div>
  )
}
