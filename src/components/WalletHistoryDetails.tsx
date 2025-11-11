import {
	ArrowRight,
	CreditCard,
	FileText,
	Loader2,
	User,
	Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCurrency, formatDate } from '../lib/utils';
import { historyService } from '../services/api';

interface WalletData {
	id: string;
	customer_id: string;
	balance: number;
	credit_cap: number;
	description: string;
	initial_balance: number;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
	customer: {
		id: string;
		title: string;
		type: string;
		category: string;
		is_property_owner: boolean;
		did_we_contact: boolean;
		phone: string;
		address: string;
		age: number;
		credibility_by_seller: string;
		credibility_by_sales_manager: string;
		behavior_tags: string[];
		national_id: string;
		branch_id: string;
		seller_id: string;
		support_id: string;
		capillary_sales_line_id: string;
		deleted: boolean;
		chat_id: string | null;
		description: string;
		locked: boolean;
		location: {
			type: string;
			coordinates: [number, number];
		};
		code: number;
		status: string | null;
		status_history: any[];
		hp_code: number;
		hp_title: string;
		created_at: string;
		updated_at: string;
		deleted_at: string | null;
	};
}

interface PaymentData {
	id: string;
	code: number;
	amount: number;
	description: string | null;
	customer_id: string;
	wallet_id: string;
	order_id: string | null;
	deleted: boolean;
	method: string;
	date: string;
	cheque_due_date: string | null;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
}

interface WalletHistoryDetailsData {
	id: string;
	wallet_id: string;
	old_wallet: WalletData;
	new_wallet: WalletData;
	employee_id: string;
	by_system: boolean;
	change_type: string;
	balance_before: number;
	balance_after: number;
	balance_diff: number;
	credit_before: number;
	credit_after: number;
	related_payment_id: string | null;
	related_invoice_id: string | null;
	reason: string | null;
	ip_address: string | null;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
	wallet: WalletData;
	employee: {
		id: string;
		profile: {
			id: string;
			kid: string;
			first_name: string;
			last_name: string;
		};
	};
	payment: PaymentData | null;
	invoice: any | null;
}

const getChangeTypeText = (changeType: string): string => {
	const types: Record<string, string> = {
		CREATED: 'ایجاد کیف پول',
		BALANCE_CHANGED: 'تغییر موجودی',
		CREDIT_CAP_CHANGED: 'تغییر سقف اعتبار',
		PAYMENT_RECEIVED: 'دریافت پرداخت',
		PAYMENT_MADE: 'پرداخت انجام شده',
		REFUND: 'بازپرداخت',
		ADJUSTMENT: 'تنظیم دستی',
		DELETED: 'حذف کیف پول',
		INVOICE_CREATED: 'ایجاد فاکتور',
		CREDIT_CAP_INCREASE: 'افزایش سقف اعتبار',
		CREDIT_CAP_DECREASE: 'کاهش سقف اعتبار',
	};
	return types[changeType] || 'تغییر نامشخص';
};

const getChangeTypeColor = (changeType: string): string => {
	const colorMap: Record<string, string> = {
		CREATED: 'bg-green-100 text-green-800',
		BALANCE_CHANGED: 'bg-yellow-100 text-yellow-800',
		CREDIT_CAP_CHANGED: 'bg-blue-100 text-blue-800',
		PAYMENT_RECEIVED: 'bg-emerald-100 text-emerald-800',
		PAYMENT_MADE: 'bg-purple-100 text-purple-800',
		REFUND: 'bg-orange-100 text-orange-800',
		ADJUSTMENT: 'bg-indigo-100 text-indigo-800',
		DELETED: 'bg-red-100 text-red-800',
	};
	return colorMap[changeType] || 'bg-gray-100 text-gray-800';
};

const getPaymentMethodText = (method: string): string => {
	const methods: Record<string, string> = {
		WALLET: 'کیف پول',
		CREDIT: 'اعتبار',
		DEPOSIT_TO_ACCOUNT: 'واریز به حساب',
		CHEQUE: 'چک',
		CARD: 'کارت',
		CASH: 'نقدی',
		ONLINE: 'آنلاین',
	};
	return methods[method] || method;
};

const getCustomerTypeText = (type: string): string => {
	const types: Record<string, string> = {
		PERSONAL: 'شخصی',
		CORPORATE: 'سازمانی',
	};
	return types[type] || type;
};

const getCategoryText = (category: string): string => {
	const categories: Record<string, string> = {
		RESTAURANT: 'رستوران',
		HOTEL: 'هتل',
		CHAIN_STORE: 'فروشگاه زنجیره‌ای',
		GOVERNMENTAL: 'دولتی',
		FAST_FOOD: 'فست فود',
		CHARITY: 'خیریه',
		BUTCHER: 'قصابی',
		WHOLESALER: 'عمده‌فروش',
		FELLOW: 'همکار',
		CATERING: 'کترینگ',
		KEBAB: 'کبابی',
		DISTRIBUTOR: 'پخش‌کننده',
		HOSPITAL: 'بیمارستان',
		FACTORY: 'کارخانه',
		OTHER: 'سایر',
	};
	return categories[category] || 'نامشخص';
};

export default function WalletHistoryDetails() {
	const navigate = useNavigate();
	const { id: historyId } = useParams();
	const [history, setHistory] = useState<WalletHistoryDetailsData | null>(null);
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
			const data = await historyService.getWalletHistoryById(
				historyId as string,
			);
			setHistory(data as unknown as WalletHistoryDetailsData);
		} catch (err: any) {
			setError('خطا در بارگذاری جزئیات تاریخچه کیف پول');
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
				<div className='text-red-500 mb-4'>{error || 'تاریخچه یافت نشد'}</div>
				<button
					onClick={() => navigate('/manage/wallet-history')}
					className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors'
				>
					بازگشت به لیست تاریخچه
				</button>
			</div>
		);
	}

	return (
		<div className='fade-in font-vazir max-w-7xl mx-auto'>
			{/* Header */}
			<div className='mb-8'>
				<button
					onClick={() => navigate('/manage/wallet-history')}
					className='mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm'
				>
					<ArrowRight className='w-4 h-4 ml-2' />
					بازگشت
				</button>
				<div className='flex items-start justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900 mb-2'>
							جزئیات تاریخچه کیف پول
						</h1>
						{history.wallet && (
							<p className='text-gray-500'>
								مشتری:{' '}
								<span className='font-semibold text-gray-700'>
									{history.wallet.customer.title}
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
								<div>
									<label className='text-xs font-medium text-gray-500 block mb-1.5'>
										موجودی
									</label>
									<p
										className={`text-xl font-bold ${
											history.balance_before >= 0
												? 'text-green-600'
												: 'text-red-600'
										}`}
									>
										{formatCurrency(history.balance_before)}
									</p>
								</div>
								<div>
									<label className='text-xs font-medium text-gray-500 block mb-1.5'>
										سقف اعتبار
									</label>
									<p className='text-sm font-semibold text-gray-900'>
										{formatCurrency(history.credit_before)}
									</p>
								</div>
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
								<div>
									<label className='text-xs font-medium text-gray-500 block mb-1.5'>
										موجودی
									</label>
									<p
										className={`text-xl font-bold ${
											history.balance_after >= 0
												? 'text-green-600'
												: 'text-red-600'
										}`}
									>
										{formatCurrency(history.balance_after)}
									</p>
								</div>
								<div>
									<label className='text-xs font-medium text-gray-500 block mb-1.5'>
										سقف اعتبار
									</label>
									<p className='text-sm font-semibold text-gray-900'>
										{formatCurrency(history.credit_after)}
									</p>
								</div>
								<div className='pt-4 border-t border-gray-200'>
									<label className='text-xs font-medium text-gray-500 block mb-1.5'>
										تغییر موجودی
									</label>
									<p
										className={`text-lg font-bold ${
											history.balance_diff >= 0
												? 'text-green-600'
												: 'text-red-600'
										}`}
									>
										{history.balance_diff >= 0 ? '+' : ''}
										{formatCurrency(history.balance_diff)}
									</p>
								</div>
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

				{/* Current Wallet */}
				{history.wallet && (
					<div className='bg-white rounded-xl border border-gray-200 p-6'>
						<div className='flex items-center space-x-reverse space-x-2 mb-5'>
							<div className='w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center'>
								<Wallet className='w-4 h-4 text-emerald-600' />
							</div>
							<h3 className='font-bold text-gray-900'>وضعیت فعلی</h3>
						</div>
						<div className='space-y-4'>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>موجودی فعلی</p>
								<p
									className={`text-xl font-bold ${
										history.wallet.balance >= 0
											? 'text-green-600'
											: 'text-red-600'
									}`}
								>
									{formatCurrency(history.wallet.balance)}
								</p>
							</div>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>سقف اعتبار</p>
								<p className='text-sm font-semibold text-gray-900'>
									{formatCurrency(history.wallet.credit_cap)}
								</p>
							</div>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>موجودی اولیه</p>
								<p className='text-sm font-semibold text-gray-900'>
									{formatCurrency(history.wallet.initial_balance)}
								</p>
							</div>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>آخرین آپدیت</p>
								<p className='text-sm font-semibold text-gray-900'>
									{formatDate(history.wallet.updated_at)}
								</p>
							</div>
							{history.wallet.description && (
								<div className='pt-4 border-t border-gray-100'>
									<p className='text-xs text-gray-500 mb-1.5'>توضیحات</p>
									<p className='text-sm text-gray-700 bg-gray-50 rounded-lg p-3'>
										{history.wallet.description}
									</p>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Customer & Payment */}
				<div className='space-y-6'>
					{/* Customer */}
					{history.wallet && (
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
										{history.wallet.customer.title}
									</p>
								</div>
								<div>
									<p className='text-xs text-gray-500 mb-1.5'>کد مشتری</p>
									<p className='text-sm font-semibold text-gray-900'>
										{history.wallet.customer.code}
									</p>
								</div>
								<div>
									<p className='text-xs text-gray-500 mb-1.5'>نوع</p>
									<p className='text-sm font-semibold text-gray-900'>
										{getCustomerTypeText(history.wallet.customer.type)}
									</p>
								</div>
								<div>
									<p className='text-xs text-gray-500 mb-1.5'>دسته‌بندی</p>
									<p className='text-sm font-semibold text-gray-900'>
										{getCategoryText(history.wallet.customer.category)}
									</p>
								</div>
								<div>
									<p className='text-xs text-gray-500 mb-1.5'>تلفن</p>
									<p className='text-sm font-semibold text-gray-900'>
										{history.wallet.customer.phone}
									</p>
								</div>
								<div>
									<p className='text-xs text-gray-500 mb-1.5'>آدرس</p>
									<p className='text-sm font-semibold text-gray-900'>
										{history.wallet.customer.address}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Payment */}
					{history.payment && (
						<div className='bg-white rounded-xl border border-gray-200 p-6'>
							<div className='flex items-center space-x-reverse space-x-2 mb-5'>
								<div className='w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center'>
									<CreditCard className='w-4 h-4 text-teal-600' />
								</div>
								<h3 className='font-bold text-gray-900'>پرداخت مرتبط</h3>
							</div>
							<div className='space-y-4'>
								<div>
									<p className='text-xs text-gray-500 mb-1.5'>کد پرداخت</p>
									<p className='text-sm font-semibold text-gray-900'>
										#{history.payment.code}
									</p>
								</div>
								<div>
									<p className='text-xs text-gray-500 mb-1.5'>مبلغ</p>
									<p className='text-xl font-bold text-emerald-600'>
										{formatCurrency(history.payment.amount)}
									</p>
								</div>
								<div>
									<p className='text-xs text-gray-500 mb-1.5'>روش پرداخت</p>
									<p className='text-sm font-semibold text-gray-900'>
										{getPaymentMethodText(history.payment.method)}
									</p>
								</div>
								<div>
									<p className='text-xs text-gray-500 mb-1.5'>تاریخ پرداخت</p>
									<p className='text-sm font-semibold text-gray-900'>
										{formatDate(history.payment.date)}
									</p>
								</div>
								{history.payment.description && (
									<div className='pt-4 border-t border-gray-100'>
										<p className='text-xs text-gray-500 mb-1.5'>توضیحات</p>
										<p className='text-sm text-gray-700 bg-gray-50 rounded-lg p-3'>
											{history.payment.description}
										</p>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* IP Address */}
			{history.ip_address && (
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-5'>
						<div className='w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center'>
							<FileText className='w-4 h-4 text-gray-600' />
						</div>
						<h3 className='font-bold text-gray-900'>اطلاعات اتصال</h3>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
						<div className='bg-gray-50 rounded-lg p-3'>
							<p className='text-xs text-gray-500 mb-1.5'>آدرس آیپی</p>
							<p className='text-sm font-semibold text-gray-900 font-mono'>
								{history.ip_address.split(',')[0]}
							</p>
						</div>
						<div className='bg-gray-50 rounded-lg p-3'>
							<p className='text-xs text-gray-500 mb-1.5'>شهر</p>
							<p className='text-sm font-semibold text-gray-900'>
								{history.ip_address.split(',')[1]?.trim() || 'نامشخص'}
							</p>
						</div>
						<div className='bg-gray-50 rounded-lg p-3'>
							<p className='text-xs text-gray-500 mb-1.5'>استان</p>
							<p className='text-sm font-semibold text-gray-900'>
								{history.ip_address.split(',')[2]?.trim() || 'نامشخص'}
							</p>
						</div>
						<div className='bg-gray-50 rounded-lg p-3'>
							<p className='text-xs text-gray-500 mb-1.5'>کشور</p>
							<p className='text-sm font-semibold text-gray-900'>
								{history.ip_address.split(',')[6]?.trim() || 'نامشخص'}
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
