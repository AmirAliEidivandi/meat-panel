import { Calculator, CheckCircle, X } from "lucide-react";
import { useState } from "react";
import { orderService } from "../services/api";
import type { OrderDetails } from "../types";

interface UpdateOrderHpCodeModalProps {
  order: OrderDetails;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateOrderHpCodeModal({
  order,
  isOpen,
  onClose,
  onSuccess,
}: UpdateOrderHpCodeModalProps) {
  const [hpInvoiceCode, setHpInvoiceCode] = useState<number>(
    order.hp_invoice_code ?? 0
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!hpInvoiceCode) {
      setError("لطفاً کد حسابداری را وارد کنید");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await orderService.updateOrderHpCode(order.id, hpInvoiceCode);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error updating HP code:", err);
      setError(err.response?.data?.message || "خطا در ثبت کد حسابداری");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-reverse space-x-3">
            <Calculator className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">ثبت کد حسابداری</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              کد حسابداری *
            </label>
            <input
              type="number"
              value={hpInvoiceCode}
              onChange={(e) => {
                setHpInvoiceCode(Number(e.target.value));
                setError("");
              }}
              placeholder="مثال: 12345"
              min="1"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {order.hp_invoice_code && (
              <p className="mt-2 text-sm text-gray-500">
                کد فعلی: {order.hp_invoice_code}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-reverse space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            انصراف
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-reverse space-x-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>در حال ثبت...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>ثبت کد</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
