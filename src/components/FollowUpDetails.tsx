import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Loader2,
  PhoneCall,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate } from "../lib/utils";
import { followUpService } from "../services/api";
import type { FollowUpDetails as FollowUpDetailsType } from "../types";

const getResultStatusText = (
  result: "CUSTOMER" | "NOT_CUSTOMER" | "REQUIRES_FOLLOW_UP" | "NOT_ANSWERED"
): string => {
  const statusMap: Record<string, string> = {
    CUSTOMER: "مشتری",
    NOT_CUSTOMER: "مشتری نیست",
    REQUIRES_FOLLOW_UP: "نیاز به پیگیری",
    NOT_ANSWERED: "پاسخ نداده",
  };
  return statusMap[result] || result;
};

const getResultStatusColor = (
  result: "CUSTOMER" | "NOT_CUSTOMER" | "REQUIRES_FOLLOW_UP" | "NOT_ANSWERED"
): string => {
  const colorMap: Record<string, string> = {
    CUSTOMER: "bg-green-100 text-green-800",
    NOT_CUSTOMER: "bg-red-100 text-red-800",
    REQUIRES_FOLLOW_UP: "bg-yellow-100 text-yellow-800",
    NOT_ANSWERED: "bg-gray-100 text-gray-800",
  };
  return colorMap[result] || "bg-gray-100 text-gray-800";
};

const getResultIcon = (
  result: "CUSTOMER" | "NOT_CUSTOMER" | "REQUIRES_FOLLOW_UP" | "NOT_ANSWERED"
) => {
  switch (result) {
    case "CUSTOMER":
      return <CheckCircle className="w-4 h-4 ml-2" />;
    case "NOT_CUSTOMER":
      return <XCircle className="w-4 h-4 ml-2" />;
    case "REQUIRES_FOLLOW_UP":
      return <AlertCircle className="w-4 h-4 ml-2" />;
    case "NOT_ANSWERED":
      return <PhoneCall className="w-4 h-4 ml-2" />;
    default:
      return null;
  }
};

const getCustomerTypeText = (type: string): string => {
  const types: Record<string, string> = {
    PERSONAL: "شخصی",
    CORPORATE: "سازمانی",
    ORGANIZATIONAL: "سازمانی",
  };
  return types[type] || type;
};

export default function FollowUpDetails() {
  const navigate = useNavigate();
  const { id: followUpId } = useParams();
  const [followUp, setFollowUp] = useState<FollowUpDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (followUpId) {
      fetchFollowUpDetails();
    }
  }, [followUpId]);

  const fetchFollowUpDetails = async () => {
    if (!followUpId) return;
    try {
      setLoading(true);
      setError("");
      const response = await followUpService.getFollowUpById(followUpId);
      // Handle case where API returns an array instead of a single object
      const followUpData = Array.isArray(response) ? response[0] : response;
      setFollowUp(followUpData);
    } catch (err: any) {
      console.error("Error fetching follow-up details:", err);
      setError(err.response?.data?.message || "خطا در بارگذاری جزئیات پیگیری");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="mr-3 text-gray-600 font-semibold">
          در حال بارگذاری...
        </span>
      </div>
    );
  }

  if (error || !followUp) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error || "پیگیری یافت نشد"}</div>
        <button
          onClick={() => navigate("/manage/follow-ups")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          بازگشت به لیست پیگیری‌ها
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in font-vazir max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/manage/follow-ups")}
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              جزئیات پیگیری
            </h1>
            {(() => {
              const id = followUp?.id || followUpId;
              return (
                <p className="text-gray-500">
                  پیگیری #{id ? String(id).substring(0, 8) : "نامشخص"}
                </p>
              );
            })()}
          </div>
          <span
            className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold ${getResultStatusColor(
              followUp.result
            )}`}
          >
            {getResultIcon(followUp.result)}
            {getResultStatusText(followUp.result)}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <PhoneCall className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">تلاش</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">{followUp.attempt}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900">تاریخ ایجاد</h3>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {formatDate(followUp.created_at)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">آخرین بروزرسانی</h3>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {formatDate(followUp.updated_at)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <User className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-900">مشتری</h3>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {followUp.customer.title}
          </p>
        </div>
      </div>

      {/* Description */}
      {followUp.description && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <PhoneCall className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900">توضیحات</h3>
          </div>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
            {followUp.description}
          </p>
        </div>
      )}

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
              <p className="text-xs text-gray-500 mb-1.5">نام</p>
              <p className="text-sm font-semibold text-gray-900">
                {followUp.customer.title}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">کد مشتری</p>
              <p className="text-sm font-semibold text-gray-900">
                {followUp.customer.code}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">نوع</p>
              <p className="text-sm font-semibold text-gray-900">
                {getCustomerTypeText(followUp.customer.type)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">دسته‌بندی</p>
              <p className="text-sm font-semibold text-gray-900">
                {followUp.customer.category}
              </p>
            </div>
            {followUp.customer.hp_code && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">کد HP</p>
                <p className="text-sm font-semibold text-gray-900">
                  {followUp.customer.hp_code}
                </p>
              </div>
            )}
            {followUp.customer.hp_title && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">عنوان HP</p>
                <p className="text-sm font-semibold text-gray-900">
                  {followUp.customer.hp_title}
                </p>
              </div>
            )}
            {followUp.customer.phone && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">تلفن</p>
                <p className="text-sm font-semibold text-gray-900">
                  {followUp.customer.phone}
                </p>
              </div>
            )}
            {followUp.customer.address && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">آدرس</p>
                <p className="text-sm font-semibold text-gray-900">
                  {followUp.customer.address}
                </p>
              </div>
            )}
            <div className="flex items-center space-x-reverse space-x-2">
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  followUp.customer.is_verified
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {followUp.customer.is_verified ? "تایید شده" : "تایید نشده"}
              </span>
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  followUp.customer.is_online
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {followUp.customer.is_online ? "آنلاین" : "آفلاین"}
              </span>
            </div>
          </div>
        </div>

        {/* Employee Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">اطلاعات کارمند</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1.5">نام</p>
              <p className="text-sm font-semibold text-gray-900">
                {followUp.employee.profile.first_name}{" "}
                {followUp.employee.profile.last_name}
              </p>
            </div>
            <button
              onClick={() =>
                navigate(`/manage/profiles/${followUp.employee.profile.id}`)
              }
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              مشاهده پروفایل نماینده
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
