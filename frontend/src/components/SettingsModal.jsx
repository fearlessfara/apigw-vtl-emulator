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
          <div className="settings-field">
            <label className="settings-label">
              Auto-render delay (ms)
            </label>
            <input
              type="number"
              name="autoRenderDelay"
              min="100"
              max="5000"
              defaultValue={settings.autoRenderDelay}
              className="form-control"
            />
          </div>
          <div className="settings-field">
            <label className="settings-label">
              Editor font size
            </label>
            <select
              name="fontSize"
              defaultValue={settings.fontSize}
              className="form-select"
            >
              <option value="12">12px</option>
              <option value="14">14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
            </select>
          </div>
          <div className="settings-field settings-toggle-group">
            <label className="settings-toggle">
              <input
                type="checkbox"
                name="lineNumbers"
                defaultChecked={settings.lineNumbers}
              />
              <span>Show line numbers</span>
            </label>
          </div>
          <div className="settings-field settings-toggle-group">
            <label className="settings-toggle">
              <input
                type="checkbox"
                name="minimap"
                defaultChecked={settings.minimap}
              />
              <span>Show minimap</span>
            </label>
          </div>
          <div className="settings-toggle-group">
            <label className="settings-toggle">
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
