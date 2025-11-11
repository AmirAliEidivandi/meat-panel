import { Loader2, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../lib/utils";
import { productService, warehouseService } from "../services/api";
import type { Product, Warehouse } from "../types";
import Pagination from "./Pagination";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [lockedFilter, setLockedFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      fetchProducts();
    } else {
      setProducts([]);
      setTotalCount(0);
    }
  }, [selectedWarehouse]);

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [searchTerm, lockedFilter, minPrice, maxPrice]);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await warehouseService.getWarehouses();

      if (Array.isArray(data)) {
        setWarehouses(data);

        // Find Isfahan warehouse
        const isfahanWarehouse = data.find(
          (w) =>
            w.name.toLowerCase().includes("اصفهان") ||
            w.name.toLowerCase().includes("آتشگاه")
        );

        if (isfahanWarehouse) {
          setSelectedWarehouse(isfahanWarehouse.id);
        }
      } else {
        setError("فرمت داده‌های انبار نامعتبر است");
      }
    } catch (err: any) {
      setError("خطا در بارگذاری انبارها");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!selectedWarehouse) {
      setProducts([]);
      setTotalCount(0);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await productService.getProductsByWarehouse(
        selectedWarehouse
      );

      if (Array.isArray(data)) {
        setProducts(data);
        setTotalCount(data.length);
      } else {
        setError("فرمت داده‌های محصولات نامعتبر است");
        setProducts([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err?.message || "خطا در دریافت لیست محصولات");
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (searchTerm) count++;
    if (lockedFilter) count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    return count;
  };

  // Apply client-side filters
  const filteredProducts = products.filter((product) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        product.title.toLowerCase().includes(searchLower) ||
        product.code.toString().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    if (lockedFilter) {
      const isLocked = lockedFilter === "true";
      if (product.locked !== isLocked) return false;
    }

    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min) && product.retail_price < min) return false;
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max) && product.retail_price > max) return false;
    }

    return true;
  });

  const filteredCount = filteredProducts.length;

  // Paginate results
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 fade-in font-vazir">
      {/* Header */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">لیست محصولات</h1>
              <p className="text-sm text-gray-600 mt-1">
                {filteredCount} محصول
                {getActiveFiltersCount() > 0 && " (فیلتر شده)"}
              </p>
            </div>
          </div>
        </div>

        {/* Warehouse Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            انتخاب انبار
          </label>
          <select
            value={selectedWarehouse}
            onChange={(e) => {
              setSelectedWarehouse(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">انتخاب انبار</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name} (کد: {warehouse.code})
              </option>
            ))}
          </select>
        </div>

        {/* Filters */}
        {selectedWarehouse && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                جستجو
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                وضعیت قفل
              </label>
              <select
                value={lockedFilter}
                onChange={(e) => setLockedFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">همه</option>
                <option value="false">فعال</option>
                <option value="true">قفل شده</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                حداقل قیمت
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="حداقل قیمت"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                حداکثر قیمت
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="حداکثر قیمت"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
        )}

        {getActiveFiltersCount() > 0 && selectedWarehouse && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {getActiveFiltersCount()} فیلتر فعال
            </span>
            <button
              onClick={() => {
                setSearchTerm("");
                setLockedFilter("");
                setMinPrice("");
                setMaxPrice("");
                setCurrentPage(1);
              }}
              className="text-sm text-teal-600 hover:text-teal-700 font-semibold"
            >
              پاک کردن فیلترها
            </button>
          </div>
        )}
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
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          <span className="mr-3 text-gray-600 font-semibold">
            در حال بارگذاری...
          </span>
        </div>
      )}

      {/* Products Table */}
      {!loading && selectedWarehouse && filteredCount > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    عنوان
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    کد
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    قیمت خرده
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    قیمت عمده
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    قیمت آنلاین
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    وزن خالص
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    وضعیت
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/manage/products/${product.id}`)}
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      {product.title}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {product.code}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-purple-600">
                      {formatCurrency(product.retail_price)}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-orange-600">
                      {formatCurrency(product.wholesale_price)}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-emerald-600">
                      {formatCurrency(product.online_price)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {product.net_weight} کیلوگرم
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          product.locked
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {product.locked ? "قفل شده" : "فعال"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/manage/products/${product.id}`);
                        }}
                        className="px-3 py-1 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors text-sm font-semibold"
                      >
                        مشاهده
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && selectedWarehouse && filteredCount === 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold">
            {getActiveFiltersCount() > 0
              ? "هیچ موردی با فیلترهای انتخابی یافت نشد"
              : "محصولی یافت نشد"}
          </p>
        </div>
      )}

      {/* No Warehouse Selected */}
      {!loading && !selectedWarehouse && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold">
            ابتدا انبار را انتخاب کنید
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && selectedWarehouse && filteredCount > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredCount}
          itemsPerPage={pageSize}
          totalPages={Math.ceil(filteredCount / pageSize)}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
