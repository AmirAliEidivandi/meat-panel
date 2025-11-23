import { Edit, Loader2, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../lib/utils';
import { customerService, walletService } from '../services/api';
import type {
	CustomerListItem,
	QueryWalletDto,
	WalletListItem,
} from '../types';
import Pagination from './Pagination';
import UpdateWalletModal from './UpdateWalletModal';

// Helper functions for Persian labels
const getCategoryText = (category: string): string => {
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

const getCustomerTypeText = (type: string): string => {
	const typeMap: Record<string, string> = {
		PERSONAL: 'شخصی',
		CORPORATE: 'سازمانی',
	};
	return typeMap[type] || type;
};

export default function WalletsList() {
	const navigate = useNavigate();
	const [wallets, setWallets] = useState<WalletListItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [totalCount, setTotalCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(20);
	const [searchTerm, setSearchTerm] = useState('');
	const [customerFilter, setCustomerFilter] = useState('');
	const [customers, setCustomers] = useState<CustomerListItem[]>([]);
	const [showUpdateWalletModal, setShowUpdateWalletModal] = useState(false);
	const [selectedWallet, setSelectedWallet] = useState<WalletListItem | null>(null);

	useEffect(() => {
		fetchWallets();
		fetchCustomers();
	}, [currentPage]);

	useEffect(() => {
		// Reset to page 1 when filters change
		setCurrentPage(1);
		fetchWallets();
	}, [searchTerm, customerFilter]);

	const fetchWallets = async () => {
		try {
			setLoading(true);
			setError('');
			const query: QueryWalletDto = {
				page: currentPage,
				'page-size': pageSize,
			};

			if (customerFilter) {
				query.customer_id = customerFilter;
			}

			const response = await walletService.getWalletList(query);
			setWallets(response.data || []);
			setTotalCount(response.count || 0);
		} catch (err: any) {
			console.error('Error fetching wallets:', err);
			setError(
				err.response?.data?.message || 'خطا در دریافت لیست کیف پول‌ها',
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
		if (customerFilter) count++;
		return count;
	};

	// Apply client-side search filter
	const filteredWallets = wallets.filter(wallet => {
		if (searchTerm) {
			const searchLower = searchTerm.toLowerCase();
			const matchesSearch =
				wallet.customer.title.toLowerCase().includes(searchLower) ||
				wallet.customer.code.toString().includes(searchTerm) ||
				getCategoryText(wallet.customer.category)
					.toLowerCase()
					.includes(searchLower) ||
				getCustomerTypeText(wallet.customer.type)
					.toLowerCase()
					.includes(searchLower);
			if (!matchesSearch) return false;
		}
		return true;
	});

	const filteredCount = filteredWallets.length;

	return (
		<div className='space-y-6 fade-in font-vazir'>
			{/* Header */}
			<div className='bg-white rounded-xl border-2 border-gray-200 p-6'>
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg'>
							<Wallet className='w-7 h-7 text-white' />
						</div>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>لیست کیف پول‌ها</h1>
							<p className='text-sm text-gray-600 mt-1'>
								{filteredCount} کیف پول
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
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							مشتری
						</label>
						<select
							value={customerFilter}
							onChange={e => setCustomerFilter(e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
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
								setCustomerFilter('');
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

			{/* Wallets Table */}
			{!loading && filteredCount > 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 overflow-hidden'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className='bg-gray-50 border-b border-gray-200'>
								<tr>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										مشتری
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										نوع
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										دسته
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										موجودی
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										حد اعتبار
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										موجودی اولیه
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
								{filteredWallets.map(wallet => (
									<tr
										key={wallet.id}
										className='hover:bg-gray-50 transition-colors cursor-pointer'
										onClick={() => navigate(`/manage/wallets/${wallet.id}`)}
									>
										<td className='px-4 py-4 text-sm font-semibold text-gray-900'>
											{wallet.customer.title}
											<br />
											<span className='text-xs text-gray-500'>
												کد: {wallet.customer.code}
											</span>
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{getCustomerTypeText(wallet.customer.type)}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{getCategoryText(wallet.customer.category)}
										</td>
										<td className='px-4 py-4'>
											<span
												className={`text-sm font-bold ${
													wallet.balance >= 0
														? 'text-green-600'
														: 'text-red-600'
												}`}
											>
												{formatCurrency(wallet.balance)}
											</span>
										</td>
										<td className='px-4 py-4 text-sm font-bold text-blue-600'>
											{formatCurrency(wallet.credit_cap)}
										</td>
										<td className='px-4 py-4 text-sm font-semibold text-gray-700'>
											{formatCurrency(wallet.initial_balance || 0)}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{formatDate(wallet.created_at)}
										</td>
										<td className='px-4 py-4 text-center'>
											<div className='flex items-center justify-center space-x-reverse space-x-2'>
												<button
													onClick={e => {
														e.stopPropagation();
														setSelectedWallet(wallet);
														setShowUpdateWalletModal(true);
													}}
													className='p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors'
													title='ویرایش کیف پول'
												>
													<Edit className='w-5 h-5' />
												</button>
												<button
													onClick={e => {
														e.stopPropagation();
														navigate(`/manage/wallets/${wallet.id}`);
													}}
													className='px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-semibold'
												>
													مشاهده
												</button>
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
			{!loading && filteredCount === 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 p-12 text-center'>
					<Wallet className='w-16 h-16 text-gray-300 mx-auto mb-4' />
					<p className='text-gray-500 text-lg font-semibold'>
						{getActiveFiltersCount() > 0
							? 'هیچ موردی با فیلترهای انتخابی یافت نشد'
							: 'کیف پولی یافت نشد'}
					</p>
				</div>
			)}

			{/* Pagination */}
			{!loading && filteredCount > 0 && (
				<Pagination
					currentPage={currentPage}
					totalItems={totalCount}
					itemsPerPage={pageSize}
					totalPages={Math.ceil(totalCount / pageSize)}
					onPageChange={handlePageChange}
				/>
			)}

			{/* Update Wallet Modal */}
			{showUpdateWalletModal && selectedWallet && (
				<UpdateWalletModal
					isOpen={showUpdateWalletModal}
					onClose={() => {
						setShowUpdateWalletModal(false);
						setSelectedWallet(null);
					}}
					walletId={selectedWallet.id}
					currentBalance={selectedWallet.balance}
					currentCreditCap={selectedWallet.credit_cap}
					onSuccess={() => {
						fetchWallets();
						setShowUpdateWalletModal(false);
						setSelectedWallet(null);
					}}
				/>
			)}
		</div>
	);
}
