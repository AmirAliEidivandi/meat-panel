import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { customerService, employeeService } from '../services/api';
import type { GetSellersResponse } from '../types';

interface UpdateSellerModalProps {
	isOpen: boolean;
	onClose: () => void;
	customerId: string;
	currentSellerId?: string;
	onSuccess: () => void;
}

export default function UpdateSellerModal({
	isOpen,
	onClose,
	customerId,
	currentSellerId,
	onSuccess,
}: UpdateSellerModalProps) {
	const [sellers, setSellers] = useState<GetSellersResponse[]>([]);
	const [selectedSellerId, setSelectedSellerId] = useState<string>(
		currentSellerId || '',
	);
	const [loading, setLoading] = useState(false);
	const [fetchingSellers, setFetchingSellers] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (isOpen) {
			fetchSellers();
			setSelectedSellerId(currentSellerId || '');
		}
	}, [isOpen, currentSellerId]);

	const fetchSellers = async () => {
		try {
			setFetchingSellers(true);
			setError('');
			const data = await employeeService.getSellers();
			setSellers(data || []);
		} catch (err: any) {
			console.error('Error fetching sellers:', err);
			setError(
				err.response?.data?.message || 'خطا در دریافت لیست فروشندگان',
			);
		} finally {
			setFetchingSellers(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (!selectedSellerId) {
			setError('لطفاً یک فروشنده انتخاب کنید');
			return;
		}

		try {
			setLoading(true);
			await customerService.updateSeller(customerId, selectedSellerId);
			onSuccess();
			onClose();
		} catch (err: any) {
			console.error('Error updating seller:', err);
			setError(
				err.response?.data?.message ||
					'خطا در به‌روزرسانی فروشنده. لطفاً دوباره تلاش کنید.',
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
						ویرایش فروشنده مشتری
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

					{/* Sellers List */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							انتخاب فروشنده <span className='text-red-500'>*</span>
						</label>
						{fetchingSellers ? (
							<div className='flex items-center justify-center py-8'>
								<Loader2 className='w-6 h-6 text-blue-600 animate-spin' />
								<span className='mr-3 text-gray-600'>در حال بارگذاری...</span>
							</div>
						) : (
							<select
								value={selectedSellerId}
								onChange={e => setSelectedSellerId(e.target.value)}
								required
								className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							>
								<option value=''>انتخاب فروشنده</option>
								{sellers.map(seller => (
									<option key={seller.id} value={seller.id}>
										{seller.profile.first_name} {seller.profile.last_name}
										{seller.capillary_sales_lines.length > 0 &&
											` - خط ${seller.capillary_sales_lines.map(l => l.line_number).join(', ')}`}
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
							disabled={loading || fetchingSellers}
							className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{loading ? 'در حال به‌روزرسانی...' : 'به‌روزرسانی'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

