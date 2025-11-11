import ReactECharts from "echarts-for-react";
import { BarChart3, Package, ShoppingCart, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { statsService } from "../services/api";
import type {
  ReturnedOrdersReportStats,
  ReturnedProductsReportStats,
} from "../types";

export default function OrderStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statsData, setStatsData] = useState<{
    returnedOrders?: ReturnedOrdersReportStats;
    returnedProducts?: ReturnedProductsReportStats;
  }>({});

  useEffect(() => {
    fetchOrderStats();
  }, []);

  const fetchOrderStats = async () => {
    try {
      setLoading(true);
      setError("");

      const [returnedOrders, returnedProducts] = await Promise.all([
        statsService.getReturnedOrdersReport(),
        statsService.getReturnedProductsReport(),
      ]);

      setStatsData({
        returnedOrders,
        returnedProducts,
      });
    } catch (err: any) {
      setError("خطا در بارگذاری آمار سفارشات");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fa-IR", {
      style: "currency",
      currency: "IRR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fa-IR").format(num);
  };

  const returnedProductsChart = {
    title: {
      text: "محصولات مرجوعی",
      textStyle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#374151",
        fontFamily: "Vazir, Tahoma, sans-serif",
      },
      left: "center",
      top: 20,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      textStyle: {
        fontFamily: "Vazir, Tahoma, sans-serif",
        fontSize: 12,
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "25%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data:
        statsData.returnedProducts?.report
          .slice(0, 8)
          .map((product) => product.product_title) || [],
      axisLabel: {
        rotate: 45,
        fontSize: 10,
        fontFamily: "Vazir, Tahoma, sans-serif",
        color: "#6b7280",
      },
      axisLine: {
        lineStyle: {
          color: "#e5e7eb",
        },
      },
    },
    yAxis: {
      type: "value",
      name: "وزن مرجوعی (کیلوگرم)",
      nameTextStyle: {
        fontFamily: "Vazir, Tahoma, sans-serif",
        fontSize: 12,
        color: "#6b7280",
      },
      axisLabel: {
        fontFamily: "Vazir, Tahoma, sans-serif",
        fontSize: 11,
        color: "#6b7280",
      },
      axisLine: {
        lineStyle: {
          color: "#e5e7eb",
        },
      },
      splitLine: {
        lineStyle: {
          color: "#f3f4f6",
        },
      },
    },
    series: [
      {
        name: "وزن مرجوعی",
        type: "bar",
        data:
          statsData.returnedProducts?.report
            .slice(0, 8)
            .map((product) => product.total_returned_weight) || [],
        itemStyle: {
          color: "#ef4444",
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: "60%",
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in font-vazir">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-reverse space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">آمار سفارشات</h1>
            <p className="text-gray-600 text-base">
              گزارشات و آمار مربوط به سفارشات و مرجوعی‌ها
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Returned Orders */}
        <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl border border-red-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">
            سفارشات مرجوعی
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatNumber(
              (statsData.returnedOrders?.summary.fully_returned_count || 0) +
                (statsData.returnedOrders?.summary.partially_returned_count ||
                  0)
            )}
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-500">
              مبلغ کل مرجوعی:{" "}
              {formatCurrency(
                statsData.returnedOrders?.summary.total_returned_amount || 0
              )}
            </p>
            <p className="text-xs text-gray-500">
              درصد مرجوعی:{" "}
              {(
                statsData.returnedOrders?.summary.average_return_percentage || 0
              ).toFixed(1)}
              %
            </p>
          </div>
        </div>

        {/* Returned Products */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl border border-orange-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <TrendingDown className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">
            محصولات مرجوعی
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatNumber(
              statsData.returnedProducts?.summary.total_returned_weight || 0
            )}{" "}
            کیلوگرم
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-500">
              مبلغ مرجوعی:{" "}
              {formatCurrency(
                statsData.returnedProducts?.summary.total_returned_amount || 0
              )}
            </p>
            <p className="text-xs text-gray-500">
              درصد مرجوعی:{" "}
              {(
                statsData.returnedProducts?.summary.average_return_percentage ||
                0
              ).toFixed(1)}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Returned Products Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
        <ReactECharts
          option={returnedProductsChart}
          style={{ height: "400px" }}
          opts={{ renderer: "svg" }}
        />
      </div>

      {/* Detailed Stats Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Returned Orders Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            سفارشات مرجوعی
          </h3>
          <div className="space-y-3">
            {statsData.returnedOrders?.report
              .sort((a, b) => b.total_returned_amount - a.total_returned_amount)
              .slice(0, 10)
              .map((order, index) => (
                <div
                  key={order.order_id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-red-50 hover:to-rose-50 transition-all duration-300"
                >
                  <div className="flex items-center space-x-reverse space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        سفارش #{order.order_code}
                      </p>
                      <p className="text-xs text-gray-500">
                        مشتری: {order.customer_title}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-red-600">
                      {formatCurrency(order.total_returned_amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatNumber(order.total_returned_weight)} کیلوگرم
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Returned Products Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            محصولات مرجوعی
          </h3>
          <div className="space-y-3">
            {statsData.returnedProducts?.report
              .sort((a, b) => b.total_returned_weight - a.total_returned_weight)
              .slice(0, 10)
              .map((product, index) => (
                <div
                  key={product.product_id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-orange-50 hover:to-amber-50 transition-all duration-300"
                >
                  <div className="flex items-center space-x-reverse space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {product.product_title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.total_return_count} بار مرجوعی
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-orange-600">
                      {formatNumber(product.total_returned_weight)} کیلوگرم
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.return_percentage.toFixed(1)}% مرجوعی
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
