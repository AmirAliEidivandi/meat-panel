import { Edit2, Loader2, Save, Upload, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDate } from "../../lib/utils";
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
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
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
      setSaving(true);
      setError("");
      await profileService.updateProfileInfo(formData);
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
    if (profileInfo) {
      setFormData({
        first_name: profileInfo.first_name,
        last_name: profileInfo.last_name,
        email: profileInfo.email,
        mobile: profileInfo.mobile,
        gender: profileInfo.gender,
        birth_date: profileInfo.birth_date || undefined,
        username: profileInfo.username || undefined,
        national_code: profileInfo.national_code || undefined,
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    try {
      setUploadingImage(true);
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
      setError("خطا در آپلود تصویر");
    } finally {
      setUploadingImage(false);
    }
  };

  const getGenderText = (gender: string | null | undefined) => {
    if (!gender) return "-";
    const genderMap: { [key: string]: string } = {
      MALE: "مرد",
      FEMALE: "زن",
      OTHER: "سایر",
    };
    return genderMap[gender] || gender;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="mr-3 text-gray-600 font-semibold">
          در حال بارگذاری...
        </span>
      </div>
    );
  }

  if (error && !profileInfo) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4 font-semibold">
          {error || "خطا در بارگذاری اطلاعات"}
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (!profileInfo) {
    return null;
  }

  return (
    <div className="fade-in font-vazir max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-reverse space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  اطلاعات شخصی
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  مدیریت اطلاعات شخصی شما
                </p>
              </div>
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-reverse space-x-2"
              >
                <Edit2 className="w-5 h-5" />
                <span>ویرایش</span>
              </button>
            ) : (
              <div className="flex items-center space-x-reverse space-x-3">
                <button
                  onClick={handleSubmit}
                  disabled={saving || uploadingImage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-reverse space-x-2 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>
                    {saving ? "در حال ذخیره..." : "ذخیره"}
                  </span>
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving || uploadingImage}
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

      {/* Profile Image */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">تصویر پروفایل</h2>
        <div className="flex justify-center">
          <div className="relative">
            {profileInfo.profile_image ? (
              <img
                src={
                  fileUrl(profileInfo.profile_image.thumbnail) ||
                  fileUrl(profileInfo.profile_image.url) ||
                  ""
                }
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-blue-200 shadow-lg">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            )}
            {editing && (
              <label className="absolute bottom-0 left-0 bg-blue-600 text-white p-3 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                {uploadingImage ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          اطلاعات اصلی
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              ) : (
                <p className="text-base font-semibold text-gray-900">
                  {profileInfo.first_name}
                </p>
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
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              ) : (
                <p className="text-base font-semibold text-gray-900">
                  {profileInfo.last_name}
                </p>
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
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-base font-semibold text-gray-900">
                  {profileInfo.email || "-"}
                </p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                شماره موبایل
              </label>
              <p className="text-base font-semibold text-gray-900">
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
                      gender: (e.target.value as "MALE" | "FEMALE" | "OTHER") || null,
                    }))
                  }
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">انتخاب کنید</option>
                  <option value="MALE">مرد</option>
                  <option value="FEMALE">زن</option>
                  <option value="OTHER">سایر</option>
                </select>
              ) : (
                <p className="text-base font-semibold text-gray-900">
                  {getGenderText(profileInfo.gender)}
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
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-base font-semibold text-gray-900">
                  {profileInfo.birth_date
                    ? formatDate(profileInfo.birth_date)
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
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-base font-semibold text-gray-900">
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
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-base font-semibold text-gray-900">
                  {profileInfo.username || "-"}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Additional Info */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          اطلاعات تکمیلی
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">وضعیت حساب</p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${
                profileInfo.enabled
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {profileInfo.enabled ? "فعال" : "غیرفعال"}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">تأیید موبایل</p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${
                profileInfo.mobile_verified
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {profileInfo.mobile_verified ? "تأیید شده" : "تأیید نشده"}
            </span>
          </div>
          {peopleInfo && (
            <div>
              <p className="text-sm text-gray-600 mb-1">عنوان</p>
              <p className="text-base font-semibold text-gray-900">
                {peopleInfo.title || "-"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
