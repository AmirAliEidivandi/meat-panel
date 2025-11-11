import { Check, Package, ShoppingCart, User, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { customerService, orderService, productService } from '../services/api';
import type {
	CreateFailedProductDto,
	CreateOrderFromRequestDto,
	CreateOrderedProductDto,
	CustomerDetails,
	CustomerRequestDetails,
	Product,
} from '../types';

interface CreateOrderFromRequestModalProps {
	request: CustomerRequestDetails;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (orderId: string) => void;
}

export default function CreateOrderFromRequestModal({
	request,
	isOpen,
	onClose,
	onSuccess,
}: CreateOrderFromRequestModalProps) {
	const [customer, setCustomer] = useState<CustomerDetails | null>(null);
	const [products, setProducts] = useState<Product[]>([]);
	const [selectedPersonId, setSelectedPersonId] = useState<string>('');
	const [bought, setBought] = useState<boolean>(true);
	const [selectedProducts, setSelectedProducts] = useState<
		Map<string, { selected: boolean; isOrdered: boolean }>
	>(new Map());
	const [notPurchasedReason, setNotPurchasedReason] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (isOpen && request) {
			fetchCustomerDetails();
			fetchProducts();
			initializeSelectedProducts();
		}
	}, [isOpen, request]);

	const fetchCustomerDetails = async () => {
		if (!request.customer.id) return;

		try {
			const data = await customerService.getCustomerById(request.customer.id);
			setCustomer(data);
			if (data.people && data.people.length > 0) {
				setSelectedPersonId(data.people[0].id);
			}
		} catch (err: any) {
			console.error('Error fetching customer details:', err);
			setError('خطا در بارگذاری اطلاعات مشتری');
		}
	};

	const fetchProducts = async () => {
		try {
			const productIds = request.request_items.map(item => item.product_id);
			const productsData: Product[] = [];
			for (const productId of productIds) {
				try {
					const product = await productService.getProductById(productId);
					productsData.push(product);
				} catch (err) {
					console.error(`Error fetching product ${productId}:`, err);
				}
			}
			setProducts(productsData);
		} catch (err: any) {
			console.error('Error fetching products:', err);
		}
	};

	const initializeSelectedProducts = () => {
		const map = new Map<string, { selected: boolean; isOrdered: boolean }>();
		request.request_items.forEach(item => {
			map.set(item.product_id, { selected: true, isOrdered: true });
		});
		setSelectedProducts(map);
	};

	const handleProductToggle = (productId: string, isOrdered: boolean) => {
		setSelectedProducts(prev => {
			const newMap = new Map(prev);
			const current = newMap.get(productId) || {
				selected: false,
				isOrdered: true,
			};
			newMap.set(productId, {
				selected: !current.selected,
				isOrdered: isOrdered,
			});
			return newMap;
		});
	};

	const handleProductTypeChange = (productId: string, isOrdered: boolean) => {
		setSelectedProducts(prev => {
			const newMap = new Map(prev);
			const current = newMap.get(productId) || {
				selected: true,
				isOrdered: true,
			};
			newMap.set(productId, {
				selected: current.selected,
				isOrdered: isOrdered,
			});
			return newMap;
		});
	};

	const handleSubmit = async () => {
		if (!selectedPersonId) {
			setError('لطفاً شخص تماس‌گیرنده را انتخاب کنید');
			return;
		}

		if (!customer) {
			setError('اطلاعات مشتری یافت نشد');
			return;
		}

		try {
			setSubmitting(true);
			setError('');

			const orderedBasket: CreateOrderedProductDto[] = [];
			const failedBasket: CreateFailedProductDto[] = [];

			request.request_items.forEach(item => {
				const selection = selectedProducts.get(item.product_id);
				if (!selection || !selection.selected) return;

				const product = products.find(p => p.id === item.product_id);
				if (!product) return;

				if (selection.isOrdered) {
					orderedBasket.push({
						id: item.product_id,
						price: item.online_price || product.online_price || 0,
						weight: item.weight,
						sec_unit_amount: item.weight,
						retail_price: product.retail_price || 0,
						wholesale_price: product.wholesale_price || 0,
						online_price: item.online_price || product.online_price || 0,
						inventory_net_weight: product.net_weight || 0,
					});
				} else {
					failedBasket.push({
						id: item.product_id,
						price: item.online_price || product.online_price || 0,
						weight: item.weight,
						locked: product.locked || false,
						not_purchased_reason: notPurchasedReason || 'OTHER',
						retail_price: product.retail_price || 0,
						wholesale_price: product.wholesale_price || 0,
						online_price: item.online_price || product.online_price || 0,
					});
				}
			});

			// Determine bought status based on baskets
			// If there are ordered products, bought should be true
			// If there are only failed products, bought should be false
			const finalBought = orderedBasket.length > 0;

			if (finalBought && orderedBasket.length === 0) {
				setError('لطفاً حداقل یک محصول را به عنوان خریداری شده انتخاب کنید');
				return;
			}

			if (!finalBought && failedBasket.length === 0) {
				setError('لطفاً حداقل یک محصول را به عنوان ناموفق انتخاب کنید');
				return;
			}

			const orderData: CreateOrderFromRequestDto = {
				customer_request_id: request.id,
				customer_id: request.customer.id,
				person_id: selectedPersonId,
				bought: finalBought,
				not_purchased_reason: finalBought
					? undefined
					: notPurchasedReason || 'OTHER',
				ordered_basket:
					finalBought && orderedBasket.length > 0 ? orderedBasket : undefined,
				failed_basket:
					!finalBought || failedBasket.length > 0 ? failedBasket : undefined,
				address: request.address || undefined,
			};

			const order = await orderService.createOrderFromRequest(orderData);
			onSuccess(order.id);
			onClose();
		} catch (err: any) {
			console.error('Error creating order:', err);
			setError(err.response?.data?.message || 'خطا در ایجاد سفارش');
		} finally {
			setSubmitting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
			<div className='bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
				{/* Header */}
				<div className='flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<ShoppingCart className='w-6 h-6 text-blue-600' />
						<h2 className='text-xl font-bold text-gray-900'>
							ساخت سفارش از درخواست
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
				<div className='p-6 space-y-6'>
					{error && (
						<div className='bg-red-50 border border-red-200 rounded-lg p-4'>
							<p className='text-red-600'>{error}</p>
						</div>
					)}

					{/* Customer Info */}
					<div className='bg-gray-50 rounded-lg p-4'>
						<div className='flex items-center space-x-reverse space-x-2 mb-3'>
							<User className='w-5 h-5 text-blue-600' />
							<h3 className='font-semibold text-gray-900'>اطلاعات مشتری</h3>
						</div>
						<p className='text-sm text-gray-700'>
							{request.customer.title || 'نامشخص'} - کد: {request.customer.code}
						</p>
					</div>

					{/* Person Selection */}
					{customer && customer.people && customer.people.length > 0 && (
						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								شخص تماس‌گیرنده *
							</label>
							<select
								value={selectedPersonId}
								onChange={e => setSelectedPersonId(e.target.value)}
								className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
							>
								{customer.people.map(person => (
									<option key={person.id} value={person.id}>
										{person.profile.first_name} {person.profile.last_name} -{' '}
										{person.profile.mobile}
									</option>
								))}
							</select>
						</div>
					)}

					{/* Bought Status */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-3'>
							وضعیت خرید *
						</label>
						<div className='flex items-center space-x-reverse space-x-4'>
							<label className='flex items-center space-x-reverse space-x-2 cursor-pointer'>
								<input
									type='radio'
									name='bought'
									checked={bought === true}
									onChange={() => setBought(true)}
									className='w-4 h-4 text-blue-600'
								/>
								<span className='text-sm text-gray-700'>خریداری شده</span>
							</label>
							<label className='flex items-center space-x-reverse space-x-2 cursor-pointer'>
								<input
									type='radio'
									name='bought'
									checked={bought === false}
									onChange={() => setBought(false)}
									className='w-4 h-4 text-blue-600'
								/>
								<span className='text-sm text-gray-700'>خریداری نشده</span>
							</label>
						</div>
					</div>

					{/* Not Purchased Reason */}
					{!bought && (
						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								دلیل خریداری نشدن
							</label>
							<select
								value={notPurchasedReason}
								onChange={e => setNotPurchasedReason(e.target.value)}
								className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
							>
								<option value=''>انتخاب کنید</option>
								<option value='PRICE_TOO_HIGH'>قیمت بالا</option>
								<option value='NOT_AVAILABLE'>موجود نیست</option>
								<option value='OLD_PRICE'>قیمت قدیمی</option>
								<option value='MARKET_LOCKED'>بازار قفل</option>
								<option value='OTHER'>سایر</option>
							</select>
						</div>
					)}

					{/* Products List */}
					<div>
						<h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center'>
							<Package className='w-5 h-5 ml-2 text-orange-600' />
							محصولات ({request.request_items.length})
						</h3>
						<div className='space-y-3'>
							{request.request_items.map((item, index) => {
								const product = products.find(p => p.id === item.product_id);
								const selection = selectedProducts.get(item.product_id);
								const isSelected = selection?.selected ?? true;
								const isOrdered = selection?.isOrdered ?? true;

								return (
									<div
										key={item.product_id}
										className='border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all'
									>
										<div className='flex items-center justify-between mb-3'>
											<div className='flex items-center space-x-reverse space-x-3 flex-1'>
												<input
													type='checkbox'
													checked={isSelected}
													onChange={() =>
														handleProductToggle(item.product_id, isOrdered)
													}
													className='w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
												/>
												<div className='flex-1'>
													<h4 className='font-semibold text-gray-900'>
														{item.product_title} (کد: {item.product_code})
													</h4>
													<p className='text-sm text-gray-600'>
														وزن: {item.weight.toLocaleString('fa-IR')} کیلوگرم -
														قیمت:{' '}
														{item.online_price?.toLocaleString('fa-IR') ||
															'نامشخص'}{' '}
														ریال
													</p>
												</div>
											</div>
											{bought && isSelected && (
												<div className='flex items-center space-x-reverse space-x-2'>
													<button
														onClick={() =>
															handleProductTypeChange(item.product_id, true)
														}
														className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
															isOrdered
																? 'bg-green-100 text-green-800'
																: 'bg-gray-100 text-gray-600'
														}`}
													>
														<Check className='w-4 h-4 inline ml-1' />
														خریداری شده
													</button>
													<button
														onClick={() =>
															handleProductTypeChange(item.product_id, false)
														}
														className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
															!isOrdered
																? 'bg-red-100 text-red-800'
																: 'bg-gray-100 text-gray-600'
														}`}
													>
														<XCircle className='w-4 h-4 inline ml-1' />
														ناموفق
													</button>
												</div>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className='flex items-center justify-end space-x-reverse space-x-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white'>
					<button
						onClick={onClose}
						className='px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold'
					>
						انصراف
					</button>
					<button
						onClick={handleSubmit}
						disabled={submitting}
						className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center space-x-reverse space-x-2'
					>
						{submitting ? (
							<>
								<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
								<span>در حال ایجاد...</span>
							</>
						) : (
							<>
								<ShoppingCart className='w-5 h-5' />
								<span>ایجاد سفارش</span>
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
