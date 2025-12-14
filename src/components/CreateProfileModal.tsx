import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { groupService, profileService } from "../services/api";
import type { CreateProfileDto, GetGroupsResponse } from "../types";
import PersianDatePicker from "./PersianDatePicker";

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProfileModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProfileModalProps) {
  const [formData, setFormData] = useState<CreateProfileDto>({
    first_name: "",
    last_name: "",
    email: "",
    gender: "MALE",
    mobile: "",
    groups: [],
    enabled: true,
    birth_date: undefined,
    national_code: undefined,
    username: undefined,
    capillary_sales_line_ids: undefined,
  });
  const [groups, setGroups] = useState<GetGroupsResponse["data"]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    } else {
      resetForm();
    }
  }, [isOpen]);

  const fetchGroups = async () => {
    try {
      const response = await groupService.getGroups();
      setGroups(response.data || []);
    } catch (err: any) {
      console.error("Error fetching groups:", err);
      setError("خطا در بارگذاری گروه‌ها");
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      gender: "MALE",
      mobile: "",
      groups: [],
      enabled: true,
      birth_date: undefined,
      national_code: undefined,
      username: undefined,
      capillary_sales_line_ids: undefined,
    });
    setError("");
  };

  const handleGroupChange = (groupId: string) => {
    setFormData((prev) => {
      const currentGroups = prev.groups || [];
      if (currentGroups.includes(groupId)) {
        return {
          ...prev,
          groups: currentGroups.filter((id) => id !== groupId),
        };
      } else {
        return {
          ...prev,
          groups: [...currentGroups, groupId],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await profileService.createProfile(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error creating profile:", err);
      setError(err.response?.data?.message || "خطا در ایجاد پروفایل");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            ایجاد پروفایل جدید
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* First Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              نام <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, first_name: e.target.value }))
              }
              required
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              نام خانوادگی <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, last_name: e.target.value }))
              }
              required
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ایمیل <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              شماره موبایل <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, mobile: e.target.value }))
              }
              required
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              جنسیت <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  gender: e.target.value as "MALE" | "FEMALE",
                }))
              }
              required
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="MALE">مرد</option>
              <option value="FEMALE">زن</option>
            </select>
          </div>

          {/* Groups */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              گروه‌ها <span className="text-red-500">*</span>
            </label>
            <div className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg min-h-[120px] max-h-60 overflow-y-auto">
              {groups.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  در حال بارگذاری گروه‌ها...
                </p>
              ) : (
                <div className="space-y-2">
                  {groups.map((group) => {
                    const isSelected = formData.groups?.includes(group.id);
                    return (
                      <label
                        key={group.id}
                        className="flex items-center space-x-reverse space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleGroupChange(group.id)}
                          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700">
                          {group.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            {formData.groups && formData.groups.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {formData.groups.length} گروه انتخاب شده
              </p>
            )}
          </div>

          {/* Enabled */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              وضعیت <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.enabled ? "true" : "false"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  enabled: e.target.value === "true",
                }))
              }
              required
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="true">فعال</option>
              <option value="false">غیرفعال</option>
            </select>
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              تاریخ تولد (اختیاری)
            </label>
            <PersianDatePicker
              value={formData.birth_date || ""}
              onChange={(date) =>
                setFormData((prev) => ({
                  ...prev,
                  birth_date: date || undefined,
                }))
              }
              placeholder="تاریخ تولد را انتخاب کنید"
            />
          </div>

          {/* National Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              کد ملی (اختیاری)
            </label>
            <input
              type="text"
              value={formData.national_code || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  national_code: e.target.value || undefined,
                }))
              }
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              نام کاربری (اختیاری)
            </label>
            <input
              type="text"
              value={formData.username || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  username: e.target.value || undefined,
                }))
              }
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-reverse space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={
                loading || !formData.groups || formData.groups.length === 0
              }
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-reverse space-x-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>ایجاد پروفایل</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
