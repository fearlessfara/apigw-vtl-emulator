import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, Button } from './ui';

function SettingsModal({ show, onHide, settings, onSave }) {
  const handleSave = () => {
    const form = document.getElementById('settingsForm');
    const formData = new FormData(form);
    onSave({
      autoRenderDelay: parseInt(formData.get('autoRenderDelay')),
      fontSize: parseInt(formData.get('fontSize')),
      lineNumbers: formData.get('lineNumbers') === 'on',
      minimap: formData.get('minimap') === 'on',
      wordWrap: formData.get('wordWrap') === 'on'
    });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} title={
      <>
        <i className="bi bi-gear"></i>Settings
      </>
    }>
      <ModalBody>
        <form id="settingsForm">
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>
              Auto-render delay (ms)
            </label>
            <input
              type="number"
              name="autoRenderDelay"
              min="100"
              max="5000"
              defaultValue={settings.autoRenderDelay}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem'
              }}
            />
          </div>
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>
              Editor font size
            </label>
            <select
              name="fontSize"
              defaultValue={settings.fontSize}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem'
              }}
            >
              <option value="12">12px</option>
              <option value="14">14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
            </select>
          </div>
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
              <input
                type="checkbox"
                name="lineNumbers"
                defaultChecked={settings.lineNumbers}
              />
              <span>Show line numbers</span>
            </label>
          </div>
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
              <input
                type="checkbox"
                name="minimap"
                defaultChecked={settings.minimap}
              />
              <span>Show minimap</span>
            </label>
          </div>
          <div>
            <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
              <input
                type="checkbox"
                name="wordWrap"
                defaultChecked={settings.wordWrap}
              />
              <span>Word wrap</span>
            </label>
          </div>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline-secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>Save Settings</Button>
      </ModalFooter>
    </Modal>
  );
}

export default SettingsModal;

