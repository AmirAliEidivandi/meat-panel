import { Loader2, X } from 'lucide-react';
// @ts-ignore - jalaali-js doesn't have type definitions
import { jalaaliToDateObject, toJalaali } from 'jalaali-js';
import { useEffect, useState } from 'react';
import { customerService, orderService, reminderService } from '../services/api';
import type {
	CreateReminderDto,
	CustomerListItem,
	Order,
} from '../types';
import PersianDatePicker from './PersianDatePicker';

interface CreateReminderModalProps {
	onClose: () => void;
	onSuccess: () => void;
}

export default function CreateReminderModal({
	onClose,
	onSuccess,
}: CreateReminderModalProps) {
	const getTodayPersian = () => {
		const today = new Date();
		const jalaali = toJalaali(today);
		return `${jalaali.jy}/${String(jalaali.jm).padStart(2, '0')}/${String(jalaali.jd).padStart(2, '0')}`;
	};

	const [formData, setFormData] = useState<CreateReminderDto>({
		customer_id: '',
		order_id: undefined,
		message: '',
		date: new Date(),
		hour: undefined,
	});
	const [customers, setCustomers] = useState<CustomerListItem[]>([]);
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [persianDate, setPersianDate] = useState(getTodayPersian());

	useEffect(() => {
		fetchCustomers();
	}, []);

	useEffect(() => {
		if (formData.customer_id) {
			fetchOrders();
		} else {
			setOrders([]);
		}
	}, [formData.customer_id]);

	const fetchCustomers = async () => {
		try {
			const response = await customerService.getAllCustomers({
				page: 1,
				'page-size': 100,
			});
			setCustomers(response.data || []);
		} catch (err) {
			console.error('Error fetching customers:', err);
		}
	};

	const fetchOrders = async () => {
		if (!formData.customer_id) return;
		try {
			const response = await orderService.getOrders({
				customer_id: formData.customer_id,
				page: 1,
				'page-size': 100,
			});
			setOrders(response.data || []);
		} catch (err) {
			console.error('Error fetching orders:', err);
		}
	};

	const convertPersianToGregorian = (persianDate: string): Date => {
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
			const dateObj = jalaaliToDateObject(
				persianYear,
				persianMonth,
				persianDay,
			);
			if (!dateObj || isNaN(dateObj.getTime())) {
				throw new Error('تاریخ ایجاد شده نامعتبر است');
			}

			// Preserve time component if hour is provided
			if (formData.hour) {
				const [hours, minutes] = formData.hour.split(':').map(Number);
				if (!isNaN(hours) && !isNaN(minutes)) {
					dateObj.setHours(hours);
					dateObj.setMinutes(minutes);
					dateObj.setSeconds(0);
					dateObj.setMilliseconds(0);
				}
			} else {
				// Use current time if no hour is provided
				const now = new Date();
				dateObj.setHours(now.getHours());
				dateObj.setMinutes(now.getMinutes());
				dateObj.setSeconds(now.getSeconds());
				dateObj.setMilliseconds(now.getMilliseconds());
			}

			return dateObj;
		} catch (err: any) {
			throw new Error(
				'خطا در تبدیل تاریخ: ' + (err.message || 'تاریخ نامعتبر است'),
			);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.customer_id || !formData.message.trim()) {
			setError('لطفاً مشتری و پیام را وارد کنید');
			return;
		}

		try {
			setLoading(true);
			setError('');

			const gregorianDate = convertPersianToGregorian(persianDate);

			const dto: CreateReminderDto = {
				customer_id: formData.customer_id,
				order_id: formData.order_id || undefined,
				message: formData.message.trim(),
				date: gregorianDate,
				hour: formData.hour || undefined,
			};

			await reminderService.createReminder(dto);
			onSuccess();
		} catch (err: any) {
			console.error('Error creating reminder:', err);
			setError(
				err.response?.data?.message ||
					err.message ||
					'خطا در ایجاد یادآور',
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
			<div className='bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
				{/* Header */}
				<div className='flex items-center justify-between p-6 border-b border-gray-200'>
					<h2 className='text-xl font-bold text-gray-900'>افزودن یادآور</h2>
					<button
						onClick={onClose}
						className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
					>
						<X className='w-5 h-5 text-gray-600' />
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className='p-6 space-y-4'>
					{error && (
						<div className='bg-red-50 border-2 border-red-200 rounded-lg p-4'>
							<p className='text-red-800 text-sm font-semibold'>{error}</p>
						</div>
					)}

					{/* Customer */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							مشتری <span className='text-red-500'>*</span>
						</label>
						<select
							value={formData.customer_id}
							onChange={e =>
								setFormData(prev => ({
									...prev,
									customer_id: e.target.value,
									order_id: undefined,
								}))
							}
							required
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
						>
							<option value=''>انتخاب مشتری...</option>
							{customers.map(customer => (
								<option key={customer.id} value={customer.id}>
									{customer.title} ({customer.code})
								</option>
							))}
						</select>
					</div>

					{/* Order (Optional) */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							سفارش (اختیاری)
						</label>
						<select
							value={formData.order_id || ''}
							onChange={e =>
								setFormData(prev => ({
									...prev,
									order_id: e.target.value || undefined,
								}))
							}
							disabled={!formData.customer_id || orders.length === 0}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed'
						>
							<option value=''>انتخاب سفارش...</option>
							{orders.map(order => (
								<option key={order.id} value={order.id}>
									سفارش #{order.code}
								</option>
							))}
						</select>
					</div>

					{/* Message */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							پیام <span className='text-red-500'>*</span>
						</label>
						<textarea
							value={formData.message}
							onChange={e =>
								setFormData(prev => ({ ...prev, message: e.target.value }))
							}
							required
							rows={4}
							placeholder='پیام یادآوری را وارد کنید...'
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none'
						/>
					</div>

					{/* Date */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							تاریخ یادآوری <span className='text-red-500'>*</span>
						</label>
						<PersianDatePicker
							value={persianDate}
							onChange={setPersianDate}
							className='w-full'
						/>
					</div>

					{/* Hour (Optional) */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							ساعت (اختیاری)
						</label>
						<input
							type='time'
							value={formData.hour || ''}
							onChange={e =>
								setFormData(prev => ({ ...prev, hour: e.target.value }))
							}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
						/>
					</div>

					{/* Actions */}
					<div className='flex items-center space-x-reverse space-x-3 pt-4'>
						<button
							type='submit'
							disabled={loading}
							className='flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center space-x-reverse space-x-2'
						>
							{loading && <Loader2 className='w-4 h-4 animate-spin' />}
							<span>{loading ? 'در حال ایجاد...' : 'ایجاد یادآور'}</span>
						</button>
						<button
							type='button'
							onClick={onClose}
							disabled={loading}
							className='px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold'
						>
							انصراف
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

