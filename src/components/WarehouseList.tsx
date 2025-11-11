import { Loader2, Warehouse } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../lib/utils";
import { warehouseService } from "../services/api";
import type { Warehouse as WarehouseType } from "../types";
import Pagination from "./Pagination";

export default function WarehouseList() {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletedFilter, setDeletedFilter] = useState("");

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [searchTerm, deletedFilter]);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await warehouseService.getWarehouses();
      const warehousesArray = Array.isArray(data) ? data : [];
      setWarehouses(warehousesArray);
      setTotalCount(warehousesArray.length);
    } catch (err: any) {
      console.error("Error fetching warehouses:", err);
      setError(err?.message || "خطا در دریافت لیست انبارها");
      setWarehouses([]);
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
    if (deletedFilter) count++;
    return count;
  };

  const branchToText = (branch: string) => {
    const branchMap: Record<string, string> = {
      ISFAHAN: "اصفهان",
      TEHRAN: "تهران",
    };
    return branchMap[branch] || branch;
  };

  // Apply client-side filters
  const filteredWarehouses = warehouses.filter((warehouse) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        warehouse.name.toLowerCase().includes(searchLower) ||
        warehouse.code.toString().includes(searchTerm) ||
        warehouse.address?.toLowerCase().includes(searchLower) ||
        warehouse.branch?.name?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    if (deletedFilter) {
      const isDeleted = deletedFilter === "true";
      if (warehouse.deleted !== isDeleted) return false;
    }

    return true;
  });

  const filteredCount = filteredWarehouses.length;

  // Paginate results
  const paginatedWarehouses = filteredWarehouses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 fade-in font-vazir">
      {/* Header */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Warehouse className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">لیست انبارها</h1>
              <p className="text-sm text-gray-600 mt-1">
                {filteredCount} انبار
                {getActiveFiltersCount() > 0 && " (فیلتر شده)"}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              جستجو
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو..."
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              وضعیت
            </label>
            <select
              value={deletedFilter}
              onChange={(e) => setDeletedFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">همه</option>
              <option value="false">فعال</option>
              <option value="true">حذف شده</option>
            </select>
          </div>
        </div>

        {getActiveFiltersCount() > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {getActiveFiltersCount()} فیلتر فعال
            </span>
            <button
              onClick={() => {
                setSearchTerm("");
                setDeletedFilter("");
                setCurrentPage(1);
              }}
              className="text-sm text-amber-600 hover:text-amber-700 font-semibold"
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
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          <span className="mr-3 text-gray-600 font-semibold">
            در حال بارگذاری...
          </span>
        </div>
      )}

      {/* Warehouses Table */}
      {!loading && filteredCount > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    نام انبار
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    کد
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    آدرس
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    شعبه
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    وضعیت قیمت‌ها
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    وضعیت
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    تاریخ ایجاد
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedWarehouses.map((warehouse) => (
                  <tr
                    key={warehouse.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() =>
                      navigate(`/manage/warehouses/${warehouse.id}`)
                    }
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      {warehouse.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {warehouse.code || "N/A"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 max-w-xs truncate">
                      {warehouse.address || "آدرس ثبت نشده"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {branchToText(warehouse.branch?.name || "")}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          warehouse.are_prices_updated
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {warehouse.are_prices_updated
                          ? "به‌روز شده"
                          : "نیاز به به‌روزرسانی"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          warehouse.deleted
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {warehouse.deleted ? "حذف شده" : "فعال"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {formatDate(warehouse.created_at)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/manage/warehouses/${warehouse.id}`);
                        }}
                        className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm font-semibold"
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
      {!loading && filteredCount === 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <Warehouse className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold">
            {getActiveFiltersCount() > 0
              ? "هیچ موردی با فیلترهای انتخابی یافت نشد"
              : "انباری یافت نشد"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredCount > 0 && (
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
