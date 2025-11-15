import {
  ArrowRight,
  Loader2,
  MessageSquare,
  Paperclip,
  Send,
  Upload,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate } from "../../lib/utils";
import { fileService, fileUrl, ticketService } from "../../services/api";
import type {
  ReplyTicketDto,
  TicketDetails as TicketDetailsType,
  TicketMessageListItem,
} from "../../types";

export default function UserTicketDetails() {
  const navigate = useNavigate();
  const { id: ticketId } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [ticket, setTicket] = useState<TicketDetailsType | null>(null);
  const [messages, setMessages] = useState<TicketMessageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [replying, setReplying] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ id: string; file: File; preview?: string }>
  >([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails();
      fetchTicketMessages();
    }
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchTicketDetails = async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      setError("");
      const response = await ticketService.getTicketById(ticketId);
      setTicket(response);
    } catch (err: any) {
      console.error("Error fetching ticket details:", err);
      if (err.response?.status === 403) {
        setError("شما دسترسی لازم برای مشاهده این تیکت را ندارید");
      } else if (err.response?.status === 401) {
        setError("خطا در احراز هویت. لطفاً دوباره وارد شوید");
      } else {
        setError(
          "خطا در بارگذاری جزئیات تیکت: " +
            (err.response?.data?.message || err.message)
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketMessages = async () => {
    if (!ticketId) return;
    try {
      const response = await ticketService.getTicketMessages(ticketId, {});
      setMessages(response.data || []);
    } catch (err: any) {
      console.error("Error fetching ticket messages:", err);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const fileArray = Array.from(files);

      const filesWithPreview = await Promise.all(
        fileArray.map(async (file) => {
          let preview: string | undefined;
          if (file.type.startsWith("image/")) {
            preview = URL.createObjectURL(file);
          }
          return {
            id: `${Date.now()}-${Math.random()}`,
            file,
            preview,
          };
        })
      );

      setUploadedFiles((prev) => [...prev, ...filesWithPreview]);
    } catch (err) {
      console.error("Error processing files:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const handleReply = async () => {
    if (!ticketId || (!replyMessage.trim() && uploadedFiles.length === 0))
      return;

    try {
      setReplying(true);

      let attachmentIds: string[] = [];
      if (uploadedFiles.length > 0) {
        const uploadResponse = await fileService.uploadFiles(
          uploadedFiles.map((f) => f.file)
        );
        attachmentIds = uploadResponse.map((f) => f.id);
      }

      const dto: ReplyTicketDto = {
        message: replyMessage.trim() || "",
        attachment_ids: attachmentIds.length > 0 ? attachmentIds : undefined,
      };

      const response = await ticketService.replyTicket(ticketId, dto);

      if (response.message) {
        const newMessage: TicketMessageListItem = {
          id: response.message.id,
          ticket_id: ticketId,
          sender_type: response.message.sender_type,
          employee_id:
            response.message.employee_id ??
            response.message.employee?.id ??
            null,
          person_id:
            response.message.person_id ?? response.message.person?.id ?? null,
          message: response.message.message,
          created_at: response.message.created_at,
          updated_at: response.message.created_at,
          deleted_at: null,
          employee: response.message.employee ?? null,
          person: response.message.person ?? null,
          attachments: response.message.attachments || [],
        };

        setMessages((prev) => [...prev, newMessage]);
      }

      if (response.ticket && ticket) {
        setTicket({
          ...ticket,
          status: response.ticket.status,
          updated_at: new Date().toISOString(),
        });
      }

      uploadedFiles.forEach((f) => {
        if (f.preview) {
          URL.revokeObjectURL(f.preview);
        }
      });
      setReplyMessage("");
      setUploadedFiles([]);
    } catch (err: any) {
      console.error("Error replying to ticket:", err);
      alert("خطا در ارسال پاسخ");
    } finally {
      setReplying(false);
    }
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
      MEDIUM: "متوسط",
      HIGH: "بالا",
      URGENT: "فوری",
    };
    return priorityMap[priority] || priority;
  };

  const getPriorityColor = (priority: string) => {
    const colorMap: { [key: string]: string } = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-blue-100 text-blue-800",
      HIGH: "bg-orange-100 text-orange-800",
      URGENT: "bg-red-100 text-red-800",
    };
    return colorMap[priority] || "bg-gray-100 text-gray-800";
  };

  const isMessageFromSupport = (message: TicketMessageListItem) => {
    return message.sender_type === "EMPLOYEE" || message.employee_id !== null;
  };

  const getSenderName = (message: TicketMessageListItem) => {
    if (message.employee) {
      return `${message.employee.profile.first_name} ${message.employee.profile.last_name}`;
    }
    if (message.person) {
      return `${message.person.profile.first_name} ${message.person.profile.last_name}`;
    }
    return "نامشخص";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="mr-3 text-gray-600 font-semibold">
          در حال بارگذاری...
        </span>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4 font-semibold">
          {error || "تیکت یافت نشد"}
        </div>
        <button
          onClick={() => navigate("/user/tickets")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
        >
          بازگشت به لیست تیکت‌ها
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in font-vazir max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/user/tickets")}
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت
        </button>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {ticket.subject}
            </h1>
            <p className="text-gray-500">
              تیکت #{ticket.id.substring(0, 8)}
            </p>
          </div>
          <div className="flex items-center space-x-reverse space-x-3">
            <span
              className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold ${getStatusColor(
                ticket.status
              )}`}
            >
              {getStatusText(ticket.status)}
            </span>
            <span
              className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold ${getPriorityColor(
                ticket.priority
              )}`}
            >
              {getPriorityText(ticket.priority)}
            </span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      )}

      {/* Ticket Info */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">اطلاعات تیکت</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">تاریخ ایجاد</p>
            <p className="text-base font-semibold text-gray-900">
              {formatDate(ticket.created_at)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">آخرین بروزرسانی</p>
            <p className="text-base font-semibold text-gray-900">
              {formatDate(ticket.updated_at)}
            </p>
          </div>
          {ticket.assigned_to && (
            <div>
              <p className="text-sm text-gray-600 mb-1">ارجاع داده شده به</p>
              <p className="text-base font-semibold text-gray-900">
                {ticket.assigned_to.profile.first_name}{" "}
                {ticket.assigned_to.profile.last_name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Messages Chat Container */}
      <div
        className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden flex flex-col mb-6"
        style={{ height: "600px" }}
      >
        {/* Messages Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">
            پیام‌ها ({messages.length})
          </h2>
        </div>

        {/* Messages List */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-semibold">
                هنوز پیامی ارسال نشده است
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isSupport = isMessageFromSupport(message);
              const senderName = getSenderName(message);

              return (
                <div
                  key={message.id}
                  className={`flex items-start space-x-reverse space-x-3 ${
                    isSupport ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Avatar - فقط برای کاربر در سمت راست (قبل از پیام) */}
                  {!isSupport && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${
                      isSupport
                        ? "bg-indigo-50 border border-indigo-200"
                        : "bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {/* Message Header */}
                    <div className="mb-2">
                      <div className="flex items-center space-x-reverse space-x-2 mb-1">
                        <p className="text-sm font-bold text-gray-900">
                          {senderName}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            isSupport
                              ? "bg-indigo-200 text-indigo-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {isSupport ? "پشتیبان" : "شما"}
                        </span>
                      </div>
                    </div>

                    {/* Message Content */}
                    <p className="text-sm text-gray-800 mb-2 whitespace-pre-wrap">
                      {message.message}
                    </p>

                    {/* Message Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((attachment) => {
                          const url = fileUrl(attachment.url) || attachment.url;
                          const thumbnail =
                            fileUrl(attachment.thumbnail) ||
                            attachment.thumbnail ||
                            url;
                          const isImage =
                            attachment.url.match(
                              /\.(jpg|jpeg|png|gif|webp)$/i
                            ) || attachment.thumbnail;

                          return (
                            <div
                              key={attachment.id}
                              className="border border-gray-300 rounded-lg p-2 bg-white"
                            >
                              {isImage ? (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <img
                                    src={thumbnail}
                                    alt="پیوست"
                                    className="w-full h-auto max-h-48 object-contain rounded"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                    }}
                                  />
                                </a>
                              ) : (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-reverse space-x-2 text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                  <Paperclip className="w-4 h-4" />
                                  <span>فایل پیوست</span>
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Message Time */}
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(message.created_at)}
                    </p>
                  </div>

                  {/* Avatar - فقط برای پشتیبان در سمت چپ (بعد از پیام) */}
                  {isSupport && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <UserCheck className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Section */}
        {ticket.status !== "CLOSED" && ticket.status !== "RESOLVED" && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">
                    فایل‌های انتخاب شده ({uploadedFiles.length})
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="relative border border-gray-300 rounded-lg p-2 bg-white group"
                    >
                      {file.preview ? (
                        <>
                          <img
                            src={file.preview}
                            alt={file.file.name}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            onClick={() => handleRemoveFile(file.id)}
                            className="absolute top-1 left-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-24">
                          <Paperclip className="w-6 h-6 text-gray-400 mb-1" />
                          <p className="text-xs text-gray-600 truncate w-full text-center">
                            {file.file.name}
                          </p>
                          <button
                            onClick={() => handleRemoveFile(file.id)}
                            className="absolute top-1 left-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Upload Button */}
            <div className="mb-3">
              <label className="inline-flex items-center justify-center px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg cursor-pointer transition-colors">
                <Upload className="w-4 h-4 ml-2 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">
                  افزودن فایل
                </span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Message Input and Send */}
            <div className="flex items-end space-x-reverse space-x-3">
              <div className="flex-1">
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (
                        !replying &&
                        (replyMessage.trim() || uploadedFiles.length > 0)
                      ) {
                        handleReply();
                      }
                    }
                  }}
                  placeholder="پیام خود را وارد کنید..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <button
                onClick={handleReply}
                disabled={
                  (!replyMessage.trim() && uploadedFiles.length === 0) ||
                  replying ||
                  uploading
                }
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-reverse space-x-2"
              >
                {replying || uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {replying || uploading ? "در حال ارسال..." : "ارسال"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
