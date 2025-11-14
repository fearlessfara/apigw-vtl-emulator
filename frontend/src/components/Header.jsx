import { Button } from './ui';
import './ui/Layout.css';

function Header({ onThemeToggle, theme, onHelpClick, onSettingsClick }) {
  return (
    <div className="app-header">
      <div className="custom-container-fluid" style={{maxWidth: '1600px', padding: '0 1.5rem'}}>
        <div className="d-flex justify-content-between align-items-center">
          <h1 style={{margin: 0}} className="d-flex align-items-center">
            <i className="bi bi-code-square header-icon"></i>
            VTL Emulator
          </h1>
          <div className="d-flex gap-1 align-items-center">
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={onThemeToggle}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', padding: '0.375rem 0.5rem'}}
            >
              <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon'}`}></i>
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={onHelpClick}
              title="Help"
              style={{border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', padding: '0.375rem 0.5rem'}}
            >
              <i className="bi bi-question-circle"></i>
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={onSettingsClick}
              title="Settings"
              style={{border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', padding: '0.375rem 0.5rem'}}
            >
              <i className="bi bi-gear"></i>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;

