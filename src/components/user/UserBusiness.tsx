import { Building2, Edit2, Loader2, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDate } from "../../lib/utils";
import { customerService, fileUrl } from "../../services/api";
import type {
  CustomerInfoResponse,
  UpdateCustomerSelfDto,
} from "../../types";

export default function UserBusiness() {
  const [customerInfo, setCustomerInfo] =
    useState<CustomerInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateCustomerSelfDto>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const customer = await customerService.getCustomerInfo();
      setCustomerInfo(customer);
      setFormData({
        title: customer.title,
        description: customer.description || undefined,
        phone: customer.phone || undefined,
        address: customer.address || undefined,
        age: customer.age || undefined,
        is_property_owner: customer.is_property_owner || undefined,
        type: customer.category || undefined,
        category: customer.category || undefined,
      });
    } catch (err: any) {
      setError("خطا در بارگذاری اطلاعات");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      await customerService.updateCustomerInfo(formData);
      await loadData();
      setEditing(false);
    } catch (err: any) {
      setError("خطا در به‌روزرسانی اطلاعات");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (customerInfo) {
      setFormData({
        title: customerInfo.title,
        description: customerInfo.description || undefined,
        phone: customerInfo.phone || undefined,
        address: customerInfo.address || undefined,
        age: customerInfo.age || undefined,
        is_property_owner: customerInfo.is_property_owner || undefined,
        type: customerInfo.category || undefined,
        category: customerInfo.category || undefined,
      });
    }
  };

  const getCategoryText = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      RESTAURANT: "رستوران",
      HOTEL: "هتل",
      CHAIN_STORE: "فروشگاه زنجیره‌ای",
      GOVERNMENTAL: "دولتی",
      FAST_FOOD: "فست فود",
      CHARITY: "خیریه",
      BUTCHER: "قصابی",
      WHOLESALER: "عمده‌فروش",
      FELLOW: "همکار",
      CATERING: "کترینگ",
      KEBAB: "کبابی",
      DISTRIBUTOR: "پخش‌کننده",
      HOSPITAL: "بیمارستان",
      FACTORY: "کارخانه",
      OTHER: "سایر",
    };
    return categoryMap[category] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        <span className="mr-3 text-gray-600 font-semibold">
          در حال بارگذاری...
        </span>
      </div>
    );
  }

  if (error && !customerInfo) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4 font-semibold">
          {error || "خطا در بارگذاری اطلاعات"}
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (!customerInfo) {
    return null;
  }

  return (
    <div className="fade-in font-vazir max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-reverse space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  اطلاعات کسب و کار
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  مدیریت اطلاعات کسب و کار شما
                </p>
              </div>
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center space-x-reverse space-x-2"
              >
                <Edit2 className="w-5 h-5" />
                <span>ویرایش</span>
              </button>
            ) : (
              <div className="flex items-center space-x-reverse space-x-3">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center space-x-reverse space-x-2 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>{saving ? "در حال ذخیره..." : "ذخیره"}</span>
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold flex items-center space-x-reverse space-x-2 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                  <span>لغو</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      )}

      {/* Business Info */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          اطلاعات اصلی
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                عنوان کسب و کار
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              ) : (
                <p className="text-base font-semibold text-gray-900">
                  {customerInfo.title}
                </p>
              )}
            </div>

            {/* Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                کد مشتری
              </label>
              <p className="text-base font-semibold text-gray-900">
                {customerInfo.code}
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                دسته‌بندی
              </label>
              <p className="text-base font-semibold text-gray-900">
                {getCategoryText(customerInfo.category)}
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                تلفن
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              ) : (
                <p className="text-base font-semibold text-gray-900">
                  {customerInfo.phone || "-"}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                آدرس
              </label>
              {editing ? (
                <textarea
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                />
              ) : (
                <p className="text-base font-semibold text-gray-900">
                  {customerInfo.address || "-"}
                </p>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                سن
              </label>
              {editing ? (
                <input
                  type="number"
                  value={formData.age || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      age: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    }))
                  }
                  min="0"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              ) : (
                <p className="text-base font-semibold text-gray-900">
                  {customerInfo.age || "-"}
                </p>
              )}
            </div>

            {/* Is Property Owner */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                مالک ملک
              </label>
              {editing ? (
                <select
                  value={formData.is_property_owner ? "true" : "false"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_property_owner: e.target.value === "true",
                    }))
                  }
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="false">خیر</option>
                  <option value="true">بله</option>
                </select>
              ) : (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${
                    customerInfo.is_property_owner
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {customerInfo.is_property_owner ? "بله" : "خیر"}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                توضیحات
              </label>
              {editing ? (
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value || undefined,
                    }))
                  }
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                />
              ) : (
                <p className="text-base text-gray-900 bg-gray-50 rounded-lg p-4">
                  {customerInfo.description || "-"}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Files */}
      {customerInfo.files && customerInfo.files.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">فایل‌ها</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {customerInfo.files.map((file) => (
              <div key={file.id} className="relative group">
                <img
                  src={fileUrl(file.thumbnail) || fileUrl(file.url) || ""}
                  alt="فایل"
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-green-300 transition-colors"
                />
                <a
                  href={fileUrl(file.url) || ""}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg"
                >
                  <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-semibold">
                    مشاهده
                  </span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          اطلاعات تکمیلی
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">تاریخ ایجاد</p>
            <p className="text-base font-semibold text-gray-900">
              {formatDate(customerInfo.created_at)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">آخرین به‌روزرسانی</p>
            <p className="text-base font-semibold text-gray-900">
              {formatDate(customerInfo.updated_at)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">وضعیت</p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${
                customerInfo.deleted
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {customerInfo.deleted ? "غیرفعال" : "فعال"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
