type FormSuccessModalProps = {
  open: boolean;
  title: string;
  message: string;
  detail?: string;
  onClose: () => void;
};

export function FormSuccessModal({ open, title, message, detail, onClose }: FormSuccessModalProps) {
  if (!open) return null;

  return (
    <div className="form-modal" role="dialog" aria-modal="true" aria-labelledby="form-modal-title">
      <div className="form-modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="form-modal__panel">
        <div className="form-modal__tick" aria-hidden="true">✓</div>
        <p className="eyebrow">Submission confirmed</p>
        <h2 id="form-modal-title">{title}</h2>
        <p>{message}</p>
        {detail ? <p className="form-modal__detail">{detail}</p> : null}
        <button type="button" className="button button--accent" onClick={onClose}>
          Close <span aria-hidden="true">↗</span>
        </button>
      </div>
    </div>
  );
}
