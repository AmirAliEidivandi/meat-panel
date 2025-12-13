import { Loader2, PhoneCall, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../lib/utils";
import {
  capillarySalesLineService,
  employeeService,
  followUpService,
} from "../services/api";
import type {
  CapillarySalesLineListItem,
  Employee,
  GetFollowUpsResponse,
  QueryFollowUp,
} from "../types";
import Pagination from "./Pagination";

const getResultStatusText = (
  result: "CUSTOMER" | "NOT_CUSTOMER" | "REQUIRES_FOLLOW_UP" | "NOT_ANSWERED"
): string => {
  const statusMap: Record<string, string> = {
    CUSTOMER: "مشتری",
    NOT_CUSTOMER: "مشتری نیست",
    REQUIRES_FOLLOW_UP: "نیاز به پیگیری",
    NOT_ANSWERED: "پاسخ نداده",
  };
  return statusMap[result] || result;
};

const getResultStatusColor = (
  result: "CUSTOMER" | "NOT_CUSTOMER" | "REQUIRES_FOLLOW_UP" | "NOT_ANSWERED"
): string => {
  const colorMap: Record<string, string> = {
    CUSTOMER: "bg-green-100 text-green-800",
    NOT_CUSTOMER: "bg-red-100 text-red-800",
    REQUIRES_FOLLOW_UP: "bg-yellow-100 text-yellow-800",
    NOT_ANSWERED: "bg-gray-100 text-gray-800",
  };
  return colorMap[result] || "bg-gray-100 text-gray-800";
};

export default function FollowUpsList() {
  const navigate = useNavigate();
  const [followUps, setFollowUps] = useState<
    GetFollowUpsResponse["data"]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<QueryFollowUp>({
    page: 1,
    "page-size": 20,
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salesLines, setSalesLines] = useState<CapillarySalesLineListItem[]>(
    []
  );

  useEffect(() => {
    fetchFollowUps();
    fetchEmployees();
    fetchSalesLines();
  }, [filters]);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await followUpService.getFollowUps(filters);
      setFollowUps(response.data || []);
      setTotalCount(response.count || 0);
      setCurrentPage(filters.page || 1);
    } catch (err: any) {
      console.error("Error fetching follow-ups:", err);
      setError(
        err.response?.data?.message || "خطا در دریافت لیست پیگیری‌ها"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getAllEmployees();
      setEmployees(response || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const fetchSalesLines = async () => {
    try {
      const response = await capillarySalesLineService.getCapillarySalesLines({
        page: 1,
        "page-size": 100,
      });
      setSalesLines(response.data || []);
    } catch (err) {
      console.error("Error fetching sales lines:", err);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters((prev) => ({ ...prev, page }));
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (filters.employee_id) count++;
    if (filters.capillary_sales_line_id) count++;
    return count;
  };

  const handleFilterChange = (key: keyof QueryFollowUp, value: any) => {
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <PhoneCall className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">لیست پیگیری‌ها</h1>
              <p className="text-sm text-gray-600 mt-1">
                {totalCount} پیگیری
                {getActiveFiltersCount() > 0 && " (فیلتر شده)"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-reverse space-x-3">
            <button
              onClick={fetchFollowUps}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-reverse space-x-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="text-sm font-semibold">بروزرسانی</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              کارمند
            </label>
            <select
              value={filters.employee_id || ""}
              onChange={(e) =>
                handleFilterChange("employee_id", e.target.value || null)
              }
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">همه کارمندان</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.profile.first_name} {employee.profile.last_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              خط فروش
            </label>
            <select
              value={filters.capillary_sales_line_id || ""}
              onChange={(e) =>
                handleFilterChange(
                  "capillary_sales_line_id",
                  e.target.value || null
                )
              }
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">همه خطوط فروش</option>
              {salesLines.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {getActiveFiltersCount() > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {getActiveFiltersCount()} فیلتر فعال
            </span>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
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
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="mr-3 text-gray-600 font-semibold">
            در حال بارگذاری...
          </span>
        </div>
      )}

      {/* FollowUps Table */}
      {!loading && followUps.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    مشتری
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    توضیحات
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    تلاش
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    نتیجه
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    کارمند
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
                {followUps.map((followUp) => (
                  <tr
                    key={followUp.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/manage/follow-ups/${followUp.id}`)}
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {followUp.customer.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          کد: {followUp.customer.code}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 max-w-md">
                      <p className="truncate">{followUp.description || "-"}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {followUp.attempt}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getResultStatusColor(
                          followUp.result
                        )}`}
                      >
                        {getResultStatusText(followUp.result)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {followUp.employee.profile.first_name}{" "}
                      {followUp.employee.profile.last_name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {formatDate(
                        typeof followUp.created_at === "string"
                          ? followUp.created_at
                          : followUp.created_at.toString()
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/manage/follow-ups/${followUp.id}`);
                        }}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold"
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
      {!loading && followUps.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <PhoneCall className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold">
            {getActiveFiltersCount() > 0
              ? "هیچ موردی با فیلترهای انتخابی یافت نشد"
              : "پیگیری یافت نشد"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && followUps.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalCount}
          itemsPerPage={filters["page-size"] || 20}
          totalPages={Math.ceil(totalCount / (filters["page-size"] || 20))}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

