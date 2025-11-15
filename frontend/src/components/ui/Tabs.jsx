import './Tabs.css';

export default function Tabs({ children, className = '', ...props }) {
  return (
    <div className={`custom-tabs ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Tab({ children, active, onClick, ...props }) {
  return (
    <button
      className={`custom-tab ${active ? 'active' : ''}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

