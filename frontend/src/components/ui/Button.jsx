import './Button.css';

export default function Button({ 
  children, 
  variant = 'secondary', 
  size = 'md',
  onClick, 
  className = '',
  style = {},
  disabled = false,
  type = 'button',
  ...props 
}) {
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
      {...props}
    >
      {children}
    </button>
  );
}

