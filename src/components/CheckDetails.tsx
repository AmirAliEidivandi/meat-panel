import {
  ArrowRight,
  CreditCard,
  Edit,
  Loader2,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatCurrency, formatDate, getBankName } from "../lib/utils";
import { accountantsService, fileUrl } from "../services/api";
import type { CheckDetailsResponse } from "../types";
import ChangeCheckStatusModal from "./ChangeCheckStatusModal";

// Helper functions
const getCheckStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    RECEIVED_BY_ACCOUNTING: "دریافت چک توسط حسابداری",
    DELIVERED_TO_PROCUREMENT: "تحویل به کارپرداز",
    DELIVERED_TO_BANK: "تحویل به بانک",
    CLEARED: "پاس شده",
    RETURNED: "برگشت خورده",
  };
  return statusMap[status] || status;
};

const getCheckStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    RECEIVED_BY_ACCOUNTING: "bg-blue-100 text-blue-800",
    DELIVERED_TO_PROCUREMENT: "bg-yellow-100 text-yellow-800",
    DELIVERED_TO_BANK: "bg-purple-100 text-purple-800",
    CLEARED: "bg-green-100 text-green-800",
    RETURNED: "bg-red-100 text-red-800",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800";
};

export default function CheckDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [check, setCheck] = useState<CheckDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCheckDetails();
    }
  }, [id]);

  const fetchCheckDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");
      const data = await accountantsService.getCheckById(id);
      setCheck(data);
    } catch (err: any) {
      console.error("Error fetching check details:", err);
      setError(err.response?.data?.message || "خطا در دریافت جزییات چک");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    if (!confirm("آیا مطمئن هستید که می‌خواهید این چک را حذف کنید؟")) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      await accountantsService.deleteCheck(id);
      alert("چک با موفقیت حذف شد");
      navigate("/manage/checks");
    } catch (err: any) {
      console.error("Error deleting check:", err);
      setError(err.response?.data?.message || "خطا در حذف چک");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChangeSuccess = () => {
    setShowStatusModal(false);
    fetchCheckDetails();
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

  if (error && !check) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => navigate("/manage/checks")}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          بازگشت به لیست چک‌ها
        </button>
      </div>
    );
  }

  if (!check) {
    return null;
  }

  return (
    <div className="fade-in font-vazir max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/manage/checks")}
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">جزئیات چک</h1>
            <p className="text-gray-500">شماره چک: {check.check_number}</p>
          </div>
          <div className="flex items-center space-x-reverse space-x-3">
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-reverse space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>تغییر وضعیت</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-reverse space-x-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{deleting ? "در حال حذف..." : "حذف"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900">مبلغ</h3>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {formatCurrency(check.amount)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">شماره چک</h3>
          </div>
          <p className="text-xl font-bold text-blue-600">
            {check.check_number}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">وضعیت</h3>
          </div>
          <span
            className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${getCheckStatusColor(
              check.status
            )}`}
          >
            {getCheckStatusText(check.status)}
          </span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-900">تاریخ چک</h3>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {formatDate(check.check_date)}
          </p>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900">اطلاعات پایه</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1.5">شماره حساب</p>
              <p className="text-sm font-semibold text-gray-900">
                {check.account_number}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">بانک صادرکننده</p>
              <p className="text-sm font-semibold text-gray-900">
                {getBankName(check.issuer_bank)}
              </p>
            </div>
            {check.destination_bank && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">بانک مقصد</p>
                <p className="text-sm font-semibold text-gray-900">
                  {getBankName(check.destination_bank)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900">اطلاعات تکمیلی</h3>
          </div>
          <div className="space-y-4">
            {check.customer && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">مشتری</p>
                <p className="text-sm font-semibold text-gray-900">
                  {check.customer.title}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 mb-1.5">تاریخ ثبت</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(check.created_at)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">آخرین بروزرسانی</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(check.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {check.description && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900">توضیحات</h3>
          </div>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
            {check.description}
          </p>
        </div>
      )}

      {/* Check Image */}
      {check.image && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900">تصویر چک</h3>
          </div>
          <div className="flex justify-center">
            <img
              src={
                fileUrl(check.image.thumbnail) || fileUrl(check.image.url) || ""
              }
              alt="Check image"
              className="max-w-full h-auto rounded-lg border border-gray-300 shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {showStatusModal && check && (
        <ChangeCheckStatusModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          onSuccess={handleStatusChangeSuccess}
          checkId={check.id}
          currentStatus={check.status}
        />
      )}
    </div>
  );
}
