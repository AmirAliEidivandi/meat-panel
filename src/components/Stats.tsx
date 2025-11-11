import ReactECharts from 'echarts-for-react';
import {
	BarChart3,
	DollarSign,
	Package,
	Phone,
	TrendingDown,
	TrendingUp,
	Users,
	Weight,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { statsService } from '../services/api';
import type {
	ActualCustomerDebtReportStats,
	CustomersWithoutPurchaseReportStats,
	InactiveCustomersReportStats,
	NegativeInventoryReportStats,
	ReturnedOrdersReportStats,
	ReturnedProductsReportStats,
	SellerReportStats,
} from '../types';

export default function Stats() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [statsData, setStatsData] = useState<{
		sellerReport?: SellerReportStats;
		negativeInventory?: NegativeInventoryReportStats;
		customerDebt?: ActualCustomerDebtReportStats;
		returnedOrders?: ReturnedOrdersReportStats;
		returnedProducts?: ReturnedProductsReportStats;
		inactiveCustomers?: InactiveCustomersReportStats;
		customersWithoutPurchase?: CustomersWithoutPurchaseReportStats;
	}>({});

	useEffect(() => {
		fetchAllStats();
	}, []);

	const fetchAllStats = async () => {
		try {
			setLoading(true);
			setError('');

			const [
				sellerReport,
				negativeInventory,
				customerDebt,
				returnedOrders,
				returnedProducts,
				inactiveCustomers,
				customersWithoutPurchase,
			] = await Promise.all([
				statsService.getSellerReport(),
				statsService.getNegativeInventoryReport(),
				statsService.getActualCustomerDebtReport(),
				statsService.getReturnedOrdersReport(),
				statsService.getReturnedProductsReport(),
				statsService.getInactiveCustomersReport(),
				statsService.getCustomersWithoutPurchaseReport(),
			]);

			setStatsData({
				sellerReport,
				negativeInventory,
				customerDebt,
				returnedOrders,
				returnedProducts,
				inactiveCustomers,
				customersWithoutPurchase,
			});
		} catch (err: any) {
			setError('خطا در بارگذاری آمار');
		} finally {
			setLoading(false);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('fa-IR', {
			style: 'currency',
			currency: 'IRR',
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const formatNumber = (num: number) => {
		return new Intl.NumberFormat('fa-IR').format(num);
	};

	// Chart configurations with Persian font
	const sellerPerformanceChart = {
		title: {
			text: 'عملکرد فروشندگان',
			textStyle: {
				fontSize: 18,
				fontWeight: 'bold',
				color: '#374151',
				fontFamily: 'Vazir, Tahoma, sans-serif',
			},
			left: 'center',
			top: 20,
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow',
			},
			backgroundColor: 'rgba(255, 255, 255, 0.95)',
			borderColor: '#e5e7eb',
			borderWidth: 1,
			textStyle: {
				fontFamily: 'Vazir, Tahoma, sans-serif',
				fontSize: 12,
			},
		},
		legend: {
			data: ['سفارش موفق', 'سفارش ناموفق', 'سفارش تحویل شده'],
			top: 50,
			textStyle: {
				fontFamily: 'Vazir, Tahoma, sans-serif',
				fontSize: 12,
			},
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '15%',
			top: '25%',
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			data:
				statsData.sellerReport?.report.map(seller => seller.seller_name) || [],
			axisLabel: {
				rotate: 45,
				fontSize: 11,
				fontFamily: 'Vazir, Tahoma, sans-serif',
				color: '#6b7280',
			},
			axisLine: {
				lineStyle: {
					color: '#e5e7eb',
				},
			},
		},
		yAxis: {
			type: 'value',
			name: 'تعداد سفارش',
			nameTextStyle: {
				fontFamily: 'Vazir, Tahoma, sans-serif',
				fontSize: 12,
				color: '#6b7280',
			},
			axisLabel: {
				fontFamily: 'Vazir, Tahoma, sans-serif',
				fontSize: 11,
				color: '#6b7280',
			},
			axisLine: {
				lineStyle: {
					color: '#e5e7eb',
				},
			},
			splitLine: {
				lineStyle: {
					color: '#f3f4f6',
				},
			},
		},
		series: [
			{
				name: 'سفارش موفق',
				type: 'bar',
				data:
					statsData.sellerReport?.report.map(
						seller => seller.successful_orders,
					) || [],
				itemStyle: {
					color: '#10b981',
					borderRadius: [4, 4, 0, 0],
				},
				barWidth: '60%',
			},
			{
				name: 'سفارش ناموفق',
				type: 'bar',
				data:
					statsData.sellerReport?.report.map(seller => seller.failed_orders) ||
					[],
				itemStyle: {
					color: '#ef4444',
					borderRadius: [4, 4, 0, 0],
				},
				barWidth: '60%',
			},
			{
				name: 'سفارش تحویل شده',
				type: 'bar',
				data:
					statsData.sellerReport?.report.map(
						seller => seller.delivered_orders,
					) || [],
				itemStyle: {
					color: '#3b82f6',
					borderRadius: [4, 4, 0, 0],
				},
				barWidth: '60%',
			},
		],
	};

	const salesAmountChart = {
		title: {
			text: 'مبلغ فروش فروشندگان',
			textStyle: {
				fontSize: 18,
				fontWeight: 'bold',
				color: '#374151',
				fontFamily: 'Vazir, Tahoma, sans-serif',
			},
			left: 'center',
			top: 20,
		},
		tooltip: {
			trigger: 'item',
			formatter: '{a} <br/>{b}: {c} ({d}%)',
			backgroundColor: 'rgba(255, 255, 255, 0.95)',
			borderColor: '#e5e7eb',
			borderWidth: 1,
			textStyle: {
				fontFamily: 'Vazir, Tahoma, sans-serif',
				fontSize: 12,
			},
		},
		legend: {
			orient: 'vertical',
			left: 'left',
			top: 'middle',
			textStyle: {
				fontFamily: 'Vazir, Tahoma, sans-serif',
				fontSize: 11,
			},
		},
		series: [
			{
				name: 'مبلغ فروش',
				type: 'pie',
				radius: ['40%', '70%'],
				center: ['60%', '50%'],
				data:
					statsData.sellerReport?.report.map(seller => ({
						value: seller.total_sales_amount,
						name: seller.seller_name,
					})) || [],
				emphasis: {
					itemStyle: {
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: 'rgba(0, 0, 0, 0.5)',
					},
				},
				label: {
					fontFamily: 'Vazir, Tahoma, sans-serif',
					fontSize: 11,
				},
				labelLine: {
					lineStyle: {
						color: '#6b7280',
					},
				},
			},
		],
		color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
	};

	// Top Products Chart
	const topProductsChart = {
		title: {
			text: 'برترین محصولات فروشندگان',
			textStyle: {
				fontSize: 18,
				fontWeight: 'bold',
				color: '#374151',
				fontFamily: 'Vazir, Tahoma, sans-serif',
			},
			left: 'center',
			top: 20,
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow',
			},
			backgroundColor: 'rgba(255, 255, 255, 0.95)',
			borderColor: '#e5e7eb',
			borderWidth: 1,
			textStyle: {
				fontFamily: 'Vazir, Tahoma, sans-serif',
				fontSize: 12,
			},
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '15%',
			top: '25%',
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			data:
				statsData.sellerReport?.report
					.flatMap(seller => seller.top_products)
					.sort((a, b) => b.total_amount - a.total_amount)
					.slice(0, 8)
					.map(product => product.product_title) || [],
			axisLabel: {
				rotate: 45,
				fontSize: 10,
				fontFamily: 'Vazir, Tahoma, sans-serif',
				color: '#6b7280',
			},
			axisLine: {
				lineStyle: {
					color: '#e5e7eb',
				},
			},
		},
		yAxis: {
			type: 'value',
			name: 'مبلغ فروش (ریال)',
			nameTextStyle: {
				fontFamily: 'Vazir, Tahoma, sans-serif',
				fontSize: 12,
				color: '#6b7280',
			},
			axisLabel: {
				fontFamily: 'Vazir, Tahoma, sans-serif',
				fontSize: 11,
				color: '#6b7280',
			},
			axisLine: {
				lineStyle: {
					color: '#e5e7eb',
				},
			},
			splitLine: {
				lineStyle: {
					color: '#f3f4f6',
				},
			},
		},
		series: [
			{
				name: 'مبلغ فروش',
				type: 'bar',
				data:
					statsData.sellerReport?.report
						.flatMap(seller => seller.top_products)
						.sort((a, b) => b.total_amount - a.total_amount)
						.slice(0, 8)
						.map(product => product.total_amount) || [],
				itemStyle: {
					color: '#8b5cf6',
					borderRadius: [4, 4, 0, 0],
				},
				barWidth: '60%',
			},
		],
	};

	// Top Categories Chart
	const topCategoriesChart = {
		title: {
			text: 'برترین دسته‌بندی‌های فروش',
			textStyle: {
				fontSize: 18,
				fontWeight: 'bold',
				color: '#374151',
				fontFamily: 'Vazir, Tahoma, sans-serif',
			},
			left: 'center',
			top: 20,
		},
		tooltip: {
			trigger: 'item',
			formatter: '{a} <br/>{b}: {c} ({d}%)',
			backgroundColor: 'rgba(255, 255, 255, 0.95)',
			borderColor: '#e5e7eb',
			borderWidth: 1,
			textStyle: {
				fontFamily: 'Vazir, Tahoma, sans-serif',
				fontSize: 12,
			},
		},
		legend: {
			orient: 'vertical',
			left: 'left',
			top: 'middle',
			textStyle: {
				fontFamily: 'Vazir, Tahoma, sans-serif',
				fontSize: 11,
			},
		},
		series: [
			{
				name: 'مبلغ فروش',
				type: 'pie',
				radius: ['40%', '70%'],
				center: ['60%', '50%'],
				data:
					statsData.sellerReport?.report
						.flatMap(seller => seller.top_categories)
						.reduce(
							(acc, category) => {
								const existing = acc.find(
									c => c.name === category.category_title,
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
							},
							[] as { name: string; value: number }[],
						)
						.sort((a, b) => b.value - a.value)
						.slice(0, 6) || [],
				emphasis: {
					itemStyle: {
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: 'rgba(0, 0, 0, 0.5)',
					},
				},
				label: {
					fontFamily: 'Vazir, Tahoma, sans-serif',
					fontSize: 11,
				},
				labelLine: {
					lineStyle: {
						color: '#6b7280',
					},
				},
			},
		],
		color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
	};

	const customerDebtChart = {
		title: {
			text: 'بدهی مشتریان',
			textStyle: {
				fontSize: 18,
				fontWeight: 'bold',
				color: '#374151',
				fontFamily: 'Vazir, Tahoma, sans-serif',
			},
			left: 'center',
			top: 20,
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow',
			},
			backgroundColor: 'rgba(255, 255, 255, 0.95)',
			borderColor: '#e5e7eb',
			borderWidth: 1,
			textStyle: {
				fontFamily: 'Vazir, Tahoma, sans-serif',
				fontSize: 12,
			},
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '15%',
			top: '25%',
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			data:
				statsData.customerDebt?.report
					.slice(0, 10)
					.map(customer => customer.customer_title) || [],
			axisLabel: {
				rotate: 45,
				fontSize: 10,
				fontFamily: 'Vazir, Tahoma, sans-serif',
				color: '#6b7280',
			},
			axisLine: {
				lineStyle: {
					color: '#e5e7eb',
				},
			},
		},
		yAxis: {
			type: 'value',
			name: 'مبلغ بدهی (ریال)',
			nameTextStyle: {
				fontFamily: 'Vazir, Tahoma, sans-serif',
				fontSize: 12,
				color: '#6b7280',
			},
			axisLabel: {
				fontFamily: 'Vazir, Tahoma, sans-serif',
				fontSize: 11,
				color: '#6b7280',
			},
			axisLine: {
				lineStyle: {
					color: '#e5e7eb',
				},
			},
			splitLine: {
				lineStyle: {
					color: '#f3f4f6',
				},
			},
		},
		series: [
			{
				name: 'بدهی واقعی',
				type: 'bar',
				data:
					statsData.customerDebt?.report
						.slice(0, 10)
						.map(customer => customer.actual_debt) || [],
				itemStyle: {
					color: '#f59e0b',
					borderRadius: [4, 4, 0, 0],
				},
				barWidth: '60%',
			},
		],
	};

	const returnedProductsChart = {
		title: {
			text: 'محصولات مرجوعی',
			textStyle: {
				fontSize: 18,
				fontWeight: 'bold',
				color: '#374151',
				fontFamily: 'Vazir, Tahoma, sans-serif',
			},
			left: 'center',
			top: 20,
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow',
			},
			backgroundColor: 'rgba(255, 255, 255, 0.95)',
			borderColor: '#e5e7eb',
			borderWidth: 1,
			textStyle: {
				fontFamily: 'Vazir, Tahoma, sans-serif',
				fontSize: 12,
			},
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '15%',
			top: '25%',
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			data:
				statsData.returnedProducts?.report
					.slice(0, 8)
					.map(product => product.product_title) || [],
			axisLabel: {
				rotate: 45,
				fontSize: 10,
				fontFamily: 'Vazir, Tahoma, sans-serif',
				color: '#6b7280',
			},
			axisLine: {
				lineStyle: {
					color: '#e5e7eb',
				},
			},
		},
		yAxis: {
			type: 'value',
			name: 'وزن مرجوعی (کیلوگرم)',
			nameTextStyle: {
				fontFamily: 'Vazir, Tahoma, sans-serif',
				fontSize: 12,
				color: '#6b7280',
			},
			axisLabel: {
				fontFamily: 'Vazir, Tahoma, sans-serif',
				fontSize: 11,
				color: '#6b7280',
			},
			axisLine: {
				lineStyle: {
					color: '#e5e7eb',
				},
			},
			splitLine: {
				lineStyle: {
					color: '#f3f4f6',
				},
			},
		},
		series: [
			{
				name: 'وزن مرجوعی',
				type: 'bar',
				data:
					statsData.returnedProducts?.report
						.slice(0, 8)
						.map(product => product.total_returned_weight) || [],
				itemStyle: {
					color: '#ef4444',
					borderRadius: [4, 4, 0, 0],
				},
				barWidth: '60%',
			},
		],
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='text-center py-12'>
				<BarChart3 className='w-16 h-16 text-gray-300 mx-auto mb-4' />
				<p className='text-red-600'>{error}</p>
			</div>
		);
	}

	return (
		<div className='space-y-6 fade-in font-vazir'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center space-x-reverse space-x-3'>
					<div className='w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md'>
						<BarChart3 className='w-5 h-5 text-white' />
					</div>
					<div>
						<h1 className='text-xl font-bold text-gray-900'>آمار و گزارشات</h1>
						<p className='text-gray-600 text-sm'>نمای کلی از عملکرد سیستم</p>
					</div>
				</div>
			</div>

			{/* Summary Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				{/* Seller Performance */}
				<div className='bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200 shadow-sm p-6 hover:shadow-md transition-all duration-300'>
					<div className='flex items-center justify-between mb-4'>
						<div className='w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center'>
							<Users className='w-6 h-6 text-white' />
						</div>
						<TrendingUp className='w-5 h-5 text-green-600' />
					</div>
					<h3 className='text-sm font-semibold text-gray-600 mb-1'>
						فروشندگان فعال
					</h3>
					<p className='text-2xl font-bold text-gray-900'>
						{formatNumber(statsData.sellerReport?.report.length || 0)}
					</p>
					<div className='mt-2 space-y-1'>
						<p className='text-xs text-gray-500'>
							کل تماس‌ها:{' '}
							{formatNumber(
								statsData.sellerReport?.report.reduce(
									(sum, seller) => sum + seller.total_calls,
									0,
								) || 0,
							)}
						</p>
						<p className='text-xs text-gray-500'>
							میانگین نرخ تبدیل:{' '}
							{(
								(statsData.sellerReport?.report || []).reduce(
									(sum, seller) => sum + seller.conversion_rate,
									0,
								) / ((statsData.sellerReport?.report || []).length || 1)
							).toFixed(1)}
							%
						</p>
					</div>
				</div>

				{/* Total Sales */}
				<div className='bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200 shadow-sm p-6 hover:shadow-md transition-all duration-300'>
					<div className='flex items-center justify-between mb-4'>
						<div className='w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center'>
							<DollarSign className='w-6 h-6 text-white' />
						</div>
						<TrendingUp className='w-5 h-5 text-green-600' />
					</div>
					<h3 className='text-sm font-semibold text-gray-600 mb-1'>کل فروش</h3>
					<p className='text-2xl font-bold text-gray-900'>
						{formatCurrency(
							statsData.sellerReport?.report.reduce(
								(sum, seller) => sum + seller.total_sales_amount,
								0,
							) || 0,
						)}
					</p>
					<div className='mt-2 space-y-1'>
						<p className='text-xs text-gray-500'>
							کل سفارشات:{' '}
							{formatNumber(
								statsData.sellerReport?.report.reduce(
									(sum, seller) => sum + seller.successful_orders,
									0,
								) || 0,
							)}
						</p>
						<p className='text-xs text-gray-500'>
							کل وزن فروش:{' '}
							{formatNumber(
								statsData.sellerReport?.report.reduce(
									(sum, seller) => sum + seller.total_weight_sold,
									0,
								) || 0,
							)}{' '}
							کیلوگرم
						</p>
					</div>
				</div>

				{/* Customer Debt */}
				<div className='bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl border border-orange-200 shadow-sm p-6 hover:shadow-md transition-all duration-300'>
					<div className='flex items-center justify-between mb-4'>
						<div className='w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center'>
							<Users className='w-6 h-6 text-white' />
						</div>
						<TrendingDown className='w-5 h-5 text-red-600' />
					</div>
					<h3 className='text-sm font-semibold text-gray-600 mb-1'>
						کل بدهی مشتریان
					</h3>
					<p className='text-2xl font-bold text-gray-900'>
						{formatCurrency(
							statsData.customerDebt?.totals.total_actual_debt || 0,
						)}
					</p>
					<div className='mt-2 space-y-1'>
						<p className='text-xs text-gray-500'>
							تعداد مشتریان:{' '}
							{formatNumber(statsData.customerDebt?.total_customers || 0)}
						</p>
						<p className='text-xs text-gray-500'>
							چک‌های در انتظار:{' '}
							{formatNumber(
								statsData.customerDebt?.totals.total_pending_cheques || 0,
							)}
						</p>
					</div>
				</div>

				{/* Returned Products */}
				<div className='bg-gradient-to-br from-red-50 to-rose-100 rounded-xl border border-red-200 shadow-sm p-6 hover:shadow-md transition-all duration-300'>
					<div className='flex items-center justify-between mb-4'>
						<div className='w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center'>
							<Package className='w-6 h-6 text-white' />
						</div>
						<TrendingDown className='w-5 h-5 text-red-600' />
					</div>
					<h3 className='text-sm font-semibold text-gray-600 mb-1'>
						محصولات مرجوعی
					</h3>
					<p className='text-2xl font-bold text-gray-900'>
						{formatNumber(
							statsData.returnedProducts?.summary.total_returned_weight || 0,
						)}{' '}
						کیلوگرم
					</p>
					<div className='mt-2 space-y-1'>
						<p className='text-xs text-gray-500'>
							مبلغ مرجوعی:{' '}
							{formatCurrency(
								statsData.returnedProducts?.summary.total_returned_amount || 0,
							)}
						</p>
						<p className='text-xs text-gray-500'>
							درصد مرجوعی:{' '}
							{(
								statsData.returnedProducts?.summary.average_return_percentage ||
								0
							).toFixed(1)}
							%
						</p>
					</div>
				</div>
			</div>

			{/* Charts Section */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* Seller Performance Chart */}
				<div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300'>
					<ReactECharts
						option={sellerPerformanceChart}
						style={{ height: '400px' }}
						opts={{ renderer: 'svg' }}
					/>
				</div>

				{/* Sales Amount Chart */}
				<div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300'>
					<ReactECharts
						option={salesAmountChart}
						style={{ height: '400px' }}
						opts={{ renderer: 'svg' }}
					/>
				</div>

				{/* Top Products Chart */}
				<div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300'>
					<ReactECharts
						option={topProductsChart}
						style={{ height: '400px' }}
						opts={{ renderer: 'svg' }}
					/>
				</div>

				{/* Top Categories Chart */}
				<div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300'>
					<ReactECharts
						option={topCategoriesChart}
						style={{ height: '400px' }}
						opts={{ renderer: 'svg' }}
					/>
				</div>

				{/* Customer Debt Chart */}
				<div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300'>
					<ReactECharts
						option={customerDebtChart}
						style={{ height: '400px' }}
						opts={{ renderer: 'svg' }}
					/>
				</div>

				{/* Returned Products Chart */}
				<div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300'>
					<ReactECharts
						option={returnedProductsChart}
						style={{ height: '400px' }}
						opts={{ renderer: 'svg' }}
					/>
				</div>
			</div>

			{/* Detailed Stats Tables */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* Top Sellers */}
				<div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300'>
					<h3 className='text-lg font-bold text-gray-900 mb-4'>
						برترین فروشندگان
					</h3>
					<div className='space-y-3'>
						{statsData.sellerReport?.report
							.sort((a, b) => b.total_sales_amount - a.total_sales_amount)
							.slice(0, 5)
							.map((seller, index) => (
								<div
									key={seller.seller_id}
									className='flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-indigo-50 transition-all duration-300'
								>
									<div className='flex items-center space-x-reverse space-x-3'>
										<div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md'>
											{index + 1}
										</div>
										<div>
											<p className='font-semibold text-gray-900'>
												{seller.seller_name}
											</p>
											<div className='flex items-center space-x-reverse space-x-4 mt-1'>
												<p className='text-xs text-gray-500'>
													<Phone className='w-3 h-3 inline ml-1' />
													{seller.total_calls} تماس
												</p>
												<p className='text-xs text-gray-500'>
													<Users className='w-3 h-3 inline ml-1' />
													{seller.unique_customers} مشتری
												</p>
											</div>
										</div>
									</div>
									<div className='text-left'>
										<p className='font-bold text-green-600'>
											{formatCurrency(seller.total_sales_amount)}
										</p>
										<div className='flex items-center space-x-reverse space-x-3 mt-1'>
											<p className='text-xs text-gray-500'>
												نرخ تبدیل: {seller.conversion_rate.toFixed(1)}%
											</p>
											<p className='text-xs text-gray-500'>
												امتیاز: {seller.performance_score}
											</p>
										</div>
									</div>
								</div>
							))}
					</div>
				</div>

				{/* Top Customers by Debt */}
				<div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300'>
					<h3 className='text-lg font-bold text-gray-900 mb-4'>
						بیشترین بدهی مشتریان
					</h3>
					<div className='space-y-4'>
						{statsData.customerDebt?.report
							.sort((a, b) => b.actual_debt - a.actual_debt)
							.slice(0, 5)
							.map((customer, index) => (
								<div
									key={customer.customer_id}
									className='p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-orange-50 hover:to-amber-50 transition-all duration-300 border border-gray-200 hover:border-orange-300'
								>
									{/* Header: Rank and Customer Info */}
									<div className='flex items-center justify-between mb-3'>
										<div className='flex items-center space-x-reverse space-x-3'>
											<div className='w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md'>
												{index + 1}
											</div>
											<div>
												<p className='font-semibold text-gray-900'>
													{customer.customer_title}
												</p>
												<p className='text-xs text-gray-500'>
													کد: {customer.customer_code}
												</p>
											</div>
										</div>
									</div>

									{/* Debt Information Grid */}
									<div className='grid grid-cols-1 md:grid-cols-2 gap-3 mt-3'>
										{/* بدهی واقعی */}
										<div className='bg-white rounded-lg p-3 border border-orange-200'>
											<p className='text-xs text-gray-600 mb-1'>بدهی واقعی</p>
											<p className='font-bold text-orange-600 text-sm'>
												{formatCurrency(customer.actual_debt)}
											</p>
										</div>

										{/* بدهی حسابداری */}
										<div className='bg-white rounded-lg p-3 border border-blue-200'>
											<p className='text-xs text-gray-600 mb-1'>بدهی حسابداری</p>
											<p className='font-bold text-blue-600 text-sm'>
												{formatCurrency(customer.accounting_debt)}
											</p>
										</div>
									</div>

									{/* Pending Cheques Information */}
									{customer.pending_cheques_count > 0 ? (
										<div className='mt-3 bg-white rounded-lg p-3 border border-amber-200'>
											<p className='text-xs text-gray-600 mb-2'>
												مبلغ چک و تاریخ سررسید چک در انتظار ({customer.pending_cheques_count} چک)
											</p>
											<div className='space-y-2'>
												{customer.pending_cheques_detail && customer.pending_cheques_detail.length > 0 ? (
													customer.pending_cheques_detail.map((cheque) => (
														<div
															key={cheque.payment_id}
															className='flex items-center justify-between text-xs bg-amber-50 rounded p-2'
														>
															<span className='font-semibold text-amber-700'>
																{formatCurrency(cheque.amount)}
															</span>
															{cheque.cheque_due_date && (
																<span className='text-gray-600'>
																	سررسید: {new Intl.DateTimeFormat('fa-IR', {
																		year: 'numeric',
																		month: 'long',
																		day: 'numeric',
																	}).format(new Date(cheque.cheque_due_date))}
																</span>
															)}
														</div>
													))
												) : (
													<div className='text-xs text-gray-500'>
														مبلغ کل: {formatCurrency(customer.pending_cheques_total)}
													</div>
												)}
											</div>
										</div>
									) : (
										<div className='mt-3 bg-white rounded-lg p-3 border border-gray-200'>
											<p className='text-xs text-gray-500 text-center'>
												چک در انتظار ندارد
											</p>
										</div>
									)}
								</div>
							))}
					</div>
				</div>
			</div>

			{/* Additional Stats Sections */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Top Products by Sales */}
				<div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300'>
					<h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center'>
						<Package className='w-5 h-5 ml-2 text-purple-600' />
						برترین محصولات فروش
					</h3>
					<div className='space-y-3'>
						{statsData.sellerReport?.report
							.flatMap(seller => seller.top_products)
							.sort((a, b) => b.total_amount - a.total_amount)
							.slice(0, 5)
							.map((product, index) => (
								<div
									key={`${product.product_title}-${index}`}
									className='flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg'
								>
									<div className='flex items-center space-x-reverse space-x-3'>
										<div className='w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold'>
											{index + 1}
										</div>
										<div>
											<p className='font-semibold text-gray-900 text-sm'>
												{product.product_title}
											</p>
											<p className='text-xs text-gray-500'>
												<Weight className='w-3 h-3 inline ml-1' />
												{formatNumber(product.total_weight)} کیلوگرم
											</p>
										</div>
									</div>
									<div className='text-left'>
										<p className='font-bold text-purple-600'>
											{formatCurrency(product.total_amount)}
										</p>
										<p className='text-xs text-gray-500'>
											{product.order_count} سفارش
										</p>
									</div>
								</div>
							))}
					</div>
				</div>

				{/* Top Categories by Sales */}
				<div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300'>
					<h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center'>
						<Package className='w-5 h-5 ml-2 text-teal-600' />
						برترین دسته‌بندی‌ها
					</h3>
					<div className='space-y-3'>
						{statsData.sellerReport?.report
							.flatMap(seller => seller.top_categories)
							.reduce((acc, category) => {
								const existing = acc.find(
									c => c.category_title === category.category_title,
								);
								if (existing) {
									existing.total_amount += category.total_amount;
									existing.total_weight += category.total_weight;
								} else {
									acc.push({ ...category });
								}
								return acc;
							}, [] as any[])
							.sort((a, b) => b.total_amount - a.total_amount)
							.slice(0, 5)
							.map((category, index) => (
								<div
									key={`${category.category_title}-${index}`}
									className='flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg'
								>
									<div className='flex items-center space-x-reverse space-x-3'>
										<div className='w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white text-sm font-bold'>
											{index + 1}
										</div>
										<div>
											<p className='font-semibold text-gray-900 text-sm'>
												{category.category_title}
											</p>
											<p className='text-xs text-gray-500'>
												<Weight className='w-3 h-3 inline ml-1' />
												{formatNumber(category.total_weight)} کیلوگرم
											</p>
										</div>
									</div>
									<div className='text-left'>
										<p className='font-bold text-teal-600'>
											{formatCurrency(category.total_amount)}
										</p>
									</div>
								</div>
							))}
					</div>
				</div>

				{/* Performance Metrics */}
				<div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300'>
					<h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center'>
						<BarChart3 className='w-5 h-5 ml-2 text-indigo-600' />
						معیارهای عملکرد
					</h3>
					<div className='space-y-4'>
						<div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4'>
							<div className='flex items-center justify-between'>
								<span className='text-sm font-semibold text-gray-700'>
									میانگین نرخ تبدیل
								</span>
								<span className='text-lg font-bold text-blue-600'>
									{(
										(statsData.sellerReport?.report || []).reduce(
											(sum, seller) => sum + seller.conversion_rate,
											0,
										) / ((statsData.sellerReport?.report || []).length || 1)
									).toFixed(1)}
									%
								</span>
							</div>
						</div>
						<div className='bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4'>
							<div className='flex items-center justify-between'>
								<span className='text-sm font-semibold text-gray-700'>
									میانگین نرخ تکمیل
								</span>
								<span className='text-lg font-bold text-green-600'>
									{(
										(statsData.sellerReport?.report || []).reduce(
											(sum, seller) => sum + seller.finalization_rate,
											0,
										) / ((statsData.sellerReport?.report || []).length || 1)
									).toFixed(1)}
									%
								</span>
							</div>
						</div>
						<div className='bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4'>
							<div className='flex items-center justify-between'>
								<span className='text-sm font-semibold text-gray-700'>
									میانگین امتیاز عملکرد
								</span>
								<span className='text-lg font-bold text-purple-600'>
									{(
										(statsData.sellerReport?.report || []).reduce(
											(sum, seller) => sum + seller.performance_score,
											0,
										) / ((statsData.sellerReport?.report || []).length || 1)
									).toFixed(1)}
								</span>
							</div>
						</div>
						<div className='bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4'>
							<div className='flex items-center justify-between'>
								<span className='text-sm font-semibold text-gray-700'>
									میانگین وزن هر سفارش
								</span>
								<span className='text-lg font-bold text-orange-600'>
									{(
										(statsData.sellerReport?.report || []).reduce(
											(sum, seller) => sum + seller.average_weight_per_order,
											0,
										) / ((statsData.sellerReport?.report || []).length || 1)
									).toFixed(1)}{' '}
									کیلوگرم
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
