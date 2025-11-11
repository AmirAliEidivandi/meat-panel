import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
	capillarySalesLineService,
	customerService,
} from '../services/api';
import type { CapillarySalesLineListItem } from '../types';

interface UpdateCapillarySalesLineModalProps {
	isOpen: boolean;
	onClose: () => void;
	customerId: string;
	currentCapillarySalesLineId?: string;
	onSuccess: () => void;
}

export default function UpdateCapillarySalesLineModal({
	isOpen,
	onClose,
	customerId,
	currentCapillarySalesLineId,
	onSuccess,
}: UpdateCapillarySalesLineModalProps) {
	const [salesLines, setSalesLines] = useState<CapillarySalesLineListItem[]>(
		[],
	);
	const [selectedSalesLineId, setSelectedSalesLineId] = useState<string>(
		currentCapillarySalesLineId || '',
	);
	const [loading, setLoading] = useState(false);
	const [fetchingSalesLines, setFetchingSalesLines] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (isOpen) {
			fetchSalesLines();
			setSelectedSalesLineId(currentCapillarySalesLineId || '');
		}
	}, [isOpen, currentCapillarySalesLineId]);

	const fetchSalesLines = async () => {
		try {
			setFetchingSalesLines(true);
			setError('');
			const response =
				await capillarySalesLineService.getCapillarySalesLines({
					page: 1,
					'page-size': 1000, // Get all sales lines
				});
			setSalesLines(response.data || []);
		} catch (err: any) {
			console.error('Error fetching sales lines:', err);
			setError(
				err.response?.data?.message || 'خطا در دریافت لیست خط فروش',
			);
		} finally {
			setFetchingSalesLines(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (!selectedSalesLineId) {
			setError('لطفاً یک خط فروش انتخاب کنید');
			return;
		}

		try {
			setLoading(true);
			await customerService.updateCapillarySalesLine(
				customerId,
				selectedSalesLineId,
			);
			onSuccess();
			onClose();
		} catch (err: any) {
			console.error('Error updating capillary sales line:', err);
			setError(
				err.response?.data?.message ||
					'خطا در به‌روزرسانی خط فروش. لطفاً دوباره تلاش کنید.',
			);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
			<div className='bg-white rounded-xl shadow-xl w-full max-w-md mx-4'>
				{/* Header */}
				<div className='flex items-center justify-between p-6 border-b border-gray-200'>
					<h2 className='text-xl font-bold text-gray-900'>
						ویرایش خط فروش مشتری
					</h2>
					<button
						onClick={onClose}
						className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors'
					>
						<X className='w-5 h-5 text-gray-500' />
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className='p-6 space-y-4'>
					{error && (
						<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
							{error}
						</div>
					)}

					{/* Sales Lines List */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							انتخاب خط فروش <span className='text-red-500'>*</span>
						</label>
						{fetchingSalesLines ? (
							<div className='flex items-center justify-center py-8'>
								<Loader2 className='w-6 h-6 text-purple-600 animate-spin' />
								<span className='mr-3 text-gray-600'>در حال بارگذاری...</span>
							</div>
						) : (
							<select
								value={selectedSalesLineId}
								onChange={e => setSelectedSalesLineId(e.target.value)}
								required
								className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
							>
								<option value=''>انتخاب خط فروش</option>
								{salesLines.map(salesLine => (
									<option key={salesLine.id} value={salesLine.id}>
										{salesLine.title} - خط {salesLine.line_number}
									</option>
								))}
							</select>
						)}
					</div>

					{/* Actions */}
					<div className='flex items-center justify-end space-x-reverse space-x-3 pt-4'>
						<button
							type='button'
							onClick={onClose}
							className='px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
						>
							انصراف
						</button>
						<button
							type='submit'
							disabled={loading || fetchingSalesLines}
							className='px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{loading ? 'در حال به‌روزرسانی...' : 'به‌روزرسانی'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

