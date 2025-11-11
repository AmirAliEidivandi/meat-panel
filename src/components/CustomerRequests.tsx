import { Loader2, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../lib/utils';
import { customerService, historyService } from '../services/api';
import type { CustomerListItem, CustomerRequest } from '../types';
import Pagination from './Pagination';

// Helper functions for Persian labels
const getStatusText = (status: string): string => {
	const statusMap: Record<string, string> = {
		PENDING: 'در انتظار',
		APPROVED: 'تأیید شده',
		REJECTED: 'رد شده',
		CONVERTED_TO_ORDER: 'تبدیل به سفارش',
	};
	return statusMap[status] || status;
};

const getStatusColor = (status: string): string => {
	const colorMap: Record<string, string> = {
		PENDING: 'bg-yellow-100 text-yellow-800',
		APPROVED: 'bg-green-100 text-green-800',
		REJECTED: 'bg-red-100 text-red-800',
		CONVERTED_TO_ORDER: 'bg-blue-100 text-blue-800',
	};
	return colorMap[status] || 'bg-gray-100 text-gray-800';
};

const getPaymentMethodText = (method: string): string => {
	const methodMap: Record<string, string> = {
		CASH: 'نقدی',
		DEPOSIT_TO_ACCOUNT: 'واریز به حساب',
		CHEQUE: 'چک',
		CREDIT: 'اعتباری',
		WALLET: 'کیف پول',
		ONLINE: 'آنلاین',
	};
	return methodMap[method] || method;
};

const getPaymentMethodColor = (method: string): string => {
	const colorMap: Record<string, string> = {
		CASH: 'bg-green-100 text-green-800',
		DEPOSIT_TO_ACCOUNT: 'bg-blue-100 text-blue-800',
		CHEQUE: 'bg-yellow-100 text-yellow-800',
		CREDIT: 'bg-purple-100 text-purple-800',
		WALLET: 'bg-indigo-100 text-indigo-800',
		ONLINE: 'bg-cyan-100 text-cyan-800',
	};
	return colorMap[method] || 'bg-gray-100 text-gray-800';
};

export default function CustomerRequests() {
	const navigate = useNavigate();
	const [requests, setRequests] = useState<CustomerRequest[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [pageSize] = useState(20);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [customerFilter, setCustomerFilter] = useState('');
	const [customers, setCustomers] = useState<CustomerListItem[]>([]);

	useEffect(() => {
		fetchRequests();
		fetchCustomers();
	}, [currentPage]);

	useEffect(() => {
		// Reset to page 1 when filters change
		setCurrentPage(1);
		fetchRequests();
	}, [searchTerm, statusFilter, customerFilter]);

	const fetchRequests = async () => {
		try {
			setLoading(true);
			setError('');
			const response = await historyService.getCustomerRequests(
				currentPage,
				pageSize,
			);

			if (response && response.data && Array.isArray(response.data)) {
				let filteredData = response.data;

				// Apply client-side filters
				if (searchTerm) {
					const searchLower = searchTerm.toLowerCase();
					filteredData = filteredData.filter(
						request =>
							request.customer?.title?.toLowerCase().includes(searchLower) ||
							request.customer?.code?.toString().includes(searchTerm) ||
							request.code?.toString().includes(searchTerm) ||
							request.representative_name?.toLowerCase().includes(searchLower),
					);
				}

				if (statusFilter) {
					filteredData = filteredData.filter(
						request => request.status === statusFilter,
					);
				}

				if (customerFilter) {
					filteredData = filteredData.filter(
						request => request.customer?.id === customerFilter,
					);
				}

				setRequests(filteredData);
				setTotalCount(response.count);
			} else {
				console.error('Invalid response structure:', response);
				setError('فرمت داده‌ها نامعتبر است');
			}
		} catch (err: any) {
			console.error('Error fetching customer requests:', err);
			setError(
				err.response?.data?.message || 'خطا در دریافت لیست درخواست‌های مشتریان',
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
		if (searchTerm) count++;
		if (statusFilter) count++;
		if (customerFilter) count++;
		return count;
	};

	return (
		<div className='space-y-6 fade-in font-vazir'>
			{/* Header */}
			<div className='bg-white rounded-xl border-2 border-gray-200 p-6'>
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<div className='w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg'>
							<Package className='w-7 h-7 text-white' />
						</div>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>
								لیست درخواست‌های مشتریان
							</h1>
							<p className='text-sm text-gray-600 mt-1'>
								{totalCount} درخواست ثبت شده
							</p>
						</div>
					</div>
				</div>

				{/* Filters */}
				<div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							جستجو
						</label>
						<input
							type='text'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							placeholder='جستجو...'
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							وضعیت
						</label>
						<select
							value={statusFilter}
							onChange={e => setStatusFilter(e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
						>
							<option value=''>همه</option>
							<option value='PENDING'>در انتظار</option>
							<option value='APPROVED'>تأیید شده</option>
							<option value='REJECTED'>رد شده</option>
							<option value='CONVERTED_TO_ORDER'>تبدیل به سفارش</option>
						</select>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							مشتری
						</label>
						<select
							value={customerFilter}
							onChange={e => setCustomerFilter(e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
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
								setSearchTerm('');
								setStatusFilter('');
								setCustomerFilter('');
								setCurrentPage(1);
							}}
							className='text-sm text-amber-600 hover:text-amber-700 font-semibold'
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
					<Loader2 className='w-8 h-8 text-amber-600 animate-spin' />
					<span className='mr-3 text-gray-600 font-semibold'>
						در حال بارگذاری...
					</span>
				</div>
			)}

			{/* Requests Table */}
			{!loading && requests.length > 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 overflow-hidden'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className='bg-gray-50 border-b border-gray-200'>
								<tr>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										کد درخواست
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										مشتری
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										نماینده
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										مبلغ کل
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										روش پرداخت
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										وضعیت
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
								{requests.map(request => (
									<tr
										key={request.id}
										className='hover:bg-gray-50 transition-colors cursor-pointer'
										onClick={() =>
											navigate(`/manage/customer-requests/${request.id}`)
										}
									>
										<td className='px-4 py-4 text-sm font-semibold text-gray-900'>
											#{request.code}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{request.customer?.title ||
												`مشتری ${request.customer?.code}`}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{request.representative_name || '-'}
										</td>
										<td className='px-4 py-4 text-sm font-bold text-emerald-600'>
											{formatCurrency(request.total_price)}
										</td>
										<td className='px-4 py-4'>
											<span
												className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPaymentMethodColor(
													request.payment_method,
												)}`}
											>
												{getPaymentMethodText(request.payment_method)}
											</span>
										</td>
										<td className='px-4 py-4'>
											<span
												className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
													request.status,
												)}`}
											>
												{getStatusText(request.status)}
											</span>
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{formatDate(request.created_at)}
										</td>
										<td className='px-4 py-4 text-center'>
											<button
												onClick={e => {
													e.stopPropagation();
													navigate(`/manage/customer-requests/${request.id}`);
												}}
												className='px-3 py-1 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm font-semibold'
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
			{!loading && requests.length === 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 p-12 text-center'>
					<Package className='w-16 h-16 text-gray-300 mx-auto mb-4' />
					<p className='text-gray-500 text-lg font-semibold'>
						{getActiveFiltersCount() > 0
							? 'هیچ موردی با فیلترهای انتخابی یافت نشد'
							: 'درخواستی یافت نشد'}
					</p>
				</div>
			)}

			{/* Pagination */}
			{!loading && requests.length > 0 && (
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
