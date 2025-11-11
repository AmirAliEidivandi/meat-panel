import { Calendar, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import { historyService } from '../services/api';
import type {
	OrderHistory as OrderHistoryType,
	QueryOrderHistoryDto,
} from '../types';
import Pagination from './Pagination';

// Helper functions for Persian labels
const getChangeTypeText = (changeType: string | null): string => {
	const types: Record<string, string> = {
		CREATED: 'ایجاد سفارش',
		STEP_CHANGED: 'تغییر مرحله',
		PAYMENT_STATUS_CHANGED: 'تغییر وضعیت پرداخت',
		FULFILLED_STATUS_CHANGED: 'تغییر وضعیت تحویل',
		ARCHIVED_STATUS_CHANGED: 'تغییر وضعیت آرشیو',
		DELIVERY_DATE_CHANGED: 'تغییر تاریخ تحویل',
		DELIVERY_METHOD_CHANGED: 'تغییر روش تحویل',
		SELLER_CHANGED: 'تغییر فروشنده',
		VISITOR_CHANGED: 'تغییر بازدیدکننده',
		WAREHOUSE_CHANGED: 'تغییر انبار',
		PRODUCTS_CHANGED: 'تغییر محصولات',
		CUSTOMER_CHANGED: 'تغییر مشتری',
		DELETED: 'حذف سفارش',
		RESTORED: 'بازیابی سفارش',
	};
	return types[changeType || ''] || 'تغییر نامشخص';
};

const getChangeTypeColor = (changeType: string | null): string => {
	const colorMap: Record<string, string> = {
		CREATED: 'bg-green-100 text-green-800',
		STEP_CHANGED: 'bg-blue-100 text-blue-800',
		PAYMENT_STATUS_CHANGED: 'bg-yellow-100 text-yellow-800',
		FULFILLED_STATUS_CHANGED: 'bg-purple-100 text-purple-800',
		ARCHIVED_STATUS_CHANGED: 'bg-gray-100 text-gray-800',
		DELIVERY_DATE_CHANGED: 'bg-cyan-100 text-cyan-800',
		DELIVERY_METHOD_CHANGED: 'bg-indigo-100 text-indigo-800',
		SELLER_CHANGED: 'bg-orange-100 text-orange-800',
		VISITOR_CHANGED: 'bg-pink-100 text-pink-800',
		WAREHOUSE_CHANGED: 'bg-teal-100 text-teal-800',
		PRODUCTS_CHANGED: 'bg-amber-100 text-amber-800',
		CUSTOMER_CHANGED: 'bg-red-100 text-red-800',
		DELETED: 'bg-red-100 text-red-800',
		RESTORED: 'bg-green-100 text-green-800',
	};
	return colorMap[changeType || ''] || 'bg-gray-100 text-gray-800';
};

const getStepText = (step: string | null): string => {
	const steps: Record<string, string> = {
		SELLER: 'فروشنده',
		SALES_MANAGER: 'مدیر فروش',
		PROCESSING: 'آماده سازی',
		INVENTORY: 'انبار',
		ACCOUNTING: 'حسابداری',
		CARGO: 'مرسوله',
		PARTIALLY_DELIVERED: 'تحویل جزئی',
		DELIVERED: 'تحویل داده شده',
		PARTIALLY_RETURNED: 'مرجوعی جزئی',
		RETURNED: 'مرجوعی کامل',
	};
	return steps[step || ''] || step || '-';
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

const getDeliveryMethodText = (method: string | null): string => {
	const methods: Record<string, string> = {
		FREE_OUR_TRUCK: 'رایگان با ماشین شرکت',
		FREE_OTHER_SERVICES: 'رایگان با سرویس خارجی',
		PAID: 'ارسال با هزینه مشتری',
		AT_INVENTORY: 'تحویل درب انبار',
		PAID_OUR_TRUCK: 'پولی با ماشین شرکت',
	};
	return methods[method || ''] || method || '-';
};

export default function OrderHistory() {
	const navigate = useNavigate();
	const [histories, setHistories] = useState<OrderHistoryType[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [filters, setFilters] = useState<QueryOrderHistoryDto>({
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
			const query: QueryOrderHistoryDto = {
				page: filters.page || currentPage,
				'page-size': filters['page-size'] || 20,
				...filters,
			};
			const response = await historyService.getOrderHistory(query);
			setHistories(response.data || []);
			setTotalCount(response.count || 0);
		} catch (err: any) {
			console.error('Error fetching order history:', err);
			setError(err.response?.data?.message || 'خطا در دریافت تاریخچه سفارشات');
		} finally {
			setLoading(false);
		}
	};

	const handlePageChange = (page: number) => {
		setFilters(prev => ({ ...prev, page }));
		setCurrentPage(page);
	};

	const handleFilterChange = (key: keyof QueryOrderHistoryDto, value: any) => {
		setFilters(prev => ({
			...prev,
			[key]: value || undefined,
			page: 1,
		}));
		setCurrentPage(1);
	};

	const getActiveFiltersCount = (): number => {
		let count = 0;
		if (filters.order_id) count++;
		if (filters.employee_id) count++;
		if (filters.change_type) count++;
		if (filters.step_after) count++;
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
						<div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg'>
							<Calendar className='w-7 h-7 text-white' />
						</div>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>
								تاریخچه سفارشات
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
							کد سفارش
						</label>
						<input
							type='text'
							value={filters.order_id || ''}
							onChange={e => handleFilterChange('order_id', e.target.value)}
							placeholder='جستجو...'
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							نوع تغییر
						</label>
						<select
							value={filters.change_type || ''}
							onChange={e => handleFilterChange('change_type', e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
						>
							<option value=''>همه</option>
							<option value='CREATED'>ایجاد سفارش</option>
							<option value='STEP_CHANGED'>تغییر مرحله</option>
							<option value='PAYMENT_STATUS_CHANGED'>تغییر وضعیت پرداخت</option>
							<option value='FULFILLED_STATUS_CHANGED'>
								تغییر وضعیت تحویل
							</option>
							<option value='DELIVERY_DATE_CHANGED'>تغییر تاریخ تحویل</option>
							<option value='DELIVERY_METHOD_CHANGED'>تغییر روش تحویل</option>
							<option value='SELLER_CHANGED'>تغییر فروشنده</option>
							<option value='PRODUCTS_CHANGED'>تغییر محصولات</option>
							<option value='CUSTOMER_CHANGED'>تغییر مشتری</option>
							<option value='DELETED'>حذف سفارش</option>
							<option value='RESTORED'>بازیابی سفارش</option>
						</select>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							مرحله
						</label>
						<select
							value={filters.step_after || ''}
							onChange={e => handleFilterChange('step_after', e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
						>
							<option value=''>همه</option>
							<option value='SELLER'>فروشنده</option>
							<option value='SALES_MANAGER'>مدیر فروش</option>
							<option value='PROCESSING'>آماده سازی</option>
							<option value='INVENTORY'>انبار</option>
							<option value='ACCOUNTING'>حسابداری</option>
							<option value='CARGO'>مرسوله</option>
							<option value='PARTIALLY_DELIVERED'>تحویل جزئی</option>
							<option value='DELIVERED'>تحویل داده شده</option>
							<option value='RETURNED'>مرجوعی</option>
							<option value='PARTIALLY_RETURNED'>مرجوعی جزئی</option>
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
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
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
							className='text-sm text-purple-600 hover:text-purple-700 font-semibold'
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
					<Loader2 className='w-8 h-8 text-purple-600 animate-spin' />
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
										کد سفارش
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										مرحله
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										وضعیت پرداخت
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										تاریخ تحویل
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										روش تحویل
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
											navigate(`/manage/order-history/${history.id}`)
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
											{history.new_order?.code ? `#${history.new_order?.code}` : '-'}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{history.step_after
												? getStepText(history.step_after)
												: '-'}
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
										<td className='px-4 py-4 text-sm text-gray-700'>
											{history.delivery_date_after
												? formatDate(history.delivery_date_after)
												: '-'}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{history.delivery_method_after
												? getDeliveryMethodText(history.delivery_method_after)
												: '-'}
										</td>
										<td className='px-4 py-4'>
											<span
												className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
													history.by_system
														? 'bg-purple-100 text-purple-800'
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
													navigate(`/manage/order-history/${history.id}`);
												}}
												className='px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-semibold'
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
					<Calendar className='w-16 h-16 text-gray-300 mx-auto mb-4' />
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
