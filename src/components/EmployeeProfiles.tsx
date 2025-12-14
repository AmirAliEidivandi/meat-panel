import { Edit, Loader2, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileService } from "../services/api";
import type { ProfileListItem } from "../types";
import CreateProfileModal from "./CreateProfileModal";
import Pagination from "./Pagination";
import UpdateProfileModal from "./UpdateProfileModal";

export default function EmployeeProfiles() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ProfileListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [enabledFilter, setEnabledFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, [currentPage]);

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
    fetchProfiles();
  }, [searchTerm, enabledFilter]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await profileService.getEmployees({
        page: currentPage,
        "page-size": pageSize,
      });
      setProfiles(response.data || []);
      setTotalCount(response.count || 0);
    } catch (err: any) {
      console.error("Error fetching employee profiles:", err);
      setError(err.response?.data?.message || "خطا در دریافت لیست کارمندان");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (searchTerm) count++;
    if (enabledFilter !== "") count++;
    return count;
  };

  // Apply client-side filters
  const filteredProfiles = profiles.filter((profile) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        profile.first_name.toLowerCase().includes(searchLower) ||
        profile.last_name.toLowerCase().includes(searchLower) ||
        profile.username?.toLowerCase().includes(searchLower) ||
        profile.mobile?.includes(searchTerm);
      if (!matchesSearch) return false;
    }

    if (enabledFilter !== "") {
      const isEnabled = enabledFilter === "true";
      if (profile.enabled !== isEnabled) return false;
    }

    return true;
  });

  const filteredCount = filteredProfiles.length;

  return (
    <div className="space-y-6 fade-in font-vazir">
      {/* Header */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                لیست کارمندان
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {filteredCount} کارمند
                {getActiveFiltersCount() > 0 && " (فیلتر شده)"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold flex items-center space-x-reverse space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>ایجاد</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              جستجو
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو..."
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              وضعیت
            </label>
            <select
              value={enabledFilter}
              onChange={(e) => setEnabledFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">همه</option>
              <option value="true">فعال</option>
              <option value="false">غیرفعال</option>
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
                setEnabledFilter("");
                setCurrentPage(1);
              }}
              className="text-sm text-teal-600 hover:text-teal-700 font-semibold"
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
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          <span className="mr-3 text-gray-600 font-semibold">
            در حال بارگذاری...
          </span>
        </div>
      )}

      {/* Profiles Table */}
      {!loading && filteredCount > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    نام و نام خانوادگی
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    نام کاربری
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    شماره موبایل
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    وضعیت
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProfiles.map((profile) => (
                  <tr
                    key={profile.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/manage/profiles/${profile.id}`)}
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      {profile.first_name} {profile.last_name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {profile.username || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {profile.mobile || "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          profile.enabled
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {profile.enabled ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center space-x-reverse space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/manage/profiles/${profile.id}`);
                          }}
                          className="px-3 py-1 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors text-sm font-semibold"
                        >
                          مشاهده
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProfileId(profile.id);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold flex items-center space-x-reverse space-x-1"
                          title="ویرایش"
                        >
                          <Edit className="w-4 h-4" />
                          <span>ویرایش</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCount === 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold">
            {getActiveFiltersCount() > 0
              ? "هیچ موردی با فیلترهای انتخابی یافت نشد"
              : "کارمندی یافت نشد"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredCount > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalCount}
          itemsPerPage={pageSize}
          totalPages={Math.ceil(totalCount / pageSize)}
          onPageChange={handlePageChange}
        />
      )}

      {/* Create Profile Modal */}
      <CreateProfileModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchProfiles();
        }}
      />

      {/* Update Profile Modal */}
      {editingProfileId && (
        <UpdateProfileModal
          isOpen={!!editingProfileId}
          onClose={() => setEditingProfileId(null)}
          onSuccess={() => {
            setEditingProfileId(null);
            fetchProfiles();
          }}
          profileId={editingProfileId}
        />
      )}
    </div>
  );
}
