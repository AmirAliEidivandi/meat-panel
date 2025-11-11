import {
  ArrowRight,
  FileText,
  Loader2,
  ShoppingCart,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatCurrency, formatDate } from "../lib/utils";
import { historyService } from "../services/api";

// Interfaces
interface OrderBasket {
  id?: string;
  order_id?: string;
  product_id?: string;
  price?: number;
  weight?: number;
  cancelled_weight?: number | null;
  inventory_net_weight?: number | null;
  fulfilled_weight?: number | null;
  returned_weight?: number | null;
  fulfilled?: boolean;
  product_title?: string;
  product_code?: number | string;
  online_price?: number;
  retail_price?: number;
  wholesale_price?: number;
  sec_unit_amount?: number;
  product?: {
    id: string;
    title: string;
    code: number;
    description?: string;
  };
}

interface FailedBasket {
  price: number;
  weight: number;
  not_purchased_reason: string | null;
  retail_price: number;
  wholesale_price: number;
  online_price: number;
  locked: boolean;
  product_id: string;
  product_title: string;
}

interface Order {
  id: string;
  code: number;
  total_price: number;
  customer_id: string;
  seller_id: string | null;
  warehouse_id: string;
  branch_id: string;
  step: string;
  payment_status: string;
  delivery_date: string | null;
  delivery_method: string;
  fulfilled: boolean;
  archived: boolean;
  customer: {
    id: string;
    title: string | null;
    code: number;
    type?: string;
    category?: string;
    phone?: string;
    address?: string;
  };
  seller: {
    id: string;
    profile: {
      id: string;
      kid: string;
      first_name: string | null;
      last_name: string | null;
    };
  } | null;
  warehouse: {
    id: string;
    name: string;
    code?: number;
    address?: string;
  } | null;
  branch: {
    id: string;
    name: string;
    address?: string;
    locked?: boolean;
  } | null;
  ordered_basket: OrderBasket[];
  failed_basket: FailedBasket[];
  created_at: string;
  updated_at: string;
}

interface OrderHistoryDetailsData {
  id: string;
  order_id: string | null;
  old_order: any;
  new_order: any;
  employee_id: string | null;
  by_system: boolean;
  change_type: string | null;
  step_before: string | null;
  step_after: string | null;
  payment_status_before: string | null;
  payment_status_after: string | null;
  fulfilled_before: boolean | null;
  fulfilled_after: boolean | null;
  archived_before: boolean | null;
  archived_after: boolean | null;
  delivery_date_before: string | null;
  delivery_date_after: string | null;
  delivery_method_before: string | null;
  delivery_method_after: string | null;
  reason: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
  order: Order | null;
  employee: {
    id: string;
    profile: {
      id: string;
      kid: string;
      first_name: string | null;
      last_name: string | null;
    };
  } | null;
}

// Helper functions
const getChangeTypeText = (changeType: string | null): string => {
  const types: Record<string, string> = {
    CREATED: "ایجاد سفارش",
    STEP_CHANGED: "تغییر مرحله",
    PAYMENT_STATUS_CHANGED: "تغییر وضعیت پرداخت",
    FULFILLED_STATUS_CHANGED: "تغییر وضعیت تحویل",
    ARCHIVED_STATUS_CHANGED: "تغییر وضعیت آرشیو",
    DELIVERY_DATE_CHANGED: "تغییر تاریخ تحویل",
    DELIVERY_METHOD_CHANGED: "تغییر روش تحویل",
    SELLER_CHANGED: "تغییر فروشنده",
    VISITOR_CHANGED: "تغییر بازدیدکننده",
    WAREHOUSE_CHANGED: "تغییر انبار",
    PRODUCTS_CHANGED: "تغییر محصولات",
    CUSTOMER_CHANGED: "تغییر مشتری",
    DELETED: "حذف سفارش",
    RESTORED: "بازیابی سفارش",
  };
  return types[changeType || ""] || "تغییر نامشخص";
};

const getChangeTypeColor = (changeType: string | null): string => {
  const colorMap: Record<string, string> = {
    CREATED: "bg-green-100 text-green-800",
    STEP_CHANGED: "bg-blue-100 text-blue-800",
    PAYMENT_STATUS_CHANGED: "bg-yellow-100 text-yellow-800",
    FULFILLED_STATUS_CHANGED: "bg-purple-100 text-purple-800",
    ARCHIVED_STATUS_CHANGED: "bg-gray-100 text-gray-800",
    DELIVERY_DATE_CHANGED: "bg-indigo-100 text-indigo-800",
    DELIVERY_METHOD_CHANGED: "bg-teal-100 text-teal-800",
    SELLER_CHANGED: "bg-pink-100 text-pink-800",
    DELETED: "bg-red-100 text-red-800",
    RESTORED: "bg-emerald-100 text-emerald-800",
  };
  return colorMap[changeType || ""] || "bg-gray-100 text-gray-800";
};

const getStepText = (step: string | null): string => {
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
  return steps[step || ""] || step || "نامشخص";
};

const getStepColor = (step: string | null): string => {
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
  return colorMap[step || ""] || "bg-gray-100 text-gray-800";
};

const getPaymentStatusText = (status: string | null): string => {
  const statuses: Record<string, string> = {
    NOT_PAID: "پرداخت نشده",
    PARTIALLY_PAID: "پرداخت جزئی",
    PAID: "پرداخت شده",
  };
  return statuses[status || ""] || status || "نامشخص";
};

const getPaymentStatusColor = (status: string | null): string => {
  const colorMap: Record<string, string> = {
    PAID: "bg-green-100 text-green-800",
    NOT_PAID: "bg-red-100 text-red-800",
    PARTIALLY_PAID: "bg-yellow-100 text-yellow-800",
  };
  return colorMap[status || ""] || "bg-gray-100 text-gray-800";
};

const getDeliveryMethodText = (method: string | null): string => {
  const methods: Record<string, string> = {
    FREE_OUR_TRUCK: "رایگان با ماشین شرکت",
    FREE_OTHER_SERVICES: "رایگان با سرویس خارجی",
    PAID: "ارسال با هزینه مشتری",
    AT_INVENTORY: "تحویل درب انبار",
  };
  return methods[method || ""] || method || "نامشخص";
};

const getCustomerTypeText = (type: string | undefined): string => {
  const types: Record<string, string> = {
    PERSONAL: "شخصی",
    CORPORATE: "سازمانی",
  };
  return types[type || ""] || type || "نامشخص";
};

const getCustomerCategoryText = (category: string | undefined): string => {
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
  return categories[category || ""] || category || "نامشخص";
};

export default function OrderHistoryDetails() {
  const navigate = useNavigate();
  const { id: historyId } = useParams();
  const [history, setHistory] = useState<OrderHistoryDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (historyId) {
      fetchHistory();
    }
  }, [historyId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await historyService.getOrderHistoryById(
        historyId as string
      );
      setHistory(data as unknown as OrderHistoryDetailsData);
    } catch (err: any) {
      console.error("Error fetching order history:", err);
      setError("خطا در بارگذاری جزئیات تاریخچه");
    } finally {
      setLoading(false);
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

  if (error || !history) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error || "تاریخچه یافت نشد"}</div>
        <button
          onClick={() => navigate("/manage/order-history")}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          بازگشت به لیست تاریخچه
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in font-vazir max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/manage/order-history")}
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              جزئیات تاریخچه سفارش
            </h1>
            {history.order && (
              <p className="text-gray-500">
                کد سفارش:{" "}
                <span className="font-semibold text-gray-700">
                  #{history.order.code}
                </span>
              </p>
            )}
          </div>
          <span
            className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold ${getChangeTypeColor(
              history.change_type
            )}`}
          >
            {getChangeTypeText(history.change_type)}
          </span>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">مقایسه تغییرات</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Before */}
          <div className="relative">
            <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-red-200"></div>
            <div className="pr-6">
              <div className="flex items-center space-x-reverse space-x-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
                <h3 className="text-lg font-semibold text-gray-900">
                  قبل از تغییر
                </h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                {history.step_before && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1.5">
                      مرحله
                    </label>
                    <span
                      className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${getStepColor(
                        history.step_before
                      )}`}
                    >
                      {getStepText(history.step_before)}
                    </span>
                  </div>
                )}
                {history.payment_status_before && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1.5">
                      وضعیت پرداخت
                    </label>
                    <span
                      className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${getPaymentStatusColor(
                        history.payment_status_before
                      )}`}
                    >
                      {getPaymentStatusText(history.payment_status_before)}
                    </span>
                  </div>
                )}
                {history.delivery_date_before && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1.5">
                      تاریخ تحویل
                    </label>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(history.delivery_date_before)}
                    </p>
                  </div>
                )}
                {history.delivery_method_before && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1.5">
                      روش تحویل
                    </label>
                    <p className="text-sm font-semibold text-gray-900">
                      {getDeliveryMethodText(history.delivery_method_before)}
                    </p>
                  </div>
                )}
                {history.fulfilled_before !== null && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1.5">
                      وضعیت تحویل
                    </label>
                    <p className="text-sm font-semibold text-gray-900">
                      {history.fulfilled_before ? "تحویل شده" : "در حال پردازش"}
                    </p>
                  </div>
                )}
                {history.archived_before !== null && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1.5">
                      وضعیت آرشیو
                    </label>
                    <p className="text-sm font-semibold text-gray-900">
                      {history.archived_before ? "آرشیو شده" : "فعال"}
                    </p>
                  </div>
                )}

                {/* Ordered Basket Before */}
                {history.old_order?.ordered_basket &&
                  Array.isArray(history.old_order.ordered_basket) &&
                  history.old_order.ordered_basket.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <label className="text-xs font-medium text-gray-500 block mb-3">
                        محصولات سفارش شده (
                        {history.old_order.ordered_basket.length} عدد)
                      </label>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {history.old_order.ordered_basket.map(
                          (item: OrderBasket, index: number) => (
                            <div
                              key={index}
                              className="bg-white rounded-lg p-3 border border-gray-200"
                            >
                              <p className="text-sm font-semibold text-gray-900">
                                {item.product_title ||
                                  item.product?.title ||
                                  "محصول نامشخص"}
                              </p>
                              {(item.product_code || item.product?.code) && (
                                <p className="text-xs text-gray-600 mt-1">
                                  کد: {item.product_code || item.product?.code}
                                </p>
                              )}
                              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                {item.weight !== undefined &&
                                  item.weight !== null && (
                                    <div>
                                      <span className="text-gray-600">
                                        وزن:{" "}
                                      </span>
                                      <span className="font-semibold text-gray-900">
                                        {item.weight} کیلوگرم
                                      </span>
                                    </div>
                                  )}
                                {item.price !== undefined &&
                                  item.price !== null &&
                                  item.weight !== undefined &&
                                  item.weight !== null && (
                                    <div>
                                      <span className="text-gray-600">
                                        قیمت:{" "}
                                      </span>
                                      <span className="font-semibold text-gray-900">
                                        {formatCurrency(
                                          item.price * item.weight
                                        )}
                                      </span>
                                    </div>
                                  )}
                                {item.fulfilled_weight !== null &&
                                  item.fulfilled_weight !== undefined && (
                                    <div>
                                      <span className="text-gray-600">
                                        وزن تحویل شده:{" "}
                                      </span>
                                      <span className="font-semibold text-gray-900">
                                        {item.fulfilled_weight} کیلوگرم
                                      </span>
                                    </div>
                                  )}
                                {item.fulfilled !== undefined &&
                                  item.fulfilled !== null && (
                                    <div>
                                      <span className="text-gray-600">
                                        وضعیت:{" "}
                                      </span>
                                      <span
                                        className={`font-semibold ${
                                          item.fulfilled
                                            ? "text-green-600"
                                            : "text-yellow-600"
                                        }`}
                                      >
                                        {item.fulfilled
                                          ? "تحویل شده"
                                          : "در انتظار"}
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* After */}
          <div className="relative">
            <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-green-200"></div>
            <div className="pr-6">
              <div className="flex items-center space-x-reverse space-x-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
                <h3 className="text-lg font-semibold text-gray-900">
                  بعد از تغییر
                </h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                {history.step_after && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1.5">
                      مرحله
                    </label>
                    <span
                      className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${getStepColor(
                        history.step_after
                      )}`}
                    >
                      {getStepText(history.step_after)}
                    </span>
                  </div>
                )}
                {history.payment_status_after && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1.5">
                      وضعیت پرداخت
                    </label>
                    <span
                      className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${getPaymentStatusColor(
                        history.payment_status_after
                      )}`}
                    >
                      {getPaymentStatusText(history.payment_status_after)}
                    </span>
                  </div>
                )}
                {history.delivery_date_after && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1.5">
                      تاریخ تحویل
                    </label>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(history.delivery_date_after)}
                    </p>
                  </div>
                )}
                {history.delivery_method_after && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1.5">
                      روش تحویل
                    </label>
                    <p className="text-sm font-semibold text-gray-900">
                      {getDeliveryMethodText(history.delivery_method_after)}
                    </p>
                  </div>
                )}
                {history.fulfilled_after !== null && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1.5">
                      وضعیت تحویل
                    </label>
                    <p className="text-sm font-semibold text-gray-900">
                      {history.fulfilled_after ? "تحویل شده" : "در حال پردازش"}
                    </p>
                  </div>
                )}
                {history.archived_after !== null && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1.5">
                      وضعیت آرشیو
                    </label>
                    <p className="text-sm font-semibold text-gray-900">
                      {history.archived_after ? "آرشیو شده" : "فعال"}
                    </p>
                  </div>
                )}

                {/* Ordered Basket After */}
                {history.new_order?.ordered_basket &&
                  Array.isArray(history.new_order.ordered_basket) &&
                  history.new_order.ordered_basket.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <label className="text-xs font-medium text-gray-500 block mb-3">
                        محصولات سفارش شده (
                        {history.new_order.ordered_basket.length} عدد)
                      </label>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {history.new_order.ordered_basket.map(
                          (item: OrderBasket, index: number) => (
                            <div
                              key={index}
                              className="bg-white rounded-lg p-3 border border-gray-200"
                            >
                              <p className="text-sm font-semibold text-gray-900">
                                {item.product_title ||
                                  item.product?.title ||
                                  "محصول نامشخص"}
                              </p>
                              {(item.product_code || item.product?.code) && (
                                <p className="text-xs text-gray-600 mt-1">
                                  کد: {item.product_code || item.product?.code}
                                </p>
                              )}
                              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                {item.weight !== undefined &&
                                  item.weight !== null && (
                                    <div>
                                      <span className="text-gray-600">
                                        وزن:{" "}
                                      </span>
                                      <span className="font-semibold text-gray-900">
                                        {item.weight} کیلوگرم
                                      </span>
                                    </div>
                                  )}
                                {item.price !== undefined &&
                                  item.price !== null &&
                                  item.weight !== undefined &&
                                  item.weight !== null && (
                                    <div>
                                      <span className="text-gray-600">
                                        قیمت:{" "}
                                      </span>
                                      <span className="font-semibold text-gray-900">
                                        {formatCurrency(
                                          item.price * item.weight
                                        )}
                                      </span>
                                    </div>
                                  )}
                                {item.fulfilled_weight !== null &&
                                  item.fulfilled_weight !== undefined && (
                                    <div>
                                      <span className="text-gray-600">
                                        وزن تحویل شده:{" "}
                                      </span>
                                      <span className="font-semibold text-gray-900">
                                        {item.fulfilled_weight} کیلوگرم
                                      </span>
                                    </div>
                                  )}
                                {item.fulfilled !== undefined &&
                                  item.fulfilled !== null && (
                                    <div>
                                      <span className="text-gray-600">
                                        وضعیت:{" "}
                                      </span>
                                      <span
                                        className={`font-semibold ${
                                          item.fulfilled
                                            ? "text-green-600"
                                            : "text-yellow-600"
                                        }`}
                                      >
                                        {item.fulfilled
                                          ? "تحویل شده"
                                          : "در انتظار"}
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Change Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">جزئیات تغییر</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1.5">نوع تغییر</p>
              <p className="text-sm font-semibold text-gray-900">
                {getChangeTypeText(history.change_type)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">روش تغییر</p>
              <p className="text-sm font-semibold">
                {history.by_system ? (
                  <span className="text-orange-600">سیستم خودکار</span>
                ) : (
                  <span className="text-blue-600">کارمند دستی</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">تاریخ تغییر</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(history.created_at)}
              </p>
            </div>
            {history.employee && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">کارمند</p>
                <p className="text-sm font-semibold text-gray-900">
                  {history.employee.profile.first_name}{" "}
                  {history.employee.profile.last_name}
                </p>
              </div>
            )}
            {history.reason && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1.5">دلیل تغییر</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                  {history.reason}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Current Order */}
        {history.order && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-reverse space-x-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900">وضعیت فعلی</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1.5">کد سفارش</p>
                <p className="text-sm font-semibold text-gray-900">
                  #{history.order.code}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5">مرحله</p>
                <span
                  className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${getStepColor(
                    history.order.step
                  )}`}
                >
                  {getStepText(history.order.step)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5">وضعیت پرداخت</p>
                <span
                  className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${getPaymentStatusColor(
                    history.order.payment_status
                  )}`}
                >
                  {getPaymentStatusText(history.order.payment_status)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5">مبلغ کل</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(history.order.total_price)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5">وضعیت تحویل</p>
                <p className="text-sm font-semibold">
                  {history.order.fulfilled ? (
                    <span className="text-green-600">تحویل شده</span>
                  ) : (
                    <span className="text-yellow-600">در حال پردازش</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5">وضعیت آرشیو</p>
                <p className="text-sm font-semibold">
                  {history.order.archived ? (
                    <span className="text-gray-600">آرشیو شده</span>
                  ) : (
                    <span className="text-green-600">فعال</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Customer & Seller */}
        <div className="space-y-6">
          {/* Customer */}
          {history.order?.customer && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-reverse space-x-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <User className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900">مشتری</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">نام</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {history.order.customer.title}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">کد مشتری</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {history.order.customer.code}
                  </p>
                </div>
                {history.order.customer.type && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">نوع</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {getCustomerTypeText(history.order.customer.type)}
                    </p>
                  </div>
                )}
                {history.order.customer.category && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">حوزه فعالیت</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {getCustomerCategoryText(history.order.customer.category)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Seller */}
          {history.order?.seller && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-reverse space-x-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="font-bold text-gray-900">فروشنده</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">نام</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {history.order.seller.profile.first_name}{" "}
                    {history.order.seller.profile.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">کد</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {history.order.seller.profile.kid}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* IP Address */}
          {history.ip_address && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-reverse space-x-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-gray-600" />
                </div>
                <h3 className="font-bold text-gray-900">اطلاعات اتصال</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">آدرس IP</p>
                  <p className="text-sm font-semibold text-gray-900 font-mono bg-gray-50 rounded px-2 py-1 inline-block">
                    {history.ip_address.split(",")[0]}
                  </p>
                </div>
                {history.ip_address.split(",").length > 1 && (
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    {history.ip_address.split(",")[1]?.trim() && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">شهر</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {history.ip_address.split(",")[1].trim()}
                        </p>
                      </div>
                    )}
                    {history.ip_address.split(",")[2]?.trim() && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">استان</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {history.ip_address.split(",")[2].trim()}
                        </p>
                      </div>
                    )}
                    {history.ip_address.split(",")[6]?.trim() && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 mb-1">کشور</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {history.ip_address.split(",")[6].trim()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
