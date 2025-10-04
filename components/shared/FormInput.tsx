import React from 'react';
import { UserIcon, AtSymbolIcon, PhoneIcon } from './Icons.tsx';

interface FormInputProps {
  type: 'text' | 'email' | 'tel' | 'number';
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  icon?: 'user' | 'email' | 'phone';
  className?: string;
}

const iconComponents = {
  user: UserIcon,
  email: AtSymbolIcon,
  phone: PhoneIcon,
};

export const FormInput: React.FC<FormInputProps> = React.memo(({
  type,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  icon,
  className = ""
}) => {
  const IconComponent = icon ? iconComponents[icon] : null;
  
  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {IconComponent && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconComponent className="h-5 w-5 text-slate-400" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`block w-full ${IconComponent ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm`}
        />
      </div>
    </div>
  );
});

FormInput.displayName = 'FormInput';