import { FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../lib/utils";
import { returnRequestService } from "../services/api";
import type { QueryReturnRequestsDto } from "../types";
import Pagination from "./Pagination";

export default function ReturnRequests() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchItems();
  }, [currentPage]);

  useEffect(() => {
    // when filters change reset to first page
    setCurrentPage(1);
    fetchItems();
  }, [statusFilter, searchTerm]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");

      const query: QueryReturnRequestsDto = {
        page: currentPage,
        "page-size": pageSize,
      };

      if (statusFilter) query.status = statusFilter;
      if (searchTerm) query.request_id = searchTerm;

      const response = await returnRequestService.getAllReturnRequests(query);

      if (response && Array.isArray(response.data)) {
        setItems(response.data);
        setTotalCount(response.count || 0);
      } else {
        setItems([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      console.error("Error fetching return requests", err);
      setError(
        err?.response?.data?.message || "خطا در دریافت درخواست‌های مرجوعی"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Translate status codes to Persian labels
  const getStatusText = (status: string | undefined) => {
    if (!status) return "-";
    const map: Record<string, string> = {
      PENDING: "در انتظار",
      APPROVED: "تأیید شده",
      REJECTED: "رد شده",
      RECEIVED: "دریافت شده",
    };
    return map[status] || status;
  };

  return (
    <div className="space-y-6 font-vazir fade-in">
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center space-x-reverse space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              درخواست های مرجوعی
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {totalCount} درخواست یافت شد
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              جستجو (کد درخواست)
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="کد درخواست..."
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              وضعیت
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            >
              <option value="">همه</option>
              <option value="PENDING">در انتظار</option>
              <option value="APPROVED">تأیید شده</option>
              <option value="REJECTED">رد شده</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
          <span className="mr-3 text-gray-600 font-semibold">
            در حال بارگذاری...
          </span>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    کد درخواست
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    مشتری
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    سفارش
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    تعداد آیتم‌ها
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
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      #{item.request?.code ?? ""}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {item.customer?.title ||
                        `مشتری ${item.customer?.code ?? ""}`}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {item.order?.code ? `#${item.order.code}` : "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {item.return_items_count ?? 0}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {getStatusText(item.status)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() =>
                          navigate(`/manage/return-requests/${item.id}`)
                        }
                        className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors text-sm font-semibold"
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

      {!loading && items.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold">
            درخواستی یافت نشد
          </p>
        </div>
      )}

      {!loading && items.length > 0 && (
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
