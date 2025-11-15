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
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: '1rem'}}>
      <div style={{flexShrink: 0}}>
        <div className="d-flex justify-content-between align-items-center">
          <h6 style={{margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)'}}>
            <i className="bi bi-terminal"></i>Output
          </h6>
          <div className="d-flex gap-1">
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
      <div className="modern-result-panel" id="result" style={{flex: 1, minHeight: 0}}>
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
          <button 
            onClick={onErrorDismiss}
            style={{background: 'transparent', border: 'none', color: 'inherit', float: 'right', cursor: 'pointer', padding: '0.25rem'}}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}
    </div>
  );
}

export default ResultPanel;

