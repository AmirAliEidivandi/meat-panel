import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Package,
  User,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatCurrency, formatDate } from "../lib/utils";
import { paymentService } from "../services/api";
import type { PaymentDetails } from "../types";

export default function PaymentDetails() {
  const navigate = useNavigate();
  const { id: paymentId } = useParams();
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (paymentId) {
      fetchPaymentDetails();
    }
  }, [paymentId]);

  const fetchPaymentDetails = async () => {
    if (!paymentId) return;

    try {
      setLoading(true);
      setError("");
      const data = await paymentService.getPaymentById(paymentId);
      setPayment(data);
    } catch (err: any) {
      console.error("Error fetching payment details:", err);
      setError("خطا در بارگذاری جزئیات پرداخت");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodText = (method: string) => {
    const methodMap: { [key: string]: string } = {
      CASH: "نقدی",
      DEPOSIT_TO_ACCOUNT: "واریز به حساب",
      CHEQUE: "چک",
      CREDIT: "اعتبار",
      WALLET: "کیف پول",
      ONLINE: "آنلاین",
    };
    return methodMap[method] || method;
  };

  const getPaymentMethodColor = (method: string) => {
    const colorMap: { [key: string]: string } = {
      CASH: "bg-green-100 text-green-800",
      DEPOSIT_TO_ACCOUNT: "bg-blue-100 text-blue-800",
      CHEQUE: "bg-yellow-100 text-yellow-800",
      CREDIT: "bg-purple-100 text-purple-800",
      WALLET: "bg-indigo-100 text-indigo-800",
      ONLINE: "bg-cyan-100 text-cyan-800",
    };
    return colorMap[method] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-red-600">{error || "پرداخت یافت نشد"}</p>
        <button
          onClick={() => navigate("/manage/customers")}
          className="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-purple-600 text-white hover:bg-purple-700"
        >
          بازگشت
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in font-vazir">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-reverse space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              جزئیات پرداخت #{payment.code}
            </h1>
            <p className="text-gray-600 text-base">
              {getPaymentMethodText(payment.method)}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Basic Info */}
      <div className="bg-white rounded-xl border-2 border-purple-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <CreditCard className="w-6 h-6 ml-2 text-purple-600" />
          اطلاعات کلی پرداخت
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm font-bold text-purple-700 mb-2">کد پرداخت</p>
            <p className="text-2xl font-bold text-gray-900">#{payment.code}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm font-bold text-green-700 mb-2">مبلغ</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(payment.amount)}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-bold text-blue-700 mb-2">روش پرداخت</p>
            <p className="text-lg font-bold text-gray-900">
              <span
                className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${getPaymentMethodColor(
                  payment.method
                )}`}
              >
                {getPaymentMethodText(payment.method)}
              </span>
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm font-bold text-yellow-700 mb-2 flex items-center">
              <Calendar className="w-4 h-4 ml-1" />
              تاریخ پرداخت
            </p>
            <p className="text-lg font-bold text-gray-900">
              {formatDate(payment.date)}
            </p>
          </div>
          {payment.cheque_due_date && (
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-sm font-bold text-orange-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 ml-1" />
                تاریخ سررسید چک
              </p>
              <p className="text-lg font-bold text-gray-900">
                {formatDate(payment.cheque_due_date)}
              </p>
            </div>
          )}
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <p className="text-sm font-bold text-indigo-700 mb-2">وضعیت</p>
            <p className="text-lg font-bold text-gray-900">
              {payment.deleted ? (
                <span className="text-red-600">حذف شده</span>
              ) : (
                <span className="text-green-600">فعال</span>
              )}
            </p>
          </div>
        </div>
        {payment.description && (
          <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm font-bold text-gray-700 mb-2">توضیحات</p>
            <p className="text-base text-gray-900">{payment.description}</p>
          </div>
        )}
      </div>

      {/* Customer Information */}
      {payment.customer && (
        <div className="bg-white rounded-xl border-2 border-blue-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <User className="w-6 h-6 ml-2 text-blue-600" />
            اطلاعات مشتری
          </h2>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-bold text-blue-700 mb-2">نام مشتری</p>
            <p className="text-lg font-bold text-gray-900">
              {payment.customer.title}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              کد: {payment.customer.code}
            </p>
          </div>
        </div>
      )}

      {/* Additional Information */}
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <CreditCard className="w-6 h-6 ml-2 text-gray-600" />
          اطلاعات اضافی
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {payment.wallet_id && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm font-bold text-green-700 mb-2 flex items-center">
                <Wallet className="w-4 h-4 ml-1" />
                کیف پول
              </p>
              <p className="text-base font-semibold text-gray-900">
                شناسه: {payment.wallet_id}
              </p>
            </div>
          )}
          {payment.order_id && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm font-bold text-blue-700 mb-2 flex items-center">
                <Package className="w-4 h-4 ml-1" />
                سفارش
              </p>
              <button
                onClick={() => navigate(`/manage/orders/${payment.order_id}`)}
                className="text-base font-semibold text-blue-600 hover:text-blue-800 underline"
              >
                شناسه: {payment.order_id}
              </button>
            </div>
          )}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm font-bold text-gray-700 mb-2 flex items-center">
              <Calendar className="w-4 h-4 ml-1" />
              تاریخ ایجاد
            </p>
            <p className="text-base font-semibold text-gray-900">
              {formatDate(payment.created_at)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm font-bold text-gray-700 mb-2 flex items-center">
              <Calendar className="w-4 h-4 ml-1" />
              آخرین بروزرسانی
            </p>
            <p className="text-base font-semibold text-gray-900">
              {formatDate(payment.updated_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
