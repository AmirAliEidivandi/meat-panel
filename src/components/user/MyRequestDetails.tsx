import { ArrowRight, Package, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDate } from '../../lib/utils';
import { fileUrl, myRequestsService } from '../../services/api';
import type { MyRequestDetailsResponse } from '../../types';

export default function MyRequestDetails() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const [request, setRequest] = useState<MyRequestDetailsResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (id) {
			fetchRequestDetails();
		}
	}, [id]);

	const fetchRequestDetails = async () => {
		if (!id) return;

		try {
			setLoading(true);
			setError('');
			const data = await myRequestsService.getMyRequestById(id);
			setRequest(data);
		} catch (err: any) {
			console.error('Error fetching request details:', err);
			setError('خطا در بارگذاری جزئیات درخواست');
		} finally {
			setLoading(false);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('fa-IR', {
			style: 'currency',
			currency: 'IRR',
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const getStatusText = (status: string) => {
		const statusMap: Record<string, string> = {
			PENDING: 'در انتظار',
			APPROVED: 'تأیید شده',
			REJECTED: 'رد شده',
			CONVERTED_TO_ORDER: 'تبدیل به سفارش',
		};
		return statusMap[status] || status;
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'PENDING':
				return 'bg-yellow-100 text-yellow-800';
			case 'APPROVED':
				return 'bg-green-100 text-green-800';
			case 'REJECTED':
				return 'bg-red-100 text-red-800';
			case 'CONVERTED_TO_ORDER':
				return 'bg-blue-100 text-blue-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getPaymentMethodText = (method: string) => {
		const methodMap: Record<string, string> = {
			CASH: 'نقدی',
			DEPOSIT_TO_ACCOUNT: 'واریز به حساب',
			CHEQUE: 'چک',
			CREDIT: 'اعتباری',
			WALLET: 'کیف پول',
		};
		return methodMap[method] || method;
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<div className='w-8 h-8 border-[3px] border-primary-600 border-t-transparent rounded-full animate-spin'></div>
			</div>
		);
	}

	if (error || !request) {
		return (
			<div className='text-center py-12'>
				<div className='text-red-500 mb-4'>{error || 'درخواست یافت نشد'}</div>
				<button
					onClick={() => navigate('/user/requests')}
					className='px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'
				>
					بازگشت به لیست
				</button>
			</div>
		);
	}

	return (
		<div className='max-w-6xl mx-auto'>
			<div className='bg-white rounded-xl shadow-lg p-8'>
				{/* Header */}
				<div className='flex items-center justify-between mb-8'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<button
							onClick={() => navigate('/user/requests')}
							className='flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors'
						>
							<ArrowRight className='w-5 h-5 text-gray-600' />
						</button>
						<div className='w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center'>
							<Package className='w-6 h-6 text-orange-600' />
						</div>
						<div>
							<h2 className='text-2xl font-bold text-gray-900'>
								{request.code
									? `درخواست #${request.code}`
									: `درخواست ${request.id.slice(0, 8)}...`}
							</h2>
							<p className='text-gray-600 text-sm mt-1'>
								{formatDate(request.created_at)}
							</p>
						</div>
					</div>
					<button
						onClick={fetchRequestDetails}
						className='inline-flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200'
					>
						<RefreshCw className='w-4 h-4 ml-2' />
						بروزرسانی
					</button>
				</div>

				{/* Status and Info */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
					<div className='bg-gray-50 rounded-lg p-6'>
						<p className='text-sm text-gray-600 mb-2'>وضعیت</p>
						<span
							className={`inline-flex items-center px-4 py-2 rounded-full text-base font-semibold ${getStatusColor(
								request.status,
							)}`}
						>
							{getStatusText(request.status)}
						</span>
					</div>
					<div className='bg-gray-50 rounded-lg p-6'>
						<p className='text-sm text-gray-600 mb-2'>روش پرداخت</p>
						<p className='text-base font-semibold text-gray-900'>
							{getPaymentMethodText(request.payment_method)}
						</p>
					</div>
				</div>

				{/* Request Items */}
				<div className='mb-8'>
					<h3 className='text-xl font-bold text-gray-900 mb-4'>
						محصولات درخواست
					</h3>
					<div className='space-y-4'>
						{request.request_items &&
						Array.isArray(request.request_items) &&
						request.request_items.length > 0 ? (
							request.request_items.map((item, index) => (
								<div
									key={index}
									className='p-6 border-2 border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow'
								>
									<div className='flex items-start space-x-reverse space-x-4'>
										{/* Product Image */}
										{item.images &&
											Array.isArray(item.images) &&
											item.images.length > 0 && (
												<div className='flex-shrink-0'>
													<img
														src={
															fileUrl(
																item.images[0].thumbnail || item.images[0].url,
															) || ''
														}
														alt={item.product_title}
														className='w-20 h-20 object-cover rounded-lg border-2 border-gray-200'
													/>
												</div>
											)}
										<div className='flex-1'>
											<h4 className='text-lg font-bold text-gray-900 mb-2'>
												{item.product_title}
											</h4>
											<div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4'>
												<div>
													<p className='text-xs text-gray-500 mb-1'>کد محصول</p>
													<p className='text-sm font-semibold text-gray-900'>
														{item.product_code}
													</p>
												</div>
												<div>
													<p className='text-xs text-gray-500 mb-1'>
														وزن (کیلوگرم)
													</p>
													<p className='text-sm font-semibold text-gray-900'>
														{item.weight}
													</p>
												</div>
												<div>
													<p className='text-xs text-gray-500 mb-1'>
														قیمت واحد
													</p>
													<p className='text-sm font-semibold text-gray-900'>
														{formatCurrency(item.online_price)}
													</p>
												</div>
												<div>
													<p className='text-xs text-gray-500 mb-1'>قیمت کل</p>
													<p className='text-sm font-semibold text-green-600'>
														{formatCurrency(item.total_price)}
													</p>
												</div>
											</div>
										</div>
									</div>
								</div>
							))
						) : (
							<p className='text-gray-500 text-center py-8'>
								محصولی در این درخواست وجود ندارد
							</p>
						)}
					</div>
				</div>

				{/* Summary */}
				<div className='bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200'>
					<h3 className='text-lg font-bold text-gray-900 mb-4'>
						خلاصه درخواست
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<p className='text-sm text-gray-600 mb-1'>تعداد محصولات</p>
							<p className='text-base font-semibold text-gray-900'>
								{request.products_count} عدد
							</p>
						</div>
						<div>
							<p className='text-sm text-gray-600 mb-1'>هزینه حمل</p>
							<p className='text-base font-semibold text-gray-900'>
								{formatCurrency(request.freight_cost)}
							</p>
						</div>
						<div className='md:col-span-2'>
							<p className='text-sm text-gray-600 mb-1'>مبلغ کل</p>
							<p className='text-2xl font-bold text-green-600'>
								{formatCurrency(request.total_price)}
							</p>
						</div>
						{request.address && (
							<div className='md:col-span-2'>
								<p className='text-sm text-gray-600 mb-1'>آدرس</p>
								<p className='text-base font-semibold text-gray-900'>
									{request.address}
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
