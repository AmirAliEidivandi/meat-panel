import {
  Archive,
  ArrowRight,
  Calculator,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Loader2,
  MoreVertical,
  Package,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatCurrency, formatDate } from "../lib/utils";
import { orderService } from "../services/api";
import type { OrderCargo, OrderDetails } from "../types";
import CargoDetails from "./CargoDetails";
import ChangeOrderStepModal from "./ChangeOrderStepModal";
import CreateDispatchCargoModal from "./CreateDispatchCargoModal";
import CreateReturnCargoModal from "./CreateReturnCargoModal";
import FulfillProductConfirmModal from "./FulfillProductConfirmModal";
import UpdateOrderHpCodeModal from "./UpdateOrderHpCodeModal";

// Helper functions
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

const getCustomerTypeText = (type: string): string => {
  const types: Record<string, string> = {
    PERSONAL: "شخصی",
    CORPORATE: "سازمانی",
  };
  return types[type] || type;
};

const getCustomerCategoryText = (category: string): string => {
  const categories: Record<string, string> = {
    RESTAURANT: "رستوران",
    HOTEL: "هتل",
    CHAIN_STORE: "فروشگاه زنجیره‌ای",
    GOVERNMENTAL: "دولتی",
    FAST_FOOD: "فست فود",
    CHARITY: "خیریه",
    BUTCHER: "قصابی",
    WHOLESALER: "عمده‌فروش",
    FELLOW: "همکار",
    CATERING: "کترینگ",
    KEBAB: "کبابی",
    DISTRIBUTOR: "پخش‌کننده",
    HOSPITAL: "بیمارستان",
    FACTORY: "کارخانه",
  };
  return categories[category] || category;
};

const getDayOfWeekText = (dayIndex: number): string => {
  const days: Record<number, string> = {
    0: "شنبه",
    1: "یکشنبه",
    2: "دوشنبه",
    3: "سه‌شنبه",
    4: "چهارشنبه",
    5: "پنج‌شنبه",
    6: "جمعه",
  };
  return days[dayIndex] || `روز ${dayIndex}`;
};

const getBehaviorTagsText = (tags: string[]): string[] => {
  const tagTranslations: Record<string, string> = {
    MANNERED: "خوش اخلاق",
    POLITE: "مودب",
    ANGRY: "عصبی",
    PATIENCE: "صبور",
    RUDE: "بی ادب",
    HASTY: "عجول",
  };
  return tags.map((tag) => tagTranslations[tag] || tag);
};

const getCargoTypeText = (type: string): string => {
  const types: Record<string, string> = {
    DISPATCH: "تحویل",
    RETURN: "مرجوعی",
  };
  return types[type] || type;
};

export default function OrderDetails() {
  const navigate = useNavigate();
  const { id: orderId } = useParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCargo, setSelectedCargo] = useState<OrderCargo | null>(null);
  const [showChangeStepModal, setShowChangeStepModal] = useState(false);
  const [showCreateDispatchModal, setShowCreateDispatchModal] = useState(false);
  const [showCreateReturnModal, setShowCreateReturnModal] = useState(false);
  const [selectedDispatchForReturn, setSelectedDispatchForReturn] =
    useState<OrderCargo | null>(null);
  const [showUpdateHpCodeModal, setShowUpdateHpCodeModal] = useState(false);
  const [changingPaymentStatus, setChangingPaymentStatus] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [fulfillProductModal, setFulfillProductModal] = useState<{
    isOpen: boolean;
    productId: string;
    productTitle: string;
  }>({
    isOpen: false,
    productId: "",
    productTitle: "",
  });

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError("");
      const response = await orderService.getOrderDetails(orderId);
      setOrder(response);
    } catch (err: any) {
      console.error("Error fetching order details:", err);
      setError("خطا در بارگذاری جزئیات سفارش");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentStatusChange = async (
    newStatus: "NOT_PAID" | "PARTIALLY_PAID" | "PAID"
  ) => {
    if (!orderId || !order) return;

    if (order.payment_status === newStatus) {
      return; // No change needed
    }

    try {
      setChangingPaymentStatus(true);
      setError("");
      await orderService.changePaymentStatus(orderId, newStatus);
      // Fetch full order details again to ensure all fields are present
      await fetchOrderDetails();
    } catch (err: any) {
      console.error("Error changing payment status:", err);
      setError(err.response?.data?.message || "خطا در تغییر وضعیت پرداخت");
    } finally {
      setChangingPaymentStatus(false);
    }
  };

  const handleArchiveOrder = async () => {
    if (!orderId || !order) return;

    try {
      setArchiving(true);
      await orderService.archiveOrder(orderId, !order.archived);
      await fetchOrderDetails();
    } catch (err: any) {
      console.error("Error archiving order:", err);
      setError("خطا در آرشیو کردن سفارش");
    } finally {
      setArchiving(false);
    }
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

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error || "سفارش یافت نشد"}</div>
        <button
          onClick={() => navigate("/manage/orders")}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          بازگشت به لیست سفارشات
        </button>
      </div>
    );
  }

  // If a cargo is selected, render CargoDetails
  if (selectedCargo) {
    return (
      <CargoDetails
        cargo={selectedCargo}
        onBack={() => setSelectedCargo(null)}
      />
    );
  }

  // Calculate totals
  const totalOrderedAmount = (order.ordered_basket || []).reduce(
    (sum, item) => sum + item.price * item.weight,
    0
  );
  const totalFulfilledAmount = (order.ordered_basket || []).reduce(
    (sum, item) => sum + item.price * (item.fulfilled_weight || 0),
    0
  );
  const totalFailedAmount = (order.failed_basket || []).reduce(
    (sum, item) => sum + item.price * item.weight,
    0
  );

  return (
    <div className="fade-in font-vazir max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/manage/orders")}
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت
        </button>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              جزئیات سفارش #{order.code}
            </h1>
            <p className="text-gray-500">
              مشتری:{" "}
              <span className="font-semibold text-gray-700">
                {order.customer?.title || "نامشخص"}
              </span>
            </p>
          </div>
          <div className="flex items-center space-x-reverse space-x-3">
            <span
              className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold ${
                order.bought
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {order.bought ? (
                <CheckCircle className="w-3 h-3 ml-1" />
              ) : (
                <XCircle className="w-3 h-3 ml-1" />
              )}
              {order.bought ? "خریداری شده" : "خریداری نشده"}
            </span>
            <span
              className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold ${
                order.fulfilled
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {order.fulfilled ? "تحویل شده" : "در انتظار تحویل"}
            </span>
            <span
              className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold ${getOrderStepColor(
                order.step
              )}`}
            >
              {getOrderStepText(order.step)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-reverse space-x-3">
          {order.step !== "DELIVERED" && (
            <button
              onClick={() => setShowChangeStepModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-reverse space-x-2 text-sm"
            >
              <Clock className="w-4 h-4" />
              <span>تغییر مرحله سفارش</span>
            </button>
          )}
          <div className="relative flex items-center">
            <CreditCard className="absolute right-3 w-4 h-4 text-white pointer-events-none z-10" />
            <select
              value={order.payment_status}
              onChange={(e) =>
                handlePaymentStatusChange(
                  e.target.value as "NOT_PAID" | "PARTIALLY_PAID" | "PAID"
                )
              }
              disabled={changingPaymentStatus}
              className="px-4 py-2 pr-10 pl-10 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "left 0.75rem center",
                paddingLeft: "2.5rem",
              }}
            >
              <option value="NOT_PAID">پرداخت نشده</option>
              <option value="PARTIALLY_PAID">پرداخت جزئی</option>
              <option value="PAID">پرداخت شده</option>
            </select>
            {changingPaymentStatus && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
            )}
          </div>
          {(order.step === "PROCESSING" ||
            order.step === "CARGO" ||
            order.step === "PARTIALLY_DELIVERED" ||
            order.step === "DELIVERED") && (
            <button
              onClick={() => setShowCreateDispatchModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center space-x-reverse space-x-2 text-sm"
            >
              <Truck className="w-4 h-4" />
              <span>ثبت مرسوله</span>
            </button>
          )}
          {order.step === "ACCOUNTING" && (
            <button
              onClick={() => setShowUpdateHpCodeModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center space-x-reverse space-x-2 text-sm"
            >
              <Calculator className="w-4 h-4" />
              <span>ثبت کد حسابداری</span>
            </button>
          )}
          <button
            onClick={handleArchiveOrder}
            disabled={archiving}
            className={`px-4 py-2 rounded-lg transition-colors font-semibold flex items-center space-x-reverse space-x-2 text-sm disabled:opacity-50 ${
              order.archived
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-amber-600 text-white hover:bg-amber-700"
            }`}
          >
            {archiving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>در حال پردازش...</span>
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                <span>
                  {order.archived ? "برگرداندن از آرشیو" : "آرشیو کردن"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900">محصولات موفق</h3>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-500">
              {(order.ordered_basket || []).length} محصول
            </p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalOrderedAmount)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="font-bold text-gray-900">محصولات ناموفق</h3>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-500">
              {(order.failed_basket || []).length} محصول
            </p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalFailedAmount)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">مجموع فاکتور شده</h3>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-500">مبلغ فاکتور شده</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalFulfilledAmount)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              مجموع کل: {formatCurrency(totalOrderedAmount + totalFailedAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Order Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">وضعیت سفارش</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1.5">مرحله</p>
              <span
                className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${getOrderStepColor(
                  order.step
                )}`}
              >
                {getOrderStepText(order.step)}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">وضعیت پرداخت</p>
              <span
                className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${getPaymentStatusColor(
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
            <div>
              <p className="text-xs text-gray-500 mb-1.5">وضعیت آرشیو</p>
              <p className="text-sm font-semibold text-gray-900">
                {order.archived ? "آرشیو شده" : "فعال"}
              </p>
            </div>
            {order.hp_invoice_code && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">کد حسابداری</p>
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-green-100 text-green-800">
                  <Calculator className="w-4 h-4 ml-1" />
                  {order.hp_invoice_code
                    ? typeof order.hp_invoice_code === "string"
                      ? order.hp_invoice_code
                      : String(order.hp_invoice_code)
                    : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">تاریخ‌ها</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1.5">تاریخ ایجاد</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(order.created_date)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">تاریخ تحویل</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(order.delivery_date)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">روز هفته</p>
              <p className="text-sm font-semibold text-gray-900">
                {getDayOfWeekText(order.day_index)}
              </p>
            </div>
          </div>
        </div>

        {/* Customer */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <User className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900">مشتری</h3>
          </div>
          <div className="space-y-4">
            {order.customer ? (
              <>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">نام</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {order.customer.title}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">کد مشتری</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {order.customer.code}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">نوع</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {getCustomerTypeText(order.customer.type)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">حوزه فعالیت</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {getCustomerCategoryText(order.customer.category)}
                  </p>
                </div>
                {order.customer.phone && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">تلفن</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {order.customer.phone}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">
                اطلاعات مشتری در دسترس نیست
              </p>
            )}
            {order.address && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">آدرس</p>
                <p className="text-sm font-semibold text-gray-900">
                  {order.address}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seller & Representative */}
      {order.seller && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-bold text-gray-900">فروشنده و نماینده</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1.5">فروشنده</p>
              <p className="text-sm font-semibold text-gray-900">
                {order.seller.profile.first_name}{" "}
                {order.seller.profile.last_name}
              </p>
            </div>
            {order.representative_name && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">نماینده</p>
                <p className="text-sm font-semibold text-gray-900">
                  {order.representative_name}
                </p>
              </div>
            )}
            {order.call_duration !== undefined && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">مدت تماس</p>
                <p className="text-sm font-semibold text-gray-900">
                  {order.call_duration} دقیقه
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 mb-1.5">پاسخ داده</p>
              <p className="text-sm font-semibold text-gray-900">
                {order.answered ? "بله" : "خیر"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">مشتری جدید</p>
              <p className="text-sm font-semibold text-gray-900">
                {order.new_customer ? "بله" : "خیر"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ordered Products */}
      {(order.ordered_basket || []).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-reverse space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900">محصولات سفارش شده</h3>
            </div>
            <div className="text-xs text-gray-500">
              مجموع سفارش: {formatCurrency(totalOrderedAmount)} | مجموع فاکتور:{" "}
              {formatCurrency(totalFulfilledAmount)}
            </div>
          </div>
          <div className="space-y-3">
            {(order.ordered_basket || []).map((item, index) => {
              const isPartiallyDelivered = order.step === "PARTIALLY_DELIVERED";
              const isNotFulfilled = !item.fulfilled;
              const showFulfillButton = isPartiallyDelivered && isNotFulfilled;

              return (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {item.product_title}
                      </h4>
                      <p className="text-xs text-gray-600">
                        کد محصول: {item.product_code}
                      </p>
                    </div>
                    <div className="flex items-center space-x-reverse space-x-3">
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.price * item.weight)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {item.weight} کیلوگرم × {formatCurrency(item.price)}
                        </p>
                      </div>
                      {showFulfillButton && (
                        <button
                          onClick={() =>
                            setFulfillProductModal({
                              isOpen: true,
                              productId: item.product_id,
                              productTitle: item.product_title,
                            })
                          }
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                          title="تحویل محصول"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-gray-600">وزن سفارش:</span>
                      <p className="font-semibold text-gray-900 mt-0.5">
                        {item.weight} کیلوگرم
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">وزن فاکتور شده:</span>
                      <p className="font-semibold text-gray-900 mt-0.5">
                        {item.fulfilled_weight || 0} کیلوگرم
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">مبلغ فاکتور شده:</span>
                      <p className="font-semibold text-gray-900 mt-0.5">
                        {formatCurrency(
                          item.price * (item.fulfilled_weight || 0)
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">درصد تحویل:</span>
                      <p className="font-semibold text-gray-900 mt-0.5">
                        {(
                          ((item.fulfilled_weight || 0) / item.weight) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>
                  {item.fulfilled_weight &&
                    item.fulfilled_weight < item.weight && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-xs text-yellow-800">
                          <span className="font-medium">اختلاف وزن:</span>{" "}
                          {item.weight - item.fulfilled_weight} کیلوگرم
                        </p>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Failed Products */}
      {(order.failed_basket || []).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="font-bold text-gray-900">
              محصولات ناموفق (مجموع: {formatCurrency(totalFailedAmount)})
            </h3>
          </div>
          <div className="space-y-3">
            {(order.failed_basket || []).map((item, index) => (
              <div
                key={index}
                className="bg-red-50 rounded-lg p-4 border border-red-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-red-900 mb-1">
                      {item.product_title}
                    </h4>
                    <p className="text-xs text-red-700">
                      کد محصول: {item.product_code}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-red-900">
                      {formatCurrency(item.price * item.weight)}
                    </p>
                    <p className="text-xs text-red-700">
                      {item.weight} کیلوگرم × {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-red-600">دلیل عدم خرید:</span>
                    <p className="font-medium text-red-800 mt-0.5">
                      {item.reason}
                    </p>
                  </div>
                  <div>
                    <span className="text-red-600">قفل شده:</span>
                    <p className="font-medium text-red-800 mt-0.5">
                      {item.locked ? "بله" : "خیر"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Behavior Tags */}
      {order.behavior_tags && order.behavior_tags.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">برچسب‌های رفتاری</h3>
          <div className="flex flex-wrap gap-2">
            {getBehaviorTagsText(order.behavior_tags).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cargos */}
      {(order.cargos || []).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <Truck className="w-4 h-4 text-teal-600" />
            </div>
            <h3 className="font-bold text-gray-900">مرسوله‌ها</h3>
          </div>
          <div className="space-y-3">
            {(order.cargos || []).map((cargo) => (
              <div
                key={cargo.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setSelectedCargo(cargo)}
                  >
                    <div className="flex items-center space-x-reverse space-x-2 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900">
                        مرسوله #{cargo.code}
                      </h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          cargo.type === "DISPATCH"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {getCargoTypeText(cargo.type)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-reverse space-x-4 text-xs text-gray-600">
                      <span>{formatDate(cargo.date)}</span>
                      <span>{cargo.products.length} محصول</span>
                    </div>
                  </div>
                  {cargo.type === "DISPATCH" && (
                    <div className="relative group">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDispatchForReturn(cargo);
                          setShowCreateReturnModal(true);
                        }}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                        title="ثبت مرجوعی"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                      <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        ثبت مرجوعی
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-600">روش تحویل:</span>
                    <p className="font-medium text-gray-900 mt-0.5">
                      {getDeliveryMethodText(cargo.delivery_method)}
                    </p>
                  </div>
                  {cargo.truck_license_plate && (
                    <div>
                      <span className="text-gray-600">پلاک ماشین:</span>
                      <p className="font-medium text-gray-900 mt-0.5">
                        {cargo.truck_license_plate}
                      </p>
                    </div>
                  )}
                  {cargo.truck_driver && (
                    <div>
                      <span className="text-gray-600">راننده:</span>
                      <p className="font-medium text-gray-900 mt-0.5">
                        {cargo.truck_driver.first_name}{" "}
                        {cargo.truck_driver.last_name}
                      </p>
                    </div>
                  )}
                </div>
                {cargo.description && (
                  <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-blue-800">
                      <span className="font-medium">توضیحات:</span>{" "}
                      {cargo.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {order.description && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">توضیحات</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
            {order.description}
          </p>
        </div>
      )}

      {/* Modals */}
      {order && (
        <>
          <ChangeOrderStepModal
            order={order}
            isOpen={showChangeStepModal}
            onClose={() => setShowChangeStepModal(false)}
            onSuccess={() => {
              fetchOrderDetails();
              setShowChangeStepModal(false);
            }}
          />
          <CreateDispatchCargoModal
            order={order}
            isOpen={showCreateDispatchModal}
            onClose={() => setShowCreateDispatchModal(false)}
            onSuccess={() => {
              fetchOrderDetails();
              setShowCreateDispatchModal(false);
            }}
          />
          {selectedDispatchForReturn && (
            <CreateReturnCargoModal
              order={order}
              dispatchCargo={selectedDispatchForReturn}
              isOpen={showCreateReturnModal}
              onClose={() => {
                setShowCreateReturnModal(false);
                setSelectedDispatchForReturn(null);
              }}
              onSuccess={() => {
                fetchOrderDetails();
                setShowCreateReturnModal(false);
                setSelectedDispatchForReturn(null);
              }}
            />
          )}
          <UpdateOrderHpCodeModal
            order={order}
            isOpen={showUpdateHpCodeModal}
            onClose={() => setShowUpdateHpCodeModal(false)}
            onSuccess={() => {
              fetchOrderDetails();
              setShowUpdateHpCodeModal(false);
            }}
          />
        </>
      )}

      {/* Fulfill Product Confirm Modal */}
      {order && orderId && (
        <FulfillProductConfirmModal
          isOpen={fulfillProductModal.isOpen}
          onClose={() =>
            setFulfillProductModal({
              isOpen: false,
              productId: "",
              productTitle: "",
            })
          }
          onSuccess={() => {
            fetchOrderDetails();
            setFulfillProductModal({
              isOpen: false,
              productId: "",
              productTitle: "",
            });
          }}
          orderId={orderId}
          productId={fulfillProductModal.productId}
          productTitle={fulfillProductModal.productTitle}
        />
      )}
    </div>
  );
}
