import ReactECharts from "echarts-for-react";
import {
  BarChart3,
  DollarSign,
  Phone,
  TrendingUp,
  Users,
  Weight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { statsService } from "../services/api";
import type { SellerReportStats } from "../types";

export default function SellerStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statsData, setStatsData] = useState<{
    sellerReport?: SellerReportStats;
  }>({});

  useEffect(() => {
    fetchSellerStats();
  }, []);

  const fetchSellerStats = async () => {
    try {
      setLoading(true);
      setError("");

      const sellerReport = await statsService.getSellerReport();

      setStatsData({
        sellerReport,
      });
    } catch (err: any) {
      setError("خطا در بارگذاری آمار فروشندگان");
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

  // Chart configurations
  const sellerPerformanceChart = {
    title: {
      text: "عملکرد فروشندگان",
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
        statsData.sellerReport?.report.map((seller) => seller.seller_name) ||
        [],
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
      name: "تعداد سفارش",
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
        name: "سفارش موفق",
        type: "bar",
        data:
          statsData.sellerReport?.report.map(
            (seller) => seller.successful_orders
          ) || [],
        itemStyle: {
          color: "#10b981",
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: "60%",
      },
      {
        name: "سفارش تحویل شده",
        type: "bar",
        data:
          statsData.sellerReport?.report.map(
            (seller) => seller.delivered_orders
          ) || [],
        itemStyle: {
          color: "#3b82f6",
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: "60%",
      },
    ],
  };

  const salesAmountChart = {
    title: {
      text: "مبلغ فروش فروشندگان",
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
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      textStyle: {
        fontFamily: "Vazir, Tahoma, sans-serif",
        fontSize: 12,
      },
    },
    legend: {
      orient: "vertical",
      left: "left",
      top: "middle",
      textStyle: {
        fontFamily: "Vazir, Tahoma, sans-serif",
        fontSize: 11,
      },
    },
    series: [
      {
        name: "مبلغ فروش",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["60%", "50%"],
        data:
          statsData.sellerReport?.report.map((seller) => ({
            value: seller.total_sales_amount,
            name: seller.seller_name,
          })) || [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        label: {
          fontFamily: "Vazir, Tahoma, sans-serif",
          fontSize: 11,
        },
        labelLine: {
          lineStyle: {
            color: "#6b7280",
          },
        },
      },
    ],
    color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
  };

  const topProductsChart = {
    title: {
      text: "برترین محصولات فروشندگان",
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
        statsData.sellerReport?.report
          .flatMap((seller) => seller.top_products)
          .sort((a, b) => b.total_amount - a.total_amount)
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
      name: "مبلغ فروش (ریال)",
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
        name: "مبلغ فروش",
        type: "bar",
        data:
          statsData.sellerReport?.report
            .flatMap((seller) => seller.top_products)
            .sort((a, b) => b.total_amount - a.total_amount)
            .slice(0, 8)
            .map((product) => product.total_amount) || [],
        itemStyle: {
          color: "#8b5cf6",
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: "60%",
      },
    ],
  };

  const topCategoriesChart = {
    title: {
      text: "برترین دسته‌بندی‌های فروش",
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
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      textStyle: {
        fontFamily: "Vazir, Tahoma, sans-serif",
        fontSize: 12,
      },
    },
    legend: {
      orient: "vertical",
      left: "left",
      top: "middle",
      textStyle: {
        fontFamily: "Vazir, Tahoma, sans-serif",
        fontSize: 11,
      },
    },
    series: [
      {
        name: "مبلغ فروش",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["60%", "50%"],
        data:
          statsData.sellerReport?.report
            .flatMap((seller) => seller.top_categories)
            .reduce((acc, category) => {
              const existing = acc.find(
                (c) => c.name === category.category_title
              );
              if (existing) {
                existing.value += category.total_amount;
              } else {
                acc.push({
                  name: category.category_title,
                  value: category.total_amount,
                });
              }
              return acc;
            }, [] as { name: string; value: number }[])
            .sort((a, b) => b.value - a.value)
            .slice(0, 6) || [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        label: {
          fontFamily: "Vazir, Tahoma, sans-serif",
          fontSize: 11,
        },
        labelLine: {
          lineStyle: {
            color: "#6b7280",
          },
        },
      },
    ],
    color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"],
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
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">آمار فروشندگان</h1>
            <p className="text-gray-600 text-base">
              گزارشات و آمار مربوط به عملکرد فروشندگان
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Sellers */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">
            فروشندگان فعال
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatNumber(statsData.sellerReport?.report.length || 0)}
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-500">
              کل تماس‌ها:{" "}
              {formatNumber(
                statsData.sellerReport?.report.reduce(
                  (sum, seller) => sum + seller.total_calls,
                  0
                ) || 0
              )}
            </p>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">کل فروش</h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(
              statsData.sellerReport?.report.reduce(
                (sum, seller) => sum + seller.total_sales_amount,
                0
              ) || 0
            )}
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-500">
              کل سفارشات:{" "}
              {formatNumber(
                statsData.sellerReport?.report.reduce(
                  (sum, seller) => sum + seller.successful_orders,
                  0
                ) || 0
              )}
            </p>
          </div>
        </div>

        {/* Average Conversion */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl border border-indigo-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">
            میانگین نرخ تبدیل
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {(
              (statsData.sellerReport?.report || []).reduce(
                (sum, seller) => sum + seller.conversion_rate,
                0
              ) / ((statsData.sellerReport?.report || []).length || 1)
            ).toFixed(1)}
            %
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-500">
              میانگین امتیاز:{" "}
              {(
                (statsData.sellerReport?.report || []).reduce(
                  (sum, seller) => sum + seller.performance_score,
                  0
                ) / ((statsData.sellerReport?.report || []).length || 1)
              ).toFixed(1)}
            </p>
          </div>
        </div>

        {/* Total Weight */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-xl border border-teal-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
              <Weight className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">
            کل وزن فروش
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatNumber(
              statsData.sellerReport?.report.reduce(
                (sum, seller) => sum + seller.total_weight_sold,
                0
              ) || 0
            )}{" "}
            کیلوگرم
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seller Performance Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <ReactECharts
            option={sellerPerformanceChart}
            style={{ height: "400px" }}
            opts={{ renderer: "svg" }}
          />
        </div>

        {/* Sales Amount Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <ReactECharts
            option={salesAmountChart}
            style={{ height: "400px" }}
            opts={{ renderer: "svg" }}
          />
        </div>

        {/* Top Products Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <ReactECharts
            option={topProductsChart}
            style={{ height: "400px" }}
            opts={{ renderer: "svg" }}
          />
        </div>

        {/* Top Categories Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <ReactECharts
            option={topCategoriesChart}
            style={{ height: "400px" }}
            opts={{ renderer: "svg" }}
          />
        </div>
      </div>

      {/* Top Sellers Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          برترین فروشندگان
        </h3>
        <div className="space-y-3">
          {statsData.sellerReport?.report
            .sort((a, b) => b.total_sales_amount - a.total_sales_amount)
            .map((seller, index) => (
              <div
                key={seller.seller_id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-indigo-50 transition-all duration-300"
              >
                <div className="flex items-center space-x-reverse space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {seller.seller_name}
                    </p>
                    <div className="flex items-center space-x-reverse space-x-4 mt-1">
                      <p className="text-xs text-gray-500">
                        <Phone className="w-3 h-3 inline ml-1" />
                        {seller.total_calls} تماس
                      </p>
                      <p className="text-xs text-gray-500">
                        <Users className="w-3 h-3 inline ml-1" />
                        {seller.unique_customers} مشتری
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-green-600">
                    {formatCurrency(seller.total_sales_amount)}
                  </p>
                  <div className="flex items-center space-x-reverse space-x-3 mt-1">
                    <p className="text-xs text-gray-500">
                      نرخ تبدیل: {seller.conversion_rate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      امتیاز: {seller.performance_score}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
