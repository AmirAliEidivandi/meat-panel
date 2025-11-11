import { Loader2, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../lib/utils";
import {
  customerService,
  employeeService,
  ticketService,
} from "../services/api";
import type {
  CustomerListItem,
  Employee,
  QueryTicketDto,
  TicketListItem,
} from "../types";
import Pagination from "./Pagination";

// Helper functions for Persian labels
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    OPEN: "باز",
    WAITING_CUSTOMER: "در انتظار مشتری",
    WAITING_SUPPORT: "در انتظار پشتیبانی",
    CLOSED: "بسته شده",
    RESOLVED: "حل شده",
    REOPENED: "باز شده",
  };
  return statusMap[status] || status;
};

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    OPEN: "bg-green-100 text-green-800",
    WAITING_CUSTOMER: "bg-blue-100 text-blue-800",
    WAITING_SUPPORT: "bg-purple-100 text-purple-800",
    CLOSED: "bg-gray-100 text-gray-800",
    RESOLVED: "bg-green-100 text-green-800",
    REOPENED: "bg-yellow-100 text-yellow-800",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800";
};

const getPriorityText = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    LOW: "پایین",
    NORMAL: "متوسط",
    HIGH: "بالا",
    URGENT: "فوری",
  };
  return priorityMap[priority] || priority;
};

const getPriorityColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    LOW: "bg-blue-100 text-blue-800",
    NORMAL: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-orange-100 text-orange-800",
    URGENT: "bg-red-100 text-red-800",
  };
  return colorMap[priority] || "bg-gray-100 text-gray-800";
};

export default function Tickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [assignedToFilter, setAssignedToFilter] = useState("");
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetchTickets();
    fetchCustomers();
    fetchEmployees();
  }, [currentPage]);

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
    fetchTickets();
  }, [
    searchTerm,
    statusFilter,
    priorityFilter,
    customerFilter,
    assignedToFilter,
  ]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const query: QueryTicketDto = {
        page: currentPage,
        "page-size": pageSize,
      };

      if (searchTerm) {
        // Note: API might not support search directly, this is a placeholder
        // You may need to adjust based on actual API support
      }

      if (statusFilter) {
        query.status = statusFilter;
      }

      if (priorityFilter) {
        query.priority = priorityFilter;
      }

      if (customerFilter) {
        query.customer_id = customerFilter;
      }

      if (assignedToFilter) {
        query.assigned_to_id = assignedToFilter;
      }

      const response = await ticketService.getTickets(query);
      setTickets(response.data || []);
      setTotalCount(response.count || 0);
    } catch (err: any) {
      console.error("Error fetching tickets:", err);
      setError(err.response?.data?.message || "خطا در دریافت لیست تیکت‌ها");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getAllCustomers();
      setCustomers(response.data || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getAllEmployees();
      setEmployees(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter) count++;
    if (priorityFilter) count++;
    if (customerFilter) count++;
    if (assignedToFilter) count++;
    return count;
  };

  return (
    <div className="space-y-6 fade-in font-vazir">
      {/* Header */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">لیست تیکت‌ها</h1>
              <p className="text-sm text-gray-600 mt-1">
                {totalCount} تیکت ثبت شده
                {getActiveFiltersCount() > 0 && " (فیلتر شده)"}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              جستجو
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو..."
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              وضعیت
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">همه</option>
              <option value="OPEN">باز</option>
              <option value="WAITING_CUSTOMER">در انتظار مشتری</option>
              <option value="WAITING_SUPPORT">در انتظار پشتیبانی</option>
              <option value="CLOSED">بسته شده</option>
              <option value="RESOLVED">حل شده</option>
              <option value="REOPENED">باز شده</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              اولویت
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">همه</option>
              <option value="LOW">پایین</option>
              <option value="NORMAL">متوسط</option>
              <option value="HIGH">بالا</option>
              <option value="URGENT">فوری</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              مشتری
            </label>
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ارجاع شده به
            </label>
            <select
              value={assignedToFilter}
              onChange={(e) => setAssignedToFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">همه</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.profile.first_name} {employee.profile.last_name}
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
                setSearchTerm("");
                setStatusFilter("");
                setPriorityFilter("");
                setCustomerFilter("");
                setAssignedToFilter("");
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

      {/* Tickets Table */}
      {!loading && tickets.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    موضوع
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    مشتری
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    ایجاد کننده
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    ارجاع شده به
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    وضعیت
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    اولویت
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    تعداد پیام‌ها
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    آخرین بروزرسانی
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/manage/tickets/${ticket.id}`)}
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      {ticket.subject}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {ticket.customer.title} (کد: {ticket.customer.code})
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {ticket.creator_person
                        ? `${ticket.creator_person.profile.first_name} ${ticket.creator_person.profile.last_name}`
                        : "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {ticket.assigned_to
                        ? `${ticket.assigned_to.profile.first_name} ${ticket.assigned_to.profile.last_name}`
                        : "ارجاع نشده"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {getStatusText(ticket.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                          ticket.priority
                        )}`}
                      >
                        {getPriorityText(ticket.priority)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {ticket.messages_count || 0} پیام
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {formatDate(ticket.updated_at)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/manage/tickets/${ticket.id}`);
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
      {!loading && tickets.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold">
            {getActiveFiltersCount() > 0
              ? "هیچ موردی با فیلترهای انتخابی یافت نشد"
              : "تیکتی یافت نشد"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && tickets.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalCount}
          itemsPerPage={pageSize}
          totalPages={Math.ceil(totalCount / pageSize)}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
