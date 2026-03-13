import { Children } from 'react';
import * as RadixAccordion from '@radix-ui/react-accordion';
import './Accordion.css';

export default function Accordion({ children, defaultActiveKey, ...props }) {
  return (
    <RadixAccordion.Root
      type="single"
      collapsible
      defaultValue={defaultActiveKey}
      className="custom-accordion"
      {...props}
    >
      {children}
    </RadixAccordion.Root>
  );
}

export function AccordionItem({ children, eventKey, ...props }) {
  const childrenArray = Children.toArray(children);
  const header = childrenArray.find(child => child.type === AccordionHeader);
  const body = childrenArray.find(child => child.type === AccordionBody);

  return (
    <RadixAccordion.Item className="custom-accordion-item" value={eventKey} {...props}>
      <RadixAccordion.Header className="custom-accordion-header-shell">
        <RadixAccordion.Trigger className="custom-accordion-header">
          <span>{header?.props?.children}</span>
          <i className="bi bi-chevron-right custom-accordion-chevron"></i>
        </RadixAccordion.Trigger>
      </RadixAccordion.Header>
      <RadixAccordion.Content className="custom-accordion-content">
        <div className="custom-accordion-body">{body?.props?.children}</div>
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  );
}

export function AccordionHeader({ children, ...props }) {
  return <div {...props}>{children}</div>;
}

export function AccordionBody({ children, ...props }) {
  return <div {...props}>{children}</div>;
}
