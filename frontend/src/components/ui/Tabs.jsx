import { Children, cloneElement } from 'react';
import * as RadixTabs from '@radix-ui/react-tabs';
import './Tabs.css';

export default function Tabs({ children, className = '', ...props }) {
  const tabs = Children.toArray(children).filter(Boolean);
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.props?.active));
  const activeValue = `tab-${activeIndex}`;

  return (
    <RadixTabs.Root value={activeValue}>
      <RadixTabs.List className={`custom-tabs ${className}`} {...props}>
        {tabs.map((tab, index) =>
          cloneElement(tab, {
            tabValue: `tab-${index}`,
            key: tab.key ?? `tab-${index}`
          })
        )}
      </RadixTabs.List>
    </RadixTabs.Root>
  );
}

export function Tab({ children, active, onClick, tabValue, ...props }) {
  return (
    <RadixTabs.Trigger
      value={tabValue}
      className={`custom-tab ${active ? 'active' : ''}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </RadixTabs.Trigger>
  );
}
