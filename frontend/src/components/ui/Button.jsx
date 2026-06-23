import { forwardRef } from 'react';
import './Button.css';

const Button = forwardRef(function Button({ 
  children, 
  variant = 'secondary', 
  size = 'md',
  onClick, 
  className = '',
  style = {},
  disabled = false,
  type = 'button',
  ...props 
}, ref) {
  const baseClass = 'custom-btn';
  const variantClass = `custom-btn-${variant}`;
  const sizeClass = `custom-btn-${size}`;
  
  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
