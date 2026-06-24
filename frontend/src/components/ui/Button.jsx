import { forwardRef } from 'react';

const variants = {
  primary: 'btn-primary-green',
  secondary: 'btn-secondary-outline',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
  'on-dark': 'btn-on-dark',
  link: 'btn-link',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', children, className = '', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
