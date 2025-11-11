import { Loader2, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import { capillarySalesLineService } from '../services/api';
import type {
	CapillarySalesLineListItem,
	QueryCapillarySalesLineDto,
} from '../types';
import Pagination from './Pagination';

export default function CapillarySalesLines() {
	const navigate = useNavigate();
	const [salesLines, setSalesLines] = useState<CapillarySalesLineListItem[]>(
		[],
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [totalCount, setTotalCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(20);

	useEffect(() => {
		fetchSalesLines();
	}, [currentPage]);

	const fetchSalesLines = async () => {
		try {
			setLoading(true);
			setError('');
			const query: QueryCapillarySalesLineDto = {
				page: currentPage,
				'page-size': pageSize,
			};

			const response =
				await capillarySalesLineService.getCapillarySalesLines(query);
			setSalesLines(response.data || []);
			setTotalCount(response.count || 0);
		} catch (err: any) {
			console.error('Error fetching sales lines:', err);
			setError(
				err.response?.data?.message || 'خطا در دریافت لیست خط فروش',
			);
		} finally {
			setLoading(false);
		}
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	return (
		<div className='space-y-6 fade-in font-vazir'>
			{/* Header */}
			<div className='bg-white rounded-xl border-2 border-gray-200 p-6'>
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg'>
							<TrendingUp className='w-7 h-7 text-white' />
						</div>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>
								لیست خط فروش
							</h1>
							<p className='text-sm text-gray-600 mt-1'>
								{totalCount} خط فروش ثبت شده
							</p>
						</div>
					</div>
				</div>
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

			{/* Sales Lines Table */}
			{!loading && salesLines.length > 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 overflow-hidden'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className='bg-gray-50 border-b border-gray-200'>
								<tr>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										عنوان
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										شماره خط
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										توضیحات
									</th>
									<th className='px-4 py-3 text-center text-sm font-semibold text-gray-700'>
										عملیات
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-200'>
								{salesLines.map(salesLine => (
									<tr
										key={salesLine.id}
										className='hover:bg-gray-50 transition-colors cursor-pointer'
										onClick={() =>
											navigate(
												`/manage/capillary-sales-lines/${salesLine.id}`,
											)
										}
									>
										<td className='px-4 py-4 text-sm font-semibold text-gray-900'>
											{salesLine.title}
										</td>
										<td className='px-4 py-4'>
											<span className='inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800'>
												خط {salesLine.line_number}
											</span>
										</td>
										<td className='px-4 py-4 text-sm text-gray-700 max-w-xs truncate'>
											{salesLine.description || '-'}
										</td>
										<td className='px-4 py-4 text-center'>
											<button
												onClick={e => {
													e.stopPropagation();
													navigate(
														`/manage/capillary-sales-lines/${salesLine.id}`,
													);
												}}
												className='px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-semibold'
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
			{!loading && salesLines.length === 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 p-12 text-center'>
					<TrendingUp className='w-16 h-16 text-gray-300 mx-auto mb-4' />
					<p className='text-gray-500 text-lg font-semibold'>
						خط فروشی یافت نشد
					</p>
				</div>
			)}

			{/* Pagination */}
			{!loading && salesLines.length > 0 && (
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
