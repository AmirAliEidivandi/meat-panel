import { UserCog, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileService } from "../services/api";
import type { ProfileListItem } from "../types";

export default function Profiles() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ProfileListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await profileService.getProfileList();
      setProfiles(response.data || []);
    } catch (err: any) {
      console.error("Error fetching profiles:", err);
      setError("خطا در بارگذاری کاربران");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={fetchProfiles}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in font-vazir">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-reverse space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
            <UserCog className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">مدیریت کاربران</h1>
            <p className="text-gray-600 text-base">
              مدیریت و مشاهده پروفایل‌های کاربران سیستم
            </p>
          </div>
        </div>
      </div>

      {/* Profiles List */}
      {profiles.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">هیچ کاربری یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-2">
          {profiles.map((profile, index) => (
            <div
              key={profile.id}
              className="p-5 hover:bg-gray-50 transition-colors duration-200 cursor-pointer rounded-xl border-2 border-gray-200 bg-white shadow-sm hover:shadow-md"
              onClick={() => navigate(`/manage/profiles/${profile.id}`)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Header Row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-reverse space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {profile.first_name} {profile.last_name}
                    </h3>
                    <p className="text-base text-gray-600">
                      نام کاربری: {profile.username}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-reverse space-x-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-2 text-base font-semibold ${
                      profile.enabled
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {profile.enabled ? "فعال" : "غیرفعال"}
                  </span>
                </div>
              </div>

              {/* Main Info Row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-2">
                {/* Mobile */}
                <div className="text-center bg-gray-50 p-4 rounded-lg">
                  <p className="text-base font-bold text-gray-700 mb-2">
                    شماره موبایل
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {profile.mobile || "نامشخص"}
                  </p>
                </div>

                {/* Username */}
                <div className="text-center bg-blue-50 p-4 rounded-lg">
                  <p className="text-base font-bold text-gray-700 mb-2">
                    نام کاربری
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {profile.username}
                  </p>
                </div>

                {/* Status */}
                <div className="text-center bg-purple-50 p-4 rounded-lg">
                  <p className="text-base font-bold text-gray-700 mb-2">
                    وضعیت
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {profile.enabled ? "فعال" : "غیرفعال"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
