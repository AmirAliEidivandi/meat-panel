import { Loader2, Package, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency, formatDate } from "../../lib/utils";
import { myRequestsService } from "../../services/api";
import type { MyRequestsResponse } from "../../types";
import Pagination from "../Pagination";

export default function MyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<MyRequestsResponse["data"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchRequests();
  }, [currentPage]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await myRequestsService.getMyRequests(
        currentPage,
        itemsPerPage
      );
      setRequests(response.data);
      setTotalItems(response.count);
    } catch (err: any) {
      console.error("Error fetching my requests:", err);
      setError("خطا در بارگذاری درخواست‌ها");
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: "در انتظار",
      APPROVED: "تأیید شده",
      REJECTED: "رد شده",
      CONVERTED_TO_ORDER: "تبدیل به سفارش",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "CONVERTED_TO_ORDER":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodText = (method: string) => {
    const methodMap: Record<string, string> = {
      CASH: "نقدی",
      DEPOSIT_TO_ACCOUNT: "واریز به حساب",
      CHEQUE: "چک",
      CREDIT: "اعتباری",
      WALLET: "کیف پول",
      ONLINE: "آنلاین",
    };
    return methodMap[method] || method;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6 fade-in font-vazir">
      {/* Header */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                درخواست‌های من
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {totalItems} درخواست ثبت شده
              </p>
            </div>
          </div>
          <button
            onClick={fetchRequests}
            className="inline-flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            بروزرسانی
          </button>
        </div>
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
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          <span className="mr-3 text-gray-600 font-semibold">
            در حال بارگذاری...
          </span>
        </div>
      )}

      {/* Requests Table */}
      {!loading && requests.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    کد درخواست
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    تاریخ ایجاد
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    تعداد محصولات
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    روش پرداخت
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    مبلغ کل
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    وضعیت
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/user/requests/${request.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">
                        {request.code
                          ? `#${request.code}`
                          : request.id.slice(0, 8) + "..."}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {request.products_count} عدد
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {getPaymentMethodText(request.payment_method)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(request.total_price)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {getStatusText(request.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/user/requests/${request.id}`);
                        }}
                        className="text-orange-600 hover:text-orange-700 font-semibold text-sm"
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
      {!loading && requests.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-semibold">
              هیچ درخواستی یافت نشد
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalItems > itemsPerPage && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / itemsPerPage)}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
