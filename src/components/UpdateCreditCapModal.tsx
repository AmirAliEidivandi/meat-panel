import { X } from 'lucide-react';
import { useState } from 'react';
import { walletService } from '../services/api';

interface UpdateCreditCapModalProps {
	isOpen: boolean;
	onClose: () => void;
	customerId: string;
	currentCreditCap: number;
	onSuccess: () => void;
}

export default function UpdateCreditCapModal({
	isOpen,
	onClose,
	customerId,
	currentCreditCap,
	onSuccess,
}: UpdateCreditCapModalProps) {
	const [creditCap, setCreditCap] = useState<number>(currentCreditCap);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (creditCap < 0) {
			setError('حد اعتبار نمی‌تواند منفی باشد');
			return;
		}

		try {
			setLoading(true);
			await walletService.updateCustomerCreditCap(customerId, creditCap);
			onSuccess();
			onClose();
			setCreditCap(currentCreditCap);
		} catch (err: any) {
			console.error('Error updating credit cap:', err);
			setError(
				err.response?.data?.message ||
					'خطا در به‌روزرسانی حد اعتبار. لطفاً دوباره تلاش کنید.',
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
					<h2 className='text-xl font-bold text-gray-900'>تعیین حد اعتبار</h2>
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

					{/* Current Credit Cap */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							حد اعتبار فعلی
						</label>
						<div className='w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50'>
							{new Intl.NumberFormat('fa-IR', {
								style: 'currency',
								currency: 'IRR',
								minimumFractionDigits: 0,
							}).format(currentCreditCap)}
						</div>
					</div>

					{/* New Credit Cap */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							حد اعتبار جدید (تومان) <span className='text-red-500'>*</span>
						</label>
						<input
							type='number'
							value={creditCap || ''}
							onChange={e =>
								setCreditCap(parseFloat(e.target.value) || 0)
							}
							required
							min='0'
							step='0.01'
							className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
							placeholder='حد اعتبار جدید را وارد کنید'
						/>
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
							disabled={loading}
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

