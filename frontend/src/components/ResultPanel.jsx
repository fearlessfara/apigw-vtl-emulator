import { Button } from './ui';
import './ui/Layout.css';

function ResultPanel({ 
  result, 
  onCopy, 
  onDownload, 
  onClear, 
  debugMode, 
  debugSteps, 
  error,
  onErrorDismiss 
}) {
  return (
    <div className="result-panel-shell">
      <div className="panel-header panel-header-tight">
        <div className="d-flex justify-content-between align-items-center panel-header-row">
          <h6 className="panel-title">
            <i className="bi bi-terminal"></i>Output
          </h6>
          <div className="panel-actions d-flex gap-1">
            <Button variant="outline-secondary" size="sm" onClick={onCopy} title="Copy">
              <i className="bi bi-clipboard"></i>
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={onDownload} title="Download">
              <i className="bi bi-download"></i>
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={onClear} title="Clear">
              <i className="bi bi-trash"></i>
            </Button>
          </div>
        </div>
      </div>
      <div className="modern-result-panel" id="result">
        {result}
      </div>
      
      {debugMode && (
        <div className="modern-debug-panel">
          <h6><i className="bi bi-bug me-1"></i>Debug Information</h6>
          <div>
            {debugSteps.map((step, idx) => (
              <div key={idx} className="modern-debug-step">
                [{step.timestamp.substring(11, 19)}] {step.message}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {error && (
        <div className="modern-error-panel">
          <strong><i className="bi bi-exclamation-triangle"></i>Error:</strong> {error}
          <button onClick={onErrorDismiss} className="error-dismiss-button">
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}
    </div>
  );
}

export default ResultPanel;
