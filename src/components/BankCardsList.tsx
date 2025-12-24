import { CreditCard, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate, getBankName } from "../lib/utils";
import { bankCardService, customerService } from "../services/api";
import type {
  BankCardsResponse,
  CustomerListItem,
  QueryBankCardsDto,
} from "../types";
import Pagination from "./Pagination";

const getCreatedTypeText = (type: "CUSTOMER" | "EMPLOYEE"): string => {
  const typeMap: Record<string, string> = {
    CUSTOMER: "مشتری",
    EMPLOYEE: "کارمند",
  };
  return typeMap[type] || type;
};

export default function BankCardsList() {
  const navigate = useNavigate();
  const [bankCards, setBankCards] = useState<BankCardsResponse["data"]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState<QueryBankCardsDto>({
    page: 1,
    "page-size": pageSize,
  });
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);

  useEffect(() => {
    fetchBankCards();
    fetchCustomers();
  }, [filters]);

  const fetchBankCards = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await bankCardService.getBankCards(filters);
      setBankCards(response.data || []);
      setTotalCount(response.count || 0);
      setCurrentPage(filters.page || 1);
    } catch (err: any) {
      console.error("Error fetching bank cards:", err);
      setError(
        err.response?.data?.message || "خطا در دریافت لیست کارت‌های بانکی"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getAllCustomers({
        page: 1,
        "page-size": 100,
      });
      setCustomers(response.data || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    setCurrentPage(page);
  };

  const handleFilterChange = (
    key: keyof QueryBankCardsDto,
    value: any
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
    setCurrentPage(1);
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (filters.person_id) count++;
    if (filters.created_type) count++;
    if (filters.employee_id) count++;
    if (filters.customer_id) count++;
    return count;
  };

  return (
    <div className="space-y-6 fade-in font-vazir">
      {/* Header */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                لیست کارت‌های بانکی
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {totalCount} کارت بانکی
                {getActiveFiltersCount() > 0 && " (فیلتر شده)"}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              نوع ایجاد
            </label>
            <select
              value={filters.created_type || ""}
              onChange={(e) =>
                handleFilterChange(
                  "created_type",
                  e.target.value || undefined
                )
              }
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">همه</option>
              <option value="CUSTOMER">مشتری</option>
              <option value="EMPLOYEE">کارمند</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              مشتری
            </label>
            <select
              value={filters.customer_id || ""}
              onChange={(e) =>
                handleFilterChange("customer_id", e.target.value || undefined)
              }
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">همه</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.title} (کد: {customer.code})
                </option>
              ))}
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
                setFilters({ page: 1, "page-size": pageSize });
                setCurrentPage(1);
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
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
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="mr-3 text-gray-600 font-semibold">
            در حال بارگذاری...
          </span>
        </div>
      )}

      {/* Bank Cards Table */}
      {!loading && bankCards.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    نام بانک
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    شماره شبا
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    شماره حساب
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    کارت
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    وضعیت تایید
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    نوع ایجاد
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    مشتری
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
                {bankCards.map((card) => (
                  <tr
                    key={card.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/manage/bank-cards/${card.id}`)}
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      {getBankName(card.bank_name)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {card.iban}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {card.account_number}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 font-mono">
                      {card.masked_pan}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${
                          card.is_verified
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {card.is_verified ? "تایید شده" : "تایید نشده"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {getCreatedTypeText(card.created_type)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {card.customer ? (
                        <div>
                          <div className="font-semibold">
                            {card.customer.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            کد: {card.customer.code}
                          </div>
                        </div>
                      ) : card.employee ? (
                        <div>
                          <div className="font-semibold">
                            {card.employee.profile.first_name}{" "}
                            {card.employee.profile.last_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {card.employee.profile.mobile}
                          </div>
                        </div>
                      ) : card.person ? (
                        <div>
                          <div className="font-semibold">
                            {card.person.profile.first_name}{" "}
                            {card.person.profile.last_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {card.person.profile.mobile}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {formatDate(
                        typeof card.created_at === "string"
                          ? card.created_at
                          : new Date(card.created_at).toISOString()
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/manage/bank-cards/${card.id}`);
                        }}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-semibold"
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
      {!loading && bankCards.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold">
            {getActiveFiltersCount() > 0
              ? "هیچ موردی با فیلترهای انتخابی یافت نشد"
              : "کارت بانکی یافت نشد"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && bankCards.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalCount}
          itemsPerPage={filters["page-size"] || pageSize}
          totalPages={Math.ceil(totalCount / (filters["page-size"] || pageSize))}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

