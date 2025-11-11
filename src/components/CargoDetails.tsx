import {
	ArrowRight,
	Calendar,
	Package,
	Truck,
	User,
	Weight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../lib/utils';
import type { OrderCargo } from '../types';

interface CargoDetailsProps {
	cargo: OrderCargo;
	onBack: () => void;
}

export default function CargoDetails({ cargo }: CargoDetailsProps) {
	const navigate = useNavigate();
	const getCargoTypeText = (type: string) => {
		const types: Record<string, string> = {
			DISPATCH: 'تحویل',
			RETURN: 'برگشت',
			EXCHANGE: 'تبدیل',
		};
		return types[type] || type;
	};

	const getDeliveryMethodText = (method: string) => {
		const methods: Record<string, string> = {
			AT_INVENTORY: 'درب انبار',
			FREE_OUR_TRUCK: 'رایگان با ماشین شرکت',
			FREE_OTHER_SERVICES: 'رایگان با سرویس خارجی',
			PAID: 'ارسال با هزینه مشتری',
		};
		return methods[method] || method;
	};

	// Calculate totals
	const totalWeight = (cargo.products || []).reduce(
		(sum, product) => sum + product.net_weight,
		0,
	);
	const totalBoxWeight = (cargo.products || []).reduce(
		(sum, product) => sum + product.box_weight,
		0,
	);
	const totalGrossWeight = (cargo.products || []).reduce(
		(sum, product) => sum + product.gross_weight,
		0,
	);

	return (
		<div className='space-y-6 fade-in font-vazir'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center space-x-reverse space-x-3'>
					<button
						onClick={() => navigate(-1)}
						className='flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors'
					>
						<ArrowRight className='w-5 h-5 text-gray-600' />
					</button>
					<div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md'>
						<Truck className='w-5 h-5 text-white' />
					</div>
					<div>
						<h1 className='text-xl font-bold text-gray-900'>
							جزئیات مرسوله #{cargo.code}
						</h1>
						<p className='text-gray-600 text-sm'>
							{getCargoTypeText(cargo.type)} -{' '}
							{getDeliveryMethodText(cargo.delivery_method)}
						</p>
					</div>
				</div>
				<div className='flex items-center space-x-reverse space-x-2'>
					<span className='inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800'>
						{cargo.products?.length || 0} محصول
					</span>
					<span className='inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800'>
						{totalWeight.toFixed(2)} کیلوگرم
					</span>
				</div>
			</div>

			{/* Cargo Summary */}
			<div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6'>
				<h2 className='text-lg font-bold text-gray-900 mb-4'>خلاصه مرسوله</h2>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					<div className='bg-blue-50 rounded-lg p-4'>
						<div className='flex items-center space-x-reverse space-x-2 mb-2'>
							<Weight className='w-4 h-4 text-blue-600' />
							<h3 className='font-semibold text-blue-900'>وزن خالص</h3>
						</div>
						<p className='text-sm text-blue-800'>
							{totalWeight.toFixed(2)} کیلوگرم
						</p>
					</div>
					<div className='bg-orange-50 rounded-lg p-4'>
						<div className='flex items-center space-x-reverse space-x-2 mb-2'>
							<Package className='w-4 h-4 text-orange-600' />
							<h3 className='font-semibold text-orange-900'>وزن بسته‌بندی</h3>
						</div>
						<p className='text-sm text-orange-800'>
							{totalBoxWeight.toFixed(2)} کیلوگرم
						</p>
					</div>
					<div className='bg-green-50 rounded-lg p-4'>
						<div className='flex items-center space-x-reverse space-x-2 mb-2'>
							<Truck className='w-4 h-4 text-green-600' />
							<h3 className='font-semibold text-green-900'>وزن ناخالص</h3>
						</div>
						<p className='text-sm text-green-800'>
							{totalGrossWeight.toFixed(2)} کیلوگرم
						</p>
					</div>
				</div>
			</div>

			{/* Cargo Info */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* Delivery Info */}
				<div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<Truck className='w-5 h-5 text-gray-600' />
						<h2 className='text-lg font-bold text-gray-900'>اطلاعات تحویل</h2>
					</div>
					<div className='space-y-3'>
						<div className='flex justify-between'>
							<span className='text-sm text-gray-600'>نوع مرسوله:</span>
							<span className='text-sm font-medium'>
								{getCargoTypeText(cargo.type)}
							</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-sm text-gray-600'>روش تحویل:</span>
							<span className='text-sm font-medium'>
								{getDeliveryMethodText(cargo.delivery_method)}
							</span>
						</div>
						{cargo.truck_license_plate && (
							<div className='flex justify-between'>
								<span className='text-sm text-gray-600'>پلاک ماشین:</span>
								<span className='text-sm font-medium'>
									{cargo.truck_license_plate}
								</span>
							</div>
						)}
						{cargo.truck_driver && (
							<div className='flex justify-between'>
								<span className='text-sm text-gray-600'>راننده:</span>
								<span className='text-sm font-medium'>
									{cargo.truck_driver.first_name} {cargo.truck_driver.last_name}
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Dates */}
				<div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<Calendar className='w-5 h-5 text-gray-600' />
						<h2 className='text-lg font-bold text-gray-900'>تاریخ‌ها</h2>
					</div>
					<div className='space-y-3'>
						<div className='flex justify-between'>
							<span className='text-sm text-gray-600'>تاریخ مرسوله:</span>
							<span className='text-sm font-medium'>
								{formatDate(cargo.date)}
							</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-sm text-gray-600'>تاریخ ایجاد:</span>
							<span className='text-sm font-medium'>
								{formatDate(cargo.created_at)}
							</span>
						</div>
						{cargo.created_date && (
							<div className='flex justify-between'>
								<span className='text-sm text-gray-600'>تاریخ ثبت:</span>
								<span className='text-sm font-medium'>
									{formatDate(cargo.created_date)}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Employee Info */}
			{cargo.employee && (
				<div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<User className='w-5 h-5 text-gray-600' />
						<h2 className='text-lg font-bold text-gray-900'>اطلاعات کارمند</h2>
					</div>
					<div className='space-y-3'>
						<div className='flex justify-between'>
							<span className='text-sm text-gray-600'>آیدی کارمند:</span>
							<span className='text-sm font-medium'>{cargo.employee_id}</span>
						</div>
						{cargo.employee.profile && (
							<div className='flex justify-between'>
								<span className='text-sm text-gray-600'>نام کارمند:</span>
								<span className='text-sm font-medium'>
									{cargo.employee.profile.first_name}{' '}
									{cargo.employee.profile.last_name}
								</span>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Products */}
			{(cargo.products || []).length > 0 && (
				<div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<Package className='w-5 h-5 text-gray-600' />
						<h2 className='text-lg font-bold text-gray-900'>
							محصولات مرسوله ({(cargo.products || []).length} محصول)
						</h2>
					</div>
					<div className='space-y-4'>
						{(cargo.products || []).map((product, index) => (
							<div
								key={index}
								className='bg-gray-50 rounded-lg p-4 border border-gray-200'
							>
								<div className='flex items-start justify-between mb-3'>
									<div>
										<h3 className='font-semibold text-gray-900'>
											{product.product_title}
										</h3>
										<p className='text-sm text-gray-600'>
											کد محصول: {product.product_code}
										</p>
									</div>
									<div className='text-left'>
										<p className='text-sm font-medium text-gray-900'>
											{product.sec_unit_amount} واحد
										</p>
									</div>
								</div>
								<div className='grid grid-cols-2 md:grid-cols-3 gap-4 text-sm'>
									<div>
										<span className='text-gray-600'>وزن خالص:</span>
										<p className='font-medium'>{product.net_weight} کیلوگرم</p>
									</div>
									<div>
										<span className='text-gray-600'>وزن بسته‌بندی:</span>
										<p className='font-medium'>{product.box_weight} کیلوگرم</p>
									</div>
									<div>
										<span className='text-gray-600'>وزن ناخالص:</span>
										<p className='font-medium'>
											{product.gross_weight} کیلوگرم
										</p>
									</div>
								</div>
								<div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-3'>
									<div>
										<span className='text-gray-600'>قیمت آنلاین:</span>
										<p className='font-medium'>
											{formatCurrency(product.online_price)}
										</p>
									</div>
									<div>
										<span className='text-gray-600'>قیمت خرده‌فروشی:</span>
										<p className='font-medium'>
											{formatCurrency(product.retail_price)}
										</p>
									</div>
									<div>
										<span className='text-gray-600'>قیمت عمده‌فروشی:</span>
										<p className='font-medium'>
											{formatCurrency(product.wholesale_price)}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Description */}
			{cargo.description && (
				<div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6'>
					<h2 className='text-lg font-bold text-gray-900 mb-4'>
						توضیحات مرسوله
					</h2>
					<p className='text-gray-800'>{cargo.description}</p>
				</div>
			)}
		</div>
	);
}
