function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) {
    return null;
  }

  return (
    <div className="toast-stack" role="status" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-item-${toast.tone}`}>
          <div className="toast-message">{toast.message}</div>
          <button
            className="toast-dismiss"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastStack;
