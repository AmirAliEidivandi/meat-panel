import { Loader2, Receipt } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../lib/utils';
import { customerService, invoiceService } from '../services/api';
import type {
	CustomerListItem,
	InvoiceListItem,
	QueryInvoiceDto,
} from '../types';
import Pagination from './Pagination';

// Helper functions for Persian labels
const getPaymentStatusText = (status: string): string => {
	const statusMap: Record<string, string> = {
		NOT_PAID: 'پرداخت نشده',
		PARTIALLY_PAID: 'پرداخت جزئی',
		PAID: 'پرداخت شده',
	};
	return statusMap[status] || status;
};

const getPaymentStatusColor = (status: string): string => {
	const colorMap: Record<string, string> = {
		NOT_PAID: 'bg-red-100 text-red-800',
		PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
		PAID: 'bg-green-100 text-green-800',
	};
	return colorMap[status] || 'bg-gray-100 text-gray-800';
};

const getInvoiceTypeText = (type: string): string => {
	const typeMap: Record<string, string> = {
		PURCHASE: 'خرید',
		RETURN_FROM_PURCHASE: 'بازگشت از خرید',
		SELL: 'فروش',
	};
	return typeMap[type] || type;
};

const getInvoiceTypeColor = (type: string): string => {
	const colorMap: Record<string, string> = {
		PURCHASE: 'bg-blue-100 text-blue-800',
		RETURN_FROM_PURCHASE: 'bg-orange-100 text-orange-800',
		SELL: 'bg-green-100 text-green-800',
	};
	return colorMap[type] || 'bg-gray-100 text-gray-800';
};

export default function Invoices() {
	const navigate = useNavigate();
	const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [filters, setFilters] = useState<QueryInvoiceDto>({
		page: 1,
		'page-size': 20,
	});
	const [customers, setCustomers] = useState<CustomerListItem[]>([]);

	useEffect(() => {
		fetchInvoices();
		fetchCustomers();
	}, [filters]);

	const fetchInvoices = async () => {
		try {
			setLoading(true);
			setError('');
			const query: QueryInvoiceDto = {
				page: filters.page || currentPage,
				'page-size': filters['page-size'] || 20,
				...filters,
			};
			const response = await invoiceService.getInvoices(query);
			setInvoices(response.data || []);
			setTotalCount(response.count || 0);
		} catch (err: any) {
			console.error('Error fetching invoices:', err);
			setError(err.response?.data?.message || 'خطا در دریافت لیست فاکتورها');
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

	const handleFilterChange = (key: keyof QueryInvoiceDto, value: any) => {
		setFilters(prev => ({
			...prev,
			[key]: value || undefined,
			page: 1,
		}));
		setCurrentPage(1);
	};

	const getActiveFiltersCount = (): number => {
		let count = 0;
		if (filters.cargo_id) count++;
		if (filters.customer_id) count++;
		if (filters.seller_id) count++;
		if (filters.warehouse_id) count++;
		if (filters.order_id) count++;
		if (filters.driver_id) count++;
		if (filters.due_date_min) count++;
		if (filters.due_date_max) count++;
		if (filters.from) count++;
		if (filters.to) count++;
		if (filters.amount_min) count++;
		if (filters.amount_max) count++;
		if (filters.code) count++;
		if (filters.hp_code) count++;
		if (filters.hp_title) count++;
		if (filters.date) count++;
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
							<h1 className='text-2xl font-bold text-gray-900'>لیست فاکتورها</h1>
							<p className='text-sm text-gray-600 mt-1'>
								{totalCount} فاکتور ثبت شده
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
							type='number'
							value={filters.code || ''}
							onChange={e =>
								handleFilterChange('code', e.target.value ? parseInt(e.target.value) : undefined)
							}
							placeholder='جستجو...'
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							مشتری
						</label>
						<select
							value={filters.customer_id || ''}
							onChange={e => handleFilterChange('customer_id', e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
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
							کد HP
						</label>
						<input
							type='number'
							value={filters.hp_code || ''}
							onChange={e =>
								handleFilterChange('hp_code', e.target.value ? parseInt(e.target.value) : undefined)
							}
							placeholder='جستجو...'
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							کد سفارش
						</label>
						<input
							type='text'
							value={filters.order_id || ''}
							onChange={e => handleFilterChange('order_id', e.target.value)}
							placeholder='جستجو...'
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
						/>
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

			{/* Invoices Table */}
			{!loading && invoices.length > 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 overflow-hidden'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className='bg-gray-50 border-b border-gray-200'>
								<tr>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										کد فاکتور
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										مشتری
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										مبلغ
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										تاریخ
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										تاریخ سررسید
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										نوع فاکتور
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										وضعیت پرداخت
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										کد سفارش
									</th>
									<th className='px-4 py-3 text-center text-sm font-semibold text-gray-700'>
										عملیات
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-200'>
								{invoices.map(invoice => (
									<tr
										key={invoice.id}
										className='hover:bg-gray-50 transition-colors cursor-pointer'
										onClick={() => navigate(`/manage/invoices/${invoice.id}`)}
									>
										<td className='px-4 py-4 text-sm font-semibold text-gray-900'>
											#{invoice.code}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{invoice.customer.title}
										</td>
										<td className='px-4 py-4 text-sm font-bold text-emerald-600'>
											{formatCurrency(invoice.amount)}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{formatDate(invoice.date)}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{invoice.due_date ? formatDate(invoice.due_date) : '-'}
										</td>
										<td className='px-4 py-4'>
											<span
												className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getInvoiceTypeColor(
													invoice.type,
												)}`}
											>
												{getInvoiceTypeText(invoice.type)}
											</span>
										</td>
										<td className='px-4 py-4'>
											<span
												className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(
													invoice.payment_status,
												)}`}
											>
												{getPaymentStatusText(invoice.payment_status)}
											</span>
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{invoice.order ? `#${invoice.order.code}` : '-'}
										</td>
										<td className='px-4 py-4 text-center'>
											<button
												onClick={e => {
													e.stopPropagation();
													navigate(`/manage/invoices/${invoice.id}`);
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
			{!loading && invoices.length === 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 p-12 text-center'>
					<Receipt className='w-16 h-16 text-gray-300 mx-auto mb-4' />
					<p className='text-gray-500 text-lg font-semibold'>
						{getActiveFiltersCount() > 0
							? 'هیچ موردی با فیلترهای انتخابی یافت نشد'
							: 'فاکتوری یافت نشد'}
					</p>
				</div>
			)}

			{/* Pagination */}
			{!loading && invoices.length > 0 && (
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
