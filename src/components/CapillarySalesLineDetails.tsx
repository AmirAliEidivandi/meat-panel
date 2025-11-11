import { ArrowRight, Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import { capillarySalesLineService } from '../services/api';
import type { CapillarySalesLineDetails } from '../types';

export default function CapillarySalesLineDetails() {
	const navigate = useNavigate();
	const { id: salesLineId } = useParams<{ id: string }>();
	const [salesLine, setSalesLine] = useState<CapillarySalesLineDetails | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const fetchSalesLineDetails = async () => {
		if (!salesLineId) return;

		try {
			setLoading(true);
			setError('');
			const data =
				await capillarySalesLineService.getCapillarySalesLineById(
					salesLineId,
				);

			if (!data || !data.id) {
				throw new Error('Invalid sales line data received');
			}

			setSalesLine(data);
		} catch (err: any) {
			console.error('Error fetching sales line details:', err);
			setError(
				err?.message || 'خطا در بارگذاری جزئیات خط فروش',
			);
			setSalesLine(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (salesLineId) {
			fetchSalesLineDetails();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [salesLineId]);

	if (!salesLineId) {
		return (
			<div className='text-center py-12'>
				<div className='text-red-500 mb-4'>شناسه خط فروش یافت نشد</div>
				<button
					onClick={() => navigate('/manage/capillary-sales-lines')}
					className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors'
				>
					بازگشت به لیست
				</button>
			</div>
		);
	}

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<Loader2 className='w-8 h-8 text-purple-600 animate-spin' />
				<span className='mr-3 text-gray-600 font-semibold'>
					در حال بارگذاری...
				</span>
			</div>
		);
	}

	if (error && !salesLine) {
		return (
			<div className='text-center py-12'>
				<div className='text-red-500 mb-4'>{error}</div>
				<button
					onClick={fetchSalesLineDetails}
					className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors mr-2'
				>
					تلاش مجدد
				</button>
				<button
					onClick={() => navigate('/manage/capillary-sales-lines')}
					className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
				>
					بازگشت به لیست
				</button>
			</div>
		);
	}

	if (!salesLine) {
		return (
			<div className='text-center py-12'>
				<div className='text-red-500 mb-4'>خط فروش یافت نشد</div>
				<button
					onClick={() => navigate('/manage/capillary-sales-lines')}
					className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors'
				>
					بازگشت به لیست
				</button>
			</div>
		);
	}

	return (
		<div className='fade-in font-vazir max-w-7xl mx-auto'>
			{/* Header */}
			<div className='mb-8'>
				<button
					onClick={() => navigate('/manage/capillary-sales-lines')}
					className='mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm'
				>
					<ArrowRight className='w-4 h-4 ml-2' />
					بازگشت
				</button>
				<div className='flex items-start justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900 mb-2'>
							{salesLine?.title || 'بدون نام'}
						</h1>
						<p className='text-gray-500'>جزئیات خط فروش</p>
					</div>
					<button
						onClick={fetchSalesLineDetails}
						className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold flex items-center space-x-reverse space-x-2 text-sm'
					>
						<RefreshCw className='w-4 h-4' />
						<span>بروزرسانی</span>
					</button>
				</div>
			</div>

			{/* Summary Cards */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center'>
							<TrendingUp className='w-4 h-4 text-purple-600' />
						</div>
						<h3 className='font-bold text-gray-900'>شماره خط</h3>
					</div>
					<p className='text-xl font-bold text-purple-600'>
						خط {salesLine?.line_number ?? 'N/A'}
					</p>
				</div>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center'>
							<TrendingUp className='w-4 h-4 text-blue-600' />
						</div>
						<h3 className='font-bold text-gray-900'>شعبه</h3>
					</div>
					<p className='text-sm font-semibold text-gray-900'>
						{salesLine?.branch?.name || 'ثبت نشده'}
					</p>
				</div>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center'>
							<TrendingUp className='w-4 h-4 text-green-600' />
						</div>
						<h3 className='font-bold text-gray-900'>تاریخ ایجاد</h3>
					</div>
					<p className='text-sm font-semibold text-gray-900'>
						{salesLine?.created_at
							? formatDate(salesLine.created_at)
							: 'N/A'}
					</p>
				</div>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center'>
							<TrendingUp className='w-4 h-4 text-orange-600' />
						</div>
						<h3 className='font-bold text-gray-900'>وضعیت</h3>
					</div>
					<p className='text-sm font-semibold text-green-600'>فعال</p>
				</div>
			</div>

			{/* Description */}
			<div className='bg-white rounded-xl border border-gray-200 p-6'>
				<div className='flex items-center space-x-reverse space-x-2 mb-5'>
					<div className='w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center'>
						<TrendingUp className='w-4 h-4 text-indigo-600' />
					</div>
					<h3 className='font-bold text-gray-900'>توضیحات</h3>
				</div>
				<div>
					<p className='text-sm text-gray-900 leading-relaxed'>
						{salesLine?.description || 'توضیحاتی ثبت نشده است'}
					</p>
				</div>
			</div>
		</div>
	);
}

