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

        let alreadyClosed = false
        const doClose = () => {
            if (alreadyClosed) return
            alreadyClosed = true
            dialog.classList.remove('closing')
            dialog.close()
            onClose()
        }

        dialog.addEventListener('animationend', doClose, { once:true})
        setTimeout(doClose, 300)
    }

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return

        const handleBackdropClick = (e: MouseEvent) => {
            if (e.target === dialog) handleClose()
        }

        dialog.addEventListener('click', handleBackdropClick)
        return () => dialog.removeEventListener('click', handleBackdropClick)
    }, [open, onClose])

    return (
        <dialog ref={dialogRef} className='help-dialog' aria-modal='true' aria-label='Ayuda del juego'>
            <div className="help-dialog-inner">
                <button className="help-dialog-close" onClick={handleClose} aria-label="Cerrar ayuda">
                    X
                </button>
                <HelpContent />
            </div>
        </dialog>
    )
}

export default HelpDialog