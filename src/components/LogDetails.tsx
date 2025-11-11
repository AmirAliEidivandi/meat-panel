import {
  Activity,
  AlertCircle,
  ArrowRight,
  Check,
  Clock,
  Code,
  Copy,
  FileText,
  Globe,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate } from "../lib/utils";
import { logService } from "../services/api";
import type { Log } from "../types";

export default function LogDetails() {
  const navigate = useNavigate();
  const { id: logId } = useParams();
  const [log, setLog] = useState<Log | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedMetadata, setExpandedMetadata] = useState(false);

  useEffect(() => {
    if (logId) {
      fetchLogDetails();
    }
  }, [logId]);

  const fetchLogDetails = async () => {
    if (!logId) return;
    try {
      setLoading(true);
      setError("");
      const response = await logService.getLogById(logId);
      setLog(response);
    } catch (err: any) {
      console.error("Error fetching log details:", err);
      setError("خطا در بارگذاری جزئیات لاگ");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getLevelColor = (level: string) => {
    const colorMap: { [key: string]: string } = {
      ERROR: "bg-red-100 text-red-800",
      WARN: "bg-yellow-100 text-yellow-800",
      INFO: "bg-blue-100 text-blue-800",
      DEBUG: "bg-gray-100 text-gray-800",
    };
    return colorMap[level] || "bg-gray-100 text-gray-800";
  };

  const getLevelText = (level: string) => {
    const textMap: { [key: string]: string } = {
      ERROR: "خطا",
      WARN: "هشدار",
      INFO: "اطلاعات",
      DEBUG: "دیباگ",
    };
    return textMap[level] || level;
  };

  const getStatusCodeColor = (statusCode: number | null) => {
    if (!statusCode) return "text-gray-500";
    if (statusCode >= 500) return "text-red-600";
    if (statusCode >= 400) return "text-yellow-600";
    if (statusCode >= 300) return "text-blue-600";
    return "text-green-600";
  };

  const getStatusCodeBg = (statusCode: number | null) => {
    if (!statusCode) return "bg-gray-100";
    if (statusCode >= 500) return "bg-red-100";
    if (statusCode >= 400) return "bg-yellow-100";
    if (statusCode >= 300) return "bg-blue-100";
    return "bg-green-100";
  };

  const renderMetadata = (metadata: any, depth = 0): React.ReactNode => {
    if (!metadata || typeof metadata !== "object") {
      return (
        <span className="text-sm text-gray-700 ltr-text text-left">
          {metadata === null ? "null" : String(metadata)}
        </span>
      );
    }

    if (Array.isArray(metadata)) {
      return (
        <div className="space-y-2 ltr-text text-left">
          {metadata.map((item, index) => (
            <div key={index} className="ml-4">
              <span className="text-xs text-gray-500">[{index}]:</span>
              <div className="ml-4 mt-1">{renderMetadata(item, depth + 1)}</div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2 ltr-text text-left">
        {Object.entries(metadata).map(([key, value]) => (
          <div key={key} className="ml-4">
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold text-gray-600 min-w-[120px] flex-shrink-0">
                {key}:
              </span>
              <div className="flex-1 min-w-0">
                {typeof value === "object" && value !== null ? (
                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                    {renderMetadata(value, depth + 1)}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-gray-700 break-all block">
                      {value === null ? "null" : String(value)}
                    </span>
                    {key.toLowerCase() === "timestamp" && value && (
                      <span className="text-xs text-blue-600 font-medium rtl-text text-right">
                        {formatDate(
                          typeof value === "number"
                            ? new Date(value).toISOString()
                            : String(value)
                        )}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <span className="mr-3 text-gray-600 font-semibold">
          در حال بارگذاری...
        </span>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error || "لاگ یافت نشد"}</div>
        <button
          onClick={() => navigate("/manage/logs")}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          بازگشت به لیست لاگ‌ها
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in font-vazir max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/manage/logs")}
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              جزئیات لاگ
            </h1>
            <p className="text-gray-500 text-sm font-mono">{log.id}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold ${getLevelColor(
              log.level
            )}`}
          >
            {getLevelText(log.level)}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">سرویس</h3>
          </div>
          <p className="text-sm font-semibold text-gray-900">{log.service}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Code className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900">کد وضعیت</h3>
          </div>
          {log.status_code ? (
            <span
              className={`inline-block px-3 py-1 rounded-lg text-lg font-bold ${getStatusCodeBg(
                log.status_code
              )} ${getStatusCodeColor(log.status_code)}`}
            >
              {log.status_code}
            </span>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">زمان پاسخ</h3>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {log.response_time ? `${log.response_time}ms` : "-"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-900">زمان ایجاد</h3>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {formatDate(log.created_at)}
          </p>
        </div>
      </div>

      {/* Message */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-reverse space-x-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
            <FileText className="w-4 h-4 text-gray-600" />
          </div>
          <h3 className="font-bold text-gray-900">پیام</h3>
        </div>
        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
          {log.message}
        </p>
      </div>

      {/* Request Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-reverse space-x-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900">اطلاعات درخواست</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-500 mb-1.5">متد</p>
            <div className="flex items-center space-x-reverse space-x-2">
              <span className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-mono text-gray-900">
                {log.method || "-"}
              </span>
              {log.method && (
                <button
                  onClick={() => copyToClipboard(log.method!, "method")}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {copiedField === "method" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">مسیر</p>
            <div className="flex items-center space-x-reverse space-x-2">
              <p className="text-sm text-gray-900 font-mono flex-1 break-all bg-gray-50 rounded-lg px-3 py-1.5">
                {log.path || "-"}
              </p>
              {log.path && (
                <button
                  onClick={() => copyToClipboard(log.path!, "path")}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {copiedField === "path" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Request ID</p>
            <div className="flex items-center space-x-reverse space-x-2">
              <p className="text-sm text-gray-900 font-mono flex-1 truncate bg-gray-50 rounded-lg px-3 py-1.5">
                {log.request_id || "-"}
              </p>
              {log.request_id && (
                <button
                  onClick={() => copyToClipboard(log.request_id!, "request_id")}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {copiedField === "request_id" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Trace ID</p>
            <div className="flex items-center space-x-reverse space-x-2">
              <p className="text-sm text-gray-900 font-mono flex-1 truncate bg-gray-50 rounded-lg px-3 py-1.5">
                {log.trace_id || "-"}
              </p>
              {log.trace_id && (
                <button
                  onClick={() => copyToClipboard(log.trace_id!, "trace_id")}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {copiedField === "trace_id" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Network Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-reverse space-x-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
            <Globe className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-900">اطلاعات شبکه</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-500 mb-1.5">آدرس IP</p>
            <div className="flex items-center space-x-reverse space-x-2">
              <p className="text-sm text-gray-900 font-mono flex-1 break-all bg-gray-50 rounded-lg px-3 py-1.5">
                {log.ip_address || "-"}
              </p>
              {log.ip_address && (
                <button
                  onClick={() => copyToClipboard(log.ip_address!, "ip")}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {copiedField === "ip" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">User ID</p>
            <div className="flex items-center space-x-reverse space-x-2">
              <p className="text-sm text-gray-900 font-mono flex-1 truncate bg-gray-50 rounded-lg px-3 py-1.5">
                {log.user_id || "-"}
              </p>
              {log.user_id && (
                <button
                  onClick={() => copyToClipboard(log.user_id!, "user_id")}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {copiedField === "user_id" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              )}
            </div>
          </div>
          {log.user_agent && (
            <div className="md:col-span-2">
              <p className="text-xs text-gray-500 mb-1.5">User Agent</p>
              <p className="text-sm text-gray-700 break-all bg-gray-50 rounded-lg px-3 py-1.5">
                {log.user_agent}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Info */}
      {log.error && (
        <div className="bg-white rounded-xl border border-red-200 p-6 mb-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="font-bold text-red-900">اطلاعات خطا</h3>
          </div>
          <div className="space-y-4">
            {log.error.name && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">نام خطا</p>
                <p className="text-sm font-semibold text-red-900 bg-red-50 rounded-lg px-3 py-1.5">
                  {log.error.name}
                </p>
              </div>
            )}
            {log.error.message && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">پیام خطا</p>
                <p className="text-sm text-red-900 bg-red-50 rounded-lg px-3 py-1.5">
                  {log.error.message}
                </p>
              </div>
            )}
            {log.error.stack && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Stack Trace</p>
                <pre className="text-xs text-red-900 bg-red-50 p-4 rounded-lg overflow-x-auto border border-red-200">
                  {log.error.stack}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metadata */}
      {log.metadata && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-reverse space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
              <h3 className="font-bold text-gray-900">Metadata</h3>
            </div>
            <button
              onClick={() => setExpandedMetadata(!expandedMetadata)}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {expandedMetadata ? "بستن" : "نمایش کامل"}
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            {expandedMetadata ? (
              <div className="space-y-3 ltr-text text-left">{renderMetadata(log.metadata)}</div>
            ) : (
              <pre className="text-xs text-gray-700 overflow-x-auto max-h-64 overflow-y-auto ltr-text text-left">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
