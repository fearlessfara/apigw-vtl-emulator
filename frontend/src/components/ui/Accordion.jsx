import { useState, Children, cloneElement } from 'react';
import './Accordion.css';

export default function Accordion({ children, defaultActiveKey, ...props }) {
  const [activeKey, setActiveKey] = useState(defaultActiveKey);

  return (
    <div className="custom-accordion" {...props}>
      {Children.map(children, (child, index) => {
        if (!child) return null;
        const key = child.props?.eventKey || index.toString();
        return cloneElement(child, {
          active: activeKey === key,
          onToggle: () => setActiveKey(activeKey === key ? null : key)
        });
      })}
    </div>
  );
}

export function AccordionItem({ children, eventKey, active, onToggle, ...props }) {
  const childrenArray = Children.toArray(children);
  const header = childrenArray.find(child => child.type === AccordionHeader);
  const body = childrenArray.find(child => child.type === AccordionBody);

  return (
    <div className="custom-accordion-item" {...props}>
      <div className="custom-accordion-header" onClick={onToggle}>
        <span>{header?.props?.children}</span>
        <i className={`bi bi-chevron-${active ? 'down' : 'right'}`}></i>
      </div>
      {active && body && (
        <div className="custom-accordion-body">
          {body.props?.children}
        </div>
      )}
    </div>
  );
}

export function AccordionHeader({ children, ...props }) {
  return <div {...props}>{children}</div>;
}

export function AccordionBody({ children, ...props }) {
  return <div {...props}>{children}</div>;
}

