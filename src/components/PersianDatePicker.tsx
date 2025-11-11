import { jalaaliToDateObject, toJalaali } from "jalaali-js";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface PersianDatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}

const monthNames = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const dayNames = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

export default function PersianDatePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  className = "",
}: PersianDatePickerProps) {
  // Initialize with today's date
  const getTodayJalaali = () => {
    const today = new Date();
    return toJalaali(today);
  };

  const todayJalaali = getTodayJalaali();
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(todayJalaali.jy);
  const [currentMonth, setCurrentMonth] = useState(todayJalaali.jm);
  const [selectedDate, setSelectedDate] = useState<{
    year: number;
    month: number;
    day: number;
  } | null>(null);

  useEffect(() => {
    if (value) {
      try {
        // Check if value is in Persian format (yyyy/mm/dd or yyyy-mm-dd)
        const persianDatePattern = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/;
        const match = value.match(persianDatePattern);

        if (match) {
          // Persian date format
          const year = parseInt(match[1]);
          const month = parseInt(match[2]);
          const day = parseInt(match[3]);

          // Validate if it's a valid Persian date (not a Gregorian date)
          // Persian years are typically between 1300-1500
          if (
            year >= 1300 &&
            year <= 1500 &&
            month >= 1 &&
            month <= 12 &&
            day >= 1 &&
            day <= 31
          ) {
            setSelectedDate({ year, month, day });
            setCurrentYear(year);
            setCurrentMonth(month);
            return;
          }
        }

        // Try parsing as Gregorian date (ISO format or standard format)
        // Only parse if it doesn't look like a Persian date
        if (!value.includes("/") && !value.includes("-")) {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            const jDate = toJalaali(date);
            setSelectedDate({ year: jDate.jy, month: jDate.jm, day: jDate.jd });
            setCurrentYear(jDate.jy);
            setCurrentMonth(jDate.jm);
          }
        }
      } catch (error) {
        console.error("Error parsing date:", error);
      }
    } else {
      // If no value, show today's date in calendar
      const today = new Date();
      const jToday = toJalaali(today);
      setCurrentYear(jToday.jy);
      setCurrentMonth(jToday.jm);
    }
  }, [value]);

  const getDaysInMonth = (year: number, month: number) => {
    const daysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
    if (month === 12 && isLeapYear(year)) {
      return 30;
    }
    return daysInMonth[month - 1];
  };

  const isLeapYear = (year: number) => {
    return ((year + 2346) * 683) % 2820 < 683;
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const firstDay = jalaaliToDateObject(year, month, 1);
    return firstDay.getDay();
  };

  const handleDateSelect = (day: number) => {
    const newDate = { year: currentYear, month: currentMonth, day };
    setSelectedDate(newDate);

    // Format as Persian date (yyyy/mm/dd)
    const formattedDate = `${newDate.year}/${String(newDate.month).padStart(
      2,
      "0"
    )}/${String(newDate.day).padStart(2, "0")}`;

    onChange(formattedDate);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const formatDisplayValue = () => {
    if (!selectedDate) return "";
    return `${selectedDate.day} ${monthNames[selectedDate.month - 1]} ${
      selectedDate.year
    }`;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        selectedDate &&
        selectedDate.year === currentYear &&
        selectedDate.month === currentMonth &&
        selectedDate.day === day;

      const isToday = (() => {
        const today = new Date();
        const jToday = toJalaali(today);
        return (
          jToday.jy === currentYear &&
          jToday.jm === currentMonth &&
          jToday.jd === day
        );
      })();

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={`
						h-8 w-8 rounded-md text-xs font-medium transition-all duration-150
						hover:bg-gray-100
						${
              isSelected
                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                : isToday
                ? "bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold"
                : "text-gray-700 hover:bg-gray-100"
            }
					`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
					w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
					transition-all duration-300 ease-in-out bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 
					shadow-sm hover:shadow-md text-right flex items-center justify-between
					${isOpen ? "ring-2 ring-blue-500 border-transparent" : ""}
				`}
      >
        <span className={selectedDate ? "text-gray-900" : "text-gray-500"}>
          {formatDisplayValue() || placeholder}
        </span>
        <Calendar className="w-5 h-5 text-gray-400" />
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden w-max min-w-[280px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-2 text-white">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevMonth}
                className="w-7 h-7 bg-white/20 rounded-md flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ChevronRight className="w-3 h-3" />
              </button>

              <div className="text-center">
                <h3 className="text-sm font-bold">
                  {monthNames[currentMonth - 1]} {currentYear}
                </h3>
              </div>

              <button
                onClick={handleNextMonth}
                className="w-7 h-7 bg-white/20 rounded-md flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-2">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="h-7 flex items-center justify-center text-xs font-semibold text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  const today = new Date();
                  const jToday = toJalaali(today);
                  setCurrentYear(jToday.jy);
                  setCurrentMonth(jToday.jm);
                  handleDateSelect(jToday.jd);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
              >
                امروز
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-gray-600 hover:text-gray-800 transition-colors font-medium"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
