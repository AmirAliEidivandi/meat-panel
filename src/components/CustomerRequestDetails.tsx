import {
  ArrowRight,
  Calendar,
  Clock,
  CreditCard,
  Loader2,
  Package,
  ShoppingCart,
  Truck,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatCurrency, formatDate } from "../lib/utils";
import { historyService } from "../services/api";
import type { CustomerRequestDetails } from "../types";
import CreateOrderFromRequestModal from "./CreateOrderFromRequestModal";

export default function CustomerRequestDetails() {
  const navigate = useNavigate();
  const { id: requestId } = useParams();
  const [request, setRequest] = useState<CustomerRequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId]);

  const fetchRequestDetails = async () => {
    if (!requestId) return;

    try {
      setLoading(true);
      setError("");
      const data = await historyService.getCustomerRequestById(requestId);
      setRequest(data);
    } catch (err: any) {
      console.error("Error fetching customer request details:", err);
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

  const getOrderStatusText = (step: string) => {
    const statusMap: Record<string, string> = {
      PENDING: "در انتظار",
      CONFIRMED: "تایید شده",
      PREPARING: "در حال آماده‌سازی",
      READY: "آماده",
      DELIVERED: "تحویل داده شده",
      CANCELLED: "لغو شده",
    };
    return statusMap[step] || step;
  };

  const getOrderStatusColor = (step: string) => {
    const colorMap: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      PREPARING: "bg-purple-100 text-purple-800",
      READY: "bg-green-100 text-green-800",
      DELIVERED: "bg-emerald-100 text-emerald-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colorMap[step] || "bg-gray-100 text-gray-800";
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

  const getDeliveryMethodText = (method: string) => {
    const methodMap: Record<string, string> = {
      AT_INVENTORY: "درب انبار",
      FREE_OUR_TRUCK: "رایگان با ماشین شرکت",
      FREE_OTHER_SERVICES: "رایگان با سرویس خارجی",
      PAID: "ارسال با هزینه مشتری",
    };
    return methodMap[method] || method;
  };

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

  if (error || !request) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error || "درخواست یافت نشد"}</div>
        <button
          onClick={() => navigate("/manage/customer-requests")}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          بازگشت به لیست درخواست‌ها
        </button>
      </div>
    );
  }

  const totalPrice = request.total_price || 0;
  const freightCost = request.freight_cost || 0;
  const finalTotal = totalPrice + freightCost;

  return (
    <div className="fade-in font-vazir max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/manage/customer-requests")}
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              جزئیات درخواست مشتری
            </h1>
            <p className="text-gray-500">
              کد درخواست:{" "}
              <span className="font-semibold text-gray-700">
                {request.code}
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
            {request.status === "PENDING" && (
              <button
                onClick={() => setShowCreateOrderModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-reverse space-x-2 text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>ساخت سفارش</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <h3 className="font-bold text-gray-900">وضعیت</h3>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {getStatusText(request.status)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900">قیمت کل محصولات</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalPrice)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Truck className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">هزینه حمل</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(freightCost)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-900">مجموع کل</h3>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(finalTotal)}
          </p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">مشتری</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1.5">نام</p>
              <p className="text-sm font-semibold text-gray-900">
                {request.customer.title || "نامشخص"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">کد مشتری</p>
              <p className="text-sm font-semibold text-gray-900">
                {request.customer.code}
              </p>
            </div>
            {request.customer.phone && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">تلفن</p>
                <p className="text-sm font-semibold text-gray-900">
                  {request.customer.phone}
                </p>
              </div>
            )}
            {request.customer.address && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">آدرس</p>
                <p className="text-sm font-semibold text-gray-900">
                  {request.customer.address}
                </p>
              </div>
            )}
            {request.representative_name && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">نماینده</p>
                <p className="text-sm font-semibold text-gray-900">
                  {request.representative_name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Request Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">جزئیات درخواست</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1.5">کد درخواست</p>
              <p className="text-sm font-semibold text-gray-900">
                {request.code}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">تاریخ ایجاد</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(request.created_at)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">روش پرداخت</p>
              <p className="text-sm font-semibold text-gray-900">
                {getPaymentMethodText(request.payment_method)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">تعداد آیتم</p>
              <p className="text-sm font-semibold text-gray-900">
                {request.request_items.length} محصول
              </p>
            </div>
            {request.address && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">آدرس تحویل</p>
                <p className="text-sm font-semibold text-gray-900">
                  {request.address}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-reverse space-x-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <Package className="w-4 h-4 text-orange-600" />
          </div>
          <h3 className="font-bold text-gray-900">
            محصولات درخواستی ({request.request_items.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                  کد محصول
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                  نام محصول
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                  وزن (کیلوگرم)
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                  قیمت واحد
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                  قیمت کل
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {request.request_items.map((item, index) => (
                <tr
                  key={item.product_id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {item.product_code}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {item.product_title}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center">
                    {item.weight.toLocaleString("fa-IR")} کیلوگرم
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center">
                    {formatCurrency(item.online_price)}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-green-700 text-center">
                    {formatCurrency(item.total_price)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-3 text-right text-sm font-bold"
                >
                  مجموع کل:
                </td>
                <td className="px-4 py-3 text-sm font-bold text-green-700 text-center">
                  {formatCurrency(totalPrice)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Related Orders */}
      {request.orders && request.orders.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">
              سفارشات مرتبط ({request.orders.length})
            </h3>
          </div>
          <div className="space-y-4">
            {request.orders.map((order, index) => {
              const orderTotal = order.ordered_basket.reduce(
                (sum, item) =>
                  sum + item.price * (item.fulfilled_weight || item.weight),
                0
              );
              const fulfilledWeight = order.ordered_basket.reduce(
                (sum, item) => sum + (item.fulfilled_weight || 0),
                0
              );
              const totalWeight = order.ordered_basket.reduce(
                (sum, item) => sum + item.weight,
                0
              );

              return (
                <div
                  key={order.id}
                  className="bg-gray-50 rounded-lg p-5 border border-gray-200"
                >
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-reverse space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900">
                          سفارش #{index + 1}
                        </h4>
                        <p className="text-xs text-gray-600">
                          ID: {order.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/manage/orders/${order.id}`)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-semibold"
                    >
                      مشاهده
                    </button>
                  </div>

                  {/* Order Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">
                        وضعیت سفارش
                      </p>
                      <span
                        className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold ${getOrderStatusColor(
                          order.step
                        )}`}
                      >
                        {getOrderStatusText(order.step)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">
                        وضعیت پرداخت
                      </p>
                      <span
                        className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold ${getPaymentStatusColor(
                          order.payment_status
                        )}`}
                      >
                        {getPaymentStatusText(order.payment_status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">روش تحویل</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {getDeliveryMethodText(order.delivery_method)}
                      </p>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">
                        تاریخ ایجاد
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    {order.delivery_date && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          تاریخ تحویل
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(order.delivery_date)}
                        </p>
                      </div>
                    )}
                    {order.address && (
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-500 mb-1.5">
                          آدرس تحویل
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {order.address}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-3">
                      خلاصه محصولات ({order.ordered_basket.length} آیتم)
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">وزن کل</p>
                        <p className="text-sm font-bold text-gray-900">
                          {totalWeight.toLocaleString("fa-IR")} کیلوگرم
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          وزن تحویل شده
                        </p>
                        <p className="text-sm font-bold text-green-700">
                          {fulfilledWeight.toLocaleString("fa-IR")} کیلوگرم
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">مبلغ کل</p>
                        <p className="text-sm font-bold text-blue-700">
                          {formatCurrency(orderTotal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">درصد تحویل</p>
                        <p className="text-sm font-bold text-purple-700">
                          {totalWeight > 0
                            ? Math.round((fulfilledWeight / totalWeight) * 100)
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Table */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                            محصول
                          </th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                            وزن درخواستی
                          </th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                            وزن تحویل شده
                          </th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                            قیمت واحد
                          </th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                            مبلغ کل
                          </th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                            وضعیت
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {order.ordered_basket.map((item, itemIndex) => (
                          <tr
                            key={item.product_id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-3 py-2 text-xs font-medium text-gray-900">
                              {item.product_title}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-700">
                              {item.weight.toLocaleString("fa-IR")} کیلوگرم
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-700">
                              {item.fulfilled_weight
                                ? `${item.fulfilled_weight.toLocaleString(
                                    "fa-IR"
                                  )} کیلوگرم`
                                : "-"}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-700">
                              {formatCurrency(item.online_price)}
                            </td>
                            <td className="px-3 py-2 text-xs font-bold text-green-700">
                              {formatCurrency(
                                item.price *
                                  (item.fulfilled_weight || item.weight)
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${
                                  item.fulfilled
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {item.fulfilled ? "تحویل شده" : "در انتظار"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {request && (
        <CreateOrderFromRequestModal
          request={request}
          isOpen={showCreateOrderModal}
          onClose={() => setShowCreateOrderModal(false)}
          onSuccess={(orderId) => {
            navigate(`/manage/orders/${orderId}`);
          }}
        />
      )}
    </div>
  );
}
