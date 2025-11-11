import {
  ArrowRight,
  BarChart3,
  Calendar,
  DollarSign,
  Loader2,
  MapPin,
  Package,
  Truck,
  User,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate } from "../lib/utils";
import { warehouseService } from "../services/api";
import type { WarehouseDetailsResponse } from "../types";

export default function WarehouseDetails() {
  const navigate = useNavigate();
  const { id: warehouseId } = useParams<{ id: string }>();
  const [warehouse, setWarehouse] = useState<WarehouseDetailsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (warehouseId) {
      fetchWarehouseDetails();
    }
  }, [warehouseId]);

  const fetchWarehouseDetails = async () => {
    if (!warehouseId) return;

    try {
      setLoading(true);
      setError("");
      const data = await warehouseService.getWarehouseById(warehouseId);
      setWarehouse(data);
    } catch (err: any) {
      console.error("Error fetching warehouse details:", err);
      setError("خطا در بارگذاری جزئیات انبار");
    } finally {
      setLoading(false);
    }
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

  if (error || !warehouse) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error || "انبار یافت نشد"}</div>
        <button
          onClick={() => navigate("/manage/warehouses")}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          بازگشت به لیست انبارها
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in font-vazir max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/manage/warehouses")}
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {warehouse.name}
            </h1>
            <p className="text-gray-500">جزئیات و مدیریت انبار</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <WarehouseIcon className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-bold text-gray-900">کد انبار</h3>
          </div>
          <p className="text-xl font-bold text-amber-600">#{warehouse.code}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <WarehouseIcon className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">وضعیت</h3>
          </div>
          <p className="text-sm font-semibold">
            {warehouse.deleted ? (
              <span className="text-red-600">حذف شده</span>
            ) : (
              <span className="text-green-600">فعال</span>
            )}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <WarehouseIcon className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900">قیمت‌ها بروزرسانی</h3>
          </div>
          <p className="text-sm font-semibold">
            {warehouse.are_prices_updated ? (
              <span className="text-green-600">بله</span>
            ) : (
              <span className="text-red-600">خیر</span>
            )}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-reverse space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">تاریخ ایجاد</h3>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {formatDate(warehouse.created_at)}
          </p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Address */}
        {warehouse.address && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-reverse space-x-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-gray-600" />
              </div>
              <h3 className="font-bold text-gray-900">آدرس</h3>
            </div>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
              {warehouse.address}
            </p>
          </div>
        )}

        {/* Branch */}
        {warehouse.branch && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-reverse space-x-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900">شعبه</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1.5">نام</p>
                <p className="text-sm font-semibold text-gray-900">
                  {warehouse.branch.name}
                </p>
              </div>
              {warehouse.branch.address && (
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">آدرس</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {warehouse.branch.address}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manager */}
        {warehouse.manager && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-reverse space-x-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <User className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900">مدیر انبار</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1.5">نام</p>
                <p className="text-sm font-semibold text-gray-900">
                  {warehouse.manager.profile.first_name}{" "}
                  {warehouse.manager.profile.last_name}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-reverse space-x-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="font-bold text-gray-900">گزارش‌ها و عملیات</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() =>
              navigate(`/manage/warehouses/${warehouseId}/product-kardex`)
            }
            className="flex items-center space-x-reverse space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all"
          >
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="text-right flex-1">
              <p className="text-sm font-semibold text-gray-900">
                گردش موجودی کالا
              </p>
              <p className="text-xs text-gray-600">گزارش گردش موجودی محصولات</p>
            </div>
          </button>
          <button
            onClick={() =>
              navigate(`/manage/warehouses/${warehouseId}/receivings`)
            }
            className="flex items-center space-x-reverse space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all"
          >
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div className="text-right flex-1">
              <p className="text-sm font-semibold text-gray-900">
                لیست ورودی‌ها
              </p>
              <p className="text-xs text-gray-600">
                مشاهده و مدیریت ورودی‌های انبار
              </p>
            </div>
          </button>
          <button
            onClick={() =>
              navigate(`/manage/warehouses/${warehouseId}/update-prices`)
            }
            className="flex items-center space-x-reverse space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div className="text-right flex-1">
              <p className="text-sm font-semibold text-gray-900">
                به‌روزرسانی قیمت‌ها
              </p>
              <p className="text-xs text-gray-600">
                ویرایش و به‌روزرسانی قیمت محصولات
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
