import { SelectHTMLAttributes, forwardRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  isRequired?: boolean;
  icon?: React.ReactNode;
}

const CustomSelect = forwardRef<HTMLSelectElement, CustomSelectProps>(
  ({ label, error, isRequired, icon, className = '', children, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

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
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-300 group-hover:text-blue-500 group-focus-within:text-blue-600 z-10">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
              w-full px-4 py-3 
              ${icon ? 'pr-11' : ''}
              appearance-none
              border-2 rounded-xl
              bg-gradient-to-r from-white to-gray-50
              text-gray-900 font-medium
              cursor-pointer
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
          >
            {children}
          </select>
          
          {/* آیکن فلش */}
          <div
            className={`
              absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none
              transition-all duration-300
              ${isFocused ? 'text-blue-500 rotate-180' : 'text-gray-400 rotate-0'}
            `}
          >
            <ChevronDown className="w-5 h-5" />
          </div>

          {/* خط انیمیشن زیر select */}
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

CustomSelect.displayName = 'CustomSelect';

export default CustomSelect;

