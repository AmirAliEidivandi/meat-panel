import { Loader2, MessageSquare, Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../lib/utils";
import { customerService, ticketService } from "../../services/api";
import type { QueryTicketDto, TicketListItem } from "../../types";
import Pagination from "../Pagination";
import CreateUserTicketModal from "./CreateUserTicketModal";

export default function UserTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomerId();
  }, []);

  useEffect(() => {
    if (customerId) {
      fetchTickets();
    }
  }, [currentPage, customerId]);

  const fetchCustomerId = async () => {
    try {
      const customerInfo = await customerService.getCustomerInfo();
      setCustomerId(customerInfo.id);
    } catch (err: any) {
      console.error("Error fetching customer info:", err);
      if (err.response?.status === 403) {
        setError("شما دسترسی لازم برای مشاهده تیکت‌ها را ندارید");
      } else if (err.response?.status === 401) {
        setError("خطا در احراز هویت. لطفاً دوباره وارد شوید");
      } else {
        setError(
          "خطا در دریافت اطلاعات مشتری: " +
            (err.response?.data?.message || err.message)
        );
      }
    }
  };

  const fetchTickets = async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      setError("");
      const query: QueryTicketDto = {
        page: currentPage,
        "page-size": pageSize,
        customer_id: customerId,
      };
      const response = await ticketService.getTickets(query);
      setTickets(response.data || []);
      setTotalCount(response.count || 0);
    } catch (err: any) {
      console.error("Error fetching tickets:", err);
      if (err.response?.status === 403) {
        setError("شما دسترسی لازم برای مشاهده تیکت‌ها را ندارید");
      } else if (err.response?.status === 401) {
        setError("خطا در احراز هویت. لطفاً دوباره وارد شوید");
      } else {
        setError(
          "خطا در بارگذاری تیکت‌ها: " +
            (err.response?.data?.message || err.message)
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchTickets();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchTickets();
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      OPEN: "باز",
      WAITING_CUSTOMER: "در انتظار شما",
      WAITING_SUPPORT: "در انتظار پشتیبانی",
      CLOSED: "بسته شده",
      RESOLVED: "حل شده",
      REOPENED: "باز شده مجدد",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      OPEN: "bg-green-100 text-green-800",
      WAITING_CUSTOMER: "bg-blue-100 text-blue-800",
      WAITING_SUPPORT: "bg-purple-100 text-purple-800",
      CLOSED: "bg-gray-100 text-gray-800",
      RESOLVED: "bg-green-100 text-green-800",
      REOPENED: "bg-yellow-100 text-yellow-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityText = (priority: string) => {
    const priorityMap: { [key: string]: string } = {
      LOW: "کم",
      NORMAL: "متوسط",
      HIGH: "بالا",
      URGENT: "فوری",
    };
    return priorityMap[priority] || priority;
  };

  const getPriorityColor = (priority: string) => {
    const colorMap: { [key: string]: string } = {
      LOW: "bg-gray-100 text-gray-800",
      NORMAL: "bg-blue-100 text-blue-800",
      HIGH: "bg-orange-100 text-orange-800",
      URGENT: "bg-red-100 text-red-800",
    };
    return colorMap[priority] || "bg-gray-100 text-gray-800";
  };

  if (loading && !customerId) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="mr-3 text-gray-600 font-semibold">
          در حال بارگذاری...
        </span>
      </div>
    );
  }

  if (error && !customerId) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4 font-semibold">{error}</div>
        <button
          onClick={fetchCustomerId}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-900">تیکت‌های من</h1>
              <p className="text-sm text-gray-600 mt-1">
                {totalCount} تیکت ثبت شده
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-reverse space-x-3">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              بروزرسانی
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold flex items-center space-x-reverse space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>ایجاد تیکت جدید</span>
            </button>
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
                    تاریخ ایجاد
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
                    onClick={() => navigate(`/user/tickets/${ticket.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">
                        {ticket.subject}
                      </div>
                      {ticket.last_message && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {ticket.last_message.message}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(ticket.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {getStatusText(ticket.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${getPriorityColor(
                          ticket.priority
                        )}`}
                      >
                        {getPriorityText(ticket.priority)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {ticket.messages_count} پیام
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/user/tickets/${ticket.id}`);
                        }}
                        className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
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
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-semibold mb-4">
              هیچ تیکتی یافت نشد
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-base font-medium text-white transition-all duration-200"
            >
              <Plus className="w-5 h-5 ml-2" />
              ایجاد تیکت جدید
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalCount > pageSize && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalCount / pageSize)}
            totalItems={totalCount}
            itemsPerPage={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Create Ticket Modal */}
      {customerId && (
        <CreateUserTicketModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          customerId={customerId}
        />
      )}
    </div>
  );
}
