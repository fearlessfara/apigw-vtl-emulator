import { Button } from './ui';
import './ui/Layout.css';

function Header({ onThemeToggle, theme, onHelpClick, onSettingsClick }) {
  return (
    <div className="app-header">
      <div className="custom-container-fluid app-shell-width header-shell">
        <div className="header-row d-flex justify-content-between align-items-center">
          <h1 className="header-title d-flex align-items-center">
            <img 
              src="/favicon.ico" 
              alt="VTL Emulator" 
              className="header-icon"
            />
            <span>VTL Emulator</span>
          </h1>
          <div className="header-actions d-flex align-items-center">
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={onThemeToggle}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="header-icon-button"
            >
              <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon'}`}></i>
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={onHelpClick}
              title="Help"
              aria-label="Help"
              className="header-icon-button"
            >
              <i className="bi bi-question-circle"></i>
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={onSettingsClick}
              title="Settings"
              aria-label="Settings"
              className="header-icon-button"
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
