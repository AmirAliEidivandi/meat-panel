import { Loader2, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../lib/utils';
import { customerService, historyService } from '../services/api';
import type {
	CustomerListItem,
	QueryWalletHistoryDto,
	WalletHistory as WalletHistoryType,
} from '../types';
import Pagination from './Pagination';

// Helper functions for Persian labels
const getChangeTypeText = (changeType: string | null): string => {
	const typeMap: Record<string, string> = {
		BALANCE_INCREASE: 'افزایش موجودی',
		BALANCE_DECREASE: 'کاهش موجودی',
		CREDIT_CAP_INCREASE: 'افزایش اعتبار',
		CREDIT_CAP_DECREASE: 'کاهش اعتبار',
		PAYMENT_RECEIVED: 'دریافت پرداخت',
		INVOICE_CREATED: 'ایجاد فاکتور',
		MANUAL_ADJUSTMENT: 'تغییر دستی',
	};
	return typeMap[changeType || ''] || 'تغییر نامشخص';
};

const getChangeTypeColor = (changeType: string | null): string => {
	const colorMap: Record<string, string> = {
		BALANCE_INCREASE: 'bg-green-100 text-green-800',
		BALANCE_DECREASE: 'bg-red-100 text-red-800',
		CREDIT_CAP_INCREASE: 'bg-blue-100 text-blue-800',
		CREDIT_CAP_DECREASE: 'bg-orange-100 text-orange-800',
		PAYMENT_RECEIVED: 'bg-emerald-100 text-emerald-800',
		INVOICE_CREATED: 'bg-purple-100 text-purple-800',
		MANUAL_ADJUSTMENT: 'bg-yellow-100 text-yellow-800',
	};
	return colorMap[changeType || ''] || 'bg-gray-100 text-gray-800';
};

export default function WalletHistory() {
	const navigate = useNavigate();
	const [histories, setHistories] = useState<WalletHistoryType[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [totalCount, setTotalCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(20);
	const [changeTypeFilter, setChangeTypeFilter] = useState('');
	const [customerFilter, setCustomerFilter] = useState('');
	const [bySystemFilter, setBySystemFilter] = useState('');
	const [customers, setCustomers] = useState<CustomerListItem[]>([]);

	useEffect(() => {
		fetchHistories();
		fetchCustomers();
	}, [currentPage]);

	useEffect(() => {
		// Reset to page 1 when filters change
		setCurrentPage(1);
		fetchHistories();
	}, [changeTypeFilter, customerFilter, bySystemFilter]);

	const fetchHistories = async () => {
		try {
			setLoading(true);
			setError('');
			const query: QueryWalletHistoryDto = {
				page: currentPage,
				'page-size': pageSize,
			};

			if (changeTypeFilter) {
				query.change_type = changeTypeFilter;
			}

			if (customerFilter) {
				query.customer_id = customerFilter;
			}

			if (bySystemFilter !== '') {
				query.by_system = bySystemFilter === 'true';
			}

			const response = await historyService.getWalletHistory(query);
			setHistories(response.data || []);
			setTotalCount(response.count || 0);
		} catch (err: any) {
			console.error('Error fetching wallet history:', err);
			setError(
				err.response?.data?.message || 'خطا در دریافت تاریخچه کیف پول',
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
		setCurrentPage(page);
	};

	const getActiveFiltersCount = (): number => {
		let count = 0;
		if (changeTypeFilter) count++;
		if (customerFilter) count++;
		if (bySystemFilter !== '') count++;
		return count;
	};

	return (
		<div className='space-y-6 fade-in font-vazir'>
			{/* Header */}
			<div className='bg-white rounded-xl border-2 border-gray-200 p-6'>
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg'>
							<Wallet className='w-7 h-7 text-white' />
						</div>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>
								تاریخچه کیف پول
							</h1>
							<p className='text-sm text-gray-600 mt-1'>
								{totalCount} رکورد ثبت شده
								{getActiveFiltersCount() > 0 && ' (فیلتر شده)'}
							</p>
						</div>
					</div>
				</div>

				{/* Filters */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							نوع تغییر
						</label>
						<select
							value={changeTypeFilter}
							onChange={e => setChangeTypeFilter(e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
						>
							<option value=''>همه</option>
							<option value='BALANCE_INCREASE'>افزایش موجودی</option>
							<option value='BALANCE_DECREASE'>کاهش موجودی</option>
							<option value='CREDIT_CAP_INCREASE'>افزایش اعتبار</option>
							<option value='CREDIT_CAP_DECREASE'>کاهش اعتبار</option>
							<option value='PAYMENT_RECEIVED'>دریافت پرداخت</option>
							<option value='INVOICE_CREATED'>ایجاد فاکتور</option>
							<option value='MANUAL_ADJUSTMENT'>تغییر دستی</option>
						</select>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							مشتری
						</label>
						<select
							value={customerFilter}
							onChange={e => setCustomerFilter(e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
							نوع عملیات
						</label>
						<select
							value={bySystemFilter}
							onChange={e => setBySystemFilter(e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
								setChangeTypeFilter('');
								setCustomerFilter('');
								setBySystemFilter('');
								setCurrentPage(1);
							}}
							className='text-sm text-blue-600 hover:text-blue-700 font-semibold'
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
					<Loader2 className='w-8 h-8 text-blue-600 animate-spin' />
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
										مشتری
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										موجودی قبل
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										تغییر
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										موجودی بعد
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										نوع
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										تاریخ ایجاد
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
											navigate(`/manage/wallet-history/${history.id}`)
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
										<td className='px-4 py-4 text-sm text-gray-700'>
											{history.wallet?.customer?.title || '-'}
										</td>
										<td className='px-4 py-4 text-sm font-semibold text-gray-700'>
											{formatCurrency(history.balance_before)}
										</td>
										<td className='px-4 py-4'>
											<span
												className={`text-sm font-bold ${
													history.balance_diff && history.balance_diff > 0
														? 'text-green-600'
														: history.balance_diff && history.balance_diff < 0
															? 'text-red-600'
															: 'text-gray-600'
												}`}
											>
												{history.balance_diff
													? `${history.balance_diff > 0 ? '+' : ''}${formatCurrency(history.balance_diff)}`
													: '-'}
											</span>
										</td>
										<td className='px-4 py-4 text-sm font-semibold text-gray-700'>
											{formatCurrency(history.balance_after)}
										</td>
										<td className='px-4 py-4'>
											<span
												className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
													history.by_system
														? 'bg-blue-100 text-blue-800'
														: 'bg-yellow-100 text-yellow-800'
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
													navigate(`/manage/wallet-history/${history.id}`);
												}}
												className='px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold'
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
					<Wallet className='w-16 h-16 text-gray-300 mx-auto mb-4' />
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
					itemsPerPage={pageSize}
					totalPages={Math.ceil(totalCount / pageSize)}
					onPageChange={handlePageChange}
				/>
			)}
		</div>
	);
}
