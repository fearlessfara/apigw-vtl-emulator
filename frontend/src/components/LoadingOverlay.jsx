function LoadingOverlay({ show, message = 'Loading...' }) {
  if (!show) return null;

  return (
    <div className="modern-loading-overlay">
      <div className="modern-loading-content">
        <div className="loading-spinner" role="status" aria-live="polite">
          <span className="sr-only">Loading...</span>
        </div>
        <h5>Initializing VTL Engine</h5>
        <p>{message}</p>
        <div className="loading-progress" aria-hidden="true">
          <div className="loading-progress-bar"></div>
        </div>
      </div>
    </div>
  );
}

export default LoadingOverlay;
