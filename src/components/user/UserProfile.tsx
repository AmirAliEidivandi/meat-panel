import { Edit2, Save, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  fileService,
  fileUrl,
  peopleService,
  profileService,
} from "../../services/api";
import type {
  PeopleInfoResponse,
  ProfileInfoResponse,
  UpdateProfileSelfDto,
} from "../../types";

export default function UserProfile() {
  const [profileInfo, setProfileInfo] = useState<ProfileInfoResponse | null>(
    null
  );
  const [peopleInfo, setPeopleInfo] = useState<PeopleInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileSelfDto>({});
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profile, people] = await Promise.all([
        profileService.getProfileInfo(),
        peopleService.getPeopleInfo(),
      ]);
      setProfileInfo(profile);
      setPeopleInfo(people);
      setFormData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        mobile: profile.mobile,
        gender: profile.gender,
        birth_date: profile.birth_date || undefined,
        username: profile.username || undefined,
        national_code: profile.national_code || undefined,
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
      await profileService.updateProfileInfo(formData);
      await loadData();
      setEditing(false);
    } catch (err: any) {
      setError("خطا در به‌روزرسانی اطلاعات");
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    try {
      const files = Array.from(e.target.files);
      const uploadResponse = await fileService.uploadFiles(files);
      if (uploadResponse.length > 0) {
        setFormData((prev) => ({
          ...prev,
          profile_image_id: uploadResponse[0].id,
        }));
      }
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profileInfo) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">خطا در بارگذاری اطلاعات</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">اطلاعات شخصی</h2>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center space-x-reverse space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Edit2 className="w-5 h-5" />
              <span>ویرایش</span>
            </button>
          ) : (
            <div className="flex items-center space-x-reverse space-x-2">
              <button
                onClick={handleSubmit}
                className="flex items-center space-x-reverse space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-5 h-5" />
                <span>ذخیره</span>
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  loadData();
                }}
                className="flex items-center space-x-reverse space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
                <span>لغو</span>
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Image */}
          <div className="md:col-span-2 flex justify-center">
            <div className="relative">
              {profileInfo.profile_image ? (
                <img
                  src={fileUrl(profileInfo.profile_image.thumbnail) || ""}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-primary-200">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
              {editing && (
                <label className="absolute bottom-0 left-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                  <Edit2 className="w-4 h-4" />
                </label>
              )}
            </div>
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              نام
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.first_name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    first_name: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            ) : (
              <p className="text-gray-900">{profileInfo.first_name}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              نام خانوادگی
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.last_name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    last_name: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            ) : (
              <p className="text-gray-900">{profileInfo.last_name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ایمیل
            </label>
            {editing ? (
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            ) : (
              <p className="text-gray-900">{profileInfo.email || "-"}</p>
            )}
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              شماره موبایل
            </label>
            <p className="text-gray-900">
              {profileInfo.mobile_prefix && profileInfo.mobile
                ? `${profileInfo.mobile_prefix}${profileInfo.mobile}`
                : profileInfo.mobile || "-"}
            </p>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              جنسیت
            </label>
            {editing ? (
              <select
                value={formData.gender || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    gender: e.target.value as
                      | "MALE"
                      | "FEMALE"
                      | "OTHER"
                      | null,
                  }))
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">انتخاب کنید</option>
                <option value="MALE">مرد</option>
                <option value="FEMALE">زن</option>
                <option value="OTHER">سایر</option>
              </select>
            ) : (
              <p className="text-gray-900">
                {profileInfo.gender === "MALE"
                  ? "مرد"
                  : profileInfo.gender === "FEMALE"
                  ? "زن"
                  : profileInfo.gender === "OTHER"
                  ? "سایر"
                  : "-"}
              </p>
            )}
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              تاریخ تولد
            </label>
            {editing ? (
              <input
                type="date"
                value={
                  formData.birth_date
                    ? new Date(formData.birth_date).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    birth_date: e.target.value || undefined,
                  }))
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            ) : (
              <p className="text-gray-900">
                {profileInfo.birth_date
                  ? new Date(profileInfo.birth_date).toLocaleDateString("fa-IR")
                  : "-"}
              </p>
            )}
          </div>

          {/* National Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              کد ملی
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.national_code || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    national_code: e.target.value || undefined,
                  }))
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            ) : (
              <p className="text-gray-900">
                {profileInfo.national_code || "-"}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              نام کاربری
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.username || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    username: e.target.value || undefined,
                  }))
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            ) : (
              <p className="text-gray-900">{profileInfo.username || "-"}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
