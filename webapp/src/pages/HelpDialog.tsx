import {useEffect, useRef} from 'react'
import HelpContent from './HelpContent'
import '../pages-styles/HelpDialog.css'

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
    }, [open])

    // Cerrar al hacer click fuera del dialog.
    const handleClose = () => {
        const dialog = dialogRef.current;
        if (!dialog) return
        dialog.classList.add('closing')
        dialog.addEventListener('animationed', () => {
            dialog.classList.remove('closing')
            dialog.close()
            onClose()
        }, {once:true})
    }

    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === dialogRef.current) handleClose()
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
                <button className="help-dialog-close" onClick={handleClose} aria-lael="Cerrar ayuda">
                    X
                </button>
                <HelpContent />
            </div>
        </dialog>
    )
}

export default HelpDialog