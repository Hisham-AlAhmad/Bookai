import styles from '@/styles/dashboard/hours.module.css'
import { CheckIcon, ErrorIcon } from './HoursIcons'

export default function HoursToast({ toast }) {
    if (!toast) return null

    const isSuccess = toast.type === 'success'

    return (
        <div className={`${styles.toast} ${isSuccess ? styles.toastSuccess : styles.toastError}`}>
            {isSuccess ? <CheckIcon /> : <ErrorIcon />}
            {toast.message}
        </div>
    )
}
