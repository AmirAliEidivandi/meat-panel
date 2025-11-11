import { X } from 'lucide-react';
import { useState } from 'react';
import { walletService } from '../services/api';

interface AddInitialBalanceModalProps {
	isOpen: boolean;
	onClose: () => void;
	customerId: string;
	onSuccess: () => void;
}

export default function AddInitialBalanceModal({
	isOpen,
	onClose,
	customerId,
	onSuccess,
}: AddInitialBalanceModalProps) {
	const [initialBalance, setInitialBalance] = useState<number>(0);
	const [description, setDescription] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (initialBalance === 0) {
			setError('مبلغ بدهی اولیه نمی‌تواند صفر باشد');
			return;
		}

		try {
			setLoading(true);
			await walletService.addCustomerInitialBalance(customerId, {
				initial_balance: initialBalance,
				description: description || undefined,
			});
			onSuccess();
			onClose();
			// Reset form
			setInitialBalance(0);
			setDescription('');
		} catch (err: any) {
			console.error('Error adding initial balance:', err);
			setError(
				err.response?.data?.message ||
					'خطا در ثبت بدهی اولیه. لطفاً دوباره تلاش کنید.',
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
					<h2 className='text-xl font-bold text-gray-900'>ثبت بدهی اولیه</h2>
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

					{/* Initial Balance */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							مبلغ بدهی اولیه (تومان) <span className='text-red-500'>*</span>
						</label>
						<input
							type='number'
							value={initialBalance || ''}
							onChange={e =>
								setInitialBalance(parseFloat(e.target.value) || 0)
							}
							required
							step='0.01'
							className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
							placeholder='مبلغ بدهی اولیه را وارد کنید'
						/>
						<p className='text-xs text-gray-500 mt-1'>
							برای بدهی منفی و برای طلب مثبت وارد کنید
						</p>
					</div>

					{/* Description */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							توضیحات
						</label>
						<textarea
							value={description}
							onChange={e => setDescription(e.target.value)}
							rows={3}
							className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
							placeholder='توضیحات (اختیاری)'
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
							className='px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{loading ? 'در حال ثبت...' : 'ثبت بدهی اولیه'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

