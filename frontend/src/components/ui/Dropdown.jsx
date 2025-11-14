import { useState, useRef, useEffect, createContext, useContext } from 'react';
import Button from './Button';
import './Dropdown.css';

const DropdownContext = createContext();

export default function Dropdown({ children, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);

  return (
    <DropdownContext.Provider value={{ isOpen, toggle, close }}>
      <div className="custom-dropdown-wrapper" ref={dropdownRef} {...props}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownToggle({ children, as: Component = Button, ...props }) {
  const { isOpen, toggle } = useContext(DropdownContext);

  return (
    <Component onClick={toggle} {...props}>
      {children}
    </Component>
  );
}

export function DropdownMenu({ children, align = 'end', ...props }) {
  const { isOpen, close } = useContext(DropdownContext);

  if (!isOpen) return null;

  return (
    <div className="custom-dropdown-menu-wrapper">
      <div 
        className={`custom-dropdown-menu custom-dropdown-menu-${align}`} 
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export function DropdownItem({ children, onClick, ...props }) {
  const { close } = useContext(DropdownContext);

  return (
    <div 
      className="custom-dropdown-item" 
      onClick={(e) => {
        onClick?.(e);
        close();
      }}
      {...props}
    >
      {children}
    </div>
  );
}

