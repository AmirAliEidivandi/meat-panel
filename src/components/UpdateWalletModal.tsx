import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { walletService } from '../services/api';
import { formatCurrency } from '../lib/utils';
import type { UpdateWalletDto } from '../types';

interface UpdateWalletModalProps {
	isOpen: boolean;
	onClose: () => void;
	walletId: string;
	currentBalance: number;
	currentCreditCap: number;
	onSuccess: () => void;
}

export default function UpdateWalletModal({
	isOpen,
	onClose,
	walletId,
	currentBalance,
	currentCreditCap,
	onSuccess,
}: UpdateWalletModalProps) {
	const [balance, setBalance] = useState<string>(currentBalance.toString());
	const [creditCap, setCreditCap] = useState<string>(currentCreditCap.toString());
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (isOpen) {
			setBalance(currentBalance.toString());
			setCreditCap(currentCreditCap.toString());
			setError('');
		}
	}, [isOpen, currentBalance, currentCreditCap]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		// Convert string to number
		const balanceNum = parseFloat(balance) || 0;
		const creditCapNum = parseFloat(creditCap) || 0;

		if (creditCapNum < 0) {
			setError('حد اعتبار نمی‌تواند منفی باشد');
			return;
		}

		try {
			setLoading(true);
			const data: UpdateWalletDto = {};
			
			// Only include fields that have changed
			if (balanceNum !== currentBalance) {
				data.balance = balanceNum;
			}
			if (creditCapNum !== currentCreditCap) {
				data.credit_cap = creditCapNum;
			}

			// If no changes, just close
			if (Object.keys(data).length === 0) {
				onClose();
				return;
			}

			await walletService.updateWallet(walletId, data);
			onSuccess();
			onClose();
		} catch (err: any) {
			console.error('Error updating wallet:', err);
			setError(
				err.response?.data?.message ||
					'خطا در به‌روزرسانی کیف پول. لطفاً دوباره تلاش کنید.',
			);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
			<div className='bg-white rounded-xl shadow-xl w-full max-w-md'>
				{/* Header */}
				<div className='flex items-center justify-between p-6 border-b border-gray-200'>
					<h2 className='text-xl font-bold text-gray-900'>ویرایش کیف پول</h2>
					<button
						onClick={onClose}
						disabled={loading}
						className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50'
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

					{/* Current Balance */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							موجودی فعلی
						</label>
						<div className='w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50'>
							{formatCurrency(currentBalance)}
						</div>
					</div>

					{/* New Balance */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							موجودی جدید (تومان) <span className='text-red-500'>*</span>
						</label>
						<input
							type='number'
							value={balance}
							onChange={e => setBalance(e.target.value)}
							required
							step='0.01'
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
							placeholder='موجودی جدید را وارد کنید'
						/>
					</div>

					{/* Current Credit Cap */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							حد اعتبار فعلی
						</label>
						<div className='w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50'>
							{formatCurrency(currentCreditCap)}
						</div>
					</div>

					{/* New Credit Cap */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							حد اعتبار جدید (تومان) <span className='text-red-500'>*</span>
						</label>
						<input
							type='number'
							value={creditCap}
							onChange={e => setCreditCap(e.target.value)}
							required
							min='0'
							step='0.01'
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
							placeholder='حد اعتبار جدید را وارد کنید'
						/>
					</div>

					{/* Actions */}
					<div className='flex items-center space-x-reverse space-x-3 pt-4'>
						<button
							type='button'
							onClick={onClose}
							disabled={loading}
							className='flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50'
						>
							انصراف
						</button>
						<button
							type='submit'
							disabled={loading}
							className='flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center space-x-reverse space-x-2'
						>
							{loading ? (
								<>
									<Loader2 className='w-5 h-5 animate-spin' />
									<span>در حال ذخیره...</span>
								</>
							) : (
								<span>ذخیره تغییرات</span>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

