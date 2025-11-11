import {
	ArrowRight,
	Calendar,
	Loader2,
	Package,
	Receipt,
	Truck,
	User,
	Warehouse,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCurrency, formatDate } from '../lib/utils';
import { invoiceService } from '../services/api';
import type { InvoiceById } from '../types';

export default function InvoiceDetails() {
	const navigate = useNavigate();
	const { id: invoiceId } = useParams();
	const [invoice, setInvoice] = useState<InvoiceById | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (invoiceId) {
			fetchInvoiceDetails();
		}
	}, [invoiceId]);

	const fetchInvoiceDetails = async () => {
		if (!invoiceId) return;

		try {
			setLoading(true);
			setError('');
			const data = await invoiceService.getInvoiceById(invoiceId);
			setInvoice(data);
		} catch (err: any) {
			console.error('Error fetching invoice details:', err);
			setError('خطا در بارگذاری جزئیات فاکتور');
		} finally {
			setLoading(false);
		}
	};

	const getPaymentStatusText = (status: string) => {
		const statusMap: { [key: string]: string } = {
			NOT_PAID: 'پرداخت نشده',
			PARTIALLY_PAID: 'پرداخت جزئی',
			PAID: 'پرداخت شده',
		};
		return statusMap[status] || status;
	};

	const getSourceText = (source: string) => {
		const sourceMap: { [key: string]: string } = {
			PURCHASED: 'خرید',
			RETURNED: 'مرجوعی',
			INVENTORY: 'انبار گردانی',
		};
		return sourceMap[source] || source;
	};

	const getPaymentStatusColor = (status: string) => {
		const colorMap: { [key: string]: string } = {
			NOT_PAID: 'bg-red-100 text-red-800',
			PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
			PAID: 'bg-green-100 text-green-800',
		};
		return colorMap[status] || 'bg-gray-100 text-gray-800';
	};

	const getDeliveryMethodText = (method: string) => {
		const methodMap: { [key: string]: string } = {
			FREE_OUR_TRUCK: 'رایگان با ماشین شرکت',
			FREE_OTHER_SERVICES: 'رایگان با سرویس خارجی',
			PAID: 'ارسال با هزینه مشتری',
			AT_INVENTORY: 'تحویل درب انبار',
		};
		return methodMap[method] || method;
	};

	const getStepText = (step: string) => {
		const stepMap: { [key: string]: string } = {
			SELLER: 'فروشنده',
			SALES_MANAGER: 'مدیر فروش',
			PROCESSING: 'آماده سازی',
			INVENTORY: 'انبار',
			ACCOUNTING: 'حسابداری',
			CARGO: 'مرسوله',
			PARTIALLY_DELIVERED: 'تحویل جزئی',
			DELIVERED: 'تحویل داده شده',
			PARTIALLY_RETURNED: 'مرجوعی جزئی',
			RETURNED: 'مرجوعی کامل',
		};
		return stepMap[step] || step;
	};

	const getInvoiceTypeText = (type: string) => {
		const typeMap: { [key: string]: string } = {
			PURCHASE: 'خرید',
			RETURN_FROM_PURCHASE: 'بازگشت از خرید',
			SELL: 'فروش',
		};
		return typeMap[type] || type;
	};

	const getInvoiceTypeColor = (type: string) => {
		const colorMap: { [key: string]: string } = {
			PURCHASE: 'bg-blue-100 text-blue-800',
			RETURN_FROM_PURCHASE: 'bg-orange-100 text-orange-800',
			SELL: 'bg-green-100 text-green-800',
		};
		return colorMap[type] || 'bg-gray-100 text-gray-800';
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

	if (error || !invoice) {
		return (
			<div className='text-center py-12'>
				<div className='text-red-500 mb-4'>
					{error || 'فاکتور یافت نشد'}
				</div>
				<button
					onClick={() => navigate('/manage/invoices')}
					className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors'
				>
					بازگشت به لیست فاکتورها
				</button>
			</div>
		);
	}

	// Calculate total products amount
	const totalProductsAmount = (invoice.products || []).reduce(
		(sum, product) => sum + product.price * product.net_weight,
		0,
	);

	return (
		<div className='fade-in font-vazir max-w-7xl mx-auto'>
			{/* Header */}
			<div className='mb-8'>
				<button
					onClick={() => navigate('/manage/invoices')}
					className='mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm'
				>
					<ArrowRight className='w-4 h-4 ml-2' />
					بازگشت
				</button>
				<div className='flex items-start justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900 mb-2'>
							جزئیات فاکتور #{invoice.code}
						</h1>
						<p className='text-gray-500'>
							{getInvoiceTypeText(invoice.type)} •{' '}
							{getPaymentStatusText(invoice.payment_status)}
						</p>
					</div>
					<div className='flex items-center space-x-reverse space-x-3'>
						<span
							className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold ${getInvoiceTypeColor(
								invoice.type,
							)}`}
						>
							{getInvoiceTypeText(invoice.type)}
						</span>
						<span
							className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold ${getPaymentStatusColor(
								invoice.payment_status,
							)}`}
						>
							{getPaymentStatusText(invoice.payment_status)}
						</span>
					</div>
				</div>
			</div>

			{/* Summary Cards */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center'>
							<Receipt className='w-4 h-4 text-blue-600' />
						</div>
						<h3 className='font-bold text-gray-900'>کد فاکتور</h3>
					</div>
					<p className='text-2xl font-bold text-gray-900'>#{invoice.code}</p>
				</div>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center'>
							<Receipt className='w-4 h-4 text-green-600' />
						</div>
						<h3 className='font-bold text-gray-900'>مبلغ فاکتور</h3>
					</div>
					<p className='text-2xl font-bold text-green-600'>
						{formatCurrency(invoice.amount)}
					</p>
				</div>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center'>
							<Package className='w-4 h-4 text-purple-600' />
						</div>
						<h3 className='font-bold text-gray-900'>مبلغ کل محصولات</h3>
					</div>
					<p className='text-2xl font-bold text-purple-600'>
						{formatCurrency(totalProductsAmount)}
					</p>
				</div>
			</div>

			{/* Info Grid */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6'>
				{/* Invoice Info */}
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-5'>
						<div className='w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center'>
							<Receipt className='w-4 h-4 text-emerald-600' />
						</div>
						<h3 className='font-bold text-gray-900'>اطلاعات فاکتور</h3>
					</div>
					<div className='space-y-4'>
						<div>
							<p className='text-xs text-gray-500 mb-1.5'>تاریخ فاکتور</p>
							<p className='text-sm font-semibold text-gray-900'>
								{formatDate(invoice.date)}
							</p>
						</div>
						{invoice.due_date && (
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>تاریخ سررسید</p>
								<p className='text-sm font-semibold text-gray-900'>
									{formatDate(invoice.due_date)}
								</p>
							</div>
						)}
						<div>
							<p className='text-xs text-gray-500 mb-1.5'>وضعیت</p>
							<p className='text-sm font-semibold'>
								{invoice.deleted ? (
									<span className='text-red-600'>حذف شده</span>
								) : (
									<span className='text-green-600'>فعال</span>
								)}
							</p>
						</div>
						{invoice.description && (
							<div className='pt-4 border-t border-gray-100'>
								<p className='text-xs text-gray-500 mb-1.5'>توضیحات</p>
								<p className='text-sm text-gray-700 bg-gray-50 rounded-lg p-3'>
									{invoice.description}
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Customer */}
				{invoice.customer && (
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
									{invoice.customer.title}
								</p>
							</div>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>کد مشتری</p>
								<p className='text-sm font-semibold text-gray-900'>
									{invoice.customer.code}
								</p>
							</div>
							{invoice.customer.phone && (
								<div>
									<p className='text-xs text-gray-500 mb-1.5'>تلفن</p>
									<p className='text-sm font-semibold text-gray-900'>
										{invoice.customer.phone}
									</p>
								</div>
							)}
							{invoice.customer.address && (
								<div>
									<p className='text-xs text-gray-500 mb-1.5'>آدرس</p>
									<p className='text-sm font-semibold text-gray-900'>
										{invoice.customer.address}
									</p>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Order */}
				{invoice.order && (
					<div className='bg-white rounded-xl border border-gray-200 p-6'>
						<div className='flex items-center justify-between mb-5'>
							<div className='flex items-center space-x-reverse space-x-2'>
								<div className='w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center'>
									<Package className='w-4 h-4 text-blue-600' />
								</div>
								<h3 className='font-bold text-gray-900'>سفارش</h3>
							</div>
							<button
								onClick={() => navigate(`/manage/orders/${invoice.order!.id}`)}
								className='px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-semibold'
							>
								مشاهده
							</button>
						</div>
						<div className='space-y-4'>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>کد سفارش</p>
								<p className='text-sm font-semibold text-gray-900'>
									#{invoice.order.code}
								</p>
							</div>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>تاریخ تحویل</p>
								<p className='text-sm font-semibold text-gray-900'>
									{formatDate(invoice.order.delivery_date)}
								</p>
							</div>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>روش تحویل</p>
								<p className='text-sm font-semibold text-gray-900'>
									{getDeliveryMethodText(invoice.order.delivery_method)}
								</p>
							</div>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>وضعیت پرداخت</p>
								<span
									className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold ${getPaymentStatusColor(
										invoice.order.payment_status,
									)}`}
								>
									{getPaymentStatusText(invoice.order.payment_status)}
								</span>
							</div>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>مرحله</p>
								<p className='text-sm font-semibold text-gray-900'>
									{getStepText(invoice.order.step)}
								</p>
							</div>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>وضعیت</p>
								<p className='text-sm font-semibold text-gray-900'>
									{invoice.order.fulfilled ? 'تحویل شده' : 'در انتظار'}
								</p>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Receiving & Cargo */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
				{/* Receiving */}
				{invoice.receiving && (
					<div className='bg-white rounded-xl border border-gray-200 p-6'>
						<div className='flex items-center space-x-reverse space-x-2 mb-5'>
							<div className='w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center'>
								<Truck className='w-4 h-4 text-green-600' />
							</div>
							<h3 className='font-bold text-gray-900'>ورودی</h3>
						</div>
						<div className='space-y-4'>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>کد ورودی</p>
								<p className='text-sm font-semibold text-gray-900'>
									#{invoice.receiving.code}
								</p>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<p className='text-xs text-gray-500 mb-1.5'>تاریخ ورودی</p>
									<p className='text-sm font-semibold text-gray-900'>
										{formatDate(invoice.receiving.date)}
									</p>
								</div>
								<div>
									<p className='text-xs text-gray-500 mb-1.5'>پلاک خودرو</p>
									<p className='text-sm font-semibold text-gray-900'>
										{invoice.receiving.license_plate}
									</p>
								</div>
								<div>
									<p className='text-xs text-gray-500 mb-1.5'>نام راننده</p>
									<p className='text-sm font-semibold text-gray-900'>
										{invoice.receiving.driver_name}
									</p>
								</div>
								<div>
									<p className='text-xs text-gray-500 mb-1.5'>منبع</p>
									<p className='text-sm font-semibold text-gray-900'>
										{getSourceText(invoice.receiving.source)}
									</p>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Cargo */}
				{invoice.cargo && (
					<div className='bg-white rounded-xl border border-gray-200 p-6'>
						<div className='flex items-center space-x-reverse space-x-2 mb-5'>
							<div className='w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center'>
								<Truck className='w-4 h-4 text-indigo-600' />
							</div>
							<h3 className='font-bold text-gray-900'>مرسوله</h3>
						</div>
						<div className='space-y-4'>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>کد مرسوله</p>
								<p className='text-sm font-semibold text-gray-900'>
									#{invoice.cargo.code}
								</p>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<p className='text-xs text-gray-500 mb-1.5'>تاریخ مرسوله</p>
									<p className='text-sm font-semibold text-gray-900'>
										{formatDate(invoice.cargo.date)}
									</p>
								</div>
								<div>
									<p className='text-xs text-gray-500 mb-1.5'>روش تحویل</p>
									<p className='text-sm font-semibold text-gray-900'>
										{getDeliveryMethodText(invoice.cargo.delivery_method)}
									</p>
								</div>
								{invoice.cargo.truck && (
									<div>
										<p className='text-xs text-gray-500 mb-1.5'>پلاک خودرو</p>
										<p className='text-sm font-semibold text-gray-900'>
											{invoice.cargo.truck.license_plate}
										</p>
									</div>
								)}
								{invoice.cargo.truck?.driver && (
									<div>
										<p className='text-xs text-gray-500 mb-1.5'>راننده</p>
										<p className='text-sm font-semibold text-gray-900'>
											{invoice.cargo.truck.driver.first_name}{' '}
											{invoice.cargo.truck.driver.last_name}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Products List */}
			{invoice.products && invoice.products.length > 0 && (
				<div className='bg-white rounded-xl border border-gray-200 p-6 mb-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-5'>
						<div className='w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center'>
							<Package className='w-4 h-4 text-purple-600' />
						</div>
						<h3 className='font-bold text-gray-900'>
							محصولات فاکتور ({invoice.products.length})
						</h3>
					</div>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className='bg-gray-50'>
								<tr>
									<th className='px-4 py-3 text-right text-xs font-semibold text-gray-700'>
										نام محصول
									</th>
									<th className='px-4 py-3 text-center text-xs font-semibold text-gray-700'>
										قیمت واحد
									</th>
									<th className='px-4 py-3 text-center text-xs font-semibold text-gray-700'>
										وزن خالص
									</th>
									<th className='px-4 py-3 text-center text-xs font-semibold text-gray-700'>
										مبلغ کل
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-100'>
								{invoice.products.map((product, index) => {
									const productTotal = product.price * product.net_weight;
									return (
										<tr
											key={product.product_id}
											className='hover:bg-gray-50 transition-colors'
										>
											<td className='px-4 py-3'>
												<p className='text-sm font-semibold text-gray-900'>
													{product.product_title}
												</p>
												<p className='text-xs text-gray-500 mt-0.5'>
													شناسه: {product.product_id}
												</p>
											</td>
											<td className='px-4 py-3 text-center'>
												<p className='text-sm font-semibold text-gray-900'>
													{formatCurrency(product.price)}
												</p>
											</td>
											<td className='px-4 py-3 text-center'>
												<p className='text-sm font-semibold text-gray-900'>
													{product.net_weight.toLocaleString('fa-IR')} کیلوگرم
												</p>
											</td>
											<td className='px-4 py-3 text-center'>
												<p className='text-base font-bold text-green-600'>
													{formatCurrency(productTotal)}
												</p>
											</td>
										</tr>
									);
								})}
							</tbody>
							<tfoot className='bg-gray-50'>
								<tr>
									<td
										colSpan={3}
										className='px-4 py-3 text-right text-sm font-bold text-gray-900'
									>
										جمع کل محصولات:
									</td>
									<td className='px-4 py-3 text-center text-lg font-bold text-green-600'>
										{formatCurrency(totalProductsAmount)}
									</td>
								</tr>
							</tfoot>
						</table>
					</div>
				</div>
			)}

			{/* Additional Info */}
			<div className='bg-white rounded-xl border border-gray-200 p-6'>
				<div className='flex items-center space-x-reverse space-x-2 mb-5'>
					<div className='w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center'>
						<Receipt className='w-4 h-4 text-gray-600' />
					</div>
					<h3 className='font-bold text-gray-900'>اطلاعات اضافی</h3>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					{invoice.cargo_id && (
						<div>
							<p className='text-xs text-gray-500 mb-1.5'>مرسوله</p>
							<p className='text-sm font-semibold text-gray-900'>
								شناسه: {invoice.cargo_id}
							</p>
						</div>
					)}
					{invoice.driver_id && (
						<div>
							<p className='text-xs text-gray-500 mb-1.5'>راننده</p>
							<p className='text-sm font-semibold text-gray-900'>
								شناسه: {invoice.driver_id}
							</p>
						</div>
					)}
					{invoice.warehouse_id && (
						<div>
							<p className='text-xs text-gray-500 mb-1.5'>انبار</p>
							<p className='text-sm font-semibold text-gray-900'>
								شناسه: {invoice.warehouse_id}
							</p>
						</div>
					)}
					{invoice.wallet_id && (
						<div>
							<p className='text-xs text-gray-500 mb-1.5'>کیف پول</p>
							<p className='text-sm font-semibold text-gray-900'>
								شناسه: {invoice.wallet_id}
							</p>
						</div>
					)}
					{invoice.hp_code && (
						<div>
							<p className='text-xs text-gray-500 mb-1.5'>کد HP</p>
							<p className='text-sm font-semibold text-gray-900'>
								{invoice.hp_code}
							</p>
							{invoice.hp_title && (
								<p className='text-xs text-gray-600 mt-1'>{invoice.hp_title}</p>
							)}
						</div>
					)}
					<div>
						<p className='text-xs text-gray-500 mb-1.5'>تاریخ ایجاد</p>
						<p className='text-sm font-semibold text-gray-900'>
							{formatDate(invoice.created_at)}
						</p>
					</div>
					<div>
						<p className='text-xs text-gray-500 mb-1.5'>آخرین بروزرسانی</p>
						<p className='text-sm font-semibold text-gray-900'>
							{formatDate(invoice.updated_at)}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
