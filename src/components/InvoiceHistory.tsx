import { Loader2, Receipt } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../lib/utils';
import { historyService } from '../services/api';
import type {
	InvoiceHistory as InvoiceHistoryType,
	QueryInvoiceHistoryDto,
} from '../types';
import Pagination from './Pagination';

// Helper functions for Persian labels
const getChangeTypeText = (changeType: string | null): string => {
	const types: Record<string, string> = {
		CREATED: 'ایجاد فاکتور',
		AMOUNT_CHANGED: 'تغییر مبلغ',
		PAYMENT_STATUS_CHANGED: 'تغییر وضعیت پرداخت',
		DUE_DATE_CHANGED: 'تغییر تاریخ سررسید',
		DATE_CHANGED: 'تغییر تاریخ',
		TYPE_CHANGED: 'تغییر نوع',
		SELLER_CHANGED: 'تغییر فروشنده',
		DRIVER_CHANGED: 'تغییر راننده',
		WAREHOUSE_CHANGED: 'تغییر انبار',
		CARGO_CHANGED: 'تغییر بار',
		PRODUCTS_CHANGED: 'تغییر محصولات',
		DELETED: 'حذف فاکتور',
		RESTORED: 'بازیابی فاکتور',
		WALLET_LINKED: 'اتصال به کیف پول',
		ORDER_LINKED: 'اتصال به سفارش',
		UPDATED: 'بروزرسانی',
	};
	return types[changeType || ''] || 'تغییر نامشخص';
};

const getChangeTypeColor = (changeType: string | null): string => {
	const colorMap: Record<string, string> = {
		CREATED: 'bg-green-100 text-green-800',
		AMOUNT_CHANGED: 'bg-yellow-100 text-yellow-800',
		PAYMENT_STATUS_CHANGED: 'bg-blue-100 text-blue-800',
		DUE_DATE_CHANGED: 'bg-cyan-100 text-cyan-800',
		DATE_CHANGED: 'bg-indigo-100 text-indigo-800',
		TYPE_CHANGED: 'bg-purple-100 text-purple-800',
		SELLER_CHANGED: 'bg-orange-100 text-orange-800',
		DRIVER_CHANGED: 'bg-pink-100 text-pink-800',
		WAREHOUSE_CHANGED: 'bg-teal-100 text-teal-800',
		CARGO_CHANGED: 'bg-amber-100 text-amber-800',
		PRODUCTS_CHANGED: 'bg-emerald-100 text-emerald-800',
		DELETED: 'bg-red-100 text-red-800',
		RESTORED: 'bg-green-100 text-green-800',
		WALLET_LINKED: 'bg-indigo-100 text-indigo-800',
		ORDER_LINKED: 'bg-blue-100 text-blue-800',
		UPDATED: 'bg-gray-100 text-gray-800',
	};
	return colorMap[changeType || ''] || 'bg-gray-100 text-gray-800';
};

const getPaymentStatusText = (status: string | null): string => {
	const statuses: Record<string, string> = {
		NOT_PAID: 'پرداخت نشده',
		PARTIALLY_PAID: 'پرداخت جزئی',
		PAID: 'پرداخت شده',
	};
	return statuses[status || ''] || status || '-';
};

const getPaymentStatusColor = (status: string | null): string => {
	const colorMap: Record<string, string> = {
		NOT_PAID: 'bg-red-100 text-red-800',
		PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
		PAID: 'bg-green-100 text-green-800',
	};
	return colorMap[status || ''] || 'bg-gray-100 text-gray-800';
};

const getInvoiceTypeText = (type: string | null): string => {
	const types: Record<string, string> = {
		PURCHASE: 'خرید',
		RETURN_FROM_PURCHASE: 'بازگشت از خرید',
		SELL: 'فروش',
	};
	return types[type || ''] || type || '-';
};

const getInvoiceTypeColor = (type: string | null): string => {
	const colorMap: Record<string, string> = {
		PURCHASE: 'bg-blue-100 text-blue-800',
		RETURN_FROM_PURCHASE: 'bg-orange-100 text-orange-800',
		SELL: 'bg-green-100 text-green-800',
	};
	return colorMap[type || ''] || 'bg-gray-100 text-gray-800';
};

export default function InvoiceHistory() {
	const navigate = useNavigate();
	const [histories, setHistories] = useState<InvoiceHistoryType[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [filters, setFilters] = useState<QueryInvoiceHistoryDto>({
		page: 1,
		'page-size': 20,
	});

	useEffect(() => {
		fetchHistories();
	}, [filters]);

	const fetchHistories = async () => {
		try {
			setLoading(true);
			setError('');
			const query: QueryInvoiceHistoryDto = {
				page: filters.page || currentPage,
				'page-size': filters['page-size'] || 20,
				...filters,
			};
			const response = await historyService.getInvoiceHistory(query);
			setHistories(response.data || []);
			setTotalCount(response.count || 0);
		} catch (err: any) {
			console.error('Error fetching invoice history:', err);
			setError(
				err.response?.data?.message || 'خطا در دریافت تاریخچه فاکتورها',
			);
		} finally {
			setLoading(false);
		}
	};

	const handlePageChange = (page: number) => {
		setFilters(prev => ({ ...prev, page }));
		setCurrentPage(page);
	};

	const handleFilterChange = (
		key: keyof QueryInvoiceHistoryDto,
		value: any,
	) => {
		setFilters(prev => ({
			...prev,
			[key]: value || undefined,
			page: 1,
		}));
		setCurrentPage(1);
	};

	const getActiveFiltersCount = (): number => {
		let count = 0;
		if (filters.invoice_id) count++;
		if (filters.employee_id) count++;
		if (filters.change_type) count++;
		if (filters.payment_status_after) count++;
		if (filters.type_after) count++;
		if (filters.by_system !== undefined) count++;
		if (filters.deleted_changed === true) count++;
		if (filters.related_payment_id) count++;
		if (filters.related_invoice_id) count++;
		if (filters.created_at_min) count++;
		if (filters.created_at_max) count++;
		return count;
	};

	return (
		<div className='space-y-6 fade-in font-vazir'>
			{/* Header */}
			<div className='bg-white rounded-xl border-2 border-gray-200 p-6'>
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<div className='w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg'>
							<Receipt className='w-7 h-7 text-white' />
						</div>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>
								تاریخچه فاکتورها
							</h1>
							<p className='text-sm text-gray-600 mt-1'>
								{totalCount} تغییر ثبت شده
							</p>
						</div>
					</div>
				</div>

				{/* Filters */}
				<div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							کد فاکتور
						</label>
						<input
							type='text'
							value={filters.invoice_id || ''}
							onChange={e => handleFilterChange('invoice_id', e.target.value)}
							placeholder='جستجو...'
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							نوع تغییر
						</label>
						<select
							value={filters.change_type || ''}
							onChange={e => handleFilterChange('change_type', e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
						>
							<option value=''>همه</option>
							<option value='CREATED'>ایجاد فاکتور</option>
							<option value='AMOUNT_CHANGED'>تغییر مبلغ</option>
							<option value='PAYMENT_STATUS_CHANGED'>تغییر وضعیت پرداخت</option>
							<option value='DUE_DATE_CHANGED'>تغییر تاریخ سررسید</option>
							<option value='DATE_CHANGED'>تغییر تاریخ</option>
							<option value='TYPE_CHANGED'>تغییر نوع</option>
							<option value='SELLER_CHANGED'>تغییر فروشنده</option>
							<option value='PRODUCTS_CHANGED'>تغییر محصولات</option>
							<option value='DELETED'>حذف فاکتور</option>
							<option value='RESTORED'>بازیابی فاکتور</option>
							<option value='WALLET_LINKED'>اتصال به کیف پول</option>
							<option value='ORDER_LINKED'>اتصال به سفارش</option>
						</select>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							وضعیت پرداخت
						</label>
						<select
							value={filters.payment_status_after || ''}
							onChange={e =>
								handleFilterChange('payment_status_after', e.target.value)
							}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
						>
							<option value=''>همه</option>
							<option value='NOT_PAID'>پرداخت نشده</option>
							<option value='PARTIALLY_PAID'>پرداخت جزئی</option>
							<option value='PAID'>پرداخت شده</option>
						</select>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							نوع تغییر
						</label>
						<select
							value={
								filters.by_system === undefined
									? ''
									: filters.by_system
									? 'true'
									: 'false'
							}
							onChange={e => {
								if (e.target.value === '') {
									handleFilterChange('by_system', undefined);
								} else {
									handleFilterChange('by_system', e.target.value === 'true');
								}
							}}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
						>
							<option value=''>همه</option>
							<option value='true'>خودکار</option>
							<option value='false'>دستی</option>
						</select>
					</div>
				</div>

				{getActiveFiltersCount() > 0 && (
					<div className='mt-4 flex items-center justify-between'>
						<span className='text-sm text-gray-600'>
							{getActiveFiltersCount()} فیلتر فعال
						</span>
						<button
							onClick={() => {
								setFilters({ page: 1, 'page-size': 20 });
								setCurrentPage(1);
							}}
							className='text-sm text-orange-600 hover:text-orange-700 font-semibold'
						>
							پاک کردن فیلترها
						</button>
					</div>
				)}
			</div>

			{/* Error Display */}
			{error && (
				<div className='bg-red-50 border-2 border-red-200 rounded-xl p-4'>
					<p className='text-red-800 font-semibold'>{error}</p>
				</div>
			)}

			{/* Loading State */}
			{loading && (
				<div className='flex items-center justify-center py-20'>
					<Loader2 className='w-8 h-8 text-orange-600 animate-spin' />
					<span className='mr-3 text-gray-600 font-semibold'>
						در حال بارگذاری...
					</span>
				</div>
			)}

			{/* History Table */}
			{!loading && histories.length > 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 overflow-hidden'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className='bg-gray-50 border-b border-gray-200'>
								<tr>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										نوع تغییر
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										کد فاکتور
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										مبلغ قبل
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										مبلغ بعد
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										تفاوت
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										وضعیت پرداخت
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										نوع فاکتور
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										نوع
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										تاریخ تغییر
									</th>
									<th className='px-4 py-3 text-center text-sm font-semibold text-gray-700'>
										عملیات
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-200'>
								{histories.map(history => (
									<tr
										key={history.id}
										className='hover:bg-gray-50 transition-colors cursor-pointer'
										onClick={() =>
											navigate(`/manage/invoice-history/${history.id}`)
										}
									>
										<td className='px-4 py-4'>
											<span
												className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getChangeTypeColor(
													history.change_type,
												)}`}
											>
												{getChangeTypeText(history.change_type)}
											</span>
										</td>
										<td className='px-4 py-4 text-sm font-semibold text-gray-900'>
											{history.invoice_id
												? `#${(history as any).new_invoice?.code || (history as any).invoice?.code || history.invoice_id}`
												: '-'}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{history.amount_before !== null
												? formatCurrency(history.amount_before)
												: '-'}
										</td>
										<td className='px-4 py-4 text-sm font-bold text-emerald-600'>
											{history.amount_after !== null
												? formatCurrency(history.amount_after)
												: '-'}
										</td>
										<td className='px-4 py-4 text-sm font-bold'>
											{history.amount_diff !== null ? (
												<span
													className={
														history.amount_diff > 0
															? 'text-green-600'
															: history.amount_diff < 0
															? 'text-red-600'
															: 'text-gray-600'
													}
												>
													{history.amount_diff > 0 ? '+' : ''}
													{formatCurrency(history.amount_diff)}
												</span>
											) : (
												<span className='text-gray-400'>-</span>
											)}
										</td>
										<td className='px-4 py-4'>
											{history.payment_status_after ? (
												<span
													className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(
														history.payment_status_after,
													)}`}
												>
													{getPaymentStatusText(history.payment_status_after)}
												</span>
											) : (
												<span className='text-gray-400'>-</span>
											)}
										</td>
										<td className='px-4 py-4'>
											{history.type_after ? (
												<span
													className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getInvoiceTypeColor(
														history.type_after,
													)}`}
												>
													{getInvoiceTypeText(history.type_after)}
												</span>
											) : (
												<span className='text-gray-400'>-</span>
											)}
										</td>
										<td className='px-4 py-4'>
											<span
												className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
													history.by_system
														? 'bg-orange-100 text-orange-800'
														: 'bg-blue-100 text-blue-800'
												}`}
											>
												{history.by_system ? 'خودکار' : 'دستی'}
											</span>
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{formatDate(history.created_at)}
										</td>
										<td className='px-4 py-4 text-center'>
											<button
												onClick={e => {
													e.stopPropagation();
													navigate(`/manage/invoice-history/${history.id}`);
												}}
												className='px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-semibold'
											>
												مشاهده
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Empty State */}
			{!loading && histories.length === 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 p-12 text-center'>
					<Receipt className='w-16 h-16 text-gray-300 mx-auto mb-4' />
					<p className='text-gray-500 text-lg font-semibold'>
						{getActiveFiltersCount() > 0
							? 'هیچ موردی با فیلترهای انتخابی یافت نشد'
							: 'تاریخچه‌ای یافت نشد'}
					</p>
				</div>
			)}

			{/* Pagination */}
			{!loading && histories.length > 0 && (
				<Pagination
					currentPage={currentPage}
					totalItems={totalCount}
					itemsPerPage={filters['page-size'] || 20}
					totalPages={Math.ceil(totalCount / (filters['page-size'] || 20))}
					onPageChange={handlePageChange}
				/>
			)}
		</div>
	);
}
