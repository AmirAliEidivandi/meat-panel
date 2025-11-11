import { Heart, Loader2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { formatCurrency } from "../../lib/utils";
import { cartService, favoriteService, fileUrl, publicService } from "../../services/api";
import {
  TemperatureTypeEnumValues,
  type PublicProductListItem,
} from "../../types";

export default function UserFavorites() {
  const [favoriteProducts, setFavoriteProducts] = useState<PublicProductListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [productWeights, setProductWeights] = useState<Record<string, number>>({});
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await favoriteService.getFavoriteProducts();
      
      // Handle different response structures
      let favoritesArray: any[] = [];
      
      // Check if response is an array directly
      if (Array.isArray(response)) {
        favoritesArray = response;
      } 
      // Check if response has data property
      else if (response && response.data && Array.isArray(response.data)) {
        favoritesArray = response.data;
      }
      // If response structure is different, log it for debugging
      else {
        console.warn("Unexpected response structure:", response);
        setFavoriteProducts([]);
        setTotalCount(0);
        return;
      }
      
      // Extract product_ids from favorites
      const productIds = favoritesArray
        .map((fav) => fav.product_id)
        .filter((id): id is string => !!id);
      
      if (productIds.length === 0) {
        setFavoriteProducts([]);
        setTotalCount(0);
        return;
      }
      
      // Fetch products for each product_id
      // If we have few favorites, fetch individually. Otherwise, fetch all and filter
      const favoriteProductsList: PublicProductListItem[] = [];
      
      if (productIds.length <= 10) {
        // For small number of favorites, fetch individually (faster)
        const productPromises = productIds.map((productId) =>
          publicService.getProductById(productId).catch(() => null)
        );
        const products = await Promise.all(productPromises);
        
        products.forEach((product) => {
          if (product) {
            // Convert PublicProductDetails to PublicProductListItem format
            const listItem: PublicProductListItem = {
              id: product.id,
              title: product.title,
              code: product.code,
              online_price: product.online_price,
              temperature_type: product.temperature_type,
              images: product.images || [],
              is_favorite: true,
            };
            favoriteProductsList.push(listItem);
          }
        });
      } else {
        // For many favorites, fetch all products and filter (more efficient)
        let currentPage = 1;
        let hasMore = true;
        const foundProductIds = new Set<string>();
        
        while (hasMore && foundProductIds.size < productIds.length) {
          const productsResponse = await publicService.getProducts({
            page: currentPage,
            "page-size": 100,
          });
          
          const products = productsResponse.data || [];
          if (products.length === 0) {
            hasMore = false;
            break;
          }
          
          // Filter products that are in favorites
          products.forEach((product) => {
            if (productIds.includes(product.id) && !foundProductIds.has(product.id)) {
              favoriteProductsList.push({ ...product, is_favorite: true });
              foundProductIds.add(product.id);
            }
          });
          
          // Check if we've found all favorites or if there are more pages
          if (foundProductIds.size >= productIds.length) {
            hasMore = false;
          } else if (products.length < 100) {
            hasMore = false;
          } else {
            currentPage++;
          }
        }
      }
      
      // Sort to maintain the order of favorites (newest first based on created_at)
      const sortedFavorites = favoritesArray
        .map((fav) => {
          const product = favoriteProductsList.find((p) => p.id === fav.product_id);
          return product ? { ...product, favoriteCreatedAt: fav.created_at } : null;
        })
        .filter((p): p is PublicProductListItem & { favoriteCreatedAt: string } => p !== null)
        .sort((a, b) => 
          new Date(b.favoriteCreatedAt).getTime() - new Date(a.favoriteCreatedAt).getTime()
        )
        .map(({ favoriteCreatedAt, ...product }) => product);
      
      setFavoriteProducts(sortedFavorites);
      setTotalCount(sortedFavorites.length);
    } catch (err: any) {
      console.error("Error fetching favorites:", err);
      setError(err.response?.data?.message || "خطا در دریافت علاقه‌مندی‌ها");
      setFavoriteProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setTogglingFavorite(productId);
      setError("");
      
      const response = await favoriteService.addFavoriteProduct({ product_id: productId });
      
      // Update the product's favorite status
      setFavoriteProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? { ...product, is_favorite: response.is_favorite }
            : product
        )
      );

      // If removed, remove from list
      if (response.action === "removed") {
        setFavoriteProducts((prev) => prev.filter((p) => p.id !== productId));
        setTotalCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      console.error("Error toggling favorite:", err);
      setError(err.response?.data?.message || "خطا در تغییر وضعیت علاقه‌مندی");
    } finally {
      setTogglingFavorite(null);
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

  return (
    <div className="space-y-6 fade-in font-vazir">
      {/* Header */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-7 h-7 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">علاقه‌مندی‌ها</h1>
              <p className="text-sm text-gray-600 mt-1">
                {totalCount} محصول در علاقه‌مندی‌ها
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          <span className="mr-3 text-gray-600 font-semibold">
            در حال بارگذاری...
          </span>
        </div>
      )}

      {/* Products Grid */}
      {!loading && favoriteProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteProducts.map((product) => (
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
                  className={`absolute top-2 left-2 p-2 rounded-full transition-all duration-200 ${
                    product.is_favorite
                      ? "bg-red-500 text-white"
                      : "bg-white/80 text-gray-400 hover:bg-white"
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
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {product.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">کد: {product.code}</p>
                {product.temperature_type && (
                  <div className="mb-3">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                      {product.temperature_type === TemperatureTypeEnumValues.COLD
                        ? "منجمد"
                        : product.temperature_type === TemperatureTypeEnumValues.HOT
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
                        <span className="text-sm text-gray-600 mr-1">
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
                  className="w-full flex items-center justify-center space-x-reverse space-x-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                >
                  {addingToCart === product.id ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>در حال اضافه کردن...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
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
      {!loading && favoriteProducts.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold">
            هنوز محصولی به علاقه‌مندی‌ها اضافه نکرده‌اید
          </p>
        </div>
      )}
    </div>
  );
}

