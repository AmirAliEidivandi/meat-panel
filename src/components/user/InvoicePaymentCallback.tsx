import { ArrowLeft, CheckCircle, Loader2, Receipt, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { invoiceService, paymentService } from "../../services/api";

export default function InvoicePaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [refId, setRefId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [amountPaid, setAmountPaid] = useState<number | null>(null);
  const [walletBalanceAfter, setWalletBalanceAfter] = useState<number | null>(
    null
  );

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      setLoading(true);

      // Get query parameters
      const invoiceIdParam = searchParams.get("invoice_id");
      const paymentTransactionId = searchParams.get("payment_transaction_id");
      const successParam = searchParams.get("success");
      const messageParam = searchParams.get("message");
      const refIdParam = searchParams.get("ref_id");
      const orderIdParam = searchParams.get("order_id");
      const amountPaidParam = searchParams.get("amount_paid");
      const remainingAmountParam = searchParams.get("remaining_amount");
      const invoiceFullyPaidParam = searchParams.get("invoice_fully_paid");
      const paymentIdParam = searchParams.get("payment_id");
      const invoiceCodeParam = searchParams.get("invoice_code");
      const cardPanParam = searchParams.get("card_pan");
      const alreadyVerifiedParam = searchParams.get("already_verified");
      const cancelledParam = searchParams.get("cancelled");

      // If result is already in query params (from backend redirect), use it
      if (successParam !== null && messageParam && invoiceIdParam) {
        setSuccess(successParam === "true");
        setMessage(decodeURIComponent(messageParam));
        setInvoiceId(invoiceIdParam);
        
        // Set order_id if available in query params
        if (orderIdParam) {
          setOrderId(orderIdParam);
        } else {
          // If order_id is not in query params, try to get it from invoice
          try {
            const invoice = await invoiceService.getInvoiceById(invoiceIdParam);
            if (invoice.order?.id) {
              setOrderId(invoice.order.id);
            }
            // Get customer_request_id for navigation
            if (invoice.order?.customer_request_id) {
              setRequestId(invoice.order.customer_request_id);
            }
          } catch (err) {
            console.error("Error fetching invoice for order_id:", err);
            // Continue without order_id
          }
        }
        
        // Set ref_id if available
        if (refIdParam) {
          setRefId(refIdParam);
        }
        
        // Set amount_paid if available
        if (amountPaidParam) {
          setAmountPaid(parseFloat(amountPaidParam));
        }
        
        // Note: wallet_balance_after might not be in query params for invoice payment
        // It's handled by backend, so we don't need to display it here
        
        setLoading(false);
        return;
      }

      // Otherwise, verify payment via API (fallback for direct access)
      if (!invoiceIdParam || !paymentTransactionId) {
        setSuccess(false);
        setMessage("اطلاعات پرداخت ناقص است");
        setLoading(false);
        return;
      }

      const authority = searchParams.get("Authority");
      const status = searchParams.get("Status");
      const trackId = searchParams.get("trackId");

      let response;

      // Determine which gateway was used
      if (authority && status !== null) {
        // Zarinpal callback
        response = await paymentService.invoiceZarinpalCallback(
          invoiceIdParam,
          paymentTransactionId,
          authority,
          status || ""
        );
      } else if (trackId) {
        // Zibal callback
        response = await paymentService.invoiceZibalCallback(
          invoiceIdParam,
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
      setOrderId(response.order_id);
      setInvoiceId(response.invoice_id);
      setAmountPaid(response.amount_paid);
      setWalletBalanceAfter(response.wallet_balance_after);
      
      // Try to get request_id from invoice if not in response
      if (response.invoice_id && !requestId) {
        try {
          const invoice = await invoiceService.getInvoiceById(response.invoice_id);
          if (invoice.order?.customer_request_id) {
            setRequestId(invoice.order.customer_request_id);
          }
        } catch (err) {
          console.error("Error fetching invoice for request_id:", err);
        }
      }
    } catch (err: any) {
      console.error("Error verifying payment:", err);
      setSuccess(false);
      setMessage(
        err.response?.data?.message || "خطا در بررسی وضعیت پرداخت"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToOrder = () => {
    // Clear any stored callback URL
    localStorage.removeItem("invoice_payment_callback");
    // Mark that wallet data should be refreshed
    sessionStorage.setItem("wallet_refresh_needed", "true");
    
    // Navigate to request details if we have request_id, otherwise to requests list
    if (requestId) {
      navigate(`/user/requests/${requestId}`);
    } else if (orderId) {
      // Fallback: try to navigate using orderId (though this might not work if orderId is not a request ID)
      navigate("/user/requests");
    } else {
      navigate("/user/requests");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full mx-4">
          <div className="flex flex-col items-center space-y-6">
            <Loader2 className="w-20 h-20 text-amber-600 animate-spin" />
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
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

            {/* Payment Details */}
            {success && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 mt-4 border-2 border-green-200 space-y-2">
                {refId && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">شماره پیگیری:</p>
                    <p className="text-xl font-bold text-gray-900">{refId}</p>
                  </div>
                )}
                {amountPaid !== null && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">مبلغ پرداخت شده:</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {new Intl.NumberFormat("fa-IR").format(amountPaid)} ریال
                    </p>
                  </div>
                )}
                {walletBalanceAfter !== null && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      موجودی کیف پول بعد از پرداخت:
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {new Intl.NumberFormat("fa-IR").format(
                        walletBalanceAfter
                      )}{" "}
                      ریال
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleBackToOrder}
            className="w-full px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg flex items-center justify-center space-x-reverse space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>
              {requestId || orderId
                ? "بازگشت به جزئیات درخواست"
                : "بازگشت به درخواست‌ها"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

