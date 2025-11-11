import { X, CreditCard, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { paymentService } from '../../services/api';

interface TopupModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (redirectUrl: string) => void;
}

export default function TopupModal({
	isOpen,
	onClose,
	onSuccess,
}: TopupModalProps) {
	const [amount, setAmount] = useState('');
	const [description, setDescription] = useState('');
	const [gateway, setGateway] = useState<'zarinpal' | 'zibal'>('zarinpal');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		const amountNum = parseInt(amount.replace(/,/g, ''));
		if (!amountNum || amountNum < 1000) {
			setError('مبلغ باید حداقل ۱۰۰۰ ریال باشد');
			return;
		}

		try {
			setLoading(true);
			let response;

			if (gateway === 'zarinpal') {
				response = await paymentService.zarinpalInitiateWalletTopup(
					amountNum,
					description || undefined,
				);
			} else {
				response = await paymentService.zibalInitiateWalletTopup(
					amountNum,
					description || undefined,
				);
			}

			// Redirect to payment gateway
			if (response.redirect_url) {
				onSuccess(response.redirect_url);
			} else {
				setError('خطا در دریافت لینک پرداخت');
			}
		} catch (err: any) {
			console.error('Error initiating topup:', err);
			setError(
				err.response?.data?.message || 'خطا در ایجاد تراکنش پرداخت',
			);
		} finally {
			setLoading(false);
		}
	};

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/,/g, '');
		if (/^\d*$/.test(value)) {
			setAmount(value);
		}
	};

	const formatAmount = (value: string) => {
		return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
			<div className='bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
				{/* Header */}
				<div className='flex items-center justify-between p-6 border-b border-gray-200'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
							<CreditCard className='w-5 h-5 text-green-600' />
						</div>
						<h3 className='text-xl font-bold text-gray-900'>افزایش موجودی</h3>
					</div>
					<button
						onClick={onClose}
						className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
					>
						<X className='w-5 h-5 text-gray-600' />
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className='p-6 space-y-6'>
					{/* Error Message */}
					{error && (
						<div className='bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start space-x-reverse space-x-3'>
							<AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
							<p className='text-sm text-red-700'>{error}</p>
						</div>
					)}

					{/* Amount Input */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							مبلغ (ریال)
						</label>
						<input
							type='text'
							value={formatAmount(amount)}
							onChange={handleAmountChange}
							placeholder='مثال: 100000'
							className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none text-lg font-semibold'
							required
						/>
						<p className='text-xs text-gray-500 mt-2'>
							حداقل مبلغ: ۱۰۰۰ ریال
						</p>
					</div>

					{/* Description Input */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							توضیحات (اختیاری)
						</label>
						<textarea
							value={description}
							onChange={e => setDescription(e.target.value)}
							placeholder='توضیحات تراکنش...'
							rows={3}
							className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none resize-none'
						/>
					</div>

					{/* Gateway Selection */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-3'>
							انتخاب درگاه پرداخت
						</label>
						<div className='grid grid-cols-2 gap-3'>
							<button
								type='button'
								onClick={() => setGateway('zarinpal')}
								className={`px-4 py-3 rounded-lg border-2 transition-all font-semibold ${
									gateway === 'zarinpal'
										? 'border-green-500 bg-green-50 text-green-700'
										: 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
								}`}
							>
								زرین‌پال
							</button>
							<button
								type='button'
								onClick={() => setGateway('zibal')}
								className={`px-4 py-3 rounded-lg border-2 transition-all font-semibold ${
									gateway === 'zibal'
										? 'border-green-500 bg-green-50 text-green-700'
										: 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
								}`}
							>
								زیبال
							</button>
						</div>
					</div>

					{/* Actions */}
					<div className='flex items-center space-x-reverse space-x-3 pt-4'>
						<button
							type='button'
							onClick={onClose}
							className='flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors'
						>
							انصراف
						</button>
						<button
							type='submit'
							disabled={loading || !amount}
							className='flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg'
						>
							{loading ? 'در حال پردازش...' : 'ادامه به درگاه پرداخت'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

