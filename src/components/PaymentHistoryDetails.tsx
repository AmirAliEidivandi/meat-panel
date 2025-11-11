import { ArrowRight, CreditCard, FileText, Loader2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatCurrency, formatDate } from "../lib/utils";
import { historyService } from "../services/api";

// Interfaces
interface PaymentData {
  id: string;
  code: number;
  amount: number;
  description: string | null;
  customer_id: string;
  wallet_id: string | null;
  order_id: string | null;
  deleted: boolean;
  method: string;
  date: string;
  cheque_due_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  customer?: {
    id: string;
    title: string;
    code: number;
  };
}

interface PaymentHistoryDetailsData {
  id: string;
  payment_id: string;
  old_payment: PaymentData | null;
  new_payment: PaymentData | null;
  employee_id: string | null;
  by_system: boolean;
  change_type: string;
  amount_before: number | null;
  amount_after: number | null;
  amount_diff: number | null;
  method_before: string | null;
  method_after: string | null;
  date_before: string | null;
  date_after: string | null;
  deleted_changed: boolean;
  reason: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  payment?: PaymentData;
  employee?: {
    id: string;
    kid: string;
    profile: {
      id: string;
      first_name: string;
      last_name: string;
    };
  };
}

// Helper functions
const getChangeTypeText = (changeType: string): string => {
  const types: Record<string, string> = {
    CREATED: "ایجاد پرداخت",
    AMOUNT_CHANGED: "تغییر مبلغ",
    METHOD_CHANGED: "تغییر روش پرداخت",
    DATE_CHANGED: "تغییر تاریخ",
    CHEQUE_DATE_CHANGED: "تغییر تاریخ چک",
    DELETED: "حذف پرداخت",
    RESTORED: "بازیابی پرداخت",
    INVOICE_LINKED: "اتصال به فاکتور",
    INVOICE_UNLINKED: "قطع اتصال از فاکتور",
  };
  return types[changeType] || "تغییر نامشخص";
};

const getChangeTypeColor = (changeType: string): string => {
  const colorMap: Record<string, string> = {
    CREATED: "bg-green-100 text-green-800",
    AMOUNT_CHANGED: "bg-yellow-100 text-yellow-800",
    METHOD_CHANGED: "bg-blue-100 text-blue-800",
    DATE_CHANGED: "bg-indigo-100 text-indigo-800",
    CHEQUE_DATE_CHANGED: "bg-purple-100 text-purple-800",
    DELETED: "bg-red-100 text-red-800",
    RESTORED: "bg-emerald-100 text-emerald-800",
    INVOICE_LINKED: "bg-teal-100 text-teal-800",
    INVOICE_UNLINKED: "bg-orange-100 text-orange-800",
  };
  return colorMap[changeType] || "bg-gray-100 text-gray-800";
};

const getPaymentMethodText = (method: string | null): string => {
  const methods: Record<string, string> = {
    CASH: "نقدی",
    DEPOSIT_TO_ACCOUNT: "واریز به حساب",
    CHEQUE: "چک",
    CREDIT: "اعتبار",
    WALLET: "کیف پول",
    ONLINE: "آنلاین",
  };
  return methods[method || ""] || method || "نامشخص";
};

const getPaymentMethodColor = (method: string | null): string => {
  const colorMap: Record<string, string> = {
    CASH: "bg-green-100 text-green-800",
    DEPOSIT_TO_ACCOUNT: "bg-blue-100 text-blue-800",
    CHEQUE: "bg-yellow-100 text-yellow-800",
    CREDIT: "bg-purple-100 text-purple-800",
    WALLET: "bg-indigo-100 text-indigo-800",
    ONLINE: "bg-teal-100 text-teal-800",
  };
  return colorMap[method || ""] || "bg-gray-100 text-gray-800";
};

export default function PaymentHistoryDetails() {
  const navigate = useNavigate();
  const { id: historyId } = useParams();
  const [history, setHistory] = useState<PaymentHistoryDetailsData | null>(
    null
  );
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
      const data = await historyService.getPaymentHistoryById(
        historyId as string
      );
      setHistory(data as PaymentHistoryDetailsData);
    } catch (err: any) {
      console.error("Error fetching payment history:", err);
      setError("خطا در بارگذاری جزئیات تاریخچه پرداخت");
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
          onClick={() => navigate("/manage/payment-history")}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          بازگشت به لیست تاریخچه پرداخت
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in font-vazir max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/manage/payment-history")}
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              جزئیات تاریخچه پرداخت
            </h1>
            {history.payment && (
              <p className="text-gray-500">
                کد پرداخت:{" "}
                <span className="font-semibold text-gray-700">
                  #{history.payment.code}
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">مقایسه تغییرات</h2>
          {history.amount_diff !== null && (
            <div className="flex items-center space-x-reverse space-x-2">
              <span className="text-sm text-gray-500">تغییر مبلغ:</span>
              <span
                className={`text-xl font-bold ${
                  history.amount_diff >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {history.amount_diff >= 0 ? "+" : ""}
                {formatCurrency(history.amount_diff)}
              </span>
            </div>
          )}
        </div>

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
                {history.amount_before !== null && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      مبلغ
                    </label>
                    <p
                      className={`text-2xl font-bold ${
                        history.amount_before >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(history.amount_before)}
                    </p>
                  </div>
                )}
                {history.method_before && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-2">
                      روش پرداخت
                    </label>
                    <span
                      className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${getPaymentMethodColor(
                        history.method_before
                      )}`}
                    >
                      {getPaymentMethodText(history.method_before)}
                    </span>
                  </div>
                )}
                {history.date_before && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      تاریخ
                    </label>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(history.date_before)}
                    </p>
                  </div>
                )}
                {history.old_payment && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      کد پرداخت
                    </label>
                    <p className="text-sm font-semibold text-gray-900">
                      #{history.old_payment.code}
                    </p>
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
                {history.amount_after !== null && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      مبلغ
                    </label>
                    <p
                      className={`text-2xl font-bold ${
                        history.amount_after >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(history.amount_after)}
                    </p>
                  </div>
                )}
                {history.method_after && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-2">
                      روش پرداخت
                    </label>
                    <span
                      className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${getPaymentMethodColor(
                        history.method_after
                      )}`}
                    >
                      {getPaymentMethodText(history.method_after)}
                    </span>
                  </div>
                )}
                {history.date_after && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      تاریخ
                    </label>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(history.date_after)}
                    </p>
                  </div>
                )}
                {history.new_payment && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      کد پرداخت
                    </label>
                    <p className="text-sm font-semibold text-gray-900">
                      #{history.new_payment.code}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Current Payment */}
        {history.payment && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-reverse space-x-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900">وضعیت فعلی</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1.5">کد پرداخت</p>
                <p className="text-sm font-semibold text-gray-900">
                  #{history.payment.code}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5">مبلغ</p>
                <p
                  className={`text-xl font-bold ${
                    history.payment.amount >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(history.payment.amount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5">روش پرداخت</p>
                <span
                  className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${getPaymentMethodColor(
                    history.payment.method
                  )}`}
                >
                  {getPaymentMethodText(history.payment.method)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5">تاریخ</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(history.payment.date)}
                </p>
              </div>
              {history.payment.cheque_due_date && (
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">
                    تاریخ سررسید چک
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(history.payment.cheque_due_date)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-1.5">وضعیت</p>
                <p className="text-sm font-semibold">
                  {history.payment.deleted ? (
                    <span className="text-red-600">حذف شده</span>
                  ) : (
                    <span className="text-green-600">فعال</span>
                  )}
                </p>
              </div>
              {history.payment.description && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1.5">توضیحات</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                    {history.payment.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Customer & IP */}
        <div className="space-y-6">
          {/* Customer */}
          {history.payment?.customer && (
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
                    {history.payment.customer.title}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">کد مشتری</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {history.payment.customer.code}
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
