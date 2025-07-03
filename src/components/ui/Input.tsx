import React from 'react';

interface InputProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'email';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  className = '',
  error,
}: InputProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
        } ${error ? 'border-red-500' : ''}`}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}