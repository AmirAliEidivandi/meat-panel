import { Loader2, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../lib/utils';
import { customerService, orderService } from '../services/api';
import type { CustomerListItem, Order, QueryOrderDto } from '../types';
import Pagination from './Pagination';

// Helper functions for Persian labels
const getOrderStepText = (step: string): string => {
	const stepMap: Record<string, string> = {
		SELLER: 'فروشنده',
		SALES_MANAGER: 'مدیر فروش',
		PROCESSING: 'آماده سازی',
		INVENTORY: 'انبار',
		ACCOUNTING: 'حسابداری',
		CARGO: 'مرسوله',
		PARTIALLY_DELIVERED: 'تحویل جزئی',
		DELIVERED: 'تحویل داده شده',
		RETURNED: 'مرجوعی',
		PARTIALLY_RETURNED: 'مرجوعی جزئی',
	};
	return stepMap[step] || step;
};

const getOrderStepColor = (step: string): string => {
	const colorMap: Record<string, string> = {
		SELLER: 'bg-blue-100 text-blue-800',
		SALES_MANAGER: 'bg-purple-100 text-purple-800',
		PROCESSING: 'bg-yellow-100 text-yellow-800',
		INVENTORY: 'bg-orange-100 text-orange-800',
		ACCOUNTING: 'bg-indigo-100 text-indigo-800',
		CARGO: 'bg-cyan-100 text-cyan-800',
		PARTIALLY_DELIVERED: 'bg-green-100 text-green-800',
		DELIVERED: 'bg-green-100 text-green-800',
		RETURNED: 'bg-red-100 text-red-800',
		PARTIALLY_RETURNED: 'bg-red-100 text-red-800',
	};
	return colorMap[step] || 'bg-gray-100 text-gray-800';
};

const getPaymentStatusText = (status: string): string => {
	const statusMap: Record<string, string> = {
		PAID: 'پرداخت شده',
		NOT_PAID: 'پرداخت نشده',
		PARTIALLY_PAID: 'پرداخت جزئی',
	};
	return statusMap[status] || status;
};

const getPaymentStatusColor = (status: string): string => {
	const colorMap: Record<string, string> = {
		PAID: 'bg-green-100 text-green-800',
		NOT_PAID: 'bg-red-100 text-red-800',
		PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
	};
	return colorMap[status] || 'bg-gray-100 text-gray-800';
};

const getDeliveryMethodText = (method: string): string => {
	const methodMap: Record<string, string> = {
		FREE_OUR_TRUCK: 'رایگان با ماشین شرکت',
		PAID_OUR_TRUCK: 'پولی با ماشین شرکت',
		FREE_OTHER_SERVICES: 'رایگان با سرویس خارجی',
		PAID: 'ارسال با هزینه مشتری',
		AT_INVENTORY: 'درب انبار',
	};
	return methodMap[method] || method;
};

export default function Orders() {
	const navigate = useNavigate();
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [filters, setFilters] = useState<QueryOrderDto>({
		page: 1,
		'page-size': 20,
	});
	const [customers, setCustomers] = useState<CustomerListItem[]>([]);

	useEffect(() => {
		fetchOrders();
		fetchCustomers();
	}, [filters]);

	const fetchOrders = async () => {
		try {
			setLoading(true);
			setError('');
			const query: QueryOrderDto = {
				page: filters.page || currentPage,
				'page-size': filters['page-size'] || 20,
				...filters,
			};
			const response = await orderService.getOrders(query);
			setOrders(response.data || []);
			setTotalCount(response.count || 0);
		} catch (err: any) {
			console.error('Error fetching orders:', err);
			setError(err.response?.data?.message || 'خطا در دریافت لیست سفارشات');
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

	const handleFilterChange = (key: keyof QueryOrderDto, value: any) => {
		setFilters(prev => ({
			...prev,
			[key]: value || undefined,
			page: 1,
		}));
		setCurrentPage(1);
	};

	const getActiveFiltersCount = (): number => {
		let count = 0;
		if (filters.search) count++;
		if (filters.customer_id) count++;
		if (filters.seller_id) count++;
		if (filters.step) count++;
		if (filters.payment_status) count++;
		if (filters.delivery_method) count++;
		if (filters.bought !== undefined) count++;
		if (filters.fulfilled !== undefined) count++;
		if (filters.archived !== undefined) count++;
		if (filters.date_from) count++;
		if (filters.date_to) count++;
		return count;
	};

	return (
		<div className='space-y-6 fade-in font-vazir'>
			{/* Header */}
			<div className='bg-white rounded-xl border-2 border-gray-200 p-6'>
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg'>
							<ShoppingCart className='w-7 h-7 text-white' />
						</div>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>لیست سفارشات</h1>
							<p className='text-sm text-gray-600 mt-1'>
								{totalCount} سفارش ثبت شده
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
							value={filters.search || ''}
							onChange={e => handleFilterChange('search', e.target.value)}
							placeholder='جستجو...'
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							مشتری
						</label>
						<select
							value={filters.customer_id || ''}
							onChange={e => handleFilterChange('customer_id', e.target.value)}
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
							وضعیت سفارش
						</label>
						<select
							value={filters.step || ''}
							onChange={e => handleFilterChange('step', e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
							وضعیت پرداخت
						</label>
						<select
							value={filters.payment_status || ''}
							onChange={e => handleFilterChange('payment_status', e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
						>
							<option value=''>همه</option>
							<option value='PAID'>پرداخت شده</option>
							<option value='NOT_PAID'>پرداخت نشده</option>
							<option value='PARTIALLY_PAID'>پرداخت جزئی</option>
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

			{/* Orders Table */}
			{!loading && orders.length > 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 overflow-hidden'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className='bg-gray-50 border-b border-gray-200'>
								<tr>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										کد سفارش
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										مشتری
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										نماینده
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										تاریخ تحویل
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										وضعیت سفارش
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										وضعیت پرداخت
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										روش ارسال
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										خریداری شده
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										تحویل شده
									</th>
									<th className='px-4 py-3 text-center text-sm font-semibold text-gray-700'>
										عملیات
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-200'>
								{orders.map(order => (
									<tr
										key={order.id}
										className='hover:bg-gray-50 transition-colors cursor-pointer'
										onClick={() => navigate(`/manage/orders/${order.id}`)}
									>
										<td className='px-4 py-4 text-sm font-semibold text-gray-900'>
											#{order.code}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{order.customer.title}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{order.representative_name || '-'}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{formatDate(order.delivery_date)}
										</td>
										<td className='px-4 py-4'>
											<span
												className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getOrderStepColor(
													order.step,
												)}`}
											>
												{getOrderStepText(order.step)}
											</span>
										</td>
										<td className='px-4 py-4'>
											<span
												className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(
													order.payment_status,
												)}`}
											>
												{getPaymentStatusText(order.payment_status)}
											</span>
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{getDeliveryMethodText(order.delivery_method)}
										</td>
										<td className='px-4 py-4 text-center'>
											{order.bought ? (
												<span className='text-green-600 font-semibold'>✓</span>
											) : (
												<span className='text-red-600 font-semibold'>✗</span>
											)}
										</td>
										<td className='px-4 py-4 text-center'>
											{order.fulfilled ? (
												<span className='text-green-600 font-semibold'>✓</span>
											) : (
													<span className='text-yellow-600 font-semibold'>-</span>
											)}
										</td>
										<td className='px-4 py-4 text-center'>
											<button
												onClick={e => {
													e.stopPropagation();
													navigate(`/manage/orders/${order.id}`);
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
			{!loading && orders.length === 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 p-12 text-center'>
					<ShoppingCart className='w-16 h-16 text-gray-300 mx-auto mb-4' />
					<p className='text-gray-500 text-lg font-semibold'>
						سفارشی یافت نشد
					</p>
				</div>
			)}

			{/* Pagination */}
			{!loading && orders.length > 0 && (
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
