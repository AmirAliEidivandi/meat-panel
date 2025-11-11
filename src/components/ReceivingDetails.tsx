import {
  ArrowRight,
  Calendar,
  Download,
  FileText,
  Loader2,
  Package,
  Receipt,
  Truck,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatCurrency, formatDate } from "../lib/utils";
import { fileUrl, receivingService, warehouseService } from "../services/api";
import type { Receiving, WarehouseDetailsResponse } from "../types";

export default function ReceivingDetails() {
  const navigate = useNavigate();
  const { id: warehouseId, receivingId } = useParams<{
    id: string;
    receivingId: string;
  }>();
  const [warehouse, setWarehouse] = useState<WarehouseDetailsResponse | null>(
    null
  );
  const [receiving, setReceiving] = useState<Receiving | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (warehouseId && receivingId) {
      fetchWarehouseDetails();
      fetchReceivingDetails();
    }
  }, [warehouseId, receivingId]);

  const fetchWarehouseDetails = async () => {
    if (!warehouseId) return;

    try {
      const data = await warehouseService.getWarehouseById(warehouseId);
      setWarehouse(data);
    } catch (err: any) {
      console.error("Error fetching warehouse details:", err);
    }
  };

  const fetchReceivingDetails = async () => {
    if (!receivingId) return;

    try {
      setLoading(true);
      setError("");
      const data = await receivingService.getReceivingById(receivingId);
      setReceiving(data);
    } catch (err: any) {
      console.error("Error fetching receiving details:", err);
      setError("خطا در بارگذاری جزئیات ورودی");
    } finally {
      setLoading(false);
    }
  };

  const getSourceText = (source: string) => {
    const sourceMap: Record<string, string> = {
      PURCHASED: "خرید",
      RETURNED: "مرجوعی",
      INVENTORY: "انبار گردانی",
    };
    return sourceMap[source] || source;
  };

  const getSourceColor = (source: string) => {
    const colorMap: Record<string, string> = {
      PURCHASED: "bg-green-100 text-green-800",
      RETURNED: "bg-orange-100 text-orange-800",
      INVENTORY: "bg-blue-100 text-blue-800",
    };
    return colorMap[source] || "bg-gray-100 text-gray-800";
  };

  const getInvoiceTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      PURCHASE: "خرید",
      RETURN_FROM_PURCHASE: "بازگشت از خرید",
      SELL: "فروش",
    };
    return typeMap[type] || type;
  };

  const getInvoiceTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      PURCHASE: "bg-blue-100 text-blue-800",
      RETURN_FROM_PURCHASE: "bg-orange-100 text-orange-800",
      SELL: "bg-green-100 text-green-800",
    };
    return colorMap[type] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      NOT_PAID: "پرداخت نشده",
      PARTIALLY_PAID: "پرداخت جزئی",
      PAID: "پرداخت شده",
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      NOT_PAID: "bg-red-100 text-red-800",
      PARTIALLY_PAID: "bg-yellow-100 text-yellow-800",
      PAID: "bg-green-100 text-green-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  if (!warehouseId || !receivingId) {
    return (
      <div className="text-center py-12">
        <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">شناسه یافت نشد</p>
        <button
          onClick={() =>
            navigate(`/manage/warehouses/${warehouseId}/receivings`)
          }
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          بازگشت به لیست
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <span className="mr-3 text-gray-600 font-semibold">
          در حال بارگذاری...
        </span>
      </div>
    );
  }

  if (error || !receiving) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error || "ورودی یافت نشد"}</div>
        <button
          onClick={() =>
            navigate(`/manage/warehouses/${warehouseId}/receivings`)
          }
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          بازگشت به لیست
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in font-vazir max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() =>
            navigate(`/manage/warehouses/${warehouseId}/receivings`)
          }
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              جزئیات ورودی #{receiving.code}
            </h1>
            <p className="text-gray-500">{warehouse?.name || "انبار"}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold ${getSourceColor(
              receiving.source
            )}`}
          >
            {getSourceText(receiving.source)}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Truck className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900">کد ورودی</h3>
          </div>
          <p className="text-xl font-bold text-emerald-600">
            #{receiving.code}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">تاریخ ورودی</h3>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {formatDate(receiving.date)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">تعداد محصولات</h3>
          </div>
          <p className="text-xl font-bold text-purple-600">
            {receiving.products_count} محصول
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Truck className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-900">پلاک خودرو</h3>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {receiving.license_plate || "-"}
          </p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Customer Info */}
        {receiving.customer && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-reverse space-x-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900">اطلاعات مشتری</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1.5">نام مشتری</p>
                <p className="text-sm font-semibold text-gray-900">
                  {receiving.customer.title}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5">کد مشتری</p>
                <p className="text-sm font-semibold text-gray-900">
                  {receiving.customer.code}
                </p>
              </div>
              {receiving.customer.phone && (
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">تلفن</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {receiving.customer.phone}
                  </p>
                </div>
              )}
              {receiving.customer.address && (
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">آدرس</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {receiving.customer.address}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transport & Employee Info */}
        <div className="space-y-6">
          {/* Transport Info */}
          {receiving.license_plate && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-reverse space-x-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-gray-600" />
                </div>
                <h3 className="font-bold text-gray-900">اطلاعات حمل و نقل</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">پلاک خودرو</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {receiving.license_plate}
                  </p>
                </div>
                {receiving.driver_name && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">نام راننده</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {receiving.driver_name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Employee Info */}
          {receiving.employee && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-reverse space-x-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <User className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900">کارمند ثبت‌کننده</h3>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5">
                  نام و نام خانوادگی
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {receiving.employee.profile.first_name}{" "}
                  {receiving.employee.profile.last_name}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products List */}
      {receiving.products && receiving.products.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-900">
              محصولات ({receiving.products.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    نام محصول
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    وزن خالص (کیلوگرم)
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    وزن ناخالص (کیلوگرم)
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    قیمت خرید
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    مبلغ کل
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {receiving.products.map((product, index) => {
                  const totalPrice =
                    product.purchase_price * product.net_weight;
                  return (
                    <tr
                      key={product.product_id || index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 text-sm font-semibold text-gray-900 text-right">
                        {product.product_title}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 text-right">
                        {product.net_weight.toLocaleString("fa-IR")} کیلوگرم
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 text-right">
                        {product.gross_weight.toLocaleString("fa-IR")} کیلوگرم
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 text-right">
                        {formatCurrency(product.purchase_price)}
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-green-700 text-right">
                        {formatCurrency(totalPrice)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td
                    colSpan={4}
                    className="px-4 py-4 text-right text-sm font-bold text-gray-900"
                  >
                    جمع کل:
                  </td>
                  <td className="px-4 py-4 text-lg font-bold text-green-700 text-right">
                    {formatCurrency(
                      receiving.products.reduce(
                        (sum, product) =>
                          sum + product.purchase_price * product.net_weight,
                        0
                      )
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Invoices List */}
      {receiving.invoices && receiving.invoices.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-900">
              فاکتورهای مرتبط ({receiving.invoices.length})
            </h3>
          </div>
          <div className="space-y-3">
            {receiving.invoices.map((invoice) => (
              <div
                key={invoice.id}
                onClick={() => navigate(`/manage/invoices/${invoice.id}`)}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-reverse space-x-3 mb-2">
                      <p className="font-bold text-gray-900">
                        فاکتور #{invoice.code}
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${getInvoiceTypeColor(
                          invoice.type
                        )}`}
                      >
                        {getInvoiceTypeText(invoice.type)}
                      </span>
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${getPaymentStatusColor(
                          invoice.payment_status
                        )}`}
                      >
                        {getPaymentStatusText(invoice.payment_status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center space-x-reverse space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {formatDate(invoice.date)}
                        </span>
                      </div>
                      {invoice.due_date && (
                        <div className="flex items-center space-x-reverse space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            سررسید: {formatDate(invoice.due_date)}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600 font-semibold">
                          مبلغ: {formatCurrency(invoice.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Total Invoices Amount */}
          <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">
                جمع کل فاکتورها:
              </span>
              <span className="text-lg font-bold text-green-700">
                {formatCurrency(
                  receiving.invoices.reduce(
                    (sum, invoice) => sum + invoice.amount,
                    0
                  )
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Files */}
      {(receiving.waybill ||
        receiving.veterinary ||
        receiving.origin_scale ||
        receiving.destination_scale ||
        (receiving.other_files && receiving.other_files.length > 0)) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900">فایل‌های ضمیمه</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {receiving.waybill && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      بارنامه
                    </p>
                    <p className="text-xs text-gray-600">{""}</p>
                  </div>
                  <a
                    href={fileUrl(receiving.waybill.url) ?? ""}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5 text-gray-600" />
                  </a>
                </div>
              </div>
            )}
            {receiving.veterinary && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      گواهی دامپزشکی
                    </p>
                    <p className="text-xs text-gray-600">{""}</p>
                  </div>
                  <a
                    href={fileUrl(receiving.veterinary.url) ?? ""}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5 text-gray-600" />
                  </a>
                </div>
              </div>
            )}
            {receiving.origin_scale && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      ترازو مبدا
                    </p>
                    <p className="text-xs text-gray-600">{""}</p>
                  </div>
                  <a
                    href={fileUrl(receiving.origin_scale.url) ?? ""}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5 text-gray-600" />
                  </a>
                </div>
              </div>
            )}
            {receiving.destination_scale && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      ترازو مقصد
                    </p>
                    <p className="text-xs text-gray-600">{""}</p>
                  </div>
                  <a
                    href={fileUrl(receiving.destination_scale.url) ?? ""}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5 text-gray-600" />
                  </a>
                </div>
              </div>
            )}
            {receiving.other_files &&
              receiving.other_files.length > 0 &&
              receiving.other_files.map((file, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        فایل دیگر #{index + 1}
                      </p>
                      <p className="text-xs text-gray-600">{""}</p>
                    </div>
                    <a
                      href={fileUrl(file.url) ?? ""}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5 text-gray-600" />
                    </a>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
