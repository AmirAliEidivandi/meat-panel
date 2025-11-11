import { Bell, Loader2, Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../lib/utils";
import { customerService, reminderService } from "../services/api";
import type {
  CustomerListItem,
  QueryReminderDto,
  ReminderListItem,
} from "../types";
import CreateReminderModal from "./CreateReminderModal";
import Pagination from "./Pagination";

const getSeenStatusText = (seen: boolean): string => {
  return seen ? "مشاهده شده" : "مشاهده نشده";
};

const getSeenStatusColor = (seen: boolean): string => {
  return seen ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
};

export default function RemindersList() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<ReminderListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<QueryReminderDto>({
    page: 1,
    "page-size": 20,
  });
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);

  useEffect(() => {
    fetchReminders();
    fetchCustomers();
  }, [filters]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await reminderService.getReminders(filters);
      setReminders(response.data || []);
      setTotalCount(response.count || 0);
      setCurrentPage(filters.page || 1);
    } catch (err: any) {
      console.error("Error fetching reminders:", err);
      setError(err.response?.data?.message || "خطا در دریافت لیست یادآورها");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getAllCustomers({
        page: 1,
        "page-size": 100,
      });
      setCustomers(response.data || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters((prev) => ({ ...prev, page }));
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (filters.customer_id) count++;
    if (filters.message) count++;
    if (filters.seen !== null && filters.seen !== undefined) count++;
    if (filters.from) count++;
    if (filters.to) count++;
    return count;
  };

  const handleFilterChange = (key: keyof QueryReminderDto, value: any) => {
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setCurrentPage(1);
    setFilters({
      page: 1,
      "page-size": 20,
    });
  };

  return (
    <div className="space-y-6 fade-in font-vazir">
      {/* Header */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">یادآورها</h1>
              <p className="text-sm text-gray-600 mt-1">
                {totalCount} یادآور
                {getActiveFiltersCount() > 0 && " (فیلتر شده)"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-reverse space-x-3">
            <button
              onClick={fetchReminders}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-reverse space-x-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="text-sm font-semibold">بروزرسانی</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-reverse space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-semibold">افزودن یادآور</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              مشتری
            </label>
            <select
              value={filters.customer_id || ""}
              onChange={(e) =>
                handleFilterChange("customer_id", e.target.value || null)
              }
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">همه مشتریان</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.title} ({customer.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              جستجو در پیام
            </label>
            <input
              type="text"
              value={filters.message || ""}
              onChange={(e) =>
                handleFilterChange("message", e.target.value || null)
              }
              placeholder="جستجو..."
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              وضعیت مشاهده
            </label>
            <select
              value={
                filters.seen === null || filters.seen === undefined
                  ? ""
                  : filters.seen
                  ? "true"
                  : "false"
              }
              onChange={(e) => {
                const value = e.target.value;
                handleFilterChange(
                  "seen",
                  value === "" ? null : value === "true"
                );
              }}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">همه</option>
              <option value="false">مشاهده نشده</option>
              <option value="true">مشاهده شده</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              از تاریخ
            </label>
            <input
              type="date"
              value={filters.from || ""}
              onChange={(e) =>
                handleFilterChange("from", e.target.value || null)
              }
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              تا تاریخ
            </label>
            <input
              type="date"
              value={filters.to || ""}
              onChange={(e) => handleFilterChange("to", e.target.value || null)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {getActiveFiltersCount() > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {getActiveFiltersCount()} فیلتر فعال
            </span>
            <button
              onClick={clearFilters}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              پاک کردن فیلترها
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <span className="mr-3 text-gray-600 font-semibold">
            در حال بارگذاری...
          </span>
        </div>
      )}

      {/* Reminders Table */}
      {!loading && reminders.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    مشتری
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    پیام
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    تاریخ یادآوری
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    نماینده
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    وضعیت
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    تاریخ ایجاد
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reminders.map((reminder) => (
                  <tr
                    key={reminder.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/manage/reminders/${reminder.id}`)}
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {reminder.customer.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          کد: {reminder.customer.code}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 max-w-md">
                      <p className="truncate">{reminder.message}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {formatDate(reminder.date)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {reminder.representative_name || "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getSeenStatusColor(
                          reminder.seen
                        )}`}
                      >
                        {getSeenStatusText(reminder.seen)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {formatDate(reminder.created_at)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/manage/reminders/${reminder.id}`);
                        }}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-semibold"
                      >
                        مشاهده
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && reminders.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold">
            {getActiveFiltersCount() > 0
              ? "هیچ موردی با فیلترهای انتخابی یافت نشد"
              : "یادآوری یافت نشد"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && reminders.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalCount}
          itemsPerPage={filters["page-size"] || 20}
          totalPages={Math.ceil(totalCount / (filters["page-size"] || 20))}
          onPageChange={handlePageChange}
        />
      )}

      {/* Create Reminder Modal */}
      {showCreateModal && (
        <CreateReminderModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchReminders();
          }}
        />
      )}
    </div>
  );
}
