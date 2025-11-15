import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { formatNumberWithCommas, parseFormattedNumber } from '../lib/utils';

interface CustomInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  isRequired?: boolean;
  type?: 'text' | 'number' | 'email' | 'tel';
  value?: string | number;
  onChange?: (value: string | number) => void;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ label, error, icon, isRequired, type = 'text', value, onChange, className = '', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [internalValue, setInternalValue] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      if (type === 'number') {
        // فقط اعداد و کاما رو قبول کن
        const cleanValue = inputValue.replace(/[^\d۰-۹,]/g, '');
        setInternalValue(cleanValue);
        
        // اگر خالی بود، 0 برگردون
        if (cleanValue === '') {
          onChange?.(0);
          return;
        }
        
        const parsed = parseFormattedNumber(cleanValue);
        onChange?.(parsed);
      } else {
        onChange?.(inputValue);
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
      // وقتی focus میشه، مقدار فعلی رو تو internal value بذار
      if (type === 'number' && value) {
        setInternalValue(String(value));
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      // وقتی blur میشه، internal value رو خالی کن تا فرمت شده نمایش داده بشه
      setInternalValue('');
    };

    // اگر focus نیست و type عدد هست، فرمت شده نمایش بده
    // اگر focus هست، مقدار خام رو نمایش بده
    const displayValue = type === 'number'
      ? isFocused
        ? internalValue || (value === 0 ? '' : String(value))
        : value && value !== 0
        ? formatNumberWithCommas(value)
        : ''
      : value;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2 transition-all duration-200">
            {label}
            {isRequired && <span className="text-red-500 mr-1">*</span>}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-300 group-hover:text-blue-500 group-focus-within:text-blue-600">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type="text"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onWheel={(e) => e.currentTarget.blur()} // جلوگیری از تغییر با اسکرول
            className={`
              w-full px-4 py-3 
              ${icon ? 'pr-11' : ''}
              border-2 rounded-xl
              bg-gradient-to-r from-white to-gray-50
              text-gray-900 font-medium
              placeholder:text-gray-400 placeholder:font-normal
              transition-all duration-300 ease-out
              ${isFocused 
                ? 'border-blue-500 shadow-lg shadow-blue-100 scale-[1.01] from-white to-blue-50/30' 
                : isHovered
                ? 'border-gray-400 shadow-md scale-[1.005]'
                : error
                ? 'border-red-300 bg-red-50/30'
                : 'border-gray-300 shadow-sm'
              }
              focus:outline-none focus:ring-4 focus:ring-blue-100
              hover:border-gray-400
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              ${className}
            `}
            {...props}
          />
          {/* خط انیمیشن زیر input */}
          <div
            className={`
              absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500
              transition-all duration-500 ease-out
              ${isFocused ? 'w-full opacity-100' : 'w-0 opacity-0'}
            `}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600 font-medium animate-shake">
            {error}
          </p>
        )}
      </div>
    );
  }
);

CustomInput.displayName = 'CustomInput';

export default CustomInput;

