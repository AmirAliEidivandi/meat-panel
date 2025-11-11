import { Activity, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import { logService } from '../services/api';
import type { Log, QueryLogDto } from '../types';
import Pagination from './Pagination';

// Helper functions for Persian labels
const getLevelText = (level: string): string => {
	const textMap: Record<string, string> = {
		ERROR: 'خطا',
		WARN: 'هشدار',
		INFO: 'اطلاعات',
		DEBUG: 'دیباگ',
	};
	return textMap[level] || level;
};

const getLevelColor = (level: string): string => {
	const colorMap: Record<string, string> = {
		ERROR: 'bg-red-100 text-red-800',
		WARN: 'bg-yellow-100 text-yellow-800',
		INFO: 'bg-blue-100 text-blue-800',
		DEBUG: 'bg-gray-100 text-gray-800',
	};
	return colorMap[level] || 'bg-gray-100 text-gray-800';
};

const getStatusCodeColor = (statusCode: number | null): string => {
	if (!statusCode) return 'text-gray-500';
	if (statusCode >= 500) return 'text-red-600';
	if (statusCode >= 400) return 'text-yellow-600';
	if (statusCode >= 300) return 'text-blue-600';
	return 'text-green-600';
};

// Extract only the IP address from the formatted IP string
const extractIpAddress = (ipString: string | null): string => {
	if (!ipString || ipString === 'unknown') return '-';

	// Try to find IP pattern (IPv4 or IPv6)
	// Look for the last IP address in the string (usually the actual client IP)
	const ipv4Pattern = /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/g;
	const matches = ipString.match(ipv4Pattern);

	if (matches && matches.length > 0) {
		// Return the last IP (usually the actual client IP, not the network range)
		return matches[matches.length - 1];
	}

	// If no IPv4 found, try IPv6
	const ipv6Pattern =
		/\b([0-9a-fA-F]{1,4}(?::[0-9a-fA-F]{1,4}){7}|::1|::)\b/g;
	const ipv6Matches = ipString.match(ipv6Pattern);
	if (ipv6Matches && ipv6Matches.length > 0) {
		return ipv6Matches[ipv6Matches.length - 1];
	}

	// If no IP pattern found, return the original string (truncated if too long)
	return ipString.length > 30 ? ipString.substring(0, 30) + '...' : ipString;
};

export default function LogsList() {
	const navigate = useNavigate();
	const [logs, setLogs] = useState<Log[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [totalCount, setTotalCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(20);
	const [searchTerm, setSearchTerm] = useState('');
	const [levelFilter, setLevelFilter] = useState('');
	const [statusCodeFilter, setStatusCodeFilter] = useState('');
	const [methodFilter, setMethodFilter] = useState('');

	useEffect(() => {
		fetchLogs();
	}, [currentPage]);

	useEffect(() => {
		// Reset to page 1 when filters change
		setCurrentPage(1);
		fetchLogs();
	}, [searchTerm, levelFilter, statusCodeFilter, methodFilter]);

	const fetchLogs = async () => {
		try {
			setLoading(true);
			setError('');
			const query: QueryLogDto = {
				page: currentPage,
				'page-size': pageSize,
			};

			if (searchTerm) {
				query.search = searchTerm;
			}

			if (levelFilter) {
				query.level = levelFilter;
			}

			if (statusCodeFilter) {
				query.statusCode = parseInt(statusCodeFilter);
			}

			if (methodFilter) {
				query.method = methodFilter;
			}

			const response = await logService.getLogs(query);
			setLogs(response.data || []);
			setTotalCount(response.count || 0);
		} catch (err: any) {
			console.error('Error fetching logs:', err);
			setError(
				err.response?.data?.message || 'خطا در دریافت لیست لاگ‌ها',
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
		if (levelFilter) count++;
		if (statusCodeFilter) count++;
		if (methodFilter) count++;
		return count;
	};

	return (
		<div className='space-y-6 fade-in font-vazir'>
			{/* Header */}
			<div className='bg-white rounded-xl border-2 border-gray-200 p-6'>
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<div className='w-12 h-12 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg'>
							<Activity className='w-7 h-7 text-white' />
						</div>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>
								لاگ‌ها و رهگیری
							</h1>
							<p className='text-sm text-gray-600 mt-1'>
								{totalCount} لاگ ثبت شده
								{getActiveFiltersCount() > 0 && ' (فیلتر شده)'}
							</p>
						</div>
					</div>
				</div>

				{/* Filters */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							جستجو
						</label>
						<input
							type='text'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							placeholder='جستجو...'
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							سطح
						</label>
						<select
							value={levelFilter}
							onChange={e => setLevelFilter(e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500'
						>
							<option value=''>همه</option>
							<option value='ERROR'>خطا</option>
							<option value='WARN'>هشدار</option>
							<option value='INFO'>اطلاعات</option>
							<option value='DEBUG'>دیباگ</option>
						</select>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							کد وضعیت
						</label>
						<input
							type='number'
							value={statusCodeFilter}
							onChange={e => setStatusCodeFilter(e.target.value)}
							placeholder='کد وضعیت'
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							متد
						</label>
						<select
							value={methodFilter}
							onChange={e => setMethodFilter(e.target.value)}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500'
						>
							<option value=''>همه</option>
							<option value='GET'>GET</option>
							<option value='POST'>POST</option>
							<option value='PUT'>PUT</option>
							<option value='PATCH'>PATCH</option>
							<option value='DELETE'>DELETE</option>
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
								setLevelFilter('');
								setStatusCodeFilter('');
								setMethodFilter('');
								setCurrentPage(1);
							}}
							className='text-sm text-slate-600 hover:text-slate-700 font-semibold'
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
					<Loader2 className='w-8 h-8 text-slate-600 animate-spin' />
					<span className='mr-3 text-gray-600 font-semibold'>
						در حال بارگذاری...
					</span>
				</div>
			)}

			{/* Logs Table */}
			{!loading && logs.length > 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 overflow-hidden'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className='bg-gray-50 border-b border-gray-200'>
								<tr>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										زمان
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										سطح
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										سرویس
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700 min-w-[200px]'>
										مسیر
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700 w-20'>
										متد
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700 w-24'>
										کد وضعیت
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700 w-28'>
										زمان پاسخ
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700 w-32'>
										IP
									</th>
									<th className='px-4 py-3 text-center text-sm font-semibold text-gray-700'>
										عملیات
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-200'>
								{logs.map(log => (
									<tr
										key={log.id}
										className='hover:bg-gray-50 transition-colors cursor-pointer'
										onClick={() => navigate(`/manage/logs/${log.id}`)}
									>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{formatDate(log.created_at)}
										</td>
										<td className='px-4 py-4'>
											<span
												className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getLevelColor(
													log.level,
												)}`}
											>
												{getLevelText(log.level)}
											</span>
										</td>
										<td className='px-4 py-4 text-sm text-gray-700'>
											{log.service}
										</td>
										<td className='px-4 py-4 text-sm text-gray-600 min-w-[200px]'>
											<div className='break-all'>{log.path || '-'}</div>
										</td>
										<td className='px-4 py-4 text-sm text-gray-600'>
											<span className='px-2 py-1 bg-gray-100 rounded text-xs font-mono'>
												{log.method || '-'}
											</span>
										</td>
										<td className='px-4 py-4'>
											{log.status_code ? (
												<span
													className={`text-sm font-semibold ${getStatusCodeColor(
														log.status_code,
													)}`}
												>
													{log.status_code}
												</span>
											) : (
												<span className='text-sm text-gray-400'>-</span>
											)}
										</td>
										<td className='px-4 py-4 text-sm text-gray-600'>
											{log.response_time ? `${log.response_time}ms` : '-'}
										</td>
										<td className='px-4 py-4 text-sm text-gray-600 font-mono'>
											{extractIpAddress(log.ip_address)}
										</td>
										<td className='px-4 py-4 text-center'>
											<button
												onClick={e => {
													e.stopPropagation();
													navigate(`/manage/logs/${log.id}`);
												}}
												className='px-3 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-semibold'
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
			{!loading && logs.length === 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 p-12 text-center'>
					<Activity className='w-16 h-16 text-gray-300 mx-auto mb-4' />
					<p className='text-gray-500 text-lg font-semibold'>
						{getActiveFiltersCount() > 0
							? 'هیچ موردی با فیلترهای انتخابی یافت نشد'
							: 'لاگی یافت نشد'}
					</p>
				</div>
			)}

			{/* Pagination */}
			{!loading && logs.length > 0 && (
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
