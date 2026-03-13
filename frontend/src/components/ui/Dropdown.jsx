import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import Button from './Button';
import './Dropdown.css';

export default function Dropdown({ children, ...props }) {
  return (
    <RadixDropdownMenu.Root modal={false}>
      <div className="custom-dropdown-wrapper" {...props}>
        {children}
      </div>
    </RadixDropdownMenu.Root>
  );
}

export function DropdownToggle({ children, as: Component = Button, ...props }) {
  return (
    <RadixDropdownMenu.Trigger asChild>
      <Component {...props}>{children}</Component>
    </RadixDropdownMenu.Trigger>
  );
}

export function DropdownMenu({ children, align = 'end', ...props }) {
  const alignValue = align === 'start' ? 'start' : 'end';

  return (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        className={`custom-dropdown-menu custom-dropdown-menu-${alignValue}`}
        align={alignValue}
        sideOffset={6}
        collisionPadding={8}
        {...props}
      >
        {children}
      </RadixDropdownMenu.Content>
    </RadixDropdownMenu.Portal>
  );
}

export function DropdownItem({ children, onClick, ...props }) {
  return (
    <RadixDropdownMenu.Item
      className="custom-dropdown-item"
      onSelect={onClick}
      {...props}
    >
      {children}
    </RadixDropdownMenu.Item>
  );
}
