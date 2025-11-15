import { useState, useEffect } from "react";
import {
  Loader2,
  Wallet,
  CreditCard,
  TrendingUp,
  DollarSign,
  Plus,
  RefreshCw,
} from "lucide-react";
import { formatCurrency, formatDate } from "../../lib/utils";
import { walletService } from "../../services/api";
import type { WalletInfoResponse } from "../../types";
import TopupModal from "./TopupModal";

export default function UserWallet() {
  const [walletInfo, setWalletInfo] = useState<WalletInfoResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const shouldRefresh = sessionStorage.getItem("wallet_refresh_needed");
    if (shouldRefresh === "true") {
      loadData();
      sessionStorage.removeItem("wallet_refresh_needed");
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const wallet = await walletService.getWalletInfo();
      setWalletInfo(wallet);
    } catch (err: any) {
      setError("خطا در بارگذاری اطلاعات");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTopupSuccess = (redirectUrl: string) => {
    localStorage.setItem("wallet_topup_callback", "/user/wallet-topup/callback");
    window.location.href = redirectUrl;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <span className="mr-3 text-gray-600 font-semibold">
          در حال بارگذاری...
        </span>
      </div>
    );
  }

  if (error || !walletInfo) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4 font-semibold">
          {error || "خطا در بارگذاری اطلاعات"}
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  const availableCredit = walletInfo.credit_cap - walletInfo.balance;

  return (
    <div className="fade-in font-vazir max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-reverse space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  کیف پول من
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  مدیریت موجودی و اعتبار
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-reverse space-x-3">
              <button
                onClick={loadData}
                className="inline-flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                بروزرسانی
              </button>
              <button
                onClick={() => setIsTopupModalOpen(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center space-x-reverse space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>افزایش موجودی</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      )}

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Balance */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900">موجودی</h3>
          </div>
          <p
            className={`text-3xl font-bold ${
              walletInfo.balance >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {formatCurrency(walletInfo.balance)}
          </p>
        </div>

        {/* Credit Cap */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">سقف اعتبار</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(walletInfo.credit_cap)}
          </p>
        </div>

        {/* Initial Balance */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">موجودی اولیه</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(walletInfo.initial_balance)}
          </p>
        </div>

        {/* Available Credit */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-900">اعتبار قابل استفاده</h3>
          </div>
          <p
            className={`text-3xl font-bold ${
              availableCredit >= 0 ? "text-orange-600" : "text-red-600"
            }`}
          >
            {formatCurrency(availableCredit)}
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          اطلاعات کیف پول
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">تاریخ ایجاد</p>
            <p className="text-base font-semibold text-gray-900">
              {formatDate(walletInfo.created_at)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">آخرین به‌روزرسانی</p>
            <p className="text-base font-semibold text-gray-900">
              {formatDate(walletInfo.updated_at)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">وضعیت</p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${
                walletInfo.deleted_at
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {walletInfo.deleted_at ? "غیرفعال" : "فعال"}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {walletInfo.description && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">توضیحات</h2>
          <p className="text-base text-gray-700 bg-gray-50 rounded-lg p-4">
            {walletInfo.description}
          </p>
        </div>
      )}

      {/* Topup Modal */}
      <TopupModal
        isOpen={isTopupModalOpen}
        onClose={() => setIsTopupModalOpen(false)}
        onSuccess={handleTopupSuccess}
      />
    </div>
  );
}
