import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { paymentService } from "../../services/api";

export default function WalletTopupCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [refId, setRefId] = useState<number | null>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      setLoading(true);

      // Get query parameters
      const paymentTransactionId = searchParams.get("payment_transaction_id");
      const successParam = searchParams.get("success");
      const messageParam = searchParams.get("message");
      const refIdParam = searchParams.get("ref_id");

      // If result is already in query params (from backend redirect), use it
      if (successParam !== null && messageParam) {
        setSuccess(successParam === "true");
        setMessage(decodeURIComponent(messageParam));
        if (refIdParam) {
          setRefId(parseInt(refIdParam));
        }
        setLoading(false);
        return;
      }

      // Otherwise, verify payment via API (fallback for direct access)
      const authority = searchParams.get("Authority");
      const status = searchParams.get("Status");
      const trackId = searchParams.get("trackId");

      if (!paymentTransactionId) {
        setSuccess(false);
        setMessage("شناسه تراکنش یافت نشد");
        setLoading(false);
        return;
      }

      let response;

      // Determine which gateway was used
      if (authority && status !== null) {
        // Zarinpal callback
        response = await paymentService.zarinpalWalletTopupCallback(
          paymentTransactionId,
          authority,
          status || ""
        );
      } else if (trackId) {
        // Zibal callback
        response = await paymentService.zibalWalletTopupCallback(
          paymentTransactionId,
          parseInt(trackId)
        );
      } else {
        setSuccess(false);
        setMessage("اطلاعات پرداخت ناقص است");
        setLoading(false);
        return;
      }

      setSuccess(response.success);
      setMessage(response.message);
      setRefId(response.ref_id);
    } catch (err: any) {
      console.error("Error verifying payment:", err);
      setSuccess(false);
      setMessage(err.response?.data?.message || "خطا در بررسی وضعیت پرداخت");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToWallet = () => {
    // Clear any stored callback URL
    localStorage.removeItem("wallet_topup_callback");
    // Mark that wallet data should be refreshed
    sessionStorage.setItem("wallet_refresh_needed", "true");
    navigate("/user/wallet");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full mx-4">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                در حال بررسی پرداخت...
              </h2>
              <p className="text-gray-600 text-center">لطفاً صبر کنید</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full">
        <div className="flex flex-col items-center space-y-6">
          {/* Icon */}
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center ${
              success ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {success ? (
              <CheckCircle className="w-16 h-16 text-green-600" />
            ) : (
              <XCircle className="w-16 h-16 text-red-600" />
            )}
          </div>

          {/* Title */}
          <div className="text-center">
            <h2
              className={`text-3xl font-bold mb-3 ${
                success ? "text-green-600" : "text-red-600"
              }`}
            >
              {success ? "پرداخت موفقیت‌آمیز بود!" : "پرداخت ناموفق"}
            </h2>
            <p className="text-gray-600 text-lg mb-4">{message}</p>
            {refId && (
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-600 mb-1">شماره پیگیری:</p>
                <p className="text-xl font-bold text-gray-900">{refId}</p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleBackToWallet}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg flex items-center justify-center space-x-reverse space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>بازگشت به کیف پول</span>
          </button>
        </div>
      </div>
    </div>
  );
}
