import { Loader2, ShoppingCart, Trash2, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../lib/utils";
import { cartService, fileUrl } from "../../services/api";
import type { CartItem, CheckoutCartDto, GetMyCartResponse } from "../../types";

export default function UserCart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<GetMyCartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showEditWeightModal, setShowEditWeightModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [editWeight, setEditWeight] = useState<string>("1");
  const [checkoutData, setCheckoutData] = useState<CheckoutCartDto>({
    address: "",
    payment_method: "WALLET",
    freight_cost: 0,
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await cartService.getMyCart();
      setCart(data);
    } catch (err: any) {
      console.error("Error fetching cart:", err);
      if (err.response?.status === 404) {
        // Cart doesn't exist yet, which is fine
        setCart(null);
      } else {
        setError(err.response?.data?.message || "خطا در دریافت سبد خرید");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditWeight = (item: CartItem) => {
    setEditingItem(item);
    setEditWeight(Math.floor(item.weight).toString());
    setShowEditWeightModal(true);
    setError("");
  };

  const handleSaveWeight = async () => {
    if (!editingItem) return;

    const weight = parseInt(editWeight, 10);
    if (isNaN(weight) || weight <= 0) {
      setError("وزن باید یک عدد صحیح مثبت باشد");
      return;
    }

    if (weight === Math.floor(editingItem.weight)) {
      setShowEditWeightModal(false);
      setEditingItem(null);
      return;
    }

    try {
      setUpdatingItems((prev) => new Set(prev).add(editingItem.id));
      setError("");
      await cartService.updateCartItem({
        cart_item_id: editingItem.id,
        weight: weight,
      });
      await fetchCart();
      setShowEditWeightModal(false);
      setEditingItem(null);
    } catch (err: any) {
      console.error("Error updating cart item:", err);
      setError(err.response?.data?.message || "خطا در به‌روزرسانی محصول");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(editingItem.id);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setUpdatingItems((prev) => new Set(prev).add(itemId));
      setError("");
      await cartService.removeCartItem(itemId);
      await fetchCart();
    } catch (err: any) {
      console.error("Error removing cart item:", err);
      setError(err.response?.data?.message || "خطا در حذف محصول");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید سبد خرید را خالی کنید؟")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await cartService.clearCart();
      setCart(null);
    } catch (err: any) {
      console.error("Error clearing cart:", err);
      setError(err.response?.data?.message || "خطا در خالی کردن سبد خرید");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!checkoutData.address.trim()) {
      setError("لطفاً آدرس را وارد کنید");
      return;
    }

    try {
      setCheckoutLoading(true);
      setError("");
      const response = await cartService.checkout(checkoutData);
      alert("درخواست شما با موفقیت ثبت شد");
      setShowCheckoutModal(false);
      setCart(null);
      // Navigate to request details
      navigate(`/user/requests/${response.id}`);
    } catch (err: any) {
      console.error("Error checking out:", err);
      setError(
        err.response?.data?.message ||
          "خطا در ثبت درخواست. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <span className="mr-3 text-gray-600 font-semibold">
          در حال بارگذاری...
        </span>
      </div>
    );
  }

  // Empty Cart State
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="space-y-6 fade-in font-vazir">
        {/* Header */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">سبد خرید</h1>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold mb-2">
            سبد خرید شما خالی است
          </p>
          <p className="text-gray-400 text-sm mb-6">
            برای افزودن محصول به سبد خرید، به لیست محصولات بروید
          </p>
          <button
            onClick={() => navigate("/user/products")}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold"
          >
            مشاهده لیست محصولات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in font-vazir">
      {/* Header */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">سبد خرید</h1>
              <p className="text-sm text-gray-600 mt-1">
                {cart.items.length} محصول در سبد خرید
              </p>
            </div>
          </div>
          <button
            onClick={handleClearCart}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all font-semibold flex items-center space-x-reverse space-x-2"
          >
            <Trash2 className="w-5 h-5" />
            <span>خالی کردن سبد</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      )}

      {/* Cart Items */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="space-y-4">
          {cart.items.map((item) => {
            const isUpdating = updatingItems.has(item.id);

            return (
              <div
                key={item.id}
                className="flex items-center space-x-reverse space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:shadow-md transition-all"
              >
                {/* Product Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={
                        fileUrl(item.images[0].thumbnail) ||
                        fileUrl(item.images[0].url) ||
                        ""
                      }
                      alt={item.product_title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {item.product_title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    کد: {item.product_code}
                  </p>
                  <p className="text-sm font-semibold text-emerald-600">
                    {formatCurrency(item.online_price)} / کیلوگرم
                  </p>
                </div>

                {/* Weight Display and Edit Button */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">وزن:</p>
                    {isUpdating ? (
                      <Loader2 className="w-5 h-5 text-amber-600 animate-spin mx-auto" />
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {Math.floor(item.weight)} کیلوگرم
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleEditWeight(item)}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors disabled:opacity-50 font-semibold text-sm"
                  >
                    ویرایش
                  </button>
                </div>

                {/* Total Price */}
                <div className="text-left min-w-[120px]">
                  <p className="text-sm text-gray-600 mb-1">جمع کل:</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {formatCurrency(item.total_price)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={isUpdating}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart Summary */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-lg">
            <span className="text-gray-700 font-semibold">
              جمع کل سبد خرید:
            </span>
            <span className="text-2xl font-bold text-emerald-600">
              {formatCurrency(cart.total_price)}
            </span>
          </div>
          <button
            onClick={() => setShowCheckoutModal(true)}
            className="w-full px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all font-bold text-lg flex items-center justify-center space-x-reverse space-x-2"
          >
            <Truck className="w-6 h-6" />
            <span>ثبت درخواست</span>
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCheckoutModal(false);
              setError("");
            }
          }}
        >
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              ثبت درخواست
            </h2>

            <div className="space-y-4">
              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  آدرس تحویل *
                </label>
                <textarea
                  value={checkoutData.address}
                  onChange={(e) =>
                    setCheckoutData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="آدرس کامل تحویل را وارد کنید..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  روش پرداخت *
                </label>
                <select
                  value={checkoutData.payment_method}
                  onChange={(e) =>
                    setCheckoutData((prev) => ({
                      ...prev,
                      payment_method: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="WALLET">کیف پول</option>
                  <option value="CASH">نقدی</option>
                  <option value="ONLINE">آنلاین</option>
                </select>
              </div>

              {/* Freight Cost */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  هزینه ارسال (ریال)
                </label>
                <input
                  type="number"
                  value={checkoutData.freight_cost}
                  onChange={(e) =>
                    setCheckoutData((prev) => ({
                      ...prev,
                      freight_cost: parseFloat(e.target.value) || 0,
                    }))
                  }
                  min={0}
                  placeholder="0"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              {/* Total */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="text-gray-700 font-semibold">جمع کل:</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(
                      cart.total_price + checkoutData.freight_cost
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-reverse space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCheckoutModal(false);
                  setError("");
                }}
                disabled={checkoutLoading}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-semibold"
              >
                انصراف
              </button>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 transition-all font-semibold flex items-center space-x-reverse space-x-2"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>در حال ثبت...</span>
                  </>
                ) : (
                  <span>ثبت درخواست</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Weight Modal */}
      {showEditWeightModal && editingItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditWeightModal(false);
              setEditingItem(null);
              setError("");
            }
          }}
        >
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              ویرایش وزن محصول
            </h2>

            <div className="space-y-4">
              {/* Product Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {editingItem.product_title}
                </h3>
                <p className="text-sm text-gray-600">
                  کد: {editingItem.product_code}
                </p>
              </div>

              {/* Weight Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  وزن (کیلوگرم) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={editWeight}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    // Allow empty string for user to clear and type new value
                    if (inputValue === "") {
                      setEditWeight("");
                      return;
                    }
                    // Only allow digits
                    if (/^\d+$/.test(inputValue)) {
                      const numValue = parseInt(inputValue, 10);
                      if (numValue > 0) {
                        setEditWeight(inputValue);
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value, 10);
                    // Only set to 1 if value is invalid or empty
                    if (!value || value < 1 || isNaN(value)) {
                      setEditWeight("1");
                    } else {
                      setEditWeight(value.toString());
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-center font-semibold text-lg"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  فقط اعداد صحیح مثبت قابل قبول است
                </p>
              </div>

              {/* Price Preview */}
              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 font-semibold">
                    قیمت کل:
                  </span>
                  <span className="text-xl font-bold text-emerald-600">
                    {formatCurrency(
                      editingItem.online_price * (parseInt(editWeight, 10) || 1)
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-reverse space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditWeightModal(false);
                  setEditingItem(null);
                  setError("");
                }}
                disabled={updatingItems.has(editingItem.id)}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-semibold"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveWeight}
                disabled={updatingItems.has(editingItem.id)}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 transition-all font-semibold flex items-center space-x-reverse space-x-2"
              >
                {updatingItems.has(editingItem.id) ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>در حال ذخیره...</span>
                  </>
                ) : (
                  <span>ذخیره</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
