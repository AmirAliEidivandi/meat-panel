import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatCurrency, formatDate } from "../lib/utils";
import { returnRequestService } from "../services/api";
import type { ReturnRequestDetailsResponse } from "../types";

export default function ReturnRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<ReturnRequestDetailsResponse | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchDetails(id);
  }, [id]);

  const fetchDetails = async (requestId: string) => {
    try {
      setLoading(true);
      setError("");
      const resp = await returnRequestService.getReturnRequestById(requestId);
      setData(resp);
    } catch (err: any) {
      console.error("Failed to load return request details", err);
      setError(err?.response?.data?.message || "خطا در دریافت جزئیات درخواست");
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status?: string) => {
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                جزئیات درخواست مرجوعی
              </h1>
              <p className="text-sm text-gray-600 mt-1">شناسه: {id}</p>
            </div>
          </div>
          <div>
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center space-x-reverse space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              بازگشت
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
          <span className="mr-3 text-gray-600 font-semibold">
            در حال بارگذاری...
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      )}

      {!loading && data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-3">اطلاعات کلی</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <div>
                <strong className="font-medium">وضعیت:</strong>{" "}
                {getStatusText(data.status)}
              </div>
              <div>
                <strong className="font-medium">دلیل:</strong>{" "}
                {data.reason || "-"}
              </div>
              <div>
                <strong className="font-medium">توضیحات:</strong>{" "}
                {data.description || "-"}
              </div>
              <div>
                <strong className="font-medium">ایجاد شده در:</strong>{" "}
                {formatDate(data.created_at)}
              </div>
              <div>
                <strong className="font-medium">آخرین بروزرسانی:</strong>{" "}
                {formatDate(data.updated_at)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">سفارش و مشتری</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold">مشتری</h3>
                <p className="text-sm text-gray-700">
                  {data.customer?.title || "-"} (کد: {data.customer?.code})
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold">سفارش</h3>
                <p className="text-sm text-gray-700">
                  کد سفارش: #{data.order?.code}
                </p>
                <p className="text-sm text-gray-700">
                  آدرس: {data.order?.address || "-"}
                </p>
                <p className="text-sm text-gray-700">
                  ایجاد شده در: {formatDate(data.order?.created_at)}
                </p>
                <p className="text-sm text-gray-700">
                  مرحله: {data.order?.step}
                </p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-3">
              درخواست مرجوعی و آیتم‌ها
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-right">محصول</th>
                    <th className="px-4 py-2 text-right">وزن</th>
                    <th className="px-4 py-2 text-right">قیمت آنلاین</th>
                    <th className="px-4 py-2 text-right">قیمت کل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.isArray(data.return_items) &&
                  data.return_items.length > 0 ? (
                    data.return_items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-right">
                          {it.product_title}
                        </td>
                        <td className="px-4 py-3 text-right">{it.weight}</td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(it.online_price)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(it.total_price)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        آیتمی یافت نشد
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
