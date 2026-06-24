import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, type = 'text', className = '', ...props },
  ref,
) {
  return (
    <div className="space-y-1.5">
      {label && <label className="label">{label}</label>}
      <input
        ref={ref}
        type={type}
        className={`input-field ${error ? 'border-red-400 focus:border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="error-text">{error}</p>}
    </div>
  );
});

export default Input;
