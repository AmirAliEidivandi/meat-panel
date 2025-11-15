import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  label?: string;
  isRequired?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function CustomDropdown({
  label,
  isRequired,
  value,
  onChange,
  options,
  placeholder = 'انتخاب کنید',
  icon,
  className = '',
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2 transition-all duration-200">
          {label}
          {isRequired && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setIsFocused(!isOpen);
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            w-full px-4 py-3 
            ${icon ? 'pr-11' : ''}
            text-right
            border-2 rounded-xl
            bg-gradient-to-r from-white to-gray-50
            text-gray-900 font-medium
            cursor-pointer
            transition-all duration-300 ease-out
            ${isFocused || isOpen
              ? 'border-blue-500 shadow-lg shadow-blue-100 scale-[1.01] from-white to-blue-50/30'
              : isHovered
              ? 'border-gray-400 shadow-md scale-[1.005]'
              : 'border-gray-300 shadow-sm'
            }
            focus:outline-none focus:ring-4 focus:ring-blue-100
            hover:border-gray-400
          `}
        >
          {icon && (
            <div
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                isFocused || isOpen ? 'text-blue-500' : 'text-gray-400'
              }`}
            >
              {icon}
            </div>
          )}
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-300 ${
              isOpen ? 'rotate-180 text-blue-500' : 'rotate-0 text-gray-400'
            }`}
          />
        </button>

        {/* خط انیمیشن زیر */}
        <div
          className={`
            absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500
            transition-all duration-500 ease-out
            ${isFocused || isOpen ? 'w-full opacity-100' : 'w-0 opacity-0'}
          `}
        />

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="absolute z-50 w-full mt-2 bg-white border-2 border-blue-200 rounded-xl shadow-2xl overflow-hidden animate-dropdown-open"
            style={{
              animation: 'dropdownSlide 0.3s ease-out',
            }}
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setIsFocused(false);
                    }}
                    className={`
                      w-full px-4 py-3 text-right flex items-center justify-between
                      transition-all duration-200
                      ${isSelected
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30'
                      }
                      ${index !== 0 ? 'border-t border-gray-100' : ''}
                    `}
                    style={{
                      animation: `fadeInItem 0.2s ease-out ${index * 0.03}s both`,
                    }}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <Check className="w-5 h-5 text-blue-600 animate-scale-in" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeInItem {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3b82f6, #6366f1);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2563eb, #4f46e5);
        }
      `}</style>
    </div>
  );
}

