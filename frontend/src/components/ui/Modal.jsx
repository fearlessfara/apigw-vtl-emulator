import { useEffect } from 'react';
import Button from './Button';
import './Modal.css';

export default function Modal({ show, onHide, title, children, size = 'md', ...props }) {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [show]);

  if (!show) return null;

  // Check if children contain ModalBody/ModalFooter components
  const childrenArray = Array.isArray(children) ? children : [children];
  const hasModalComponents = childrenArray.some(child => 
    child?.type === ModalBody || child?.type === ModalFooter
  );

  return (
    <div className="custom-modal-overlay" onClick={onHide}>
      <div 
        className={`custom-modal custom-modal-${size}`}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {title && (
          <div className="custom-modal-header">
            <h5 className="custom-modal-title">{title}</h5>
            <button 
              className="custom-modal-close" 
              onClick={onHide}
              aria-label="Close"
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        )}
        {hasModalComponents ? children : (
          <div className="custom-modal-body">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export function ModalHeader({ children, ...props }) {
  return <div className="custom-modal-header" {...props}>{children}</div>;
}

export function ModalTitle({ children, ...props }) {
  return <h5 className="custom-modal-title" {...props}>{children}</h5>;
}

export function ModalBody({ children, ...props }) {
  return <div className="custom-modal-body" {...props}>{children}</div>;
}

export function ModalFooter({ children, ...props }) {
  return <div className="custom-modal-footer" {...props}>{children}</div>;
}

