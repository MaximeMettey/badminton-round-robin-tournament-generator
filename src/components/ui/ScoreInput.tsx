import { useState, useEffect } from 'react';

interface ScoreInputProps {
  value: number;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function ScoreInput({ value, onChange, disabled = false, className = '', placeholder = '0' }: ScoreInputProps) {
  const [displayValue, setDisplayValue] = useState(value === 0 ? '' : value.toString());

  useEffect(() => {
    setDisplayValue(value === 0 ? '' : value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // Allow empty string
    if (val === '') {
      setDisplayValue('');
      onChange('0');
      return;
    }

    // Only allow digits
    if (/^\d+$/.test(val)) {
      setDisplayValue(val);
      onChange(val);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select(); // Select all text on focus for easy replacement
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      disabled={disabled}
      placeholder={placeholder}
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-center font-bold text-lg ${className}`}
    />
  );
}
