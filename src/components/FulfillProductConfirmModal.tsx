import { AlertCircle, CheckCircle, Package, X } from 'lucide-react';
import { useState } from 'react';
import { orderService } from '../services/api';

interface FulfillProductConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	orderId: string;
	productId: string;
	productTitle: string;
}

export default function FulfillProductConfirmModal({
	isOpen,
	onClose,
	onSuccess,
	orderId,
	productId,
	productTitle,
}: FulfillProductConfirmModalProps) {
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');

	const handleConfirm = async () => {
		try {
			setSubmitting(true);
			setError('');
			await orderService.fulfillProduct(orderId, productId);
			onSuccess();
			onClose();
		} catch (err: any) {
			console.error('Error fulfilling product:', err);
			setError(
				err.response?.data?.message || 'خطا در ثبت تحویل محصول',
			);
		} finally {
			setSubmitting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
			<div className='bg-white rounded-xl shadow-2xl max-w-md w-full mx-4'>
				{/* Header */}
				<div className='flex items-center justify-between p-6 border-b border-gray-200'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<Package className='w-6 h-6 text-green-600' />
						<h2 className='text-xl font-bold text-gray-900'>
							تایید تحویل محصول
						</h2>
					</div>
					<button
						onClick={onClose}
						className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
					>
						<X className='w-5 h-5 text-gray-600' />
					</button>
				</div>

				{/* Content */}
				<div className='p-6 space-y-4'>
					{error && (
						<div className='bg-red-50 border border-red-200 rounded-lg p-4'>
							<p className='text-red-600 flex items-center space-x-reverse space-x-2'>
								<AlertCircle className='w-5 h-5' />
								<span>{error}</span>
							</p>
						</div>
					)}

					<div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
						<p className='text-yellow-800 font-semibold mb-2'>
							آیا مطمئن هستید که می‌خواهید این محصول را به تحویل داده شده
							تغییر دهید؟
						</p>
						<div className='bg-white rounded-lg p-3 mt-3'>
							<p className='text-sm text-gray-600 mb-1'>محصول:</p>
							<p className='text-base font-bold text-gray-900'>{productTitle}</p>
						</div>
					</div>

					<div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
						<p className='text-sm text-blue-800'>
							پس از تایید، وضعیت این محصول به "تحویل داده شده" تغییر خواهد کرد و
							در صورت تکمیل تمام محصولات، وضعیت سفارش نیز به‌روزرسانی
							خواهد شد.
						</p>
					</div>
				</div>

				{/* Footer */}
				<div className='flex items-center justify-end space-x-reverse space-x-3 p-6 border-t border-gray-200'>
					<button
						onClick={onClose}
						disabled={submitting}
						className='px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
					>
						انصراف
					</button>
					<button
						onClick={handleConfirm}
						disabled={submitting}
						className='px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-reverse space-x-2'
					>
						{submitting ? (
							<>
								<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
								<span>در حال ثبت...</span>
							</>
						) : (
							<>
								<CheckCircle className='w-5 h-5' />
								<span>تایید و ثبت</span>
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}

