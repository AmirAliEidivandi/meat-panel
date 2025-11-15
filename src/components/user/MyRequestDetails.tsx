import {
  ArrowRight,
  Clock,
  CreditCard,
  FileText,
  Loader2,
  Package,
  Receipt,
  RefreshCw,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatCurrency, formatDate } from "../../lib/utils";
import { fileUrl, myRequestsService } from "../../services/api";
import type { MyRequestDetailsResponse } from "../../types";

export default function MyRequestDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<MyRequestDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchRequestDetails();
    }
  }, [id]);

  const fetchRequestDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");
      const data = await myRequestsService.getMyRequestById(id);
      setRequest(data);
    } catch (err: any) {
      console.error("Error fetching request details:", err);
      setError("خطا در بارگذاری جزئیات درخواست");
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

  const getOrderStepText = (step: string): string => {
    const steps: Record<string, string> = {
      SELLER: "فروشنده",
      SALES_MANAGER: "مدیر فروش",
      PROCESSING: "آماده سازی",
      INVENTORY: "انبار",
      ACCOUNTING: "حسابداری",
      CARGO: "مرسوله",
      PARTIALLY_DELIVERED: "تحویل جزئی",
      DELIVERED: "تحویل داده شده",
      PARTIALLY_RETURNED: "مرجوعی جزئی",
      RETURNED: "مرجوعی کامل",
    };
    return steps[step] || step;
  };

  const getOrderStepColor = (step: string): string => {
    const colorMap: Record<string, string> = {
      SELLER: "bg-blue-100 text-blue-800",
      SALES_MANAGER: "bg-purple-100 text-purple-800",
      PROCESSING: "bg-yellow-100 text-yellow-800",
      INVENTORY: "bg-indigo-100 text-indigo-800",
      ACCOUNTING: "bg-green-100 text-green-800",
      CARGO: "bg-teal-100 text-teal-800",
      PARTIALLY_DELIVERED: "bg-orange-100 text-orange-800",
      DELIVERED: "bg-emerald-100 text-emerald-800",
      PARTIALLY_RETURNED: "bg-red-100 text-red-800",
      RETURNED: "bg-gray-100 text-gray-800",
    };
    return colorMap[step] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusText = (status: string): string => {
    const statuses: Record<string, string> = {
      PAID: "پرداخت شده",
      NOT_PAID: "پرداخت نشده",
      PARTIALLY_PAID: "پرداخت جزئی",
    };
    return statuses[status] || status;
  };

  const getPaymentStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      PAID: "bg-green-100 text-green-800",
      NOT_PAID: "bg-red-100 text-red-800",
      PARTIALLY_PAID: "bg-yellow-100 text-yellow-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  const getDeliveryMethodText = (method: string): string => {
    const methods: Record<string, string> = {
      AT_INVENTORY: "درب انبار",
      FREE_OUR_TRUCK: "رایگان با ماشین شرکت",
      FREE_OTHER_SERVICES: "رایگان با سرویس خارجی",
      PAID: "ارسال با هزینه مشتری",
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        <span className="mr-3 text-gray-600 font-semibold">
          در حال بارگذاری...
        </span>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4 font-semibold">
          {error || "درخواست یافت نشد"}
        </div>
        <button
          onClick={() => navigate("/user/requests")}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
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
          onClick={() => navigate("/user/requests")}
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت
        </button>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              جزئیات درخواست{" "}
              {request.code ? `#${request.code}` : request.id.slice(0, 8)}
            </h1>
            <p className="text-gray-500">
              تاریخ ایجاد:{" "}
              <span className="font-semibold text-gray-700">
                {formatDate(request.created_at)}
              </span>
            </p>
          </div>
          <div className="flex items-center space-x-reverse space-x-3">
            <span
              className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold ${getStatusColor(
                request.status
              )}`}
            >
              {getStatusText(request.status)}
            </span>
            <button
              onClick={fetchRequestDetails}
              className="inline-flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              بروزرسانی
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-900">وضعیت</h3>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${getStatusColor(
              request.status
            )}`}
          >
            {getStatusText(request.status)}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">روش پرداخت</h3>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {getPaymentMethodText(request.payment_method)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900">تعداد محصولات</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {request.products_count}
          </p>
        </div>
      </div>

      {/* Request Items */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          محصولات درخواست
        </h2>
        {request.request_items &&
        Array.isArray(request.request_items) &&
        request.request_items.length > 0 ? (
          <div className="space-y-4">
            {request.request_items.map((item, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start space-x-reverse space-x-4">
                  {/* Product Image */}
                  {item.images &&
                    Array.isArray(item.images) &&
                    item.images.length > 0 && (
                      <div className="flex-shrink-0">
                        <img
                          src={
                            fileUrl(
                              item.images[0].thumbnail || item.images[0].url
                            ) || ""
                          }
                          alt={item.product_title}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-gray-900 mb-3">
                      {item.product_title}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">کد محصول</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.product_code}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          وزن (کیلوگرم)
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.weight}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">قیمت واحد</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.online_price)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">قیمت کل</p>
                        <p className="text-sm font-semibold text-green-600">
                          {formatCurrency(item.total_price)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            محصولی در این درخواست وجود ندارد
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">خلاصه درخواست</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">تعداد محصولات</p>
            <p className="text-lg font-semibold text-gray-900">
              {request.products_count} عدد
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">هزینه حمل</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(request.freight_cost)}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 mb-1">مبلغ کل</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(request.total_price)}
            </p>
          </div>
          {request.address && (
            <div className="md:col-span-2 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-1">آدرس</p>
              <p className="text-base font-semibold text-gray-900">
                {request.address}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Orders Status */}
      {request.orders &&
        Array.isArray(request.orders) &&
        request.orders.length > 0 && (
          <div className="mb-6">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
              <div className="flex items-center space-x-reverse space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    وضعیت سفارشات
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    تعداد سفارشات: {request.orders.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {request.orders.map((order, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border-2 border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        سفارش #{order.code}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        سفارش شماره {index + 1}
                      </p>
                    </div>
                    {/* Payment Button - Show if order is PARTIALLY_DELIVERED and not fully paid */}
                    {order.step === "PARTIALLY_DELIVERED" &&
                      order.payment_status !== "PAID" && (
                        <button
                          onClick={() =>
                            navigate(`/user/orders/${order.id}/invoice/payment`)
                          }
                          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all font-semibold flex items-center space-x-reverse space-x-2 shadow-lg"
                        >
                          <Receipt className="w-5 h-5" />
                          <span>پرداخت فاکتور</span>
                        </button>
                      )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Order Step */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-reverse space-x-2 mb-3">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <p className="text-sm font-semibold text-gray-700">
                          مرحله سفارش
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${getOrderStepColor(
                          order.step
                        )}`}
                      >
                        {getOrderStepText(order.step)}
                      </span>
                    </div>

                    {/* Payment Status */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-reverse space-x-2 mb-3">
                        <CreditCard className="w-4 h-4 text-gray-600" />
                        <p className="text-sm font-semibold text-gray-700">
                          وضعیت پرداخت
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${getPaymentStatusColor(
                          order.payment_status
                        )}`}
                      >
                        {getPaymentStatusText(order.payment_status)}
                      </span>
                    </div>

                    {/* Delivery Method */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-reverse space-x-2 mb-3">
                        <Truck className="w-4 h-4 text-gray-600" />
                        <p className="text-sm font-semibold text-gray-700">
                          روش تحویل
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {getDeliveryMethodText(order.delivery_method)}
                      </p>
                    </div>

                    {/* Order Address */}
                    {order.address && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center space-x-reverse space-x-2 mb-3">
                          <Package className="w-4 h-4 text-gray-600" />
                          <p className="text-sm font-semibold text-gray-700">
                            آدرس تحویل
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {order.address}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {order.description && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                      <div className="flex items-center space-x-reverse space-x-2 mb-2">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <p className="text-sm font-semibold text-gray-700">
                          توضیحات
                        </p>
                      </div>
                      <p className="text-sm text-gray-900">
                        {order.description}
                      </p>
                    </div>
                  )}

                  {/* Invoice Information */}
                  {order.invoices &&
                    Array.isArray(order.invoices) &&
                    order.invoices.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-bold text-gray-900">
                          اطلاعات فاکتورها ({order.invoices.length})
                        </h4>
                        {order.invoices.map((invoice, invoiceIndex) => (
                          <div
                            key={invoiceIndex}
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="text-base font-semibold text-gray-800">
                                فاکتور #{invoice.code}
                              </h5>
                              <p className="text-sm text-gray-600">
                                فاکتور شماره {invoiceIndex + 1}
                              </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-gray-600 mb-1">
                                  کد فاکتور
                                </p>
                                <p className="text-base font-semibold text-gray-900">
                                  #{invoice.code}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-1">
                                  مبلغ فاکتور
                                </p>
                                <p className="text-base font-semibold text-green-600">
                                  {formatCurrency(invoice.amount)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-1">
                                  وضعیت پرداخت فاکتور
                                </p>
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${getPaymentStatusColor(
                                    invoice.payment_status
                                  )}`}
                                >
                                  {getPaymentStatusText(invoice.payment_status)}
                                </span>
                              </div>
                              {invoice.description && (
                                <div className="md:col-span-3 pt-4 border-t border-blue-200">
                                  <p className="text-sm text-gray-600 mb-1">
                                    توضیحات فاکتور
                                  </p>
                                  <p className="text-base text-gray-900">
                                    {invoice.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
