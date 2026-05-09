import styles from '@/styles/dashboard/settings.module.css'
import { CameraIcon, ImageIcon } from './SettingsIcons'

export default function BrandAssetsCard({
  coverUrl,
  logoUrl,
  uploadingCover,
  uploadingLogo,
  coverInputRef,
  logoInputRef,
  onImageSelect,
  businessName,
}) {
  const logoFallback = businessName?.[0]?.toUpperCase() || 'B'

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}><ImageIcon /></div>
        <div className={styles.cardHeaderText}>
          <p className={styles.cardTitle}>Brand Assets</p>
          <p className={styles.cardSubtitle}>Cover photo and logo shown on your public booking page</p>
        </div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.mediaSection}>

          <div
            className={styles.coverWrap}
            onClick={() => !uploadingCover && coverInputRef.current?.click()}
          >
            {coverUrl
              ? <img src={coverUrl} alt="Cover" className={styles.coverImg} />
              : <div className={styles.coverPlaceholder}><ImageIcon /></div>
            }
            <div className={styles.coverOverlay}>
              <CameraIcon />
              {uploadingCover ? 'Uploading...' : 'Change cover photo'}
            </div>
            {uploadingCover && (
              <div className={styles.uploadingBadge}>
                <span>Uploading...</span>
              </div>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className={styles.coverInput}
              onChange={(e) => onImageSelect(e.target.files?.[0], 'cover')}
            />
          </div>

          <div
            className={styles.logoWrap}
            onClick={() => !uploadingLogo && logoInputRef.current?.click()}
          >
            {logoUrl
              ? <img src={logoUrl} alt="Logo" className={styles.logoImg} />
              : <div className={styles.logoFallback}>{logoFallback}</div>
            }
            <div className={styles.logoOverlay}>
              <CameraIcon />
              {uploadingLogo && (
                <span className={styles.logoOverlayText}>Uploading...</span>
              )}
            </div>
            {uploadingLogo && (
              <div className={styles.uploadingBadge}>
                <span>Uploading...</span>
              </div>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className={styles.logoInput}
              onChange={(e) => onImageSelect(e.target.files?.[0], 'logo')}
            />
          </div>

        </div>
      </div>
    </div>
  )
}
