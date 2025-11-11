import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../lib/utils';
import { customerService } from '../services/api';
import type { CustomerListItem, QueryCustomerDto } from '../types';
import Pagination from './Pagination';

// Helper functions for Persian labels
const getCustomerTypeText = (type: string): string => {
	const typeMap: Record<string, string> = {
		INDIVIDUAL: 'حقیقی',
		COMPANY: 'حقوقی',
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

export default function CustomersByDebt() {
	const navigate = useNavigate();
	const [customers, setCustomers] = useState<CustomerListItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [totalCount, setTotalCount] = useState(0);
	const [totalDebt, setTotalDebt] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(20);
	const [searchTerm, setSearchTerm] = useState('');
	const [typeFilter, setTypeFilter] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('');

	useEffect(() => {
		fetchCustomersByDebt();
	}, [currentPage]);

	useEffect(() => {
		// Reset to page 1 when filters change
		setCurrentPage(1);
		fetchCustomersByDebt();
	}, [searchTerm, typeFilter, categoryFilter]);

	const fetchCustomersByDebt = async () => {
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

			const response = await customerService.getCustomersByDebt(query);
			setTotalDebt(response.metadata?.total_debt || 0);
			setCustomers(response.data || []);
			setTotalCount(response.count || 0);
		} catch (err: any) {
			console.error('Error fetching customers by debt:', err);
			setError(
				err.response?.data?.message || 'خطا در دریافت لیست مشتریان بدهکار',
			);
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
						<div className='w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg'>
							<AlertCircle className='w-7 h-7 text-white' />
						</div>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>
								مشتریان بدهکار
							</h1>
							<p className='text-sm text-gray-600 mt-1'>
								{totalCount} مشتری بدهکار
								{getActiveFiltersCount() > 0 && ' (فیلتر شده)'}
							</p>
						</div>
					</div>
				</div>

				{/* Total Debt Summary */}
				{totalDebt > 0 && (
					<div className='mb-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-2 border-red-200 p-4'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center space-x-reverse space-x-3'>
								<div className='w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center'>
									<AlertCircle className='w-5 h-5 text-white' />
								</div>
								<div>
									<p className='text-xs font-semibold text-gray-600 mb-1'>
										کل بدهی مشتریان
									</p>
									<p className='text-2xl font-bold text-red-600'>
										{formatCurrency(totalDebt)}
									</p>
								</div>
							</div>
						</div>
					</div>
				)}

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
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							نوع
						</label>
						<select
							value={typeFilter}
							onChange={e => setTypeFilter(e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
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
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
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
							className='text-sm text-red-600 hover:text-red-700 font-semibold'
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
					<Loader2 className='w-8 h-8 text-red-600 animate-spin' />
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
										موجودی کیف پول
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										تلفن
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										آدرس
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
								{customers.map(customer => (
									<tr
										key={customer.id}
										className='hover:bg-red-50 transition-colors cursor-pointer'
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
										<td className='px-4 py-4'>
											<span className='text-sm font-bold text-red-600'>
												{customer.wallet
													? formatCurrency(customer.wallet.balance || 0)
													: '-'}
											</span>
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{customer.phone || '-'}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700 max-w-xs truncate'>
											{customer.address || '-'}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{formatDate(customer.created_at)}
										</td>
										<td className='px-4 py-4 text-center'>
											<button
												onClick={e => {
													e.stopPropagation();
													navigate(`/manage/customers/${customer.id}`);
												}}
												className='px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold'
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
			{!loading && customers.length === 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 p-12 text-center'>
					<AlertCircle className='w-16 h-16 text-gray-300 mx-auto mb-4' />
					<p className='text-gray-500 text-lg font-semibold'>
						{getActiveFiltersCount() > 0
							? 'هیچ موردی با فیلترهای انتخابی یافت نشد'
							: 'مشتری بدهکاری یافت نشد'}
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
