import {
	AlertCircle,
	Package,
	Plus,
	Trash2,
	Truck as TruckIcon,
	X,
} from 'lucide-react';
// @ts-ignore - jalaali-js doesn't have type definitions
import { jalaaliToDateObject, toJalaali } from 'jalaali-js';
import { useEffect, useState } from 'react';
import {
	cargoService,
	profileService,
	truckService,
	warehouseService,
} from '../services/api';
import type {
	CreateDispatchCargoDto,
	DeliveryMethodEnum,
	OrderDetails,
	ProductInCargoDto,
	ProfileByGroupsResponse,
	Truck,
} from '../types';
import { DeliveryMethodEnumValues, OrderStepEnumValues } from '../types';
import PersianDatePicker from './PersianDatePicker';

interface CreateDispatchCargoModalProps {
	order: OrderDetails;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

// TODO: Move these to config file
const CARGO_DISPATCH_GROUP_IDS =
	'97ab2a17-83d8-41ed-b1fc-8c7a7e8a96f3+9d9e07a8-2677-4c68-aaf0-0a9c9d775f1f';

interface ProductFormData {
	product_id: string;
	product_title: string;
	product_code: number;
	net_weight: number;
	gross_weight: number;
	sec_unit_amount: number;
	box_weight: number;
	carton_count: number;
	alreadyShipped?: number;
}

export default function CreateDispatchCargoModal({
	order,
	isOpen,
	onClose,
	onSuccess,
}: CreateDispatchCargoModalProps) {
	const [date, setDate] = useState<string>('');
	const [employeeId, setEmployeeId] = useState<string>('');
	const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodEnum>(
		DeliveryMethodEnumValues.AtInventory,
	);
	const [description, setDescription] = useState<string>('');
	const [warehouseId, setWarehouseId] = useState<string>('');
	const [truckId, setTruckId] = useState<string>('');
	const [employees, setEmployees] = useState<ProfileByGroupsResponse['data']>(
		[],
	);
	const [warehouses, setWarehouses] = useState<any[]>([]);
	const [trucks, setTrucks] = useState<Truck[]>([]);
	const [products, setProducts] = useState<ProductFormData[]>([]);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');
	const [shippedWeights, setShippedWeights] = useState<Map<string, number>>(
		new Map(),
	);
	const [loadingTrucks, setLoadingTrucks] = useState(false);

	useEffect(() => {
		if (isOpen) {
			fetchEmployees();
			fetchWarehouses();
			// Set default date to today
			const today = new Date();
			const jalaali = toJalaali(today);
			setDate(
				`${jalaali.jy}/${String(jalaali.jm).padStart(2, '0')}/${String(jalaali.jd).padStart(2, '0')}`,
			);
		}
	}, [isOpen]);

	useEffect(() => {
		if (isOpen && order) {
			fetchShippedWeights();
		}
	}, [isOpen, order]);

	useEffect(() => {
		if (
			isOpen &&
			warehouseId &&
			deliveryMethod === DeliveryMethodEnumValues.FreeOurTruck
		) {
			fetchTrucks(warehouseId);
		} else {
			setTrucks([]);
			setTruckId('');
		}
	}, [isOpen, warehouseId, deliveryMethod]);

	useEffect(() => {
		if (isOpen && order.ordered_basket) {
			initializeProducts();
		}
	}, [shippedWeights, isOpen, order.ordered_basket]);

	const fetchEmployees = async () => {
		try {
			setLoading(true);
			const response = await profileService.getByGroups(
				CARGO_DISPATCH_GROUP_IDS,
			);
			setEmployees(response.data || []);
			if (response.data && response.data.length > 0) {
				setEmployeeId(response.data[0].employee.id);
			}
		} catch (err: any) {
			console.error('Error fetching employees:', err);
			setError('خطا در بارگذاری لیست مسئولین');
		} finally {
			setLoading(false);
		}
	};

	const fetchWarehouses = async () => {
		try {
			const response = await warehouseService.getWarehouses();
			// Handle both array and object with data property
			const warehousesList = Array.isArray(response) ? response : response;
			setWarehouses(warehousesList);
			if (warehousesList.length > 0) {
				setWarehouseId(warehousesList[0].id);
			}
		} catch (err: any) {
			console.error('Error fetching warehouses:', err);
		}
	};

	const fetchShippedWeights = async () => {
		try {
			// Calculate shipped weights from existing cargos
			// We'll use the order's cargos if available, otherwise calculate from API
			if (order.cargos && order.cargos.length > 0) {
				const shippedMap = new Map<string, number>();
				order.cargos.forEach(cargo => {
					if (cargo.type === 'DISPATCH' && cargo.products) {
						cargo.products.forEach((product: any) => {
							const current = shippedMap.get(product.product_id) || 0;
							shippedMap.set(
								product.product_id,
								current + (product.net_weight || 0),
							);
						});
					}
				});
				setShippedWeights(shippedMap);
			}
		} catch (err: any) {
			console.error('Error fetching shipped weights:', err);
		}
	};

	const fetchTrucks = async (warehouseId: string) => {
		if (!warehouseId) {
			setTrucks([]);
			setTruckId('');
			return;
		}

		try {
			setLoadingTrucks(true);
			const response = await truckService.getTrucksByWarehouse(warehouseId);
			setTrucks(response.data || []);
			if (response.data && response.data.length > 0) {
				setTruckId(response.data[0].id);
			} else {
				setTruckId('');
			}
		} catch (err: any) {
			console.error('Error fetching trucks:', err);
			setTrucks([]);
			setTruckId('');
		} finally {
			setLoadingTrucks(false);
		}
	};

	const initializeProducts = () => {
		if (!order.ordered_basket || order.ordered_basket.length === 0) {
			setError('سفارش محصولی ندارد');
			return;
		}

		const productList: ProductFormData[] = order.ordered_basket.map(item => {
			const alreadyShipped = shippedWeights.get(item.product_id) || 0;
			return {
				product_id: item.product_id,
				product_title: item.product_title || 'نامشخص',
				product_code: item.product_code || 0,
				net_weight: item.weight || 0,
				gross_weight: 0,
				sec_unit_amount: item.weight || 0,
				box_weight: 0,
				carton_count: 0,
				alreadyShipped: alreadyShipped,
			};
		});

		setProducts(productList);
	};

	const calculateBoxWeight = (
		grossWeight: number,
		netWeight: number,
		cartonCount: number,
	): number => {
		if (cartonCount <= 0) return 0;
		return (grossWeight - netWeight) / cartonCount;
	};

	const handleProductChange = (
		index: number,
		field: keyof ProductFormData,
		value: number | string,
	) => {
		setProducts((prev: ProductFormData[]) => {
			const newProducts = [...prev];
			const product = { ...newProducts[index] };
			(product as any)[field] = value;

			// Auto-calculate box_weight when gross_weight, net_weight, or carton_count changes
			if (
				field === 'gross_weight' ||
				field === 'net_weight' ||
				field === 'carton_count'
			) {
				product.box_weight = calculateBoxWeight(
					product.gross_weight,
					product.net_weight,
					product.carton_count,
				);
			}

			newProducts[index] = product;
			return newProducts;
		});
	};

	const removeProduct = (index: number) => {
		setProducts(prev => prev.filter((_, i) => i !== index));
	};

	const addProduct = () => {
		if (order.ordered_basket && order.ordered_basket.length > 0) {
			const firstProduct = order.ordered_basket[0];
			const alreadyShipped = shippedWeights.get(firstProduct.product_id) || 0;
			setProducts(prev => [
				...prev,
				{
					product_id: firstProduct.product_id,
					product_title: firstProduct.product_title || 'نامشخص',
					product_code: firstProduct.product_code || 0,
					net_weight: firstProduct.weight || 0,
					gross_weight: 0,
					sec_unit_amount: firstProduct.weight || 0,
					box_weight: 0,
					carton_count: 0,
					alreadyShipped: alreadyShipped,
				},
			]);
		}
	};

	const handleSubmit = async () => {
		if (!date) {
			setError('لطفاً تاریخ را انتخاب کنید');
			return;
		}

		if (!employeeId) {
			setError('لطفاً مسئول بار را انتخاب کنید');
			return;
		}

		if (!warehouseId) {
			setError('لطفاً انبار را انتخاب کنید');
			return;
		}

		if (!deliveryMethod) {
			setError('لطفاً روش ارسال را انتخاب کنید');
			return;
		}

		if (deliveryMethod === DeliveryMethodEnumValues.FreeOurTruck && !truckId) {
			setError('لطفاً ماشین را انتخاب کنید');
			return;
		}

		if (products.length === 0) {
			setError('لطفاً حداقل یک محصول اضافه کنید');
			return;
		}

		// Validate products (only non-disabled ones)
		for (const product of products) {
			const isDisabled = (product.alreadyShipped || 0) > 0.1;
			if (isDisabled) continue; // Skip validation for disabled products

			if (product.gross_weight <= 0) {
				setError(
					`لطفاً وزن ناخالص محصول "${product.product_title}" را وارد کنید`,
				);
				return;
			}
			if (product.carton_count <= 0) {
				setError(
					`لطفاً تعداد کارتن محصول "${product.product_title}" را وارد کنید`,
				);
				return;
			}
			if (product.net_weight <= 0) {
				setError(
					`لطفاً وزن خالص محصول "${product.product_title}" را وارد کنید`,
				);
				return;
			}
			if (product.net_weight > product.gross_weight) {
				setError(
					`وزن خالص نمی‌تواند بیشتر از وزن ناخالص باشد (${product.product_title})`,
				);
				return;
			}
		}

		// Check if there's at least one non-disabled product
		const hasEnabledProducts = products.some(
			p => (p.alreadyShipped || 0) <= 0.1,
		);
		if (!hasEnabledProducts) {
			setError('تمام محصولات قبلاً در مرسوله‌های دیگر ثبت شده‌اند');
			return;
		}

		try {
			setSubmitting(true);
			setError('');

			// Convert Persian date to Gregorian
			if (!date || date.trim() === '') {
				setError('لطفاً تاریخ را وارد کنید');
				setSubmitting(false);
				return;
			}

			const dateParts = date.split('/');
			if (dateParts.length !== 3) {
				setError('فرمت تاریخ نامعتبر است');
				setSubmitting(false);
				return;
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
				setError('تاریخ وارد شده نامعتبر است');
				setSubmitting(false);
				return;
			}

			// Use jalaaliToDateObject which directly converts to Date object
			let dateObj: Date;
			try {
				dateObj = jalaaliToDateObject(persianYear, persianMonth, persianDay);
			} catch (err: any) {
				setError('خطا در تبدیل تاریخ: ' + (err.message || 'تاریخ نامعتبر است'));
				setSubmitting(false);
				return;
			}

			// Validate the date object
			if (!dateObj || isNaN(dateObj.getTime())) {
				setError('تاریخ ایجاد شده نامعتبر است');
				setSubmitting(false);
				return;
			}

			// Preserve current time (hours, minutes, seconds, milliseconds) to maintain chronological order
			const now = new Date();
			dateObj.setHours(now.getHours());
			dateObj.setMinutes(now.getMinutes());
			dateObj.setSeconds(now.getSeconds());
			dateObj.setMilliseconds(now.getMilliseconds());

			// Only include non-disabled products in the cargo
			const cargoProducts: ProductInCargoDto[] = products
				.filter(product => (product.alreadyShipped || 0) <= 0.1)
				.map(product => ({
					product_id: product.product_id,
					net_weight: product.net_weight,
					gross_weight: product.gross_weight,
					sec_unit_amount: product.sec_unit_amount,
					box_weight: product.box_weight > 0 ? product.box_weight : undefined,
				}));

			const cargoData: CreateDispatchCargoDto = {
				order_id: order.id,
				date: dateObj.toISOString(),
				warehouse_id: warehouseId,
				delivery_method: deliveryMethod,
				employee_id: employeeId,
				truck_id:
					deliveryMethod === DeliveryMethodEnumValues.FreeOurTruck
						? truckId
						: undefined,
				description: description || undefined,
				products: cargoProducts,
			};

			await cargoService.createDispatch(cargoData);
			onSuccess();
			onClose();
		} catch (err: any) {
			console.error('Error creating dispatch cargo:', err);
			setError(err.response?.data?.message || 'خطا در ایجاد مرسوله');
		} finally {
			setSubmitting(false);
		}
	};

	if (!isOpen) return null;

	const getDeliveryMethodText = (method: DeliveryMethodEnum) => {
		const methods: Record<DeliveryMethodEnum, string> = {
			[DeliveryMethodEnumValues.AtInventory]: 'درب انبار',
			[DeliveryMethodEnumValues.FreeOurTruck]: 'رایگان با ماشین شرکت',
			[DeliveryMethodEnumValues.FreeOtherServices]: 'رایگان با سرویس خارجی',
			[DeliveryMethodEnumValues.Paid]: 'ارسال با هزینه مشتری',
		};
		return methods[method] || method;
	};

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
			<div className='bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
				{/* Header */}
				<div className='flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<TruckIcon className='w-6 h-6 text-purple-600' />
						<h2 className='text-xl font-bold text-gray-900'>
							ایجاد مرسوله جدید
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

					{/* Check if order is in PROCESSING step */}
					{order.step !== OrderStepEnumValues.Processing && (
						<div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
							<AlertCircle className='w-5 h-5 text-yellow-600 inline ml-2' />
							<span className='text-yellow-800'>
								مرسوله فقط برای سفارش‌های در مرحله "آماده سازی" قابل ثبت است
							</span>
						</div>
					)}

					{/* Dispatch Details */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								تاریخ *
							</label>
							<PersianDatePicker
								value={date}
								onChange={setDate}
								placeholder='انتخاب تاریخ'
								className='w-full'
							/>
						</div>

						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								مسئول بار *
							</label>
							<select
								value={employeeId}
								onChange={e => {
									setEmployeeId(e.target.value);
									setError('');
								}}
								className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
								disabled={loading}
							>
								<option value=''>انتخاب مسئول بار</option>
								{employees.map(emp => (
									<option key={emp.employee.id} value={emp.employee.id}>
										{emp.first_name} {emp.last_name}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								روش ارسال *
							</label>
							<select
								value={deliveryMethod}
								onChange={e => {
									setDeliveryMethod(e.target.value as DeliveryMethodEnum);
									setError('');
									// Reset truck selection when delivery method changes
									if (
										e.target.value !== DeliveryMethodEnumValues.FreeOurTruck
									) {
										setTruckId('');
									}
								}}
								className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
							>
								<option value={DeliveryMethodEnumValues.AtInventory}>
									{getDeliveryMethodText(DeliveryMethodEnumValues.AtInventory)}
								</option>
								<option value={DeliveryMethodEnumValues.FreeOurTruck}>
									{getDeliveryMethodText(DeliveryMethodEnumValues.FreeOurTruck)}
								</option>
								<option value={DeliveryMethodEnumValues.FreeOtherServices}>
									{getDeliveryMethodText(
										DeliveryMethodEnumValues.FreeOtherServices,
									)}
								</option>
								<option value={DeliveryMethodEnumValues.Paid}>
									{getDeliveryMethodText(DeliveryMethodEnumValues.Paid)}
								</option>
							</select>
						</div>

						{deliveryMethod === DeliveryMethodEnumValues.FreeOurTruck && (
							<div>
								<label className='block text-sm font-semibold text-gray-700 mb-2'>
									ماشین *
								</label>
								<select
									value={truckId}
									onChange={e => {
										setTruckId(e.target.value);
										setError('');
									}}
									disabled={loadingTrucks || !warehouseId}
									className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed'
								>
									<option value=''>
										{loadingTrucks
											? 'در حال بارگذاری...'
											: !warehouseId
												? 'ابتدا انبار را انتخاب کنید'
												: trucks.length === 0
													? 'ماشینی یافت نشد'
													: 'انتخاب ماشین'}
									</option>
									{trucks.map(truck => (
										<option key={truck.id} value={truck.id}>
											{truck.license_plate} - {truck.driver.first_name}{' '}
											{truck.driver.last_name} ({truck.type} - ظرفیت:{' '}
											{truck.capacity} تن)
										</option>
									))}
								</select>
							</div>
						)}

						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								انبار *
							</label>
							<select
								value={warehouseId}
								onChange={e => {
									setWarehouseId(e.target.value);
									setError('');
								}}
								className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
							>
								<option value=''>انتخاب انبار</option>
								{warehouses.map(wh => (
									<option key={wh.id} value={wh.id}>
										{wh.name}
									</option>
								))}
							</select>
						</div>
					</div>

					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							توضیحات
						</label>
						<textarea
							value={description}
							onChange={e => {
								setDescription(e.target.value);
								setError('');
							}}
							placeholder='توضیحات (اختیاری)'
							rows={3}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
						/>
					</div>

					{/* Product List */}
					<div>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-lg font-bold text-purple-900 flex items-center'>
								<Package className='w-5 h-5 ml-2' />
								لیست محصولات
							</h3>
							<button
								onClick={addProduct}
								className='px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-semibold flex items-center space-x-reverse space-x-2 transition-colors'
							>
								<Plus className='w-4 h-4' />
								<span>+ اضافه کردن محصول</span>
							</button>
						</div>

						<div className='space-y-4'>
							{products.map((product, index) => {
								const isDisabled = (product.alreadyShipped || 0) > 0.1;
								return (
									<div
										key={index}
										className={`rounded-lg p-4 border-2 ${
											isDisabled
												? 'bg-yellow-50 border-yellow-300'
												: 'bg-gray-50 border-gray-200'
										}`}
									>
										<div className='flex items-center justify-between mb-4'>
											<div className='flex items-center space-x-reverse space-x-2'>
												<h4 className='text-base font-bold text-gray-900'>
													#محصول {index + 1}
												</h4>
												{isDisabled && (
													<span className='px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold'>
														قبلاً ثبت شده ({product.alreadyShipped?.toFixed(2)}{' '}
														کیلوگرم)
													</span>
												)}
											</div>
											<button
												onClick={() => removeProduct(index)}
												disabled={isDisabled}
												className={`p-2 rounded-lg transition-colors ${
													isDisabled
														? 'opacity-50 cursor-not-allowed'
														: 'hover:bg-red-100'
												}`}
											>
												<Trash2 className='w-4 h-4 text-red-600' />
											</button>
										</div>

										<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
											<div>
												<label className='block text-sm font-semibold text-gray-700 mb-2'>
													محصول *
												</label>
												<select
													value={product.product_id}
													onChange={e =>
														handleProductChange(
															index,
															'product_id',
															e.target.value,
														)
													}
													disabled={isDisabled}
													className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
														isDisabled
															? 'border-gray-200 bg-gray-100 cursor-not-allowed'
															: 'border-gray-300'
													}`}
												>
													{order.ordered_basket?.map(item => (
														<option
															key={item.product_id}
															value={item.product_id}
														>
															{item.product_title} (کد: {item.product_code})
														</option>
													))}
												</select>
											</div>

											<div>
												<label className='block text-sm font-semibold text-gray-700 mb-2'>
													وزن ناخالص (به کیلوگرم) *
												</label>
												<input
													type='number'
													value={product.gross_weight || ''}
													onChange={e =>
														handleProductChange(
															index,
															'gross_weight',
															parseFloat(e.target.value) || 0,
														)
													}
													placeholder='0'
													min='0'
													step='0.01'
													disabled={isDisabled}
													className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
														isDisabled
															? 'border-gray-200 bg-gray-100 cursor-not-allowed'
															: 'border-gray-300'
													}`}
												/>
											</div>

											<div>
												<label className='block text-sm font-semibold text-gray-700 mb-2'>
													تعداد کارتن *
												</label>
												<input
													type='number'
													value={product.carton_count || ''}
													onChange={e =>
														handleProductChange(
															index,
															'carton_count',
															parseInt(e.target.value) || 0,
														)
													}
													placeholder='0'
													min='0'
													disabled={isDisabled}
													className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
														isDisabled
															? 'border-gray-200 bg-gray-100 cursor-not-allowed'
															: 'border-gray-300'
													}`}
												/>
											</div>

											<div>
												<label className='block text-sm font-semibold text-gray-700 mb-2'>
													وزن هر کارتن (به کیلوگرم)
												</label>
												<input
													type='number'
													value={
														product.box_weight > 0
															? product.box_weight.toFixed(2)
															: ''
													}
													readOnly
													placeholder='محاسبه خودکار'
													className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-100'
												/>
											</div>

											<div>
												<label className='block text-sm font-semibold text-gray-700 mb-2'>
													وزن خالص (به کیلوگرم) *
												</label>
												<input
													type='number'
													value={product.net_weight || ''}
													onChange={e =>
														handleProductChange(
															index,
															'net_weight',
															parseFloat(e.target.value) || 0,
														)
													}
													placeholder='0'
													min='0'
													step='0.01'
													disabled={isDisabled}
													className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
														isDisabled
															? 'border-gray-200 bg-gray-100 cursor-not-allowed'
															: 'border-gray-300'
													}`}
												/>
											</div>
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
						disabled={
							submitting ||
							order.step !== OrderStepEnumValues.Processing ||
							products.length === 0
						}
						className='px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-reverse space-x-2'
					>
						{submitting ? (
							<>
								<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
								<span>در حال ثبت...</span>
							</>
						) : (
							<>
								<Package className='w-5 h-5' />
								<span>ثبت</span>
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
