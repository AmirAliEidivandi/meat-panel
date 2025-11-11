import {
	ArrowRight,
	CheckCircle,
	FileText,
	Loader2,
	Receipt,
	User,
	XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCurrency, formatDate } from '../lib/utils';
import { historyService } from '../services/api';

interface InvoiceData {
	id: string;
	code: number;
	date: string;
	amount: number;
	customer_id: string;
	payment_status: string;
	type: string;
	seller_id: string | null;
	driver_id: string | null;
	warehouse_id: string | null;
	due_date: string | null;
	deleted: boolean;
	description: string | null;
	customer?: {
		id: string;
		title: string;
		code: number;
	};
}

interface InvoiceHistoryDetailsData {
	id: string;
	invoice_id: string;
	old_invoice: InvoiceData | null;
	new_invoice: InvoiceData | null;
	employee_id: string | null;
	by_system: boolean;
	change_type: string;
	amount_before: number | null;
	amount_after: number | null;
	amount_diff: number | null;
	payment_status_before: string | null;
	payment_status_after: string | null;
	type_before: string | null;
	type_after: string | null;
	date_before: string | null;
	date_after: string | null;
	due_date_before: string | null;
	due_date_after: string | null;
	seller_id_before: string | null;
	seller_id_after: string | null;
	driver_id_before: string | null;
	driver_id_after: string | null;
	deleted_changed: boolean;
	reason: string | null;
	ip_address: string | null;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
	invoice?: InvoiceData;
	employee?: {
		id: string;
		profile: {
			id: string;
			kid: string;
			first_name: string;
			last_name: string;
		};
	};
}

// Helper functions
const getChangeTypeText = (changeType: string) => {
	const types: Record<string, string> = {
		CREATED: 'ایجاد فاکتور',
		AMOUNT_CHANGED: 'تغییر مبلغ',
		PAYMENT_STATUS_CHANGED: 'تغییر وضعیت پرداخت',
		DUE_DATE_CHANGED: 'تغییر تاریخ سررسید',
		DATE_CHANGED: 'تغییر تاریخ',
		TYPE_CHANGED: 'تغییر نوع',
		SELLER_CHANGED: 'تغییر فروشنده',
		DRIVER_CHANGED: 'تغییر راننده',
		WAREHOUSE_CHANGED: 'تغییر انبار',
		CARGO_CHANGED: 'تغییر بار',
		PRODUCTS_CHANGED: 'تغییر محصولات',
		DELETED: 'حذف فاکتور',
		RESTORED: 'بازیابی فاکتور',
		WALLET_LINKED: 'اتصال به کیف پول',
		ORDER_LINKED: 'اتصال به سفارش',
		UPDATED: 'بروزرسانی',
	};
	return types[changeType] || 'تغییر نامشخص';
};

const getChangeTypeColor = (changeType: string) => {
	const colorMap: Record<string, string> = {
		CREATED: 'bg-green-100 text-green-800',
		AMOUNT_CHANGED: 'bg-yellow-100 text-yellow-800',
		PAYMENT_STATUS_CHANGED: 'bg-blue-100 text-blue-800',
		DUE_DATE_CHANGED: 'bg-indigo-100 text-indigo-800',
		DATE_CHANGED: 'bg-purple-100 text-purple-800',
		TYPE_CHANGED: 'bg-pink-100 text-pink-800',
		DELETED: 'bg-red-100 text-red-800',
		RESTORED: 'bg-emerald-100 text-emerald-800',
	};
	return colorMap[changeType] || 'bg-gray-100 text-gray-800';
};

const getPaymentStatusText = (status: string | null) => {
	const statuses: Record<string, string> = {
		NOT_PAID: 'پرداخت نشده',
		PARTIALLY_PAID: 'پرداخت جزئی',
		PAID: 'پرداخت شده',
	};
	return statuses[status || ''] || status || 'نامشخص';
};

const getPaymentStatusColor = (status: string | null) => {
	const colorMap: Record<string, string> = {
		PAID: 'bg-green-100 text-green-800',
		NOT_PAID: 'bg-red-100 text-red-800',
		PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
	};
	return colorMap[status || ''] || 'bg-gray-100 text-gray-800';
};

const getInvoiceTypeText = (type: string | null) => {
	const types: Record<string, string> = {
		PURCHASE: 'خرید',
		RETURN_FROM_PURCHASE: 'بازگشت از خرید',
		SELL: 'فروش',
	};
	return types[type || ''] || type || 'نامشخص';
};

const getInvoiceTypeColor = (type: string | null) => {
	const colorMap: Record<string, string> = {
		PURCHASE: 'bg-blue-100 text-blue-800',
		RETURN_FROM_PURCHASE: 'bg-orange-100 text-orange-800',
		SELL: 'bg-green-100 text-green-800',
	};
	return colorMap[type || ''] || 'bg-gray-100 text-gray-800';
};

export default function InvoiceHistoryDetails() {
	const navigate = useNavigate();
	const { id: historyId } = useParams();
	const [history, setHistory] = useState<InvoiceHistoryDetailsData | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (historyId) {
			fetchHistory();
		}
	}, [historyId]);

	const fetchHistory = async () => {
		try {
			setLoading(true);
			setError('');
			const data = await historyService.getInvoiceHistoryById(
				historyId as string,
			);
			setHistory(data as InvoiceHistoryDetailsData);
		} catch (err: any) {
			setError('خطا در بارگذاری جزئیات تاریخچه فاکتور');
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

	if (error || !history) {
		return (
			<div className='text-center py-12'>
				<div className='text-red-500 mb-4'>
					{error || 'تاریخچه یافت نشد'}
				</div>
				<button
					onClick={() => navigate('/manage/invoice-history')}
					className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors'
				>
					بازگشت به لیست تاریخچه فاکتورها
				</button>
			</div>
		);
	}

	return (
		<div className='fade-in font-vazir max-w-7xl mx-auto'>
			{/* Header */}
			<div className='mb-8'>
				<button
					onClick={() => navigate('/manage/invoice-history')}
					className='mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm'
				>
					<ArrowRight className='w-4 h-4 ml-2' />
					بازگشت
				</button>
				<div className='flex items-start justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900 mb-2'>
							جزئیات تاریخچه فاکتور
						</h1>
						{history.invoice && (
							<p className='text-gray-500'>
								کد فاکتور:{' '}
								<span className='font-semibold text-gray-700'>
									#{history.invoice.code}
								</span>
							</p>
						)}
					</div>
					<span
						className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold ${getChangeTypeColor(
							history.change_type,
						)}`}
					>
						{getChangeTypeText(history.change_type)}
					</span>
				</div>
			</div>

			{/* Comparison Section */}
			<div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6'>
				<h2 className='text-xl font-bold text-gray-900 mb-6'>مقایسه تغییرات</h2>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
					{/* Before */}
					<div className='relative'>
						<div className='absolute right-0 top-0 bottom-0 w-0.5 bg-red-200'></div>
						<div className='pr-6'>
							<div className='flex items-center space-x-reverse space-x-3 mb-4'>
								<div className='w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm'></div>
								<h3 className='text-lg font-semibold text-gray-900'>
									قبل از تغییر
								</h3>
							</div>
							<div className='bg-gray-50 rounded-xl p-5 space-y-4'>
								{history.amount_before !== null && (
									<div>
										<label className='text-xs font-medium text-gray-500 block mb-1.5'>
											مبلغ
										</label>
										<p
											className={`text-xl font-bold ${
												history.amount_before >= 0
													? 'text-green-600'
													: 'text-red-600'
											}`}
										>
											{formatCurrency(history.amount_before)}
										</p>
									</div>
								)}
								{history.payment_status_before && (
									<div>
										<label className='text-xs font-medium text-gray-500 block mb-1.5'>
											وضعیت پرداخت
										</label>
										<span
											className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${getPaymentStatusColor(
												history.payment_status_before,
											)}`}
										>
											{getPaymentStatusText(history.payment_status_before)}
										</span>
									</div>
								)}
								{history.type_before && (
									<div>
										<label className='text-xs font-medium text-gray-500 block mb-1.5'>
											نوع فاکتور
										</label>
										<span
											className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${getInvoiceTypeColor(
												history.type_before,
											)}`}
										>
											{getInvoiceTypeText(history.type_before)}
										</span>
									</div>
								)}
								{history.date_before && (
									<div>
										<label className='text-xs font-medium text-gray-500 block mb-1.5'>
											تاریخ
										</label>
										<p className='text-sm font-semibold text-gray-900'>
											{formatDate(history.date_before)}
										</p>
									</div>
								)}
								{history.due_date_before && (
									<div>
										<label className='text-xs font-medium text-gray-500 block mb-1.5'>
											تاریخ سررسید
										</label>
										<p className='text-sm font-semibold text-gray-900'>
											{formatDate(history.due_date_before)}
										</p>
									</div>
								)}
								{history.old_invoice && (
									<div>
										<label className='text-xs font-medium text-gray-500 block mb-1.5'>
											کد فاکتور
										</label>
										<p className='text-sm font-semibold text-gray-900'>
											#{history.old_invoice.code}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* After */}
					<div className='relative'>
						<div className='absolute right-0 top-0 bottom-0 w-0.5 bg-green-200'></div>
						<div className='pr-6'>
							<div className='flex items-center space-x-reverse space-x-3 mb-4'>
								<div className='w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm'></div>
								<h3 className='text-lg font-semibold text-gray-900'>
									بعد از تغییر
								</h3>
							</div>
							<div className='bg-gray-50 rounded-xl p-5 space-y-4'>
								{history.amount_after !== null && (
									<div>
										<label className='text-xs font-medium text-gray-500 block mb-1.5'>
											مبلغ
										</label>
										<p
											className={`text-xl font-bold ${
												history.amount_after >= 0
													? 'text-green-600'
													: 'text-red-600'
											}`}
										>
											{formatCurrency(history.amount_after)}
										</p>
									</div>
								)}
								{history.payment_status_after && (
									<div>
										<label className='text-xs font-medium text-gray-500 block mb-1.5'>
											وضعیت پرداخت
										</label>
										<span
											className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${getPaymentStatusColor(
												history.payment_status_after,
											)}`}
										>
											{getPaymentStatusText(history.payment_status_after)}
										</span>
									</div>
								)}
								{history.type_after && (
									<div>
										<label className='text-xs font-medium text-gray-500 block mb-1.5'>
											نوع فاکتور
										</label>
										<span
											className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${getInvoiceTypeColor(
												history.type_after,
											)}`}
										>
											{getInvoiceTypeText(history.type_after)}
										</span>
									</div>
								)}
								{history.date_after && (
									<div>
										<label className='text-xs font-medium text-gray-500 block mb-1.5'>
											تاریخ
										</label>
										<p className='text-sm font-semibold text-gray-900'>
											{formatDate(history.date_after)}
										</p>
									</div>
								)}
								{history.due_date_after && (
									<div>
										<label className='text-xs font-medium text-gray-500 block mb-1.5'>
											تاریخ سررسید
										</label>
										<p className='text-sm font-semibold text-gray-900'>
											{formatDate(history.due_date_after)}
										</p>
									</div>
								)}
								{history.new_invoice && (
									<div>
										<label className='text-xs font-medium text-gray-500 block mb-1.5'>
											کد فاکتور
										</label>
										<p className='text-sm font-semibold text-gray-900'>
											#{history.new_invoice.code}
										</p>
									</div>
								)}
								{history.amount_diff !== null && (
									<div className='pt-4 border-t border-gray-200'>
										<label className='text-xs font-medium text-gray-500 block mb-1.5'>
											تغییر مبلغ
										</label>
										<p
											className={`text-lg font-bold ${
												history.amount_diff >= 0
													? 'text-green-600'
													: 'text-red-600'
											}`}
										>
											{history.amount_diff >= 0 ? '+' : ''}
											{formatCurrency(history.amount_diff)}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Info Grid */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6'>
				{/* Change Details */}
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-5'>
						<div className='w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center'>
							<FileText className='w-4 h-4 text-blue-600' />
						</div>
						<h3 className='font-bold text-gray-900'>جزئیات تغییر</h3>
					</div>
					<div className='space-y-4'>
						<div>
							<p className='text-xs text-gray-500 mb-1.5'>نوع تغییر</p>
							<p className='text-sm font-semibold text-gray-900'>
								{getChangeTypeText(history.change_type)}
							</p>
						</div>
						<div>
							<p className='text-xs text-gray-500 mb-1.5'>روش تغییر</p>
							<p className='text-sm font-semibold'>
								{history.by_system ? (
									<span className='text-orange-600'>سیستم خودکار</span>
								) : (
									<span className='text-blue-600'>کارمند دستی</span>
								)}
							</p>
						</div>
						<div>
							<p className='text-xs text-gray-500 mb-1.5'>تاریخ تغییر</p>
							<p className='text-sm font-semibold text-gray-900'>
								{formatDate(history.created_at)}
							</p>
						</div>
						{history.employee && (
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>کارمند</p>
								<p className='text-sm font-semibold text-gray-900'>
									{history.employee.profile.first_name}{' '}
									{history.employee.profile.last_name}
								</p>
							</div>
						)}
						{history.reason && (
							<div className='pt-4 border-t border-gray-100'>
								<p className='text-xs text-gray-500 mb-1.5'>دلیل تغییر</p>
								<p className='text-sm text-gray-700 bg-gray-50 rounded-lg p-3'>
									{history.reason}
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Current Invoice */}
				{history.invoice && (
					<div className='bg-white rounded-xl border border-gray-200 p-6'>
						<div className='flex items-center space-x-reverse space-x-2 mb-5'>
							<div className='w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center'>
								<Receipt className='w-4 h-4 text-emerald-600' />
							</div>
							<h3 className='font-bold text-gray-900'>وضعیت فعلی</h3>
						</div>
						<div className='space-y-4'>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>کد فاکتور</p>
								<p className='text-sm font-semibold text-gray-900'>
									#{history.invoice.code}
								</p>
							</div>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>مبلغ</p>
								<p
									className={`text-xl font-bold ${
										history.invoice.amount >= 0
											? 'text-green-600'
											: 'text-red-600'
									}`}
								>
									{formatCurrency(history.invoice.amount)}
								</p>
							</div>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>وضعیت پرداخت</p>
								<span
									className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${getPaymentStatusColor(
										history.invoice.payment_status,
									)}`}
								>
									{getPaymentStatusText(history.invoice.payment_status)}
								</span>
							</div>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>نوع فاکتور</p>
								<span
									className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${getInvoiceTypeColor(
										history.invoice.type,
									)}`}
								>
									{getInvoiceTypeText(history.invoice.type)}
								</span>
							</div>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>تاریخ فاکتور</p>
								<p className='text-sm font-semibold text-gray-900'>
									{formatDate(history.invoice.date)}
								</p>
							</div>
							{history.invoice.due_date && (
								<div>
									<p className='text-xs text-gray-500 mb-1.5'>تاریخ سررسید</p>
									<p className='text-sm font-semibold text-gray-900'>
										{formatDate(history.invoice.due_date)}
									</p>
								</div>
							)}
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>وضعیت</p>
								<p className='text-sm font-semibold'>
									{history.invoice.deleted ? (
										<span className='text-red-600'>حذف شده</span>
									) : (
										<span className='text-green-600'>فعال</span>
									)}
								</p>
							</div>
							{history.invoice.description && (
								<div className='pt-4 border-t border-gray-100'>
									<p className='text-xs text-gray-500 mb-1.5'>توضیحات</p>
									<p className='text-sm text-gray-700 bg-gray-50 rounded-lg p-3'>
										{history.invoice.description}
									</p>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Customer & IP */}
				<div className='space-y-6'>
					{/* Customer */}
					{history.invoice?.customer && (
						<div className='bg-white rounded-xl border border-gray-200 p-6'>
							<div className='flex items-center space-x-reverse space-x-2 mb-5'>
								<div className='w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center'>
									<User className='w-4 h-4 text-purple-600' />
								</div>
								<h3 className='font-bold text-gray-900'>مشتری</h3>
							</div>
							<div className='space-y-4'>
								<div>
									<p className='text-xs text-gray-500 mb-1.5'>نام</p>
									<p className='text-sm font-semibold text-gray-900'>
										{history.invoice.customer.title}
									</p>
								</div>
								<div>
									<p className='text-xs text-gray-500 mb-1.5'>کد مشتری</p>
									<p className='text-sm font-semibold text-gray-900'>
										{history.invoice.customer.code}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* IP Address */}
					{history.ip_address && (
						<div className='bg-white rounded-xl border border-gray-200 p-6'>
							<div className='flex items-center space-x-reverse space-x-2 mb-5'>
								<div className='w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center'>
									<FileText className='w-4 h-4 text-gray-600' />
								</div>
								<h3 className='font-bold text-gray-900'>اطلاعات اتصال</h3>
							</div>
							<div className='space-y-4'>
								<div>
									<p className='text-xs text-gray-500 mb-1.5'>آدرس IP</p>
									<p className='text-sm font-semibold text-gray-900 font-mono bg-gray-50 rounded px-2 py-1 inline-block'>
										{history.ip_address.split(',')[0]}
									</p>
								</div>
								{history.ip_address.split(',').length > 1 && (
									<div className='grid grid-cols-2 gap-3 pt-3 border-t border-gray-100'>
										{history.ip_address.split(',')[1]?.trim() && (
											<div>
												<p className='text-xs text-gray-500 mb-1'>شهر</p>
												<p className='text-sm font-semibold text-gray-900'>
													{history.ip_address.split(',')[1].trim()}
												</p>
											</div>
										)}
										{history.ip_address.split(',')[2]?.trim() && (
											<div>
												<p className='text-xs text-gray-500 mb-1'>استان</p>
												<p className='text-sm font-semibold text-gray-900'>
													{history.ip_address.split(',')[2].trim()}
												</p>
											</div>
										)}
										{history.ip_address.split(',')[6]?.trim() && (
											<div className='col-span-2'>
												<p className='text-xs text-gray-500 mb-1'>کشور</p>
												<p className='text-sm font-semibold text-gray-900'>
													{history.ip_address.split(',')[6].trim()}
												</p>
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
