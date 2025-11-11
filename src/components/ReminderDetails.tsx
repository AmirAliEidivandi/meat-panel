import {
	ArrowRight,
	Bell,
	Calendar,
	Loader2,
	Package,
	User,
	CheckCircle,
	XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import { reminderService } from '../services/api';
import type { ReminderDetails as ReminderDetailsType } from '../types';

const getSeenStatusText = (seen: boolean): string => {
	return seen ? 'مشاهده شده' : 'مشاهده نشده';
};

const getSeenStatusColor = (seen: boolean): string => {
	return seen
		? 'bg-green-100 text-green-800'
		: 'bg-yellow-100 text-yellow-800';
};

const getPaymentStatusText = (status: string): string => {
	const statusMap: Record<string, string> = {
		NOT_PAID: 'پرداخت نشده',
		PARTIALLY_PAID: 'پرداخت جزئی',
		PAID: 'پرداخت شده',
	};
	return statusMap[status] || status;
};

const getPaymentStatusColor = (status: string): string => {
	const colorMap: Record<string, string> = {
		NOT_PAID: 'bg-red-100 text-red-800',
		PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
		PAID: 'bg-green-100 text-green-800',
	};
	return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export default function ReminderDetails() {
	const navigate = useNavigate();
	const { id: reminderId } = useParams();
	const [reminder, setReminder] = useState<ReminderDetailsType | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (reminderId) {
			fetchReminderDetails();
		}
	}, [reminderId]);

	const fetchReminderDetails = async () => {
		if (!reminderId) return;
		try {
			setLoading(true);
			setError('');
			const response = await reminderService.getReminderById(reminderId);
			setReminder(response);
		} catch (err: any) {
			console.error('Error fetching reminder details:', err);
			setError(
				err.response?.data?.message || 'خطا در بارگذاری جزئیات یادآور',
			);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<Loader2 className='w-8 h-8 text-emerald-600 animate-spin' />
				<span className='mr-3 text-gray-600 font-semibold'>
					در حال بارگذاری...
				</span>
			</div>
		);
	}

	if (error || !reminder) {
		return (
			<div className='text-center py-12'>
				<div className='text-red-500 mb-4'>{error || 'یادآور یافت نشد'}</div>
				<button
					onClick={() => navigate('/manage/reminders')}
					className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors'
				>
					بازگشت به لیست یادآورها
				</button>
			</div>
		);
	}

	return (
		<div className='fade-in font-vazir max-w-7xl mx-auto'>
			{/* Header */}
			<div className='mb-8'>
				<button
					onClick={() => navigate('/manage/reminders')}
					className='mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm'
				>
					<ArrowRight className='w-4 h-4 ml-2' />
					بازگشت
				</button>
				<div className='flex items-start justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900 mb-2'>
							جزئیات یادآور
						</h1>
						<p className='text-gray-500'>
							یادآور #{reminder.id.substring(0, 8)}
						</p>
					</div>
					<span
						className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold ${getSeenStatusColor(
							reminder.seen,
						)}`}
					>
						{reminder.seen ? (
							<CheckCircle className='w-4 h-4 ml-2' />
						) : (
							<XCircle className='w-4 h-4 ml-2' />
						)}
						{getSeenStatusText(reminder.seen)}
					</span>
				</div>
			</div>

			{/* Summary Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6'>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center'>
							<Calendar className='w-4 h-4 text-emerald-600' />
						</div>
						<h3 className='font-bold text-gray-900'>تاریخ یادآوری</h3>
					</div>
					<p className='text-sm font-semibold text-gray-900'>
						{formatDate(reminder.date)}
					</p>
				</div>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center'>
							<Calendar className='w-4 h-4 text-blue-600' />
						</div>
						<h3 className='font-bold text-gray-900'>تاریخ ایجاد</h3>
					</div>
					<p className='text-sm font-semibold text-gray-900'>
						{formatDate(reminder.created_at)}
					</p>
				</div>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center'>
							<User className='w-4 h-4 text-purple-600' />
						</div>
						<h3 className='font-bold text-gray-900'>مشتری</h3>
					</div>
					<p className='text-sm font-semibold text-gray-900'>
						{reminder.customer.title}
					</p>
				</div>
			</div>

			{/* Message */}
			<div className='bg-white rounded-xl border border-gray-200 p-6 mb-6'>
				<div className='flex items-center space-x-reverse space-x-2 mb-5'>
					<div className='w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center'>
						<Bell className='w-4 h-4 text-gray-600' />
					</div>
					<h3 className='font-bold text-gray-900'>پیام یادآوری</h3>
				</div>
				<p className='text-sm text-gray-700 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap'>
					{reminder.message}
				</p>
			</div>

			{/* Info Grid */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
				{/* Customer Info */}
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-5'>
						<div className='w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center'>
							<User className='w-4 h-4 text-gray-600' />
						</div>
						<h3 className='font-bold text-gray-900'>اطلاعات مشتری</h3>
					</div>
					<div className='space-y-4'>
						<div>
							<p className='text-xs text-gray-500 mb-1.5'>نام</p>
							<p className='text-sm font-semibold text-gray-900'>
								{reminder.customer.title}
							</p>
						</div>
						<div>
							<p className='text-xs text-gray-500 mb-1.5'>کد مشتری</p>
							<p className='text-sm font-semibold text-gray-900'>
								{reminder.customer.code}
							</p>
						</div>
						{reminder.representative_name && (
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>نماینده</p>
								<p className='text-sm font-semibold text-gray-900'>
									{reminder.representative_name}
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Order Info (if exists) */}
				{reminder.order && (
					<div className='bg-white rounded-xl border border-gray-200 p-6'>
						<div className='flex items-center space-x-reverse space-x-2 mb-5'>
							<div className='w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center'>
								<Package className='w-4 h-4 text-emerald-600' />
							</div>
							<h3 className='font-bold text-gray-900'>سفارش مرتبط</h3>
						</div>
						<div className='space-y-4'>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>کد سفارش</p>
								<button
									onClick={() => navigate(`/manage/orders/${reminder.order?.id}`)}
									className='text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors'
								>
									#{reminder.order.code}
								</button>
							</div>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>وضعیت پرداخت</p>
								<span
									className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${getPaymentStatusColor(
										reminder.order.payment_status,
									)}`}
								>
									{getPaymentStatusText(reminder.order.payment_status)}
								</span>
							</div>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>وضعیت تحویل</p>
								<span
									className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${
										reminder.order.fulfilled
											? 'bg-green-100 text-green-800'
											: 'bg-yellow-100 text-yellow-800'
									}`}
								>
									{reminder.order.fulfilled ? 'تحویل شده' : 'تحویل نشده'}
								</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
