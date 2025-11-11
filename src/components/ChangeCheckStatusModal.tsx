import { Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { accountantsService } from '../services/api';

interface ChangeCheckStatusModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	checkId: string;
	currentStatus: string;
}

const checkStatusOptions = [
	{
		value: 'RECEIVED_BY_ACCOUNTING',
		label: 'دریافت چک توسط حسابداری',
	},
	{
		value: 'DELIVERED_TO_PROCUREMENT',
		label: 'تحویل به کارپرداز',
	},
	{
		value: 'DELIVERED_TO_BANK',
		label: 'تحویل به بانک',
	},
	{
		value: 'CLEARED',
		label: 'پاس شده',
	},
	{
		value: 'RETURNED',
		label: 'برگشت خورده',
	},
];

export default function ChangeCheckStatusModal({
	isOpen,
	onClose,
	onSuccess,
	checkId,
	currentStatus,
}: ChangeCheckStatusModalProps) {
	const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (selectedStatus === currentStatus) {
			onClose();
			return;
		}

		try {
			setLoading(true);
			await accountantsService.changeCheckStatus(checkId, selectedStatus);
			onSuccess();
		} catch (err: any) {
			console.error('Error changing check status:', err);
			setError(
				err.response?.data?.message ||
					'خطا در تغییر وضعیت چک. لطفاً دوباره تلاش کنید.',
			);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div
			className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'
			onClick={e => {
				if (e.target === e.currentTarget) {
					onClose();
				}
			}}
		>
			<div className='bg-white rounded-xl border-2 border-gray-200 p-6 max-w-md w-full'>
				<div className='flex items-center justify-between mb-6'>
					<h2 className='text-2xl font-bold text-gray-900'>
						تغییر وضعیت چک
					</h2>
					<button
						onClick={onClose}
						className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
					>
						<X className='w-6 h-6 text-gray-600' />
					</button>
				</div>

				{error && (
					<div className='bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4'>
						<p className='text-red-800 font-semibold'>{error}</p>
					</div>
				)}

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							وضعیت جدید *
						</label>
						<select
							value={selectedStatus}
							onChange={e => setSelectedStatus(e.target.value)}
							required
							className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
						>
							{checkStatusOptions.map(option => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>

					{/* Actions */}
					<div className='flex items-center justify-end space-x-reverse space-x-3 pt-4'>
						<button
							type='button'
							onClick={onClose}
							disabled={loading}
							className='px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-semibold'
						>
							انصراف
						</button>
						<button
							type='submit'
							disabled={loading}
							className='px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 transition-all font-semibold flex items-center space-x-reverse space-x-2'
						>
							{loading ? (
								<>
									<Loader2 className='w-5 h-5 animate-spin' />
									<span>در حال ذخیره...</span>
								</>
							) : (
								<span>ذخیره</span>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

