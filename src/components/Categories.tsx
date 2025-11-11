import { FolderOpen, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService, warehouseService } from '../services/api';
import type { Category, Warehouse } from '../types';
import { TemperatureTypeEnumValues } from '../types';
import Pagination from './Pagination';

// Helper functions for Persian labels
const getTemperatureTypeText = (type: string | null | undefined): string => {
	if (!type) return '-';
	return type === TemperatureTypeEnumValues.HOT ? 'گرم' : 'سرد';
};

const getTemperatureTypeColor = (type: string | null | undefined): string => {
	if (!type) return 'bg-gray-100 text-gray-800';
	return type === TemperatureTypeEnumValues.HOT
		? 'bg-red-100 text-red-800'
		: 'bg-blue-100 text-blue-800';
};

export default function Categories() {
	const navigate = useNavigate();
	const [categories, setCategories] = useState<Category[]>([]);
	const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
	const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [pageSize] = useState(20);
	const [searchTerm, setSearchTerm] = useState('');
	const [temperatureFilter, setTemperatureFilter] = useState('');

	useEffect(() => {
		fetchWarehouses();
	}, []);

	useEffect(() => {
		if (selectedWarehouse) {
			fetchCategories();
		} else {
			setCategories([]);
			setTotalCount(0);
		}
	}, [selectedWarehouse]);

	useEffect(() => {
		// Reset to page 1 when filters change
		setCurrentPage(1);
	}, [searchTerm, temperatureFilter]);

	const fetchWarehouses = async () => {
		try {
			setLoading(true);
			setError('');
			const data = await warehouseService.getWarehouses();

			if (Array.isArray(data)) {
				setWarehouses(data);

				// Find Isfahan warehouse
				const isfahanWarehouse = data.find(
					w =>
						w.name.toLowerCase().includes('اصفهان') ||
						w.name.toLowerCase().includes('آتشگاه'),
				);

				if (isfahanWarehouse) {
					setSelectedWarehouse(isfahanWarehouse.id);
				}
			} else {
				setError('فرمت داده‌های انبار نامعتبر است');
			}
		} catch (err: any) {
			setError('خطا در بارگذاری انبارها');
		} finally {
			setLoading(false);
		}
	};

	const fetchCategories = async () => {
		if (!selectedWarehouse) {
			setCategories([]);
			setTotalCount(0);
			return;
		}

		try {
			setLoading(true);
			setError('');
			const data =
				await categoryService.getCategoriesByWarehouse(selectedWarehouse);

			let categoriesArray: Category[] = [];

			if (Array.isArray(data)) {
				categoriesArray = data;
			} else {
				setError('فرمت داده‌های دسته‌بندی نامعتبر است');
				setCategories([]);
				setTotalCount(0);
				return;
			}

			setCategories(categoriesArray);
			setTotalCount(categoriesArray.length);
		} catch (err: any) {
			console.error('Error fetching categories:', err);
			setError(err?.message || 'خطا در دریافت لیست دسته‌بندی‌ها');
			setCategories([]);
			setTotalCount(0);
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
		if (temperatureFilter) count++;
		return count;
	};

	// Apply client-side filters
	const filteredCategories = categories.filter(category => {
		if (searchTerm) {
			const searchLower = searchTerm.toLowerCase();
			const matchesSearch =
				category.title?.toLowerCase().includes(searchLower) ||
				category.code?.toString().includes(searchTerm);
			if (!matchesSearch) return false;
		}

		if (temperatureFilter) {
			if (category.temperature_type !== temperatureFilter) return false;
		}

		return true;
	});

	const filteredCount = filteredCategories.length;

	// Paginate results
	const paginatedCategories = filteredCategories.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	);

	return (
		<div className='space-y-6 fade-in font-vazir'>
			{/* Header */}
			<div className='bg-white rounded-xl border-2 border-gray-200 p-6'>
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<div className='w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg'>
							<FolderOpen className='w-7 h-7 text-white' />
						</div>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>
								لیست دسته‌بندی‌ها
							</h1>
							<p className='text-sm text-gray-600 mt-1'>
								{filteredCount} دسته‌بندی
								{getActiveFiltersCount() > 0 && ' (فیلتر شده)'}
							</p>
						</div>
					</div>
				</div>

				{/* Warehouse Selection */}
				<div className='mb-6'>
					<label className='block text-sm font-semibold text-gray-700 mb-2'>
						انتخاب انبار
					</label>
					<select
						value={selectedWarehouse}
						onChange={e => {
							setSelectedWarehouse(e.target.value);
							setCurrentPage(1);
						}}
						className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500'
					>
						<option value=''>انتخاب انبار</option>
						{warehouses.map(warehouse => (
							<option key={warehouse.id} value={warehouse.id}>
								{warehouse.name} (کد: {warehouse.code})
							</option>
						))}
					</select>
				</div>

				{/* Filters */}
				{selectedWarehouse && (
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
								className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500'
							/>
						</div>
						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								نوع دما
							</label>
							<select
								value={temperatureFilter}
								onChange={e => setTemperatureFilter(e.target.value)}
								className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500'
							>
								<option value=''>همه</option>
								<option value={TemperatureTypeEnumValues.HOT}>گرم</option>
								<option value={TemperatureTypeEnumValues.COLD}>سرد</option>
							</select>
						</div>
					</div>
				)}

				{getActiveFiltersCount() > 0 && selectedWarehouse && (
					<div className='mt-4 flex items-center justify-between'>
						<span className='text-sm text-gray-600'>
							{getActiveFiltersCount()} فیلتر فعال
						</span>
						<button
							onClick={() => {
								setSearchTerm('');
								setTemperatureFilter('');
								setCurrentPage(1);
							}}
							className='text-sm text-pink-600 hover:text-pink-700 font-semibold'
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
					<Loader2 className='w-8 h-8 text-pink-600 animate-spin' />
					<span className='mr-3 text-gray-600 font-semibold'>
						در حال بارگذاری...
					</span>
				</div>
			)}

			{/* Categories Table */}
			{!loading && selectedWarehouse && filteredCount > 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 overflow-hidden'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className='bg-gray-50 border-b border-gray-200'>
								<tr>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										عنوان
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										کد
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										اولویت
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										نوع دما
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										والد
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										زیردسته‌ها
									</th>
									<th className='px-4 py-3 text-center text-sm font-semibold text-gray-700'>
										عملیات
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-200'>
								{paginatedCategories
									.filter(category => category && category.id)
									.map(category => (
										<tr
											key={category.id}
											className='hover:bg-gray-50 transition-colors cursor-pointer'
											onClick={() =>
												navigate(`/manage/categories/${category.id}`)
											}
										>
											<td className='px-4 py-4 text-sm font-semibold text-gray-900'>
												{category.title || 'بدون نام'}
											</td>
											<td className='px-4 py-4 text-sm text-gray-700'>
												{category.code ?? 'N/A'}
											</td>
											<td className='px-4 py-4 text-sm text-gray-700'>
												{category.priority ?? 0}
											</td>
											<td className='px-4 py-4'>
												{category.temperature_type ? (
													<span
														className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTemperatureTypeColor(
															category.temperature_type,
														)}`}
													>
														{getTemperatureTypeText(category.temperature_type)}
													</span>
												) : (
													<span className='text-gray-400'>-</span>
												)}
											</td>
											<td className='px-4 py-4 text-sm text-gray-700'>
												{category.parent?.title || '-'}
											</td>
											<td className='px-4 py-4 text-sm text-gray-700'>
												{category.children && category.children.length > 0
													? `${category.children.length} مورد`
													: '-'}
											</td>
											<td className='px-4 py-4 text-center'>
												<button
													onClick={e => {
														e.stopPropagation();
														navigate(`/manage/categories/${category.id}`);
													}}
													className='px-3 py-1 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors text-sm font-semibold'
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
			{!loading && selectedWarehouse && filteredCount === 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 p-12 text-center'>
					<FolderOpen className='w-16 h-16 text-gray-300 mx-auto mb-4' />
					<p className='text-gray-500 text-lg font-semibold'>
						{getActiveFiltersCount() > 0
							? 'هیچ موردی با فیلترهای انتخابی یافت نشد'
							: 'دسته‌بندی‌ای یافت نشد'}
					</p>
				</div>
			)}

			{/* No Warehouse Selected */}
			{!loading && !selectedWarehouse && (
				<div className='bg-white rounded-xl border-2 border-gray-200 p-12 text-center'>
					<FolderOpen className='w-16 h-16 text-gray-300 mx-auto mb-4' />
					<p className='text-gray-500 text-lg font-semibold'>
						ابتدا انبار را انتخاب کنید
					</p>
				</div>
			)}

			{/* Pagination */}
			{!loading && selectedWarehouse && filteredCount > 0 && (
				<Pagination
					currentPage={currentPage}
					totalItems={filteredCount}
					itemsPerPage={pageSize}
					totalPages={Math.ceil(filteredCount / pageSize)}
					onPageChange={handlePageChange}
				/>
			)}
		</div>
	);
}
