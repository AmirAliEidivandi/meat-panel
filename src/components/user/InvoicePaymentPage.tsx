import { ArrowRight, CreditCard, Loader2, Receipt, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatCurrency } from "../../lib/utils";
import { paymentService } from "../../services/api";
import type { InvoicePaymentInfo } from "../../types";

export default function InvoicePaymentPage() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [paymentInfo, setPaymentInfo] = useState<InvoicePaymentInfo | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingFromWallet, setPayingFromWallet] = useState(false);
  const [initiatingGateway, setInitiatingGateway] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<"zarinpal" | "zibal">(
    "zarinpal"
  );

  useEffect(() => {
    if (orderId) {
      fetchPaymentInfo();
    }
  }, [orderId]);

  const fetchPaymentInfo = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError("");
      const data = await paymentService.getInvoicePaymentInfo(orderId);
      setPaymentInfo(data);
    } catch (err: any) {
      console.error("Error fetching payment info:", err);
      setError(
        err.response?.data?.message || "خطا در بارگذاری اطلاعات پرداخت فاکتور"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePayFromWallet = async () => {
    if (!orderId || !paymentInfo) return;

    try {
      setPayingFromWallet(true);
      setError("");

      // Send the remaining amount to pay
      const response = await paymentService.payInvoiceFromWallet(orderId, {
        amount: paymentInfo.remaining_amount,
      });

      if (response.success) {
        alert("پرداخت با موفقیت انجام شد");
        // Store request_id before refreshing
        const requestId = paymentInfo.request_id;
        // Refresh payment info
        await fetchPaymentInfo();
        // Navigate back to request details if we have request_id, otherwise go to requests list
        if (requestId) {
          navigate(`/user/requests/${requestId}`);
        } else {
          navigate("/user/requests");
        }
      } else {
        setError(response.message || "خطا در پرداخت از کیف پول");
      }
    } catch (err: any) {
      console.error("Error paying from wallet:", err);
      setError(err.response?.data?.message || "خطا در پرداخت از کیف پول");
    } finally {
      setPayingFromWallet(false);
    }
  };

  const handlePayFromGateway = async () => {
    if (!paymentInfo) return;

    try {
      setInitiatingGateway(true);
      setError("");

      const response =
        selectedGateway === "zarinpal"
          ? await paymentService.initiateInvoiceZarinpalPayment(
              paymentInfo.invoice_id,
              paymentInfo.remaining_amount
            )
          : await paymentService.initiateInvoiceZibalPayment(
              paymentInfo.invoice_id,
              paymentInfo.remaining_amount
            );

      if (response.redirect_url) {
        // Store callback URL
        localStorage.setItem(
          "invoice_payment_callback",
          `/user/invoice-payment/callback`
        );
        // Redirect to payment gateway
        window.location.href = response.redirect_url;
      } else {
        setError("خطا در دریافت لینک پرداخت");
      }
    } catch (err: any) {
      console.error("Error initiating gateway payment:", err);
      setError(err.response?.data?.message || "خطا در ایجاد تراکنش پرداخت");
    } finally {
      setInitiatingGateway(false);
    }
  };

  const getPaymentStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      NOT_PAID: "پرداخت نشده",
      PARTIALLY_PAID: "پرداخت جزئی",
      PAID: "پرداخت شده",
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      NOT_PAID: "bg-red-100 text-red-800",
      PARTIALLY_PAID: "bg-yellow-100 text-yellow-800",
      PAID: "bg-green-100 text-green-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <span className="mr-3 text-gray-600 font-semibold">
          در حال بارگذاری...
        </span>
      </div>
    );
  }

  if (error && !paymentInfo) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4 font-semibold">{error}</div>
        <button
          onClick={() => navigate("/user/requests")}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold"
        >
          بازگشت به درخواست‌ها
        </button>
      </div>
    );
  }

  if (!paymentInfo) {
    return null;
  }

  // If already paid
  if (paymentInfo.payment_status === "PAID") {
    return (
      <div className="fade-in font-vazir max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Receipt className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            فاکتور پرداخت شده است
          </h2>
          <p className="text-gray-600 mb-6">این فاکتور قبلاً پرداخت شده است</p>
          <button
            onClick={() => navigate(`/user/requests/${orderId}`)}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold"
          >
            بازگشت به جزئیات درخواست
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in font-vazir max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/user/requests/${orderId}`)}
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت
        </button>
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Receipt className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                پرداخت فاکتور
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                فاکتور شماره {paymentInfo.invoice_code}
              </p>
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

      {/* Payment Info */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">اطلاعات فاکتور</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">مبلغ کل فاکتور</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(paymentInfo.total_amount)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">موجودی کیف پول</p>
            <p
              className={`text-3xl font-bold ${
                paymentInfo.wallet_balance >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(paymentInfo.wallet_balance)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">مبلغ باقیمانده</p>
            <p
              className={`text-3xl font-bold ${
                paymentInfo.remaining_amount > 0
                  ? "text-orange-600"
                  : "text-green-600"
              }`}
            >
              {formatCurrency(paymentInfo.remaining_amount)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">وضعیت پرداخت</p>
            <span
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold ${getPaymentStatusColor(
                paymentInfo.payment_status
              )}`}
            >
              {getPaymentStatusText(paymentInfo.payment_status)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Options */}
      {paymentInfo.remaining_amount > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">روش پرداخت</h2>

          {/* Pay from Wallet */}
          {paymentInfo.can_pay_from_wallet && (
            <div className="mb-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 mb-4">
                <div className="flex items-center space-x-reverse space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      پرداخت از کیف پول
                    </h3>
                    <p className="text-sm text-gray-600">
                      موجودی کیف پول شما کافی است
                    </p>
                  </div>
                </div>
                <button
                  onClick={handlePayFromWallet}
                  disabled={payingFromWallet}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-bold text-lg flex items-center justify-center space-x-reverse space-x-2 shadow-lg disabled:opacity-50"
                >
                  {payingFromWallet ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>در حال پرداخت...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-6 h-6" />
                      <span>
                        پرداخت {formatCurrency(paymentInfo.remaining_amount)} از
                        کیف پول
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Pay from Gateway */}
          <div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-center space-x-reverse space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    پرداخت از درگاه
                  </h3>
                  <p className="text-sm text-gray-600">
                    {paymentInfo.can_pay_from_wallet
                      ? "یا می‌توانید از درگاه پرداخت کنید"
                      : "پرداخت از طریق درگاه پرداخت"}
                  </p>
                </div>
              </div>

              {/* Gateway Selection */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  انتخاب درگاه پرداخت
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedGateway("zarinpal")}
                    className={`px-4 py-3 rounded-lg border-2 transition-all font-semibold ${
                      selectedGateway === "zarinpal"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    زرین‌پال
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGateway("zibal")}
                    className={`px-4 py-3 rounded-lg border-2 transition-all font-semibold ${
                      selectedGateway === "zibal"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    زیبال
                  </button>
                </div>
              </div>

              <button
                onClick={handlePayFromGateway}
                disabled={initiatingGateway}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-bold text-lg flex items-center justify-center space-x-reverse space-x-2 shadow-lg disabled:opacity-50"
              >
                {initiatingGateway ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>در حال هدایت به درگاه...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" />
                    <span>
                      پرداخت {formatCurrency(paymentInfo.remaining_amount)} از
                      درگاه{" "}
                      {selectedGateway === "zarinpal" ? "زرین‌پال" : "زیبال"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
