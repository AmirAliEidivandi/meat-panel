import { ArrowDownCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency, formatDate } from "../lib/utils";
import { customerService, withdrawalRequestService } from "../services/api";
import type {
  CustomerListItem,
  GetWithdrawalRequestsResponse,
  QueryWithdrawalRequestDto,
} from "../types";
import Pagination from "./Pagination";

const getStatusText = (
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "COMPLETED"
    | "CANCELLED"
    | "REVIEWING"
    | "PROCESSING"
): string => {
  const statusMap: Record<string, string> = {
    PENDING: "در انتظار بررسی",
    APPROVED: "تایید شده",
    REJECTED: "رد شده",
    COMPLETED: "تکمیل شده",
    CANCELLED: "لغو شده",
    REVIEWING: "در حال بررسی",
    PROCESSING: "در حال پردازش",
  };
  return statusMap[status] || status;
};

const getStatusColor = (
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "COMPLETED"
    | "CANCELLED"
    | "REVIEWING"
    | "PROCESSING"
): string => {
  const colorMap: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-blue-100 text-blue-800",
    REJECTED: "bg-red-100 text-red-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-gray-100 text-gray-800",
    REVIEWING: "bg-purple-100 text-purple-800",
    PROCESSING: "bg-indigo-100 text-indigo-800",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800";
};

export default function WithdrawalRequestsList() {
  const navigate = useNavigate();
  const [withdrawalRequests, setWithdrawalRequests] = useState<
    GetWithdrawalRequestsResponse["data"]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [customerFilter, setCustomerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);

  useEffect(() => {
    fetchWithdrawalRequests();
    fetchCustomers();
  }, [currentPage, customerFilter, statusFilter]);

  const fetchWithdrawalRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const query: QueryWithdrawalRequestDto = {
        page: currentPage,
        "page-size": pageSize,
      };

      if (customerFilter) {
        query.customer_id = customerFilter;
      }

      if (statusFilter) {
        query.status = statusFilter;
      }

      const response = await withdrawalRequestService.getWithdrawalRequests(
        query
      );
      setWithdrawalRequests(response.data || []);
      setTotalCount(response.count || 0);
    } catch (err: any) {
      console.error("Error fetching withdrawal requests:", err);
      setError(
        err.response?.data?.message || "خطا در دریافت لیست درخواست‌های برداشت"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getAllCustomers();
      setCustomers(response.data || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (customerFilter) count++;
    if (statusFilter) count++;
    return count;
  };

  return (
    <div className="space-y-6 fade-in font-vazir">
      {/* Header */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <ArrowDownCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                درخواست های برداشت
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {totalCount} درخواست
                {getActiveFiltersCount() > 0 && " (فیلتر شده)"}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              مشتری
            </label>
            <select
              value={customerFilter}
              onChange={(e) => {
                setCustomerFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="">همه</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.title} (کد: {customer.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              وضعیت
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="">همه</option>
              <option value="PENDING">در انتظار بررسی</option>
              <option value="APPROVED">تایید شده</option>
              <option value="REJECTED">رد شده</option>
              <option value="COMPLETED">تکمیل شده</option>
              <option value="CANCELLED">لغو شده</option>
              <option value="REVIEWING">در حال بررسی</option>
              <option value="PROCESSING">در حال پردازش</option>
            </select>
          </div>
        </div>

        {getActiveFiltersCount() > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {getActiveFiltersCount()} فیلتر فعال
            </span>
            <button
              onClick={() => {
                setCustomerFilter("");
                setStatusFilter("");
                setCurrentPage(1);
              }}
              className="text-sm text-cyan-600 hover:text-cyan-700 font-semibold"
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
          <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
          <span className="mr-3 text-gray-600 font-semibold">
            در حال بارگذاری...
          </span>
        </div>
      )}

      {/* Withdrawal Requests Table */}
      {!loading && withdrawalRequests.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    کد مشتری
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    مشتری
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    وضعیت
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    مبلغ درخواستی
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
                {withdrawalRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() =>
                      navigate(`/manage/withdrawal-requests/${request.id}`)
                    }
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      {request.customer.code}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      {request.customer.title}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {getStatusText(request.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(request.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {formatDate(
                        typeof request.created_at === "string"
                          ? request.created_at
                          : new Date(request.created_at).toISOString()
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/manage/withdrawal-requests/${request.id}`
                          );
                        }}
                        className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-colors text-sm font-semibold"
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
      {!loading && withdrawalRequests.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <ArrowDownCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold">
            {getActiveFiltersCount() > 0
              ? "هیچ موردی با فیلترهای انتخابی یافت نشد"
              : "درخواست برداشتی یافت نشد"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && withdrawalRequests.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalCount}
          itemsPerPage={pageSize}
          totalPages={Math.ceil(totalCount / pageSize)}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

