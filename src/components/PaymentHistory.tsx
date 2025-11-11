import { CreditCard, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../lib/utils';
import { customerService, historyService } from '../services/api';
import type {
	CustomerListItem,
	PaymentHistory as PaymentHistoryType,
	QueryPaymentHistoryDto,
} from '../types';
import Pagination from './Pagination';

// Helper functions for Persian labels
const getChangeTypeText = (changeType: string | null): string => {
	const types: Record<string, string> = {
		CREATED: 'ایجاد پرداخت',
		AMOUNT_CHANGED: 'تغییر مبلغ',
		METHOD_CHANGED: 'تغییر روش پرداخت',
		DATE_CHANGED: 'تغییر تاریخ',
		CHEQUE_DATE_CHANGED: 'تغییر تاریخ چک',
		DELETED: 'حذف پرداخت',
		RESTORED: 'بازیابی پرداخت',
		INVOICE_LINKED: 'اتصال به فاکتور',
		INVOICE_UNLINKED: 'قطع اتصال از فاکتور',
	};
	return types[changeType || ''] || 'تغییر نامشخص';
};

const getChangeTypeColor = (changeType: string | null): string => {
	const colorMap: Record<string, string> = {
		CREATED: 'bg-green-100 text-green-800',
		AMOUNT_CHANGED: 'bg-yellow-100 text-yellow-800',
		METHOD_CHANGED: 'bg-blue-100 text-blue-800',
		DATE_CHANGED: 'bg-cyan-100 text-cyan-800',
		CHEQUE_DATE_CHANGED: 'bg-indigo-100 text-indigo-800',
		DELETED: 'bg-red-100 text-red-800',
		RESTORED: 'bg-green-100 text-green-800',
		INVOICE_LINKED: 'bg-purple-100 text-purple-800',
		INVOICE_UNLINKED: 'bg-orange-100 text-orange-800',
	};
	return colorMap[changeType || ''] || 'bg-gray-100 text-gray-800';
};

const getPaymentMethodText = (method: string | null): string => {
	const methods: Record<string, string> = {
		CASH: 'نقدی',
		DEPOSIT_TO_ACCOUNT: 'واریز به حساب',
		CHEQUE: 'چک',
		CREDIT: 'اعتبار',
		WALLET: 'کیف پول',
		ONLINE: 'آنلاین',
	};
	return methods[method || ''] || method || '-';
};

const getPaymentMethodColor = (method: string | null): string => {
	const colorMap: Record<string, string> = {
		CASH: 'bg-green-100 text-green-800',
		DEPOSIT_TO_ACCOUNT: 'bg-blue-100 text-blue-800',
		CHEQUE: 'bg-yellow-100 text-yellow-800',
		CREDIT: 'bg-purple-100 text-purple-800',
		WALLET: 'bg-indigo-100 text-indigo-800',
		ONLINE: 'bg-cyan-100 text-cyan-800',
	};
	return colorMap[method || ''] || 'bg-gray-100 text-gray-800';
};

export default function PaymentHistory() {
	const navigate = useNavigate();
	const [histories, setHistories] = useState<PaymentHistoryType[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [filters, setFilters] = useState<QueryPaymentHistoryDto>({
		page: 1,
		'page-size': 20,
	});
	const [customers, setCustomers] = useState<CustomerListItem[]>([]);

	useEffect(() => {
		fetchHistories();
		fetchCustomers();
	}, [filters]);

	const fetchHistories = async () => {
		try {
			setLoading(true);
			setError('');
			const query: QueryPaymentHistoryDto = {
				page: filters.page || currentPage,
				'page-size': filters['page-size'] || 20,
				...filters,
			};
			const response = await historyService.getPaymentHistory(query);
			setHistories(response.data || []);
			setTotalCount(response.count || 0);
		} catch (err: any) {
			console.error('Error fetching payment history:', err);
			setError(
				err.response?.data?.message || 'خطا در دریافت تاریخچه پرداخت‌ها',
			);
		} finally {
			setLoading(false);
		}
	};

	const fetchCustomers = async () => {
		try {
			const response = await customerService.getAllCustomers();
			setCustomers(response.data || []);
		} catch (err) {
			console.error('Error fetching customers:', err);
		}
	};

	const handlePageChange = (page: number) => {
		setFilters(prev => ({ ...prev, page }));
		setCurrentPage(page);
	};

	const handleFilterChange = (
		key: keyof QueryPaymentHistoryDto,
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
		if (filters.payment_id) count++;
		if (filters.employee_id) count++;
		if (filters.customer_id) count++;
		if (filters.change_type) count++;
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
						<div className='w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg'>
							<CreditCard className='w-7 h-7 text-white' />
						</div>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>
								تاریخچه پرداخت‌ها
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
							کد پرداخت
						</label>
						<input
							type='text'
							value={filters.payment_id || ''}
							onChange={e => handleFilterChange('payment_id', e.target.value)}
							placeholder='جستجو...'
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							مشتری
						</label>
						<select
							value={filters.customer_id || ''}
							onChange={e => handleFilterChange('customer_id', e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
						>
							<option value=''>همه</option>
							{customers.map(customer => (
								<option key={customer.id} value={customer.id}>
									{customer.title} (کد: {customer.code})
								</option>
							))}
						</select>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							نوع تغییر
						</label>
						<select
							value={filters.change_type || ''}
							onChange={e => handleFilterChange('change_type', e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
						>
							<option value=''>همه</option>
							<option value='CREATED'>ایجاد پرداخت</option>
							<option value='AMOUNT_CHANGED'>تغییر مبلغ</option>
							<option value='METHOD_CHANGED'>تغییر روش پرداخت</option>
							<option value='DATE_CHANGED'>تغییر تاریخ</option>
							<option value='CHEQUE_DATE_CHANGED'>تغییر تاریخ چک</option>
							<option value='DELETED'>حذف پرداخت</option>
							<option value='RESTORED'>بازیابی پرداخت</option>
							<option value='INVOICE_LINKED'>اتصال به فاکتور</option>
							<option value='INVOICE_UNLINKED'>قطع اتصال از فاکتور</option>
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
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
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
							className='text-sm text-emerald-600 hover:text-emerald-700 font-semibold'
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
					<Loader2 className='w-8 h-8 text-emerald-600 animate-spin' />
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
										کد پرداخت
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
										روش پرداخت
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
											navigate(`/manage/payment-history/${history.id}`)
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
											{history.payment_id
												? `#${(history as any).new_payment?.code || (history as any).payment?.code || history.payment_id}`
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
											{history.method_after ? (
												<span
													className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPaymentMethodColor(
														history.method_after,
													)}`}
												>
													{getPaymentMethodText(history.method_after)}
												</span>
											) : (
												<span className='text-gray-400'>-</span>
											)}
										</td>
										<td className='px-4 py-4'>
											<span
												className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
													history.by_system
														? 'bg-emerald-100 text-emerald-800'
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
													navigate(`/manage/payment-history/${history.id}`);
												}}
												className='px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-semibold'
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
					<CreditCard className='w-16 h-16 text-gray-300 mx-auto mb-4' />
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
