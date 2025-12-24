import {
  ArrowRight,
  Calendar,
  CreditCard,
  Loader2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate, getBankName } from "../lib/utils";
import { bankCardService } from "../services/api";
import type { BankCardDetailsResponse } from "../types";

const getCreatedTypeText = (type: "CUSTOMER" | "EMPLOYEE"): string => {
  const typeMap: Record<string, string> = {
    CUSTOMER: "مشتری",
    EMPLOYEE: "کارمند",
  };
  return typeMap[type] || type;
};

export default function BankCardDetails() {
  const navigate = useNavigate();
  const { id: cardId } = useParams();
  const [card, setCard] = useState<BankCardDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cardId) {
      fetchBankCardDetails();
    }
  }, [cardId]);

  const fetchBankCardDetails = async () => {
    if (!cardId) return;
    try {
      setLoading(true);
      setError("");
      const data = await bankCardService.getBankCardById(cardId);
      setCard(data);
    } catch (err: any) {
      console.error("Error fetching bank card details:", err);
      setError("خطا در بارگذاری جزئیات کارت بانکی");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="mr-3 text-gray-600 font-semibold">
          در حال بارگذاری...
        </span>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          {error || "کارت بانکی یافت نشد"}
        </div>
        <button
          onClick={() => navigate("/manage/bank-cards")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          بازگشت به لیست کارت‌های بانکی
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in font-vazir max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/manage/bank-cards")}
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              جزئیات کارت بانکی
            </h1>
            <p className="text-gray-500">کارت #{card.id.substring(0, 8)}</p>
          </div>
          <span
            className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${
              card.is_verified
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {card.is_verified ? "تایید شده" : "تایید نشده"}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-bold text-gray-900">نام بانک</h3>
          </div>
          <p className="text-lg font-bold text-indigo-600">
            {getBankName(card.bank_name)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">شماره شبا</h3>
          </div>
          <p className="text-sm font-semibold text-gray-900 font-mono">
            {card.iban}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">شماره حساب</h3>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {card.account_number}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900">تاریخ ایجاد</h3>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {formatDate(
              typeof card.created_at === "string"
                ? card.created_at
                : new Date(card.created_at).toISOString()
            )}
          </p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Bank Card Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900">اطلاعات کارت بانکی</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1.5">نام بانک</p>
              <p className="text-sm font-semibold text-gray-900">
                {getBankName(card.bank_name)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">شماره شبا</p>
              <p className="text-sm font-semibold text-gray-900 font-mono">
                {card.iban}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">شماره حساب</p>
              <p className="text-sm font-semibold text-gray-900">
                {card.account_number}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">شماره کارت (ماسک شده)</p>
              <p className="text-sm font-semibold text-gray-900 font-mono">
                {card.masked_pan}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">وضعیت تایید</p>
              <span
                className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${
                  card.is_verified
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {card.is_verified ? "تایید شده" : "تایید نشده"}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">نوع ایجاد</p>
              <p className="text-sm font-semibold text-gray-900">
                {getCreatedTypeText(card.created_type)}
              </p>
            </div>
          </div>
        </div>

        {/* Owner Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900">اطلاعات صاحب کارت</h3>
          </div>
          <div className="space-y-4">
            {card.customer ? (
              <>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">نام مشتری</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {card.customer.title}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">کد مشتری</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {card.customer.code}
                  </p>
                </div>
                <button
                  onClick={() =>
                    navigate(`/manage/customers/${card.customer!.id}`)
                  }
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold"
                >
                  مشاهده اطلاعات مشتری
                </button>
              </>
            ) : card.employee ? (
              <>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">نام و نام خانوادگی</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {card.employee.profile.first_name}{" "}
                    {card.employee.profile.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">کد ملی</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {card.employee.profile.kid}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">موبایل</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {card.employee.profile.mobile}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">نام کاربری</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {card.employee.profile.username}
                  </p>
                </div>
                <button
                  onClick={() =>
                    navigate(`/manage/profiles/${card.employee!.profile.id}`)
                  }
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold"
                >
                  مشاهده پروفایل
                </button>
              </>
            ) : card.person ? (
              <>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">نام و نام خانوادگی</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {card.person.profile.first_name}{" "}
                    {card.person.profile.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">کد ملی</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {card.person.profile.kid}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">موبایل</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {card.person.profile.mobile}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">نام کاربری</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {card.person.profile.username}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">اطلاعات صاحب کارت موجود نیست</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

