import { MessageSquare, Plus, RefreshCw } from "lucide-react";
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
      console.error("Error details:", {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
        data: err.response?.data,
      });

      // Don't set error if it's a 403 (permission issue) - just show message
      if (err.response?.status === 403) {
        setError("شما دسترسی لازم برای مشاهده تیکت‌ها را ندارید");
      } else if (err.response?.status === 401) {
        // 401 will be handled by interceptor, but show message anyway
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
      console.error("Error details:", {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
        data: err.response?.data,
      });

      // Handle different error types
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
        <div className="w-8 h-8 border-[3px] border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !customerId) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={fetchCustomerId}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">تیکت‌های من</h2>
              <p className="text-gray-600 text-sm mt-1">
                مشاهده و مدیریت تیکت‌های پشتیبانی شما
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
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-sm font-medium text-white transition-all duration-200"
            >
              <Plus className="w-4 h-4 ml-2" />
              تیکت جدید
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Tickets List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-[3px] border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">هیچ تیکتی یافت نشد</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-base font-medium text-white transition-all duration-200"
            >
              <Plus className="w-5 h-5 ml-2" />
              ایجاد تیکت جدید
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket, index) => (
              <div
                key={ticket.id}
                onClick={() => navigate(`/user/tickets/${ticket.id}`)}
                className="p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer rounded-xl border-2 border-gray-200 bg-white shadow-sm hover:shadow-md"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-reverse space-x-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {ticket.subject}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(ticket.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-reverse space-x-2">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {getStatusText(ticket.status)}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getPriorityColor(
                        ticket.priority
                      )}`}
                    >
                      {getPriorityText(ticket.priority)}
                    </span>
                  </div>
                </div>

                {/* Last Message */}
                {ticket.last_message && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-start space-x-reverse space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600 mb-1">
                          {ticket.last_message.sender_type === "PERSON"
                            ? "شما"
                            : ticket.last_message.sender_profile
                            ? `${ticket.last_message.sender_profile.first_name} ${ticket.last_message.sender_profile.last_name}`
                            : "پشتیبانی"}
                        </p>
                        <p className="text-sm text-gray-900 line-clamp-2">
                          {ticket.last_message.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(ticket.last_message.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-reverse space-x-4 text-sm text-gray-600">
                    <span>{ticket.messages_count} پیام</span>
                    {ticket.assigned_to && (
                      <span>
                        ارجاع داده شده به:{" "}
                        {ticket.assigned_to.profile.first_name}{" "}
                        {ticket.assigned_to.profile.last_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalCount > pageSize && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalCount / pageSize)}
              totalItems={totalCount}
              itemsPerPage={pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

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
