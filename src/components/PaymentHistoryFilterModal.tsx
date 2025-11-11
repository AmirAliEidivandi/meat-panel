import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { customerService, employeeService } from "../services/api";
import type { Customer, Employee, QueryPaymentHistoryDto } from "../types";

interface PaymentHistoryFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: QueryPaymentHistoryDto) => void;
  currentFilters: QueryPaymentHistoryDto;
}

const paymentChangeTypes = [
  { value: "CREATED", label: "ایجاد پرداخت" },
  { value: "AMOUNT_CHANGED", label: "تغییر مبلغ" },
  { value: "METHOD_CHANGED", label: "تغییر روش پرداخت" },
  { value: "DATE_CHANGED", label: "تغییر تاریخ" },
  { value: "CHEQUE_DATE_CHANGED", label: "تغییر تاریخ چک" },
  { value: "DELETED", label: "حذف پرداخت" },
  { value: "RESTORED", label: "بازیابی پرداخت" },
  { value: "INVOICE_LINKED", label: "اتصال به فاکتور" },
  { value: "INVOICE_UNLINKED", label: "قطع اتصال از فاکتور" },
];

const sortOptions = [{ value: "created_at", label: "تاریخ ایجاد" }];

export default function PaymentHistoryFilterModal({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
}: PaymentHistoryFilterModalProps) {
  const [filters, setFilters] =
    useState<QueryPaymentHistoryDto>(currentFilters);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchEmployees();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const response = await customerService.getAllCustomers();
      setCustomers(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await employeeService.getAllEmployees();
      setEmployees(response || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleFilterChange = (
    key: keyof QueryPaymentHistoryDto,
    value: string | boolean | undefined
  ) => {
    setFilters((prev) => {
      if (value === "" || value === undefined) {
        const { [key]: _, ...restWithoutKey } = prev;
        return restWithoutKey;
      }

      return { ...prev, [key]: value };
    });
  };

  const handleClearAll = () => {
    setFilters({});
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-3">
            <Search className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">
              فیلترهای پیشرفته تاریخچه پرداخت‌ها
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="p-6 space-y-6">
          {/* Customer and Employee Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                مشتری
              </label>
              <select
                value={filters.customer_id || ""}
                onChange={(e) =>
                  handleFilterChange("customer_id", e.target.value || undefined)
                }
                disabled={loadingCustomers}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-400 hover:shadow-sm cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:shadow-none"
              >
                <option value="">همه مشتریان</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                کارمند
              </label>
              <select
                value={filters.employee_id || ""}
                onChange={(e) =>
                  handleFilterChange("employee_id", e.target.value || undefined)
                }
                disabled={loadingEmployees}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-400 hover:shadow-sm cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:shadow-none"
              >
                <option value="">همه کارمندان</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.profile.first_name} {employee.profile.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Change Type and System Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                نوع تغییر
              </label>
              <select
                value={filters.change_type || ""}
                onChange={(e) =>
                  handleFilterChange("change_type", e.target.value || undefined)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-400 hover:shadow-sm cursor-pointer"
              >
                <option value="">همه انواع</option>
                {paymentChangeTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                نوع تغییرات
              </label>
              <select
                value={
                  filters.by_system === undefined
                    ? ""
                    : filters.by_system
                    ? "true"
                    : "false"
                }
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    handleFilterChange("by_system", undefined);
                  } else {
                    handleFilterChange("by_system", value === "true");
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-400 hover:shadow-sm cursor-pointer"
              >
                <option value="">همه</option>
                <option value="true">خودکار</option>
                <option value="false">دستی</option>
              </select>
            </div>
          </div>

          {/* Deleted Changed */}
          <div>
            <label className="flex items-center space-x-reverse space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.deleted_changed === true}
                onChange={(e) =>
                  handleFilterChange(
                    "deleted_changed",
                    e.target.checked ? true : undefined
                  )
                }
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                نمایش تغییرات حذف
              </span>
            </label>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                مرتب‌سازی بر اساس
              </label>
              <select
                value={filters.sort_by || ""}
                onChange={(e) =>
                  handleFilterChange("sort_by", e.target.value || undefined)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-400 hover:shadow-sm cursor-pointer"
              >
                <option value="">پیش‌فرض</option>
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ترتیب
              </label>
              <select
                value={filters.sort_order || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "sort_order",
                    (e.target.value as "asc" | "desc") || undefined
                  )
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-400 hover:shadow-sm cursor-pointer"
              >
                <option value="">پیش‌فرض</option>
                <option value="asc">صعودی</option>
                <option value="desc">نزولی</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleClearAll}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-semibold"
          >
            پاک کردن همه
          </button>
          <div className="flex items-center space-x-reverse space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
            >
              انصراف
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              اعمال فیلتر
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
