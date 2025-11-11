import {
	ArrowRight,
	BarChart3,
	FileSpreadsheet,
	Loader2,
	Package,
	RefreshCw,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCurrency, formatDate } from '../lib/utils';
import {
	productService,
	statsService,
	warehouseService,
} from '../services/api';
import type {
	GetProductKardexResponse,
	Product,
	QueryProductKardexDto,
	WarehouseDetailsResponse,
} from '../types';
import PersianDatePicker from './PersianDatePicker';

export default function ProductKardex() {
	const navigate = useNavigate();
	const { id: warehouseId } = useParams<{ id: string }>();
	const [warehouse, setWarehouse] = useState<WarehouseDetailsResponse | null>(
		null,
	);
	const [products, setProducts] = useState<Product[]>([]);
	const [selectedProductId, setSelectedProductId] = useState<string>('');
	const [fromDate, setFromDate] = useState<string>('');
	const [toDate, setToDate] = useState<string>('');
	const [kardexData, setKardexData] = useState<GetProductKardexResponse | null>(
		null,
	);
	const [loading, setLoading] = useState(false);
	const [productsLoading, setProductsLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (warehouseId) {
			fetchWarehouseDetails();
			fetchProducts();
		}
	}, [warehouseId]);

	const fetchWarehouseDetails = async () => {
		if (!warehouseId) return;

		try {
			const data = await warehouseService.getWarehouseById(warehouseId);
			setWarehouse(data);
		} catch (err: any) {
			console.error('Error fetching warehouse details:', err);
			setError('خطا در بارگذاری جزئیات انبار');
		}
	};

	const fetchProducts = async () => {
		if (!warehouseId) return;

		try {
			setProductsLoading(true);
			const data = await productService.getProductsByWarehouse(warehouseId);
			setProducts(Array.isArray(data) ? data : []);
		} catch (err: any) {
			console.error('Error fetching products:', err);
			setError('خطا در بارگذاری محصولات');
		} finally {
			setProductsLoading(false);
		}
	};

	const handleGenerateReport = async () => {
		if (!selectedProductId) {
			setError('لطفاً یک محصول را انتخاب کنید');
			return;
		}

		if (!warehouseId) return;

		try {
			setLoading(true);
			setError('');
			const query: QueryProductKardexDto = {
				page: 1,
				'page-size': 1000,
				product_id: selectedProductId,
				from: fromDate || '',
				to: toDate || '',
			};
			const data = await statsService.getProductKardex(query);
			setKardexData(data);
		} catch (err: any) {
			console.error('Error generating kardex report:', err);
			setError('خطا در ایجاد گزارش');
		} finally {
			setLoading(false);
		}
	};

	const getTypeText = (type: string) => {
		const typeMap: Record<string, string> = {
			CARGO_DISPATCH: 'مرسوله ارسالی',
			RECEIVING: 'ورود به انبار',
			DISPATCHING: 'خروج از انبار',
			PRODUCE_INPUT: 'استفاده شده در تولید',
			PRODUCE_OUTPUT: 'تولید شده',
			CARGO_RETURN: 'مرجوعی',
			ADVANCE_INVENTORY: 'موجودی قبل',
		};
		return typeMap[type] || type;
	};

	const getTypeColor = (type: string) => {
		const colorMap: Record<string, string> = {
			CARGO_DISPATCH: 'bg-blue-100 text-blue-800',
			RECEIVING: 'bg-green-100 text-green-800',
			DISPATCHING: 'bg-red-100 text-red-800',
			PRODUCE_INPUT: 'bg-gray-100 text-gray-800',
			PRODUCE_OUTPUT: 'bg-emerald-100 text-emerald-800',
			CARGO_RETURN: 'bg-orange-100 text-orange-800',
			ADVANCE_INVENTORY: 'bg-yellow-100 text-yellow-800',
		};
		return colorMap[type] || 'bg-gray-100 text-gray-800';
	};

	if (!warehouseId) {
		return (
			<div className='text-center py-12'>
				<Package className='w-16 h-16 text-gray-300 mx-auto mb-4' />
				<p className='text-gray-500'>شناسه انبار یافت نشد</p>
				<button
					onClick={() => navigate('/manage/warehouses')}
					className='mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors'
				>
					بازگشت به لیست انبارها
				</button>
			</div>
		);
	}

	return (
		<div className='space-y-6 fade-in font-vazir'>
			{/* Header */}
			<div className='bg-white rounded-xl border border-gray-200 p-6'>
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<button
							onClick={() => navigate(`/manage/warehouses/${warehouseId}`)}
							className='w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all'
						>
							<ArrowRight className='w-5 h-5 text-gray-700' />
						</button>
						<div className='w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg'>
							<BarChart3 className='w-7 h-7 text-white' />
						</div>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>
								گردش موجودی کالا
							</h1>
							<p className='text-sm text-gray-600 mt-1'>
								{warehouse?.name || 'انبار'}
							</p>
						</div>
					</div>
				</div>

				{/* Filters */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
					{/* Product Selection */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							محصول <span className='text-red-500'>*</span>
						</label>
						<select
							value={selectedProductId}
							onChange={e => setSelectedProductId(e.target.value)}
							disabled={productsLoading}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed'
						>
							<option value=''>انتخاب محصول</option>
							{products.map(product => (
								<option key={product.id} value={product.id}>
									{product.title} (کد: {product.code})
								</option>
							))}
						</select>
					</div>

					{/* From Date */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							از تاریخ
						</label>
						<PersianDatePicker
							value={fromDate}
							onChange={setFromDate}
							placeholder='انتخاب تاریخ شروع'
						/>
					</div>

					{/* To Date */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							تا تاریخ
						</label>
						<PersianDatePicker
							value={toDate}
							onChange={setToDate}
							placeholder='انتخاب تاریخ پایان'
						/>
					</div>
				</div>

				{/* Generate Report Button */}
				<button
					onClick={handleGenerateReport}
					disabled={loading || !selectedProductId || productsLoading}
					className='w-full md:w-auto px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center space-x-reverse space-x-2'
				>
					{loading ? (
						<>
							<RefreshCw className='w-5 h-5 animate-spin' />
							<span>در حال ایجاد گزارش...</span>
						</>
					) : (
						<>
							<BarChart3 className='w-5 h-5' />
							<span>ایجاد گزارش</span>
						</>
					)}
				</button>
			</div>

			{/* Error Display */}
			{error && (
				<div className='bg-red-50 border border-red-200 rounded-xl p-4'>
					<p className='text-red-800 font-semibold'>{error}</p>
				</div>
			)}

			{/* Loading State */}
			{productsLoading && (
				<div className='flex items-center justify-center py-20'>
					<Loader2 className='w-8 h-8 text-amber-600 animate-spin' />
					<span className='mr-3 text-gray-600 font-semibold'>
						در حال بارگذاری محصولات...
					</span>
				</div>
			)}

			{/* Report Table */}
			{kardexData && kardexData.items && kardexData.items.length > 0 && (
				<div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
					{/* Report Header */}
					<div className='p-6 border-b border-gray-200'>
						<div className='flex items-center justify-between mb-4'>
							<div className='flex items-center space-x-reverse space-x-3'>
								<div className='w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center'>
									<Package className='w-5 h-5 text-white' />
								</div>
								<div>
									<h2 className='text-xl font-bold text-gray-900'>
										لیست گردش موجودی
									</h2>
									<p className='text-sm text-gray-600'>
										{kardexData.items.length} ردیف
									</p>
								</div>
							</div>
							<button className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold flex items-center space-x-reverse space-x-2'>
								<FileSpreadsheet className='w-4 h-4' />
								<span>خروجی اکسل</span>
							</button>
						</div>

						{/* Product Info */}
						{kardexData.product && (
							<div className='bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200'>
								<div className='flex items-center space-x-reverse space-x-4'>
									<div className='w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center'>
										<Package className='w-5 h-5 text-white' />
									</div>
									<div>
										<p className='text-sm font-semibold text-gray-700 mb-1'>
											محصول:
										</p>
										<p className='text-lg font-bold text-gray-900'>
											{kardexData.product.title} (کد:{' '}
											{kardexData.product.code})
										</p>
										<p className='text-xs text-gray-600 mt-1'>
											موجودی فعلی:{' '}
											{kardexData.product.net_weight.toLocaleString('fa-IR')}{' '}
											کیلوگرم
										</p>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Table */}
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className='bg-gray-50 border-b border-gray-200'>
								<tr>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										#
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										تاریخ
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										کد
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										نوع
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										مشتری
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										ورودی
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										خروجی
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										فی
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										مبلغ
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
										مانده انبار
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-200'>
								{kardexData.items.map((item, index) => {
									// تشخیص ورودی/خروجی بر اساس نوع تراکنش
									const isEntryType =
										item.type === 'RECEIVING' ||
										item.type === 'CARGO_RETURN' ||
										item.type === 'PRODUCE_OUTPUT';
									const isExitType =
										item.type === 'DISPATCHING' ||
										item.type === 'CARGO_DISPATCH' ||
										item.type === 'PRODUCE_INPUT';

									// net_weight همیشه مقدار مثبت است، نوع تراکنش مشخص می‌کند ورودی یا خروجی
									const absWeight = Math.abs(item.net_weight);
									const entryWeight = isEntryType ? absWeight : 0;
									const exitWeight = isExitType ? absWeight : 0;

									return (
										<tr
											key={index}
											className='hover:bg-gray-50 transition-colors'
										>
											<td className='px-4 py-4 text-sm text-gray-700 font-semibold text-right'>
												{index + 1}
											</td>
											<td className='px-4 py-4 text-sm text-gray-700 text-right'>
												{formatDate(item.date)}
											</td>
											<td className='px-4 py-4 text-sm text-gray-900 font-semibold text-right'>
												{item.code || '-'}
											</td>
											<td className='px-4 py-4 text-right'>
												<span
													className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${getTypeColor(
														item.type,
													)}`}
												>
													{getTypeText(item.type)}
												</span>
											</td>
											<td className='px-4 py-4 text-sm text-gray-700 text-right'>
												{item.customer?.title || '-'}
											</td>
											<td className='px-4 py-4 text-sm text-green-700 font-semibold text-right'>
												{entryWeight > 0
													? `${entryWeight.toLocaleString('fa-IR')} کیلوگرم`
													: '-'}
											</td>
											<td className='px-4 py-4 text-sm text-red-700 font-semibold text-right'>
												{exitWeight > 0
													? `${exitWeight.toLocaleString('fa-IR')} کیلوگرم`
													: '-'}
											</td>
											<td className='px-4 py-4 text-sm text-gray-700 text-right'>
												{formatCurrency(item.fee)}
											</td>
											<td className='px-4 py-4 text-sm font-bold text-green-700 text-right'>
												{formatCurrency(item.amount)}
											</td>
											<td className='px-4 py-4 text-sm font-bold text-right'>
												<span
													className={
														item.remaining < 0
															? 'text-red-600'
															: item.remaining > 0
																? 'text-blue-600'
																: 'text-gray-900'
													}
												>
													{item.remaining.toLocaleString('fa-IR')} کیلوگرم
												</span>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Empty State */}
			{kardexData && kardexData.items && kardexData.items.length === 0 && (
				<div className='bg-white rounded-xl border border-gray-200 p-12 text-center'>
					<BarChart3 className='w-16 h-16 text-gray-300 mx-auto mb-4' />
					<p className='text-gray-500 text-lg font-semibold'>
						هیچ داده‌ای برای نمایش وجود ندارد
					</p>
				</div>
			)}
		</div>
	);
}
