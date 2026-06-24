const variantStyles = {
  default: 'card',
  elevated: 'card-elevated',
  floating: 'card-floating',
  dark: 'card-dark',
};

export default function Card({ children, className = '', variant = 'default', ...props }) {
  return (
    <div className={`${variantStyles[variant] || variantStyles.default} ${className}`} {...props}>
      {children}
    </div>
  );
}
