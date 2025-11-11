import { ArrowRight, Loader2, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate } from "../lib/utils";
import { receivingService, warehouseService } from "../services/api";
import type {
  QueryReceivingDto,
  ReceivingListItem,
  WarehouseDetailsResponse,
} from "../types";
import Pagination from "./Pagination";

export default function ReceivingsList() {
  const navigate = useNavigate();
  const { id: warehouseId } = useParams<{ id: string }>();
  const [warehouse, setWarehouse] = useState<WarehouseDetailsResponse | null>(
    null
  );
  const [receivings, setReceivings] = useState<ReceivingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<QueryReceivingDto>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    if (warehouseId) {
      fetchWarehouseDetails();
      fetchReceivings();
    }
  }, [warehouseId, currentPage, filters]);

  const fetchWarehouseDetails = async () => {
    if (!warehouseId) return;

    try {
      const data = await warehouseService.getWarehouseById(warehouseId);
      setWarehouse(data);
    } catch (err: any) {
      console.error("Error fetching warehouse details:", err);
    }
  };

  const fetchReceivings = async () => {
    if (!warehouseId) return;

    try {
      setLoading(true);
      setError("");
      const query: QueryReceivingDto = {
        page: currentPage,
        "page-size": itemsPerPage,
        ...filters,
      };
      const response = await receivingService.getReceivings(query, warehouseId);
      setReceivings(response.data || []);
      setTotalItems(response.count || 0);
    } catch (err: any) {
      console.error("Error fetching receivings:", err);
      setError("خطا در بارگذاری ورودی‌ها");
    } finally {
      setLoading(false);
    }
  };

  const getSourceText = (source: string) => {
    const sourceMap: Record<string, string> = {
      PURCHASED: "خرید",
      RETURNED: "مرجوعی",
      INVENTORY: "انبار گردانی",
    };
    return sourceMap[source] || source;
  };

  const getSourceColor = (source: string) => {
    const colorMap: Record<string, string> = {
      PURCHASED: "bg-green-100 text-green-800",
      RETURNED: "bg-orange-100 text-orange-800",
      INVENTORY: "bg-blue-100 text-blue-800",
    };
    return colorMap[source] || "bg-gray-100 text-gray-800";
  };

  if (!warehouseId) {
    return (
      <div className="text-center py-12">
        <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                لیست ورودی‌ها
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {warehouse?.name || "انبار"} • {totalItems} ورودی ثبت شده
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
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

      {/* Receivings Table */}
      {!loading && receivings.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    کد ورودی
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    تاریخ
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    منبع
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    مشتری
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    تعداد محصولات
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    پلاک / راننده
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {receivings.map((receiving) => (
                  <tr
                    key={receiving.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/manage/warehouses/${warehouseId}/receivings/${receiving.id}`
                      )
                    }
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      #{receiving.code}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {formatDate(receiving.date)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${getSourceColor(
                          receiving.source
                        )}`}
                      >
                        {getSourceText(receiving.source)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {receiving.customer ? receiving.customer.title : "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {receiving.products_count} محصول
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {receiving.license_plate ? (
                        <div>
                          <div>{receiving.license_plate}</div>
                          {receiving.driver_name && (
                            <div className="text-xs text-gray-500 mt-1">
                              {receiving.driver_name}
                            </div>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/manage/warehouses/${warehouseId}/receivings/${receiving.id}`
                          );
                        }}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-semibold"
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
      {!loading && receivings.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold">
            ورودی‌ای یافت نشد
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && receivings.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          totalPages={Math.ceil(totalItems / itemsPerPage)}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
