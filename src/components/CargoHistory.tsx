import { Loader2, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import { historyService } from '../services/api';
import type {
	CargoHistory as CargoHistoryType,
	QueryCargoHistoryDto,
} from '../types';
import Pagination from './Pagination';

// Helper functions for Persian labels
const getChangeTypeText = (changeType: string | null): string => {
	const types: Record<string, string> = {
		STATUS_CHANGED: 'تغییر وضعیت',
		DRIVER_CHANGED: 'تغییر راننده',
		TRUCK_CHANGED: 'تغییر کامیون',
		WAREHOUSE_CHANGED: 'تغییر انبار',
		DELIVERY_DATE_CHANGED: 'تغییر تاریخ تحویل',
		CREATED: 'ایجاد مرسوله',
		UPDATED: 'بروزرسانی',
		DELETED: 'حذف مرسوله',
		RESTORED: 'بازیابی مرسوله',
	};
	return types[changeType || ''] || 'تغییر نامشخص';
};

const getChangeTypeColor = (changeType: string | null): string => {
	const colorMap: Record<string, string> = {
		STATUS_CHANGED: 'bg-blue-100 text-blue-800',
		DRIVER_CHANGED: 'bg-orange-100 text-orange-800',
		TRUCK_CHANGED: 'bg-purple-100 text-purple-800',
		WAREHOUSE_CHANGED: 'bg-teal-100 text-teal-800',
		DELIVERY_DATE_CHANGED: 'bg-cyan-100 text-cyan-800',
		CREATED: 'bg-green-100 text-green-800',
		UPDATED: 'bg-gray-100 text-gray-800',
		DELETED: 'bg-red-100 text-red-800',
		RESTORED: 'bg-green-100 text-green-800',
	};
	return colorMap[changeType || ''] || 'bg-gray-100 text-gray-800';
};

export default function CargoHistory() {
	const navigate = useNavigate();
	const [histories, setHistories] = useState<CargoHistoryType[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [filters, setFilters] = useState<QueryCargoHistoryDto>({
		page: 1,
		'page-size': 20,
	});

	useEffect(() => {
		fetchHistories();
	}, [filters]);

	const fetchHistories = async () => {
		try {
			setLoading(true);
			setError('');
			const query: QueryCargoHistoryDto = {
				page: filters.page || currentPage,
				'page-size': filters['page-size'] || 20,
				...filters,
			};
			const response = await historyService.getCargoHistory(query);
			setHistories(response.data || []);
			setTotalCount(response.count || 0);
		} catch (err: any) {
			console.error('Error fetching cargo history:', err);
			setError(
				err.response?.data?.message || 'خطا در دریافت تاریخچه مرسوله‌ها',
			);
		} finally {
			setLoading(false);
		}
	};

	const handlePageChange = (page: number) => {
		setFilters(prev => ({ ...prev, page }));
		setCurrentPage(page);
	};

	const handleFilterChange = (
		key: keyof QueryCargoHistoryDto,
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
		if (filters.cargo_id) count++;
		if (filters.employee_id) count++;
		if (filters.change_type) count++;
		if (filters.deleted_changed === true) count++;
		if (filters.by_system !== undefined) count++;
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
						<div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg'>
							<Package className='w-7 h-7 text-white' />
						</div>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>
								تاریخچه مرسوله‌ها
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
							کد مرسوله
						</label>
						<input
							type='text'
							value={filters.cargo_id || ''}
							onChange={e => handleFilterChange('cargo_id', e.target.value)}
							placeholder='جستجو...'
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							نوع تغییر
						</label>
						<select
							value={filters.change_type || ''}
							onChange={e => handleFilterChange('change_type', e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
						>
							<option value=''>همه</option>
							<option value='CREATED'>ایجاد مرسوله</option>
							<option value='STATUS_CHANGED'>تغییر وضعیت</option>
							<option value='DRIVER_CHANGED'>تغییر راننده</option>
							<option value='TRUCK_CHANGED'>تغییر کامیون</option>
							<option value='WAREHOUSE_CHANGED'>تغییر انبار</option>
							<option value='DELIVERY_DATE_CHANGED'>تغییر تاریخ تحویل</option>
							<option value='UPDATED'>بروزرسانی</option>
							<option value='DELETED'>حذف مرسوله</option>
							<option value='RESTORED'>بازیابی مرسوله</option>
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
										کد مرسوله
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										تاریخ تحویل
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
											navigate(`/manage/cargo-history/${history.id}`)
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
											{history.cargo_id
												? `#${(history as any).new_cargo?.code || (history as any).cargo?.code || history.cargo_id}`
												: '-'}
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{history.date_after
												? formatDate(history.date_after)
												: history.date_before
												? formatDate(history.date_before)
												: '-'}
										</td>
										<td className='px-4 py-4'>
											<span
												className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
													history.by_system
														? 'bg-blue-100 text-blue-800'
														: 'bg-indigo-100 text-indigo-800'
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
													navigate(`/manage/cargo-history/${history.id}`);
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
					<Package className='w-16 h-16 text-gray-300 mx-auto mb-4' />
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
