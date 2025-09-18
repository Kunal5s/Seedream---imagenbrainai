
import React from 'react';

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

const Select: React.FC<SelectProps> = ({ label, value, onChange, options }) => {
  const selectId = `select-${label.replace(/\s+/g, '-').toLowerCase()}`;
  
  return (
    <div>
      <label htmlFor={selectId} className="block text-sm font-medium text-gray-400 mb-1">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-900 border border-gray-700 rounded-md p-2.5 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;