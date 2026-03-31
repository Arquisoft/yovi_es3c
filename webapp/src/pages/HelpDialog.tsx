import {useEffect, useRef} from 'react'
import HelpContent from './HelpContent'

interface HelpDialogProps {
    open: boolean
    onClose: () => void
}

const HelpDialog = ({open, onClose }: HelpDialogProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        if (open) dialog.showModal()
            else dialog.close()
    }, [open])

    // Cerrar al hacer click fuera del dialog.
    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === dialogRef.current) onClose()
    }

    return (
        <dialog
            ref={dialogRef}
            className='help-dialog'
            aria-modal="true"
            aria-label="Ayuda del juego"
            onClick={handleBackdropClick}
        >
            <div className="help-dialog-inner">
                <button className="help-dialog-close" onClick={onClose} aria-lael="Cerrar ayuda">
                    X
                </button>
                <HelpContent />
            </div>
        </dialog>
    )
}

export default HelpDialog