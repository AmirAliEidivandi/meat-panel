import {
  Heart,
  Loader2,
  Minus,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { formatCurrency } from "../../lib/utils";
import {
  cartService,
  favoriteService,
  fileUrl,
  publicService,
} from "../../services/api";
import {
  TemperatureTypeEnumValues,
  type PublicProductListItem,
  type QueryPublicDto,
} from "../../types";
import Pagination from "../Pagination";

export default function UserProducts() {
  const [products, setProducts] = useState<PublicProductListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<QueryPublicDto>({
    page: 1,
    "page-size": 20,
  });
  const [productWeights, setProductWeights] = useState<Record<string, number>>(
    {}
  );
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await publicService.getProducts(filters);
      setProducts(response.data || []);
      setTotalCount(response.count || 0);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.message || "خطا در دریافت لیست محصولات");
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (productId: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (value === "" || (numValue > 0 && !isNaN(numValue))) {
      setProductWeights((prev) => ({
        ...prev,
        [productId]: value === "" ? 1 : numValue,
      }));
    }
  };

  const handleWeightIncrement = (productId: string) => {
    const currentWeight = productWeights[productId] || 1;
    setProductWeights((prev) => ({
      ...prev,
      [productId]: currentWeight + 1,
    }));
  };

  const handleWeightDecrement = (productId: string) => {
    const currentWeight = productWeights[productId] || 1;
    if (currentWeight > 1) {
      setProductWeights((prev) => ({
        ...prev,
        [productId]: currentWeight - 1,
      }));
    }
  };

  const handleToggleFavorite = async (
    productId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    try {
      setTogglingFavorite(productId);
      setError("");

      const response = await favoriteService.addFavoriteProduct({
        product_id: productId,
      });

      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? { ...product, is_favorite: response.is_favorite }
            : product
        )
      );
    } catch (err: any) {
      console.error("Error toggling favorite:", err);
      setError(
        err.response?.data?.message || "خطا در تغییر وضعیت علاقه‌مندی"
      );
    } finally {
      setTogglingFavorite(null);
    }
  };

  const handleAddToCart = async (productId: string) => {
    const weight = productWeights[productId] || 1;

    if (weight <= 0) {
      setError("وزن باید بیشتر از صفر باشد");
      return;
    }

    try {
      setAddingToCart(productId);
      setError("");

      await cartService.addCartItem({
        product_id: productId,
        weight: weight,
      });

      setProductWeights((prev) => {
        const newWeights = { ...prev };
        delete newWeights[productId];
        return newWeights;
      });

      alert("محصول به سبد خرید اضافه شد");
    } catch (err: any) {
      console.error("Error adding to cart:", err);
      setError(
        err.response?.data?.message || "خطا در اضافه کردن محصول به سبد خرید"
      );
    } finally {
      setAddingToCart(null);
    }
  };

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      search: searchTerm || undefined,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const totalPages = Math.ceil(totalCount / (filters["page-size"] || 20));

  return (
    <div className="fade-in font-vazir max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">لیست محصولات</h1>
              <p className="text-sm text-gray-600 mt-1">
                {totalCount} محصول موجود
              </p>
            </div>
          </div>
          <button
            onClick={fetchProducts}
            className="inline-flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            بروزرسانی
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-reverse space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="جستجوی محصولات..."
              className="w-full pr-10 pl-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold shadow-lg"
          >
            جستجو
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <span className="mr-3 text-gray-600 font-semibold">
            در حال بارگذاری...
          </span>
        </div>
      )}

      {/* Products Grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={
                      fileUrl(product.images[0].thumbnail) ||
                      fileUrl(product.images[0].url) ||
                      ""
                    }
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <ShoppingBag className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                {/* Favorite Heart Button */}
                <button
                  onClick={(e) => handleToggleFavorite(product.id, e)}
                  disabled={togglingFavorite === product.id}
                  className={`absolute top-3 left-3 p-2 rounded-full transition-all duration-200 shadow-lg ${
                    product.is_favorite
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-white/90 text-gray-400 hover:bg-white hover:text-red-500"
                  } ${togglingFavorite === product.id ? "opacity-50 cursor-not-allowed" : "hover:scale-110"}`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      product.is_favorite ? "fill-current" : ""
                    } ${togglingFavorite === product.id ? "animate-pulse" : ""}`}
                  />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                  {product.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">کد: {product.code}</p>
                {product.temperature_type && (
                  <div className="mb-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        product.temperature_type ===
                        TemperatureTypeEnumValues.COLD
                          ? "bg-blue-100 text-blue-800"
                          : product.temperature_type ===
                            TemperatureTypeEnumValues.HOT
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.temperature_type ===
                      TemperatureTypeEnumValues.COLD
                        ? "منجمد"
                        : product.temperature_type ===
                          TemperatureTypeEnumValues.HOT
                        ? "گرم"
                        : "عادی"}
                    </span>
                  </div>
                )}
                {product.online_price !== undefined &&
                  product.online_price !== null && (
                    <div className="mb-4">
                      <p className="text-xl font-bold text-emerald-600">
                        {formatCurrency(product.online_price)}
                        <span className="text-sm text-gray-600 mr-1 font-normal">
                          / کیلوگرم
                        </span>
                      </p>
                    </div>
                  )}

                {/* Weight Control */}
                <div className="mb-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    وزن (کیلوگرم)
                  </label>
                  <div className="flex items-center space-x-reverse space-x-2">
                    <button
                      onClick={() => handleWeightDecrement(product.id)}
                      disabled={
                        addingToCart === product.id ||
                        (productWeights[product.id] || 1) <= 1
                      }
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-5 h-5 text-gray-700" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={productWeights[product.id] || 1}
                      onChange={(e) =>
                        handleWeightChange(product.id, e.target.value)
                      }
                      onBlur={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (!value || value < 1) {
                          setProductWeights((prev) => ({
                            ...prev,
                            [product.id]: 1,
                          }));
                        }
                      }}
                      disabled={addingToCart === product.id}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={() => handleWeightIncrement(product.id)}
                      disabled={addingToCart === product.id}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={addingToCart === product.id}
                  className="w-full flex items-center justify-center space-x-reverse space-x-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg"
                >
                  {addingToCart === product.id ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>در حال اضافه کردن...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>افزودن به سبد خرید</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            محصولی یافت نشد
          </h2>
          <p className="text-gray-500">
            لطفاً عبارت جستجوی دیگری را امتحان کنید
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && products.length > 0 && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={filters.page || 1}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={filters["page-size"] || 20}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
