import { FileBarChart, Loader2, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../lib/utils';
import { customerService } from '../services/api';
import type { CustomerByLastOrderListItem, QueryCustomerDto } from '../types';
import Pagination from './Pagination';

// Helper functions for Persian labels
const getCustomerTypeText = (type: string): string => {
	const typeMap: Record<string, string> = {
		PERSONAL: 'شخصی',
		CORPORATE: 'سازمانی',
	};
	return typeMap[type] || type;
};

const getCustomerCategoryText = (category: string): string => {
	const categoryMap: Record<string, string> = {
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
	return categoryMap[category] || category;
};

const getOrderStatusText = (step: string): string => {
	const statusMap: Record<string, string> = {
		SELLER: 'فروشنده',
		SALES_MANAGER: 'مدیر فروش',
		PROCESSING: 'در حال پردازش',
		INVENTORY: 'موجودی',
		ACCOUNTING: 'حسابداری',
		CARGO: 'حمل و نقل',
		PARTIALLY_DELIVERED: 'تحویل جزئی',
		DELIVERED: 'تحویل داده شده',
		PARTIALLY_RETURNED: 'مرجوعی جزئی',
		RETURNED: 'مرجوعی کامل',
	};
	return statusMap[step] || step;
};

const getPaymentStatusText = (status: string): string => {
	const statusMap: Record<string, string> = {
		NOT_PAID: 'پرداخت نشده',
		PARTIALLY_PAID: 'پرداخت جزئی',
		PAID: 'پرداخت شده',
	};
	return statusMap[status] || status;
};

export default function CustomersReport() {
	const navigate = useNavigate();
	const [customers, setCustomers] = useState<CustomerByLastOrderListItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [totalCount, setTotalCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(20);
	const [searchTerm, setSearchTerm] = useState('');
	const [typeFilter, setTypeFilter] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('');

	useEffect(() => {
		fetchCustomersByLastOrder();
	}, [currentPage]);

	useEffect(() => {
		// Reset to page 1 when filters change
		setCurrentPage(1);
		fetchCustomersByLastOrder();
	}, [searchTerm, typeFilter, categoryFilter]);

	const fetchCustomersByLastOrder = async () => {
		try {
			setLoading(true);
			setError('');
			const query: QueryCustomerDto = {
				page: currentPage,
				'page-size': pageSize,
			};

			if (searchTerm) {
				query.title = searchTerm;
			}

			if (typeFilter) {
				query.type = typeFilter;
			}

			if (categoryFilter) {
				query.category = categoryFilter;
			}

			const response = await customerService.getCustomersByLastOrder(query);
			setCustomers(response.data || []);
			setTotalCount(response.count || 0);
		} catch (err: any) {
			console.error('Error fetching customers by last order:', err);
			setError(err.response?.data?.message || 'خطا در دریافت گزارش مشتری‌ها');
		} finally {
			setLoading(false);
		}
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const getActiveFiltersCount = (): number => {
		let count = 0;
		if (searchTerm) count++;
		if (typeFilter) count++;
		if (categoryFilter) count++;
		return count;
	};

	return (
		<div className='space-y-6 fade-in font-vazir'>
			{/* Header */}
			<div className='bg-white rounded-xl border-2 border-gray-200 p-6'>
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<div className='w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg'>
							<FileBarChart className='w-7 h-7 text-white' />
						</div>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>
								گزارش مشتری‌ها
							</h1>
							<p className='text-sm text-gray-600 mt-1'>
								{totalCount} مشتری
								{getActiveFiltersCount() > 0 && ' (فیلتر شده)'}
							</p>
						</div>
					</div>
				</div>

				{/* Filters */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							جستجو
						</label>
						<input
							type='text'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							placeholder='جستجو...'
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							نوع
						</label>
						<select
							value={typeFilter}
							onChange={e => setTypeFilter(e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
						>
							<option value=''>همه</option>
							<option value='INDIVIDUAL'>حقیقی</option>
							<option value='COMPANY'>حقوقی</option>
							<option value='PERSONAL'>شخصی</option>
							<option value='CORPORATE'>سازمانی</option>
						</select>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							دسته
						</label>
						<select
							value={categoryFilter}
							onChange={e => setCategoryFilter(e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
						>
							<option value=''>همه</option>
							<option value='RESTAURANT'>رستوران</option>
							<option value='HOTEL'>هتل</option>
							<option value='CHAIN_STORE'>فروشگاه زنجیره‌ای</option>
							<option value='GOVERNMENTAL'>دولتی</option>
							<option value='FAST_FOOD'>فست فود</option>
							<option value='CHARITY'>خیریه</option>
							<option value='BUTCHER'>قصابی</option>
							<option value='WHOLESALER'>عمده‌فروش</option>
							<option value='FELLOW'>همکار</option>
							<option value='CATERING'>کترینگ</option>
							<option value='KEBAB'>کبابی</option>
							<option value='DISTRIBUTOR'>پخش‌کننده</option>
							<option value='HOSPITAL'>بیمارستان</option>
							<option value='FACTORY'>کارخانه</option>
							<option value='OTHER'>سایر</option>
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
								setTypeFilter('');
								setCategoryFilter('');
								setCurrentPage(1);
							}}
							className='text-sm text-green-600 hover:text-green-700 font-semibold'
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
					<Loader2 className='w-8 h-8 text-green-600 animate-spin' />
					<span className='mr-3 text-gray-600 font-semibold'>
						در حال بارگذاری...
					</span>
				</div>
			)}

			{/* Customers Table */}
			{!loading && customers.length > 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 overflow-hidden'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className='bg-gray-50 border-b border-gray-200'>
								<tr>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										نام مشتری
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										کد
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										نوع
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										دسته
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										کیف پول
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										کد آخرین سفارش
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										مبلغ آخرین سفارش
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										وضعیت سفارش
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										تاریخ آخرین سفارش
									</th>
									<th className='px-4 py-3 text-center text-sm font-semibold text-gray-700'>
										عملیات
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-200'>
								{customers.map(customer => (
									<tr
										key={customer.id}
										className='hover:bg-gray-50 transition-colors cursor-pointer'
										onClick={() => navigate(`/manage/customers/${customer.id}`)}
									>
										<td className='px-4 py-4 text-sm font-semibold text-gray-900'>
											{customer.title}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{customer.code}
										</td>
										<td className='px-4 py-4'>
											<span className='inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800'>
												{getCustomerTypeText(customer.type)}
											</span>
										</td>
										<td className='px-4 py-4'>
											<span className='inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800'>
												{getCustomerCategoryText(customer.category)}
											</span>
										</td>
										<td className='px-4 py-4 text-sm font-semibold text-gray-700'>
											{customer.wallet ? (
												<div>
													<div
														className={
															customer.wallet.balance &&
															customer.wallet.balance < 0
																? 'text-red-600'
																: 'text-gray-700'
														}
													>
														{formatCurrency(customer.wallet.balance || 0)}
													</div>
													<div className='text-xs text-gray-500 mt-1'>
														سقف:{' '}
														{formatCurrency(customer.wallet.credit_cap || 0)}
													</div>
												</div>
											) : (
												<span className='text-gray-400'>-</span>
											)}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{customer.last_order ? (
												<span className='font-semibold text-green-600'>
													#{customer.last_order.code}
												</span>
											) : (
												<span className='text-gray-400'>-</span>
											)}
										</td>
										<td className='px-4 py-4 text-sm font-bold text-emerald-600'>
											{customer.last_order
												? formatCurrency(customer.last_order.total_amount || 0)
												: '-'}
										</td>
										<td className='px-4 py-4'>
											{customer.last_order ? (
												<div className='space-y-1'>
													<span className='inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800'>
														{getOrderStatusText(customer.last_order.step)}
													</span>
													<br />
													<span className='inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 mt-1'>
														{getPaymentStatusText(
															customer.last_order.payment_status,
														)}
													</span>
												</div>
											) : (
												<span className='text-gray-400'>-</span>
											)}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{customer.last_order
												? formatDate(customer.last_order.created_date)
												: '-'}
										</td>
										<td className='px-4 py-4 text-center'>
											<div className='flex items-center justify-center space-x-reverse space-x-2'>
												<button
													onClick={e => {
														e.stopPropagation();
														navigate(`/manage/customers/${customer.id}`);
													}}
													className='px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-semibold'
												>
													مشتری
												</button>
												{customer.last_order && (
													<button
														onClick={e => {
															e.stopPropagation();
															navigate(
																`/manage/orders/${customer.last_order.id}`,
															);
														}}
														className='px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold flex items-center'
													>
														<ShoppingCart className='w-3 h-3 ml-1' />
														سفارش
													</button>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Empty State */}
			{!loading && customers.length === 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 p-12 text-center'>
					<FileBarChart className='w-16 h-16 text-gray-300 mx-auto mb-4' />
					<p className='text-gray-500 text-lg font-semibold'>
						{getActiveFiltersCount() > 0
							? 'هیچ موردی با فیلترهای انتخابی یافت نشد'
							: 'مشتری‌ای یافت نشد'}
					</p>
				</div>
			)}

			{/* Pagination */}
			{!loading && customers.length > 0 && (
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
