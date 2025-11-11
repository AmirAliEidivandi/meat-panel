import { Package, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../lib/utils";
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fa-IR", {
      style: "currency",
      currency: "IRR",
      minimumFractionDigits: 0,
    }).format(amount);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={fetchRequests}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                درخواست‌های من
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                مشاهده و پیگیری درخواست‌های شما
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

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">هیچ درخواستی یافت نشد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request, index) => (
              <div
                key={request.id}
                onClick={() => navigate(`/user/requests/${request.id}`)}
                className="p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer rounded-xl border-2 border-gray-200 bg-white shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-reverse space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {request.code
                          ? `درخواست #${request.code}`
                          : `درخواست ${request.id.slice(0, 8)}...`}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(request.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-reverse space-x-3">
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {getStatusText(request.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">تعداد محصولات</p>
                    <p className="text-base font-semibold text-gray-900">
                      {request.products_count} عدد
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">روش پرداخت</p>
                    <p className="text-base font-semibold text-gray-900">
                      {getPaymentMethodText(request.payment_method)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">مبلغ کل</p>
                    <p className="text-base font-semibold text-green-600">
                      {formatCurrency(request.total_price)}
                    </p>
                  </div>
                </div>

                {request.freight_cost > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">هزینه حمل:</span>{" "}
                      {formatCurrency(request.freight_cost)}
                    </p>
                  </div>
                )}

                {request.address && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">آدرس:</span>{" "}
                      {request.address}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalItems > itemsPerPage && (
          <div className="mt-8">
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
    </div>
  );
}
