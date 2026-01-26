'use client';

import React, { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  label?: string;
  value: string; // HH:mm format
  onChange: (time: string) => void;
  minTime?: Date;
  maxTime?: Date;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  intervalMinutes?: number;
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

export const TimePicker: React.FC<TimePickerProps> = ({
  label,
  value,
  onChange,
  minTime,
  maxTime,
  placeholder = 'Select time',
  error,
  required = false,
  disabled = false,
  intervalMinutes = 15,
}) => {
  // Convert HH:mm string to Date object for the picker
  const stringToDate = (timeStr: string): Date | null => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Convert Date object back to HH:mm string
  const dateToString = (date: Date | null): string => {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const selectedDate = stringToDate(value);

  const handleChange = (date: Date | null) => {
    onChange(dateToString(date));
  };

  return (
    <div className="space-y-2 ">
      {label && (
        <label className="block text-sm font-medium text-white/80">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none z-10">
          <Clock size={18} />
        </div>
        <ReactDatePicker
          selected={selectedDate}
          onChange={handleChange}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={intervalMinutes}
          minTime={minTime}
          maxTime={maxTime}
          timeCaption="Select Time"
          placeholderText={placeholder}
          disabled={disabled}
          customInput={<CustomInput placeholder={placeholder} disabled={disabled} />}
          wrapperClassName="w-full"
          calendarClassName="dark-datepicker"
          popperClassName="dark-datepicker-popper"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};
