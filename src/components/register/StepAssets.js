'use client'

import { useEffect, useRef, useState } from 'react'
import { genUploader } from 'uploadthing/client'
import styles from '@/styles/register.module.css'

const uploader = genUploader({ url: '/api/uploadthing', package: '@uploadthing/react' })

export default function StepAssets({ assets, onChange, businessName, onNext, onBack }) {
    const [uploadingCover, setUploadingCover] = useState(false)
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [error, setError] = useState('')

    const coverInputRef = useRef(null)
    const logoInputRef = useRef(null)

    const logoFallback = businessName?.[0]?.toUpperCase() || 'B'

    useEffect(() => {
        return () => {
            if (assets.coverPreview?.startsWith('blob:')) URL.revokeObjectURL(assets.coverPreview)
            if (assets.logoPreview?.startsWith('blob:')) URL.revokeObjectURL(assets.logoPreview)
        }
    }, [assets.coverPreview, assets.logoPreview])

    function handleFileSelect(file, type) {
        if (!file) return
        const preview = URL.createObjectURL(file)
        onChange((prev) => ({
            ...prev,
            [`${type}File`]: file,
            [`${type}Preview`]: preview,
        }))
    }

    async function handleUpload(type) {
        const file = assets[`${type}File`]
        if (!file) return null

        const setter = type === 'cover' ? setUploadingCover : setUploadingLogo
        setter(true)
        setError('')
        try {
            const [upload] = await uploader.uploadFiles('imageUploader', { files: [file] })
            const url = upload?.ufsUrl || upload?.url
            if (!url) throw new Error(`${type} upload failed`)
            onChange((prev) => ({ ...prev, [`${type}Url`]: url }))
            return url
        } catch {
            setError(`Failed to upload ${type} image. Please try again.`)
            return null
        } finally {
            setter(false)
        }
    }

    async function handleNext() {
        setError('')
        // Upload any pending files before proceeding
        if (assets.coverFile && !assets.coverUrl) {
            const url = await handleUpload('cover')
            if (!url) return
        }
        if (assets.logoFile && !assets.logoUrl) {
            const url = await handleUpload('logo')
            if (!url) return
        }
        onNext()
    }

    const isUploading = uploadingCover || uploadingLogo

    return (
        <div className={styles.step}>
            <div className={styles.stepHeader}>
                <h2 className={styles.stepTitle}>Brand Assets</h2>
                <p className={styles.stepSub}>Add your logo and cover photo. You can update these later in Settings.</p>
            </div>

            <div className={styles.assetsSection}>
                {/* Cover image */}
                <div className={styles.coverUploadWrap} onClick={() => !isUploading && coverInputRef.current?.click()}>
                    {assets.coverPreview ? (
                        <img src={assets.coverPreview} alt="Cover" className={styles.coverPreviewImg} />
                    ) : (
                        <div className={styles.coverPlaceholder}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <span>Click to upload cover photo</span>
                            <span className={styles.coverPlaceholderSub}>Recommended: 1200×400px</span>
                        </div>
                    )}
                    <div className={styles.coverOverlay}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                        </svg>
                        {uploadingCover ? 'Uploading...' : 'Change cover photo'}
                    </div>
                    <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        className={styles.hiddenInput}
                        onChange={(e) => handleFileSelect(e.target.files?.[0], 'cover')}
                    />
                </div>

                {/* Logo image */}
                <div className={styles.logoRow}>
                    <div className={styles.logoUploadWrap} onClick={() => !isUploading && logoInputRef.current?.click()}>
                        {assets.logoPreview ? (
                            <img src={assets.logoPreview} alt="Logo" className={styles.logoPreviewImg} />
                        ) : (
                            <div className={styles.logoFallback}>{logoFallback}</div>
                        )}
                        <div className={styles.logoOverlay}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                            </svg>
                        </div>
                        <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            className={styles.hiddenInput}
                            onChange={(e) => handleFileSelect(e.target.files?.[0], 'logo')}
                        />
                    </div>
                    <div className={styles.logoUploadInfo}>
                        <p className={styles.logoUploadLabel}>Business Logo</p>
                        <p className={styles.logoUploadHint}>Square image, min 200×200px. Shown on your booking page and dashboard.</p>
                    </div>
                </div>
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}

            <div className={styles.actions}>
                <button className={styles.btnSecondary} onClick={onBack} disabled={isUploading}>Back</button>
                <button className={styles.btnPrimary} onClick={handleNext} disabled={isUploading}>
                    {isUploading ? (
                        <>
                            <span className={styles.spinnerSmall} />
                            Uploading...
                        </>
                    ) : (
                        <>
                            Continue
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}