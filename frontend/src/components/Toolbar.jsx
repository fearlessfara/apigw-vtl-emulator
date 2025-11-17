import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from './ui';

function Toolbar({
  onRender,
  autoRender,
  onAutoRenderToggle,
  currentEngine,
  onEngineChange,
  onImport,
  onExport,
  onShare,
  debugMode,
  onDebugToggle,
  renderTime,
  templateSize,
  engineInfo
}) {
  return (
    <div className="modern-toolbar">
      <Button 
        variant="primary" 
        onClick={onRender}
      >
        <i className="bi bi-play-fill"></i>Render
      </Button>
      <Button 
        variant={autoRender ? "success" : "outline-success"}
        onClick={onAutoRenderToggle}
        className={autoRender ? "active" : ""}
      >
        <i className="bi bi-arrow-repeat"></i>{autoRender ? 'Auto ON' : 'Auto'}
      </Button>
      <div className="vr"></div>
      <div className="modern-engine-selector">
        <label htmlFor="engineSelect">Engine:</label>
        <select
          id="engineSelect"
          value={currentEngine}
          onChange={(e) => onEngineChange(e.target.value)}
        >
          <option value="cheerpj">CheerpJ (Java)</option>
          <option value="wasm">WebAssembly (GraalVM)</option>
          <option value="vela">Vela (JavaScript) - Experimental</option>
        </select>
      </div>
      <div className="vr"></div>
      <Dropdown>
        <DropdownToggle 
          variant="outline-secondary" 
          size="sm"
        >
          <i className="bi bi-list"></i>
        </DropdownToggle>
        <DropdownMenu align="end">
          <DropdownItem onClick={onImport}>
            <i className="bi bi-upload"></i>Import
          </DropdownItem>
          <DropdownItem onClick={onExport}>
            <i className="bi bi-download"></i>Export
          </DropdownItem>
          <DropdownItem onClick={onShare}>
            <i className="bi bi-share"></i>Share
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <div className="vr"></div>
      <Button 
        variant="outline-info" 
        onClick={onDebugToggle}
        className={debugMode ? "active" : ""}
      >
        <i className="bi bi-bug"></i>Debug
      </Button>
      <div className="modern-performance-stats">
        <span>Render: {renderTime}ms</span>
        <span>Size: {templateSize} chars</span>
        <span className="engine-info" dangerouslySetInnerHTML={{__html: engineInfo}}></span>
      </div>
    </div>
  );
}

export default Toolbar;

