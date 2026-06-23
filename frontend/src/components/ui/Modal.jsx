import { useEffect } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
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
    <RadixDialog.Root open={show} onOpenChange={(open) => !open && onHide?.()}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="custom-modal-overlay" />
        <RadixDialog.Content className={`custom-modal custom-modal-${size}`} {...props}>
          {title && (
            <div className="custom-modal-header">
              <RadixDialog.Title className="custom-modal-title">{title}</RadixDialog.Title>
              <RadixDialog.Close className="custom-modal-close" aria-label="Close">
                <i className="bi bi-x"></i>
              </RadixDialog.Close>
            </div>
          )}
          {hasModalComponents ? children : <div className="custom-modal-body">{children}</div>}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
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
