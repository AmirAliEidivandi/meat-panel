import { X } from 'lucide-react';
// @ts-ignore - jalaali-js doesn't have type definitions
import { jalaaliToDateObject, toJalaali } from 'jalaali-js';
import { useState } from 'react';
import { paymentService } from '../services/api';
import type { CreatePaymentDto } from '../types';
import PersianDatePicker from './PersianDatePicker';

interface CreatePaymentModalProps {
	isOpen: boolean;
	onClose: () => void;
	customerId: string;
	onSuccess: () => void;
}

export default function CreatePaymentModal({
	isOpen,
	onClose,
	customerId,
	onSuccess,
}: CreatePaymentModalProps) {
	// Get today's date in Persian format for initial value
	const getTodayPersian = () => {
		const today = new Date();
		const jalaali = toJalaali(today);
		return `${jalaali.jy}/${String(jalaali.jm).padStart(2, '0')}/${String(jalaali.jd).padStart(2, '0')}`;
	};

	const [formData, setFormData] = useState<CreatePaymentDto>({
		amount: 0,
		customer_id: customerId,
		method: 'CASH',
		description: null,
		date: getTodayPersian(),
		// cheque_due_date: null,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const paymentMethods = [
		{ value: 'CASH', label: 'نقدی' },
		{ value: 'DEPOSIT_TO_ACCOUNT', label: 'واریز به حساب' },
		{ value: 'CHEQUE', label: 'چک' },
		{ value: 'ONLINE', label: 'آنلاین' },
	];

	const convertPersianToGregorian = (persianDate: string): string => {
		if (!persianDate || persianDate.trim() === '') {
			throw new Error('تاریخ خالی است');
		}

		const dateParts = persianDate.split('/');
		if (dateParts.length !== 3) {
			throw new Error('فرمت تاریخ نامعتبر است');
		}

		const persianYear = parseInt(dateParts[0]);
		const persianMonth = parseInt(dateParts[1]);
		const persianDay = parseInt(dateParts[2]);

		if (
			isNaN(persianYear) ||
			isNaN(persianMonth) ||
			isNaN(persianDay) ||
			persianYear < 1300 ||
			persianYear > 1500 ||
			persianMonth < 1 ||
			persianMonth > 12 ||
			persianDay < 1 ||
			persianDay > 31
		) {
			throw new Error('تاریخ وارد شده نامعتبر است');
		}

		try {
			// Convert Persian date to Gregorian Date object (this sets time to 00:00:00)
			const dateObj = jalaaliToDateObject(
				persianYear,
				persianMonth,
				persianDay,
			);
			if (!dateObj || isNaN(dateObj.getTime())) {
				throw new Error('تاریخ ایجاد شده نامعتبر است');
			}

			// Preserve current time (hours, minutes, seconds, milliseconds) to maintain chronological order
			const now = new Date();
			dateObj.setHours(now.getHours());
			dateObj.setMinutes(now.getMinutes());
			dateObj.setSeconds(now.getSeconds());
			dateObj.setMilliseconds(now.getMilliseconds());

			return dateObj.toISOString();
		} catch (err: any) {
			throw new Error(
				'خطا در تبدیل تاریخ: ' + (err.message || 'تاریخ نامعتبر است'),
			);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (formData.amount <= 0) {
			setError('مبلغ باید بیشتر از صفر باشد');
			return;
		}

		if (formData.method === 'CHEQUE' && !formData.cheque_due_date) {
			setError('برای چک، تاریخ سررسید الزامی است');
			return;
		}

		try {
			setLoading(true);

			// Convert Persian dates to Gregorian (ISO string)
			let gregorianDate: string;
			let gregorianChequeDate: string | undefined = undefined;

			try {
				gregorianDate = convertPersianToGregorian(formData.date);
			} catch (err: any) {
				setError(err.message || 'خطا در تبدیل تاریخ پرداخت');
				setLoading(false);
				return;
			}

			if (formData.cheque_due_date) {
				try {
					gregorianChequeDate = convertPersianToGregorian(
						formData.cheque_due_date,
					);
				} catch (err: any) {
					setError(err.message || 'خطا در تبدیل تاریخ سررسید چک');
					setLoading(false);
					return;
				}
			}

			// Create payment with Gregorian dates
			await paymentService.createPayment({
				...formData,
				date: gregorianDate,
				cheque_due_date: gregorianChequeDate,
			});

			onSuccess();
			onClose();
			// Reset form
			setFormData({
				amount: 0,
				customer_id: customerId,
				method: 'CASH',
				description: null,
				date: getTodayPersian(),
				// cheque_due_date: null,
			});
		} catch (err: any) {
			console.error('Error creating payment:', err);
			setError(
				err.response?.data?.message ||
					'خطا در ثبت پرداخت. لطفاً دوباره تلاش کنید.',
			);
		} finally {
			setLoading(false);
		}
	};

	const handleDateChange = (date: string) => {
		setFormData(prev => ({ ...prev, date }));
	};

	const handleChequeDateChange = (date: string) => {
		setFormData(prev => ({ ...prev, cheque_due_date: date }));
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
			<div className='bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto'>
				{/* Header */}
				<div className='flex items-center justify-between p-6 border-b border-gray-200'>
					<h2 className='text-xl font-bold text-gray-900'>ثبت پرداخت</h2>
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

					{/* Amount */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							مبلغ (تومان) <span className='text-red-500'>*</span>
						</label>
						<input
							type='number'
							value={formData.amount || ''}
							onChange={e =>
								setFormData(prev => ({
									...prev,
									amount: parseFloat(e.target.value) || 0,
								}))
							}
							required
							min='0'
							step='0.01'
							className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
							placeholder='مبلغ را وارد کنید'
						/>
					</div>

					{/* Payment Method */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							روش پرداخت <span className='text-red-500'>*</span>
						</label>
						<select
							value={formData.method}
							onChange={e =>
								setFormData(prev => ({
									...prev,
									method: e.target.value as any,
									// cheque_due_date:
									// 	e.target.value !== 'CHEQUE' ? null : prev.cheque_due_date,
								}))
							}
							required
							className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
						>
							{paymentMethods.map(method => (
								<option key={method.value} value={method.value}>
									{method.label}
								</option>
							))}
						</select>
					</div>

					{/* Date */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							تاریخ پرداخت <span className='text-red-500'>*</span>
						</label>
						<PersianDatePicker
							value={formData.date}
							onChange={handleDateChange}
							placeholder='تاریخ را انتخاب کنید'
						/>
					</div>

					{/* Cheque Due Date */}
					{formData.method === 'CHEQUE' && (
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								تاریخ سررسید چک <span className='text-red-500'>*</span>
							</label>
							<PersianDatePicker
								value={formData.cheque_due_date || ''}
								onChange={handleChequeDateChange}
								placeholder='تاریخ سررسید را انتخاب کنید'
							/>
						</div>
					)}

					{/* Description */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							توضیحات
						</label>
						<textarea
							value={formData.description || ''}
							onChange={e =>
								setFormData(prev => ({
									...prev,
									description: e.target.value || null,
								}))
							}
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
							className='px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{loading ? 'در حال ثبت...' : 'ثبت پرداخت'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
