import { ArrowRight, DollarSign, Loader2, Package, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatNumberWithCommas } from "../lib/utils";
import { productService, warehouseService } from "../services/api";
import type {
  Product,
  UpdateProductPricesRequest,
  WarehouseDetailsResponse,
} from "../types";

interface ProductPrice {
  id: string;
  title: string;
  code: number;
  retail_price: number;
  wholesale_price: number;
  online_price: number;
}

export default function UpdateProductPrices() {
  const navigate = useNavigate();
  const { id: warehouseId } = useParams<{ id: string }>();
  const [warehouse, setWarehouse] = useState<WarehouseDetailsResponse | null>(
    null
  );
  const [products, setProducts] = useState<ProductPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (warehouseId) {
      fetchWarehouseDetails();
      fetchProducts();
    }
  }, [warehouseId]);

  const fetchWarehouseDetails = async () => {
    if (!warehouseId) return;

    try {
      const data = await warehouseService.getWarehouseById(warehouseId);
      setWarehouse(data);
    } catch (err: any) {
      console.error("Error fetching warehouse details:", err);
    }
  };

  const fetchProducts = async () => {
    if (!warehouseId) return;

    try {
      setLoading(true);
      setError("");
      const data = await productService.getProductsByWarehouse(warehouseId);
      const productsData: ProductPrice[] = (
        Array.isArray(data) ? data : []
      ).map((product: Product) => ({
        id: product.id,
        title: product.title,
        code: product.code,
        retail_price: product.retail_price || 0,
        wholesale_price: product.wholesale_price || 0,
        online_price: product.online_price || 0,
      }));
      setProducts(productsData);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError("خطا در بارگذاری محصولات");
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (
    productId: string,
    field: "retail_price" | "wholesale_price" | "online_price",
    value: string
  ) => {
    // Remove all non-digit characters except for Persian and English digits
    let cleaned = value.replace(/[^\d۰-۹]/g, "");

    // Convert Persian digits to English for parsing
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    const englishDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    persianDigits.forEach((persian, index) => {
      cleaned = cleaned.replace(new RegExp(persian, "g"), englishDigits[index]);
    });

    // Parse to number
    const numValue = cleaned === "" ? 0 : parseFloat(cleaned) || 0;

    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId ? { ...product, [field]: numValue } : product
      )
    );
  };

  const handleSave = async () => {
    if (!warehouseId) return;

    try {
      setSaving(true);
      setError("");

      const updateData: UpdateProductPricesRequest[] = products.map(
        (product) => ({
          id: product.id,
          retail_price: product.retail_price || 0,
          wholesale_price: product.wholesale_price || 0,
          online_price: product.online_price || 0,
        })
      );

      await productService.updateProductPrices(warehouseId, updateData);
      // Show success message or navigate back
      navigate(`/manage/warehouses/${warehouseId}`);
    } catch (err: any) {
      console.error("Error updating prices:", err);
      setError("خطا در به‌روزرسانی قیمت‌ها");
    } finally {
      setSaving(false);
    }
  };

  if (!warehouseId) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">شناسه انبار یافت نشد</p>
        <button
          onClick={() => navigate("/manage/warehouses")}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          بازگشت به لیست انبارها
        </button>
      </div>
    );
  }

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

  return (
    <div className="space-y-6 fade-in font-vazir">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-reverse space-x-3">
            <button
              onClick={() => navigate(`/manage/warehouses/${warehouseId}`)}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all"
            >
              <ArrowRight className="w-5 h-5 text-gray-700" />
            </button>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                به‌روزرسانی قیمت‌ها
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {warehouse?.name || "انبار"} • {products.length} محصول
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center space-x-reverse space-x-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>در حال ذخیره...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>ذخیره تغییرات</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      )}

      {/* Products Table */}
      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold">
            هیچ محصولی یافت نشد
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    #
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    کد محصول
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    نام محصول
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    قیمت خرده‌فروشی
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    قیمت عمده‌فروشی
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    قیمت آنلاین
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product, index) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4 text-sm text-gray-700 font-semibold text-right">
                      {formatNumberWithCommas(index + 1)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 font-semibold text-right">
                      {formatNumberWithCommas(product.code)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 font-semibold text-right">
                      {product.title}
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={
                            product.retail_price
                              ? formatNumberWithCommas(product.retail_price)
                              : ""
                          }
                          onChange={(e) =>
                            handlePriceChange(
                              product.id,
                              "retail_price",
                              e.target.value
                            )
                          }
                          placeholder="0"
                          dir="ltr"
                          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right text-sm font-semibold bg-white"
                          style={{ direction: "ltr", textAlign: "right" }}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                          ریال
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={
                            product.wholesale_price
                              ? formatNumberWithCommas(product.wholesale_price)
                              : ""
                          }
                          onChange={(e) =>
                            handlePriceChange(
                              product.id,
                              "wholesale_price",
                              e.target.value
                            )
                          }
                          placeholder="0"
                          dir="ltr"
                          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right text-sm font-semibold bg-white"
                          style={{ direction: "ltr", textAlign: "right" }}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                          ریال
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={
                            product.online_price
                              ? formatNumberWithCommas(product.online_price)
                              : ""
                          }
                          onChange={(e) =>
                            handlePriceChange(
                              product.id,
                              "online_price",
                              e.target.value
                            )
                          }
                          placeholder="0"
                          dir="ltr"
                          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right text-sm font-semibold bg-white"
                          style={{ direction: "ltr", textAlign: "right" }}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                          ریال
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
