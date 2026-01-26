'use client';

import React, { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  error?: string;
  required?: boolean;
  dateFormat?: string;
  disabled?: boolean;
}

const CustomInput = forwardRef<
  HTMLButtonElement,
  {
    value?: string;
    onClick?: () => void;
    placeholder?: string;
    disabled?: boolean;
  }
>(({ value, onClick, placeholder, disabled }, ref) => (
  <button
    type="button"
    onClick={onClick}
    ref={ref}
    disabled={disabled}
    className="w-full px-4 py-3 pl-10 border border-white/10 bg-white/5 text-white rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 outline-none transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
  >
    {value || <span className="text-white/30">{placeholder}</span>}
  </button>
));

CustomInput.displayName = 'CustomInput';

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Select date',
  error,
  required = false,
  dateFormat = 'yyyy-MM-dd',
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative focus-within:text-green-400">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none z-10 transition-colors">
          <Calendar size={18} />
        </div>
        <ReactDatePicker
          selected={value}
          onChange={onChange}
          minDate={minDate}
          maxDate={maxDate}
          dateFormat={dateFormat}
          placeholderText={placeholder}
          disabled={disabled}
          customInput={<CustomInput placeholder={placeholder} disabled={disabled} />}
          wrapperClassName="w-full"
          calendarClassName="dark-datepicker"
          popperClassName="dark-datepicker-popper"
          portalId="datepicker-portal"
          popperPlacement="bottom-start"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};
