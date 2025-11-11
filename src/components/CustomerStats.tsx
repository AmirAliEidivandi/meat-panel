import ReactECharts from 'echarts-for-react';
import {
	AlertTriangle,
	BarChart3,
	Loader2,
	RefreshCw,
	TrendingDown,
	Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { statsService } from '../services/api';
import { formatCurrency, formatDate } from '../lib/utils';
import type {
	ActualCustomerDebtReportStats,
	CustomersWithoutPurchaseReportStats,
	InactiveCustomersReportStats,
} from '../types';

export default function CustomerStats() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [statsData, setStatsData] = useState<{
		customerDebt?: ActualCustomerDebtReportStats;
		inactiveCustomers?: InactiveCustomersReportStats;
		customersWithoutPurchase?: CustomersWithoutPurchaseReportStats;
	}>({});

	useEffect(() => {
		fetchCustomerStats();
	}, []);

	const fetchCustomerStats = async () => {
		try {
			setLoading(true);
			setError('');

			const [customerDebt, inactiveCustomers, customersWithoutPurchase] =
				await Promise.all([
					statsService.getActualCustomerDebtReport(),
					statsService.getInactiveCustomersReport(),
					statsService.getCustomersWithoutPurchaseReport(),
				]);

			setStatsData({
				customerDebt,
				inactiveCustomers,
				customersWithoutPurchase,
			});
		} catch (err: any) {
			console.error('Error fetching customer stats:', err);
			setError(
				err.response?.data?.message || 'خطا در بارگذاری آمار مشتریان',
			);
		} finally {
			setLoading(false);
		}
	};

	const formatNumber = (num: number) => {
		return new Intl.NumberFormat('fa-IR').format(num);
	};

	const getCustomerCategoryText = (category: string) => {
		const categoryMap: { [key: string]: string } = {
			RESTAURANT: 'رستوران',
			HOTEL: 'هتل',
			CHAIN_STORE: 'فروشگاه زنجیره‌ای',
			GOVERNMENTAL: 'دولتی',
			FAST_FOOD: 'فست فود',
			CHARITY: 'خیریه',
			BUTCHER: 'قصابی',
			WHOLESALER: 'عمده‌فروش',
			FELLOW: 'همکار',
			CATERING: 'کترینگ',
			KEBAB: 'کبابی',
			DISTRIBUTOR: 'پخش‌کننده',
			HOSPITAL: 'بیمارستان',
			FACTORY: 'کارخانه',
			OTHER: 'سایر',
		};
		return categoryMap[category as keyof typeof categoryMap] || category;
	};

	const getRiskLevelText = (risk: string) => {
		const riskMap: { [key: string]: string } = {
			high: 'بالا',
			medium: 'متوسط',
			low: 'پایین',
		};
		return riskMap[risk.toLowerCase()] || risk;
	};

	const getRiskLevelColor = (risk: string) => {
		const colorMap: { [key: string]: string } = {
			high: 'bg-red-100 text-red-800',
			medium: 'bg-yellow-100 text-yellow-800',
			low: 'bg-green-100 text-green-800',
		};
		return colorMap[risk.toLowerCase()] || 'bg-gray-100 text-gray-800';
	};

	// Customer Debt Chart
	const customerDebtChart = {
		title: {
			text: 'بدهی ۱۰ مشتری برتر',
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
			formatter: (params: any) => {
				const param = params[0];
				return `${param.name}<br/>${param.seriesName}: ${formatCurrency(
					param.value,
				)}`;
			},
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '20%',
			top: '25%',
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			data:
				statsData.customerDebt?.report
					.sort((a, b) => b.actual_debt - a.actual_debt)
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
				formatter: (value: number) => {
					return formatCurrency(value);
				},
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
						.sort((a, b) => b.actual_debt - a.actual_debt)
						.slice(0, 10)
						.map(customer => customer.actual_debt) || [],
				itemStyle: {
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						colorStops: [
							{ offset: 0, color: '#f59e0b' },
							{ offset: 1, color: '#d97706' },
						],
					},
					borderRadius: [4, 4, 0, 0],
				},
				barWidth: '60%',
			},
		],
	};

	// Risk Breakdown Chart
	const riskBreakdownChart = {
		title: {
			text: 'توزیع ریسک مشتریان غیرفعال',
			textStyle: {
				fontSize: 16,
				fontWeight: 'bold',
				color: '#374151',
				fontFamily: 'Vazir, Tahoma, sans-serif',
			},
			left: 'center',
			top: 10,
		},
		tooltip: {
			trigger: 'item',
			formatter: '{b}: {c} ({d}%)',
			textStyle: {
				fontFamily: 'Vazir, Tahoma, sans-serif',
			},
		},
		legend: {
			orient: 'vertical',
			right: 10,
			top: 'center',
			textStyle: {
				fontFamily: 'Vazir, Tahoma, sans-serif',
			},
		},
		series: [
			{
				name: 'ریسک',
				type: 'pie',
				radius: ['40%', '70%'],
				avoidLabelOverlap: false,
				itemStyle: {
					borderRadius: 8,
					borderColor: '#fff',
					borderWidth: 2,
				},
				label: {
					show: true,
					formatter: '{b}: {c}',
					fontFamily: 'Vazir, Tahoma, sans-serif',
				},
				emphasis: {
					label: {
						show: true,
						fontSize: 14,
						fontWeight: 'bold',
					},
				},
				data: statsData.inactiveCustomers?.summary.risk_breakdown
					? [
							{
								value:
									statsData.inactiveCustomers.summary.risk_breakdown.high,
								name: 'ریسک بالا',
								itemStyle: { color: '#ef4444' },
							},
							{
								value:
									statsData.inactiveCustomers.summary.risk_breakdown.medium,
								name: 'ریسک متوسط',
								itemStyle: { color: '#f59e0b' },
							},
							{
								value:
									statsData.inactiveCustomers.summary.risk_breakdown.low,
								name: 'ریسک پایین',
								itemStyle: { color: '#10b981' },
							},
					  ]
					: [],
			},
		],
	};

	return (
		<div className='space-y-6 fade-in font-vazir'>
			{/* Header */}
			<div className='bg-white rounded-xl border-2 border-gray-200 p-6'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<div className='w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg'>
							<BarChart3 className='w-7 h-7 text-white' />
						</div>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>
								آمار مشتریان
							</h1>
							<p className='text-sm text-gray-600 mt-1'>
								گزارشات و آمار جامع مشتریان
							</p>
						</div>
					</div>
					<button
						onClick={fetchCustomerStats}
						disabled={loading}
						className='px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors flex items-center space-x-reverse space-x-2 disabled:opacity-50'
					>
						<RefreshCw
							className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
						/>
						<span className='text-sm font-semibold'>بروزرسانی</span>
					</button>
				</div>
			</div>

			{/* Error Display */}
			{error && (
				<div className='bg-red-50 border-2 border-red-200 rounded-xl p-4'>
					<div className='flex items-center space-x-reverse space-x-2'>
						<AlertTriangle className='w-5 h-5 text-red-600' />
						<p className='text-red-800 font-semibold'>{error}</p>
					</div>
				</div>
			)}

			{/* Loading State */}
			{loading && (
				<div className='flex items-center justify-center py-20'>
					<Loader2 className='w-8 h-8 text-emerald-600 animate-spin' />
					<span className='mr-3 text-gray-600 font-semibold'>
						در حال بارگذاری...
					</span>
				</div>
			)}

			{/* Summary Cards */}
			{!loading && (
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
					{/* Customer Debt */}
					<div className='bg-white rounded-xl border-2 border-orange-200 shadow-sm p-6 hover:shadow-md transition-all'>
						<div className='flex items-center justify-between mb-4'>
							<div className='w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg'>
								<Users className='w-6 h-6 text-white' />
							</div>
							<TrendingDown className='w-5 h-5 text-red-600' />
						</div>
						<h3 className='text-sm font-semibold text-gray-600 mb-2'>
							کل بدهی مشتریان
						</h3>
						<p className='text-2xl font-bold text-gray-900 mb-4'>
							{formatCurrency(
								statsData.customerDebt?.totals.total_actual_debt || 0,
							)}
						</p>
						<div className='space-y-2 pt-4 border-t border-gray-200'>
							<div className='flex justify-between text-xs'>
								<span className='text-gray-600'>تعداد مشتریان:</span>
								<span className='font-semibold text-gray-900'>
									{formatNumber(statsData.customerDebt?.total_customers || 0)}
								</span>
							</div>
							<div className='flex justify-between text-xs'>
								<span className='text-gray-600'>چک‌های در انتظار:</span>
								<span className='font-semibold text-gray-900'>
									{formatNumber(
										statsData.customerDebt?.totals.total_pending_cheques || 0,
									)}
								</span>
							</div>
							<div className='flex justify-between text-xs'>
								<span className='text-gray-600'>بدهی حسابداری:</span>
								<span className='font-semibold text-gray-900'>
									{formatCurrency(
										statsData.customerDebt?.totals.total_accounting_debt || 0,
									)}
								</span>
							</div>
						</div>
					</div>

					{/* Inactive Customers */}
					<div className='bg-white rounded-xl border-2 border-red-200 shadow-sm p-6 hover:shadow-md transition-all'>
						<div className='flex items-center justify-between mb-4'>
							<div className='w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg'>
								<Users className='w-6 h-6 text-white' />
							</div>
							<TrendingDown className='w-5 h-5 text-red-600' />
						</div>
						<h3 className='text-sm font-semibold text-gray-600 mb-2'>
							مشتریان غیرفعال
						</h3>
						<p className='text-2xl font-bold text-gray-900 mb-4'>
							{formatNumber(
								statsData.inactiveCustomers?.summary
									.total_inactive_customers || 0,
							)}
						</p>
						<div className='space-y-2 pt-4 border-t border-gray-200'>
							<div className='flex justify-between text-xs'>
								<span className='text-gray-600'>میانگین روزهای غیرفعالی:</span>
								<span className='font-semibold text-gray-900'>
									{formatNumber(
										statsData.inactiveCustomers?.summary.avg_days_inactive ||
											0,
									)}
								</span>
							</div>
							<div className='flex justify-between text-xs'>
								<span className='text-gray-600'>درآمد از دست رفته:</span>
								<span className='font-semibold text-red-600'>
									{formatCurrency(
										statsData.inactiveCustomers?.summary.total_lost_revenue ||
											0,
									)}
								</span>
							</div>
							<div className='flex justify-between text-xs'>
								<span className='text-gray-600'>میانگین ارزش مشتری:</span>
								<span className='font-semibold text-gray-900'>
									{formatCurrency(
										statsData.inactiveCustomers?.summary.avg_customer_value ||
											0,
									)}
								</span>
							</div>
						</div>
					</div>

					{/* Customers Without Purchase */}
					<div className='bg-white rounded-xl border-2 border-yellow-200 shadow-sm p-6 hover:shadow-md transition-all'>
						<div className='flex items-center justify-between mb-4'>
							<div className='w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg'>
								<Users className='w-6 h-6 text-white' />
							</div>
							<TrendingDown className='w-5 h-5 text-yellow-600' />
						</div>
						<h3 className='text-sm font-semibold text-gray-600 mb-2'>
							مشتریان بدون خرید
						</h3>
						<p className='text-2xl font-bold text-gray-900 mb-4'>
							{formatNumber(
								statsData.customersWithoutPurchase?.summary
									.total_customers_without_purchase || 0,
							)}
						</p>
						<div className='space-y-2 pt-4 border-t border-gray-200'>
							<div className='flex justify-between text-xs'>
								<span className='text-gray-600'>هرگز تماس نشده:</span>
								<span className='font-semibold text-gray-900'>
									{formatNumber(
										statsData.customersWithoutPurchase?.summary
											.never_contacted || 0,
									)}
								</span>
							</div>
							<div className='flex justify-between text-xs'>
								<span className='text-gray-600'>تماس شده بدون خرید:</span>
								<span className='font-semibold text-gray-900'>
									{formatNumber(
										statsData.customersWithoutPurchase?.summary
											.contacted_no_purchase || 0,
									)}
								</span>
							</div>
							<div className='flex justify-between text-xs'>
								<span className='text-gray-600'>میانگین روزهای ثبت:</span>
								<span className='font-semibold text-gray-900'>
									{formatNumber(
										statsData.customersWithoutPurchase?.summary
											.avg_days_since_registration || 0,
									)}
								</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Charts */}
			{!loading && (
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
					{/* Customer Debt Chart */}
					<div className='bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6'>
						<ReactECharts
							option={customerDebtChart}
							style={{ height: '400px' }}
							opts={{ renderer: 'svg' }}
						/>
					</div>

					{/* Risk Breakdown Chart */}
					{statsData.inactiveCustomers?.summary.risk_breakdown && (
						<div className='bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6'>
							<ReactECharts
								option={riskBreakdownChart}
								style={{ height: '400px' }}
								opts={{ renderer: 'svg' }}
							/>
						</div>
					)}
				</div>
			)}

			{/* Top Customers by Debt Table */}
			{!loading && statsData.customerDebt && (
				<div className='bg-white rounded-xl border-2 border-gray-200 overflow-hidden'>
					<div className='p-6 border-b border-gray-200'>
						<h3 className='text-lg font-bold text-gray-900'>
							بیشترین بدهی مشتریان
						</h3>
					</div>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className='bg-gray-50 border-b border-gray-200'>
								<tr>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										رتبه
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										مشتری
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										کد
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										بدهی واقعی
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										بدهی حسابداری
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										چک‌های در انتظار
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-200'>
								{statsData.customerDebt.report
									.sort((a, b) => b.actual_debt - a.actual_debt)
									.slice(0, 15)
									.map((customer, index) => (
										<tr
											key={customer.customer_id}
											className='hover:bg-gray-50 transition-colors'
										>
											<td className='px-4 py-4'>
												<span className='inline-block w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center text-white text-sm font-bold'>
													{index + 1}
												</span>
											</td>
											<td className='px-4 py-4 text-sm font-semibold text-gray-900'>
												{customer.customer_title}
											</td>
											<td className='px-4 py-4 text-sm text-gray-700'>
												{customer.customer_code}
											</td>
											<td className='px-4 py-4 text-sm font-bold text-orange-600'>
												{formatCurrency(customer.actual_debt)}
											</td>
											<td className='px-4 py-4 text-sm font-semibold text-blue-600'>
												{formatCurrency(customer.accounting_debt)}
											</td>
											<td className='px-4 py-4 text-sm text-gray-700'>
												{customer.pending_cheques_count > 0 ? (
													<span className='inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold'>
														{customer.pending_cheques_count} چک -{' '}
														{formatCurrency(customer.pending_cheques_total)}
													</span>
												) : (
													<span className='text-gray-400'>-</span>
												)}
											</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Inactive Customers Table */}
			{!loading && statsData.inactiveCustomers && (
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
					{/* Inactive Customers List */}
					<div className='bg-white rounded-xl border-2 border-gray-200 overflow-hidden'>
						<div className='p-6 border-b border-gray-200'>
							<h3 className='text-lg font-bold text-gray-900'>
								مشتریان غیرفعال
							</h3>
						</div>
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead className='bg-gray-50 border-b border-gray-200'>
									<tr>
										<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
											مشتری
										</th>
										<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
											روزهای غیرفعال
										</th>
										<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
											ریسک
										</th>
										<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
											کل خرید
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-gray-200'>
									{statsData.inactiveCustomers.report
										.sort(
											(a, b) =>
												b.days_since_last_purchase -
												a.days_since_last_purchase,
										)
										.slice(0, 10)
										.map(customer => (
											<tr
												key={customer.customer_id}
												className='hover:bg-gray-50 transition-colors'
											>
												<td className='px-4 py-4'>
													<div>
														<p className='text-sm font-semibold text-gray-900'>
															{customer.customer_title}
														</p>
														<p className='text-xs text-gray-500'>
															کد: {customer.customer_code}
														</p>
													</div>
												</td>
												<td className='px-4 py-4 text-sm text-gray-700'>
													{formatNumber(customer.days_since_last_purchase)} روز
												</td>
												<td className='px-4 py-4'>
													<span
														className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRiskLevelColor(
															customer.risk_level,
														)}`}
													>
														{getRiskLevelText(customer.risk_level)}
													</span>
												</td>
												<td className='px-4 py-4 text-sm font-semibold text-red-600'>
													{formatCurrency(customer.total_spent)}
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Top Valuable Inactive Customers */}
					<div className='bg-white rounded-xl border-2 border-gray-200 overflow-hidden'>
						<div className='p-6 border-b border-gray-200'>
							<h3 className='text-lg font-bold text-gray-900'>
								مشتریان باارزش غیرفعال
							</h3>
						</div>
						<div className='p-6 space-y-4'>
							{statsData.inactiveCustomers.summary.top_5_valuable_customers.map(
								(customer, index) => (
									<div
										key={index}
										className='p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200'
									>
										<div className='flex items-center justify-between'>
											<div className='flex items-center space-x-reverse space-x-3'>
												<span className='w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center text-white text-sm font-bold'>
													{index + 1}
												</span>
												<div>
													<p className='text-sm font-semibold text-gray-900'>
														{customer.customer_title}
													</p>
													<p className='text-xs text-gray-500'>
														{customer.days_inactive} روز غیرفعال
													</p>
												</div>
											</div>
											<p className='text-sm font-bold text-red-600'>
												{formatCurrency(customer.total_spent)}
											</p>
										</div>
									</div>
								),
							)}
						</div>
					</div>
				</div>
			)}

			{/* Customers Without Purchase */}
			{!loading && statsData.customersWithoutPurchase && (
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
					{/* Customers Without Purchase List */}
					<div className='lg:col-span-2 bg-white rounded-xl border-2 border-gray-200 overflow-hidden'>
						<div className='p-6 border-b border-gray-200'>
							<h3 className='text-lg font-bold text-gray-900'>
								مشتریان بدون خرید
							</h3>
						</div>
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead className='bg-gray-50 border-b border-gray-200'>
									<tr>
										<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
											مشتری
										</th>
										<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
											دسته‌بندی
										</th>
										<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
											روزهای ثبت
										</th>
										<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
											تعداد تماس
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-gray-200'>
									{statsData.customersWithoutPurchase.report
										.slice(0, 15)
										.map(customer => (
											<tr
												key={customer.customer_id}
												className='hover:bg-gray-50 transition-colors'
											>
												<td className='px-4 py-4'>
													<div>
														<p className='text-sm font-semibold text-gray-900'>
															{customer.customer_title}
														</p>
														<p className='text-xs text-gray-500'>
															کد: {customer.customer_code}
														</p>
													</div>
												</td>
												<td className='px-4 py-4 text-sm text-gray-700'>
													{getCustomerCategoryText(customer.customer_category)}
												</td>
												<td className='px-4 py-4 text-sm text-gray-700'>
													{formatNumber(customer.days_since_registration)} روز
												</td>
												<td className='px-4 py-4 text-sm text-gray-700'>
													{customer.total_contacts > 0 ? (
														<span className='inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold'>
															{customer.total_contacts} تماس
														</span>
													) : (
														<span className='text-gray-400'>بدون تماس</span>
													)}
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Additional Info */}
					<div className='space-y-6'>
						{/* Top Reasons */}
						{statsData.customersWithoutPurchase.summary
							.top_5_not_purchased_reasons &&
							statsData.customersWithoutPurchase.summary
								.top_5_not_purchased_reasons.length > 0 && (
								<div className='bg-white rounded-xl border-2 border-gray-200 overflow-hidden'>
									<div className='p-6 border-b border-gray-200'>
										<h3 className='text-lg font-bold text-gray-900'>
											دلایل عدم خرید
										</h3>
									</div>
									<div className='p-6 space-y-3'>
										{statsData.customersWithoutPurchase.summary.top_5_not_purchased_reasons.map(
											(reason, index) => (
												<div
													key={index}
													className='p-3 bg-gray-50 rounded-lg border border-gray-200'
												>
													<div className='flex items-center space-x-reverse space-x-2'>
														<span className='w-6 h-6 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center text-white text-xs font-bold'>
															{index + 1}
														</span>
														<p className='text-sm font-semibold text-gray-900'>
															{reason}
														</p>
													</div>
												</div>
											),
										)}
									</div>
								</div>
							)}

						{/* Oldest Registered */}
						{statsData.customersWithoutPurchase.summary.oldest_registered &&
							statsData.customersWithoutPurchase.summary.oldest_registered
								.length > 0 && (
								<div className='bg-white rounded-xl border-2 border-gray-200 overflow-hidden'>
									<div className='p-6 border-b border-gray-200'>
										<h3 className='text-lg font-bold text-gray-900'>
											قدیمی‌ترین ثبت‌نام‌ها
										</h3>
									</div>
									<div className='p-6 space-y-3'>
										{statsData.customersWithoutPurchase.summary.oldest_registered.map(
											(customer, index) => (
												<div
													key={index}
													className='p-3 bg-gray-50 rounded-lg border border-gray-200'
												>
													<p className='text-sm font-semibold text-gray-900 mb-1'>
														{customer.customer_title}
													</p>
													<div className='flex justify-between text-xs text-gray-600'>
														<span>
															{customer.days_since_registration} روز
														</span>
														<span>{customer.total_contacts} تماس</span>
													</div>
												</div>
											),
										)}
									</div>
								</div>
							)}
					</div>
				</div>
			)}
		</div>
	);
}
