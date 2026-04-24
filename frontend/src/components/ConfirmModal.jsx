import '../styles/ConfirmModal.css'

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="confirm-modal">
        <div className="modal-icon">!</div>

        <h2>{title}</h2>
        <p>{message}</p>

        <div className="modal-actions">
          <button type="button" className="modal-btn cancel-btn" onClick={onCancel}>
            {cancelText}
          </button>

          <button type="button" className="modal-btn confirm-btn" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}