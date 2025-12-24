import {
  ArrowDownCircle,
  ArrowRight,
  Calendar,
  CreditCard,
  Loader2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatCurrency, formatDate, getBankName } from "../lib/utils";
import { withdrawalRequestService } from "../services/api";
import type { GetWithdrawalRequestDetailsResponse } from "../types";

const getStatusText = (
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "COMPLETED"
    | "CANCELLED"
    | "REVIEWING"
    | "PROCESSING"
): string => {
  const statusMap: Record<string, string> = {
    PENDING: "در انتظار بررسی",
    APPROVED: "تایید شده",
    REJECTED: "رد شده",
    COMPLETED: "تکمیل شده",
    CANCELLED: "لغو شده",
    REVIEWING: "در حال بررسی",
    PROCESSING: "در حال پردازش",
  };
  return statusMap[status] || status;
};

const getStatusColor = (
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "COMPLETED"
    | "CANCELLED"
    | "REVIEWING"
    | "PROCESSING"
): string => {
  const colorMap: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-blue-100 text-blue-800",
    REJECTED: "bg-red-100 text-red-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-gray-100 text-gray-800",
    REVIEWING: "bg-purple-100 text-purple-800",
    PROCESSING: "bg-indigo-100 text-indigo-800",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800";
};

export default function WithdrawalRequestDetails() {
  const navigate = useNavigate();
  const { id: requestId } = useParams();
  const [request, setRequest] =
    useState<GetWithdrawalRequestDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (requestId) {
      fetchWithdrawalRequestDetails();
    }
  }, [requestId]);

  const fetchWithdrawalRequestDetails = async () => {
    if (!requestId) return;
    try {
      setLoading(true);
      setError("");
      const data = await withdrawalRequestService.getWithdrawalRequestById(
        requestId
      );
      setRequest(data);
    } catch (err: any) {
      console.error("Error fetching withdrawal request details:", err);
      setError("خطا در بارگذاری جزئیات درخواست برداشت");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
        <span className="mr-3 text-gray-600 font-semibold">
          در حال بارگذاری...
        </span>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          {error || "درخواست برداشت یافت نشد"}
        </div>
        <button
          onClick={() => navigate("/manage/withdrawal-requests")}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          بازگشت به لیست درخواست‌های برداشت
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in font-vazir max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/manage/withdrawal-requests")}
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              جزئیات درخواست برداشت
            </h1>
            <p className="text-gray-500">
              درخواست #{request.id.substring(0, 8)}
            </p>
          </div>
          <span
            className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(
              request.status
            )}`}
          >
            {getStatusText(request.status)}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
              <ArrowDownCircle className="w-4 h-4 text-cyan-600" />
            </div>
            <h3 className="font-bold text-gray-900">مبلغ درخواستی</h3>
          </div>
          <p className="text-2xl font-bold text-cyan-600">
            {formatCurrency(request.amount)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">تاریخ ایجاد</h3>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {formatDate(
              typeof request.created_at === "string"
                ? request.created_at
                : new Date(request.created_at).toISOString()
            )}
          </p>
        </div>
        {request.requested_at && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-reverse space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900">تاریخ درخواست</h3>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {formatDate(
                typeof request.requested_at === "string"
                  ? request.requested_at
                  : new Date(request.requested_at).toISOString()
              )}
            </p>
          </div>
        )}
        {request.reviewed_at && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-reverse space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900">تاریخ بررسی</h3>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {formatDate(
                typeof request.reviewed_at === "string"
                  ? request.reviewed_at
                  : new Date(request.reviewed_at).toISOString()
              )}
            </p>
          </div>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900">اطلاعات مشتری</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1.5">نام مشتری</p>
              <p className="text-sm font-semibold text-gray-900">
                {request.customer.title}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">کد مشتری</p>
              <p className="text-sm font-semibold text-gray-900">
                {request.customer.code}
              </p>
            </div>
            <button
              onClick={() =>
                navigate(`/manage/customers/${request.customer.id}`)
              }
              className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-semibold"
            >
              مشاهده اطلاعات مشتری
            </button>
          </div>
        </div>

        {/* Person Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900">اطلاعات شخص</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1.5">نام و نام خانوادگی</p>
              <p className="text-sm font-semibold text-gray-900">
                {request.person.profile.first_name}{" "}
                {request.person.profile.last_name}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">موبایل</p>
              <p className="text-sm font-semibold text-gray-900">
                {request.person.profile.mobile}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">نام کاربری</p>
              <p className="text-sm font-semibold text-gray-900">
                {request.person.profile.username}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Representative Name */}
      {request.representative_name && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900">نام نماینده</h3>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {request.representative_name}
          </p>
        </div>
      )}

      {/* Bank Card Info */}
      {request.bank_card && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900">اطلاعات کارت بانکی</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-1.5">نام بانک</p>
              <p className="text-sm font-semibold text-gray-900">
                {getBankName(request.bank_card.bank_name)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">وضعیت تایید</p>
              <span
                className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${
                  request.bank_card.is_verified
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {request.bank_card.is_verified ? "تایید شده" : "تایید نشده"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason */}
      {request.reject_reason && (
        <div className="bg-white rounded-xl border border-red-200 p-6 mb-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="font-bold text-gray-900">دلیل رد</h3>
          </div>
          <p className="text-sm text-gray-700 bg-red-50 rounded-lg p-4 whitespace-pre-wrap">
            {request.reject_reason}
          </p>
        </div>
      )}

      {/* Employees Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Reviewed By Employee */}
        {request.reviewed_by_employee && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-reverse space-x-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900">بررسی شده توسط</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1.5">
                  نام و نام خانوادگی
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {request.reviewed_by_employee.profile.first_name}{" "}
                  {request.reviewed_by_employee.profile.last_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5">کد ملی</p>
                <p className="text-sm font-semibold text-gray-900">
                  {request.reviewed_by_employee.profile.kid}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5">موبایل</p>
                <p className="text-sm font-semibold text-gray-900">
                  {request.reviewed_by_employee.profile.mobile}
                </p>
              </div>
              <button
                onClick={() =>
                  navigate(
                    `/manage/profiles/${request.reviewed_by_employee.profile.id}`
                  )
                }
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
              >
                مشاهده پروفایل
              </button>
            </div>
          </div>
        )}

        {/* Processed By Employee */}
        {request.processed_by_employee && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-reverse space-x-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900">پردازش شده توسط</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1.5">
                  نام و نام خانوادگی
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {request.processed_by_employee.profile.first_name}{" "}
                  {request.processed_by_employee.profile.last_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5">کد ملی</p>
                <p className="text-sm font-semibold text-gray-900">
                  {request.processed_by_employee.profile.kid}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5">موبایل</p>
                <p className="text-sm font-semibold text-gray-900">
                  {request.processed_by_employee.profile.mobile}
                </p>
              </div>
              <button
                onClick={() =>
                  navigate(
                    `/manage/profiles/${request.processed_by_employee.profile.id}`
                  )
                }
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
              >
                مشاهده پروفایل
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
