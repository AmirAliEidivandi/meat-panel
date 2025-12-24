import { CreditCard, Loader2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate, getBankName } from '../lib/utils';
import { accountantsService, customerService } from '../services/api';
import type { CheckListItem, CustomerListItem, QueryCheckDto } from '../types';
import CreateCheckModal from './CreateCheckModal';
import Pagination from './Pagination';

// Helper functions for Persian labels
const getCheckStatusText = (status: string): string => {
	const statusMap: Record<string, string> = {
		RECEIVED_BY_ACCOUNTING: 'دریافت چک توسط حسابداری',
		DELIVERED_TO_PROCUREMENT: 'تحویل به کارپرداز',
		DELIVERED_TO_BANK: 'تحویل به بانک',
		CLEARED: 'پاس شده',
		RETURNED: 'برگشت خورده',
	};
	return statusMap[status] || status;
};

const getCheckStatusColor = (status: string): string => {
	const colorMap: Record<string, string> = {
		RECEIVED_BY_ACCOUNTING: 'bg-blue-100 text-blue-800',
		DELIVERED_TO_PROCUREMENT: 'bg-yellow-100 text-yellow-800',
		DELIVERED_TO_BANK: 'bg-purple-100 text-purple-800',
		CLEARED: 'bg-green-100 text-green-800',
		RETURNED: 'bg-red-100 text-red-800',
	};
	return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export default function ChecksList() {
	const navigate = useNavigate();
	const [checks, setChecks] = useState<CheckListItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [filters, setFilters] = useState<QueryCheckDto>({
		page: 1,
		'page-size': 20,
	});
	const [customers, setCustomers] = useState<CustomerListItem[]>([]);

	useEffect(() => {
		fetchChecks();
		fetchCustomers();
	}, [filters]);

	const fetchChecks = async () => {
		try {
			setLoading(true);
			setError('');
			const response = await accountantsService.getChecks(filters);
			setChecks(response.data || []);
			setTotalCount(response.count || 0);
		} catch (err: any) {
			console.error('Error fetching checks:', err);
			setError(err.response?.data?.message || 'خطا در دریافت لیست چک‌ها');
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

	const handleFilterChange = (key: keyof QueryCheckDto, value: any) => {
		setFilters(prev => ({
			...prev,
			[key]: value || undefined,
			page: 1,
		}));
		setCurrentPage(1);
	};

	const handleCreateSuccess = () => {
		setShowCreateModal(false);
		fetchChecks();
	};

	const getActiveFiltersCount = (): number => {
		let count = 0;
		if (filters.check_number) count++;
		if (filters.account_number) count++;
		if (filters.issuer_bank) count++;
		if (filters.destination_bank) count++;
		if (filters.customer_id) count++;
		if (filters.check_date_min) count++;
		if (filters.check_date_max) count++;
		if (filters.amount_min) count++;
		if (filters.amount_max) count++;
		return count;
	};

	return (
		<div className='space-y-6 fade-in font-vazir'>
			{/* Header */}
			<div className='bg-white rounded-xl border-2 border-gray-200 p-6'>
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<div className='w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg'>
							<CreditCard className='w-7 h-7 text-white' />
						</div>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>لیست چک‌ها</h1>
							<p className='text-sm text-gray-600 mt-1'>
								{totalCount} چک ثبت شده
							</p>
						</div>
					</div>
					<button
						onClick={() => setShowCreateModal(true)}
						className='px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all font-semibold flex items-center space-x-reverse space-x-2'
					>
						<Plus className='w-5 h-5' />
						<span>ثبت چک جدید</span>
					</button>
				</div>

				{/* Filters */}
				<div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							شماره چک
						</label>
						<input
							type='text'
							value={filters.check_number || ''}
							onChange={e => handleFilterChange('check_number', e.target.value)}
							placeholder='جستجو...'
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							شماره حساب
						</label>
						<input
							type='text'
							value={filters.account_number || ''}
							onChange={e =>
								handleFilterChange('account_number', e.target.value)
							}
							placeholder='جستجو...'
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							بانک صادرکننده
						</label>
						<select
							value={filters.issuer_bank || ''}
							onChange={e => handleFilterChange('issuer_bank', e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
						>
							<option value=''>همه</option>
							<option value='SEPAH'>بانک سپه</option>
							<option value='MELLI'>بانک ملی</option>
							<option value='TEJARAT'>بانک تجارت</option>
							<option value='MELLAT'>بانک ملت</option>
							<option value='SADERAT'>بانک صادرات</option>
							<option value='PARSIAN'>بانک پارسیان</option>
							<option value='PASARGAD'>بانک پاسارگاد</option>
							<option value='SAMAN'>بانک سامان</option>
							<option value='OTHER'>سایر</option>
						</select>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							مشتری
						</label>
						<select
							value={filters.customer_id || ''}
							onChange={e => handleFilterChange('customer_id', e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
						>
							<option value=''>همه</option>
							{customers.map(customer => (
								<option key={customer.id} value={customer.id}>
									{customer.title} (کد: {customer.code})
								</option>
							))}
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
							className='text-sm text-teal-600 hover:text-teal-700 font-semibold'
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
					<Loader2 className='w-8 h-8 text-teal-600 animate-spin' />
					<span className='mr-3 text-gray-600 font-semibold'>
						در حال بارگذاری...
					</span>
				</div>
			)}

			{/* Checks Table */}
			{!loading && checks.length > 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 overflow-hidden'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className='bg-gray-50 border-b border-gray-200'>
								<tr>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										شماره چک
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										شماره حساب
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										بانک صادرکننده
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										بانک مقصد
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										مبلغ
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										تاریخ چک
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										وضعیت
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										مشتری
									</th>
									<th className='px-4 py-3 text-center text-sm font-semibold text-gray-700'>
										عملیات
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-200'>
								{checks.map(check => (
									<tr
										key={check.id}
										className='hover:bg-gray-50 transition-colors cursor-pointer'
										onClick={() => navigate(`/manage/checks/${check.id}`)}
									>
										<td className='px-4 py-4 text-sm font-semibold text-gray-900'>
											{check.check_number}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{check.account_number}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{getBankName(check.issuer_bank)}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{check.destination_bank
												? getBankName(check.destination_bank)
												: '-'}
										</td>
										<td className='px-4 py-4 text-sm font-bold text-emerald-600'>
											{formatCurrency(check.amount)}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{formatDate(check.check_date)}
										</td>
										<td className='px-4 py-4'>
											<span
												className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCheckStatusColor(
													check.status,
												)}`}
											>
												{getCheckStatusText(check.status)}
											</span>
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{check.customer_id ? '✓' : '-'}
										</td>
										<td className='px-4 py-4 text-center'>
											<button
												onClick={e => {
													e.stopPropagation();
													navigate(`/manage/checks/${check.id}`);
												}}
												className='px-3 py-1 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors text-sm font-semibold'
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
			{!loading && checks.length === 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 p-12 text-center'>
					<CreditCard className='w-16 h-16 text-gray-300 mx-auto mb-4' />
					<p className='text-gray-500 text-lg font-semibold'>چکی یافت نشد</p>
				</div>
			)}

			{/* Pagination */}
			{!loading && checks.length > 0 && (
				<Pagination
					currentPage={currentPage}
					totalItems={totalCount}
					itemsPerPage={filters['page-size'] || 20}
					totalPages={Math.ceil(totalCount / (filters['page-size'] || 20))}
					onPageChange={handlePageChange}
				/>
			)}

			{/* Create Check Modal */}
			{showCreateModal && (
				<CreateCheckModal
					isOpen={showCreateModal}
					onClose={() => setShowCreateModal(false)}
					onSuccess={handleCreateSuccess}
				/>
			)}
		</div>
	);
}
