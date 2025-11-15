function LoadingOverlay({ show, message = 'Loading...' }) {
  if (!show) return null;

  return (
    <div className="modern-loading-overlay">
      <div className="modern-loading-content">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5>Initializing VTL Engine</h5>
        <p>{message}</p>
        <div className="loading-progress">
          <div className="progress" style={{height: '4px'}}>
            <div 
              className="progress-bar progress-bar-striped progress-bar-animated" 
              role="progressbar" 
              style={{width: '0%'}}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingOverlay;

