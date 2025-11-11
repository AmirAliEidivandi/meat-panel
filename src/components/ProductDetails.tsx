import {
	ArrowRight,
	Camera,
	Loader2,
	Package,
	RefreshCw,
	Upload,
	X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { fileService, productService } from '../services/api';
import type { FileUploadResponse, Product } from '../types';

export default function ProductDetails() {
	const navigate = useNavigate();
	const { id: productId } = useParams<{ id: string }>();
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [uploading, setUploading] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [uploadedFiles, setUploadedFiles] = useState<FileUploadResponse[]>([]);
	const [description, setDescription] = useState('');
	const [isSpecial, setIsSpecial] = useState(false);
	const [isOnline, setIsOnline] = useState(false);

	useEffect(() => {
		if (productId) {
			fetchProductDetails();
		}
	}, [productId]);

	const fetchProductDetails = async () => {
		if (!productId) return;
		try {
			setLoading(true);
			setError('');
			const data = await productService.getProductById(productId);
			setProduct(data);
			setDescription(data.description || '');
			setIsSpecial(data.is_special || false);
			setIsOnline(data.is_online || false);
		} catch (err: any) {
			setError('خطا در بارگذاری جزئیات محصول');
		} finally {
			setLoading(false);
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length > 0) {
			setSelectedFiles(files);
			setUploadedFiles([]);
		}
	};

	const handleFileUpload = async () => {
		if (selectedFiles.length === 0) return;

		try {
			setUploading(true);
			const uploadedFilesData = await fileService.uploadFiles(selectedFiles);
			setUploadedFiles(uploadedFilesData);
		} catch (err: any) {
			setError('خطا در آپلود فایل‌ها');
		} finally {
			setUploading(false);
		}
	};

	const handleProductUpdate = async () => {
		if (!product || !productId) return;

		try {
			setUploading(true);
			const updateData: any = {};

			if (uploadedFiles.length > 0) {
				updateData.image_ids = uploadedFiles.map(file => file.id);
			}

			if (description !== product.description) {
				updateData.description = description;
			}

			if (isSpecial !== (product.is_special || false)) {
				updateData.is_special = isSpecial;
			}

			if (isOnline !== (product.is_online || false)) {
				updateData.is_online = isOnline;
			}

			if (Object.keys(updateData).length > 0) {
				await productService.updateProduct(productId, updateData);
				// Refresh product details
				await fetchProductDetails();
				setSelectedFiles([]);
				setUploadedFiles([]);
			}
		} catch (err: any) {
			setError('خطا در بروزرسانی محصول');
		} finally {
			setUploading(false);
		}
	};

	const removeSelectedFile = (index: number) => {
		setSelectedFiles(prev => prev.filter((_, i) => i !== index));
	};

	const removeUploadedFile = (index: number) => {
		setUploadedFiles(prev => prev.filter((_, i) => i !== index));
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

	if (error && !product) {
		return (
			<div className='text-center py-12'>
				<div className='text-red-500 mb-4'>{error}</div>
				<button
					onClick={fetchProductDetails}
					className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors mr-2'
				>
					تلاش مجدد
				</button>
				<button
					onClick={() => navigate('/manage/products')}
					className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
				>
					بازگشت به لیست
				</button>
			</div>
		);
	}

	if (!product) {
		return (
			<div className='text-center py-12'>
				<div className='text-red-500 mb-4'>محصول یافت نشد</div>
				<button
					onClick={() => navigate('/manage/products')}
					className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors'
				>
					بازگشت به لیست
				</button>
			</div>
		);
	}

	return (
		<div className='fade-in font-vazir max-w-7xl mx-auto'>
			{/* Header */}
			<div className='mb-8'>
				<button
					onClick={() => navigate('/manage/products')}
					className='mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm'
				>
					<ArrowRight className='w-4 h-4 ml-2' />
					بازگشت
				</button>
				<div className='flex items-start justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900 mb-2'>{product.title}</h1>
						<p className='text-gray-500'>جزئیات و مدیریت محصول</p>
					</div>
					<button
						onClick={fetchProductDetails}
						className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold flex items-center space-x-reverse space-x-2 text-sm'
					>
						<RefreshCw className='w-4 h-4' />
						<span>بروزرسانی</span>
					</button>
				</div>
			</div>

			{/* Summary Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center'>
							<Package className='w-4 h-4 text-blue-600' />
						</div>
						<h3 className='font-bold text-gray-900'>کد محصول</h3>
					</div>
					<p className='text-xl font-bold text-blue-600'>{product.code}</p>
				</div>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center'>
							<Package className='w-4 h-4 text-green-600' />
						</div>
						<h3 className='font-bold text-gray-900'>وزن خالص</h3>
					</div>
					<p className='text-xl font-bold text-green-600'>
						{product.net_weight} کیلوگرم
					</p>
				</div>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center'>
							<Package className='w-4 h-4 text-purple-600' />
						</div>
						<h3 className='font-bold text-gray-900'>قیمت خرده</h3>
					</div>
					<p className='text-xl font-bold text-purple-600'>
						{formatCurrency(product.retail_price)}
					</p>
				</div>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center'>
							<Package className='w-4 h-4 text-orange-600' />
						</div>
						<h3 className='font-bold text-gray-900'>وضعیت</h3>
					</div>
					<p className='text-sm font-semibold'>
						{product.locked ? (
							<span className='text-red-600'>قفل شده</span>
						) : (
							<span className='text-green-600'>فعال</span>
						)}
					</p>
				</div>
			</div>

			{/* Price Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center'>
							<Package className='w-4 h-4 text-cyan-600' />
						</div>
						<h3 className='font-bold text-gray-900'>قیمت عمده</h3>
					</div>
					<p className='text-xl font-bold text-cyan-600'>
						{formatCurrency(product.wholesale_price)}
					</p>
				</div>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center'>
							<Package className='w-4 h-4 text-pink-600' />
						</div>
						<h3 className='font-bold text-gray-900'>قیمت آنلاین</h3>
					</div>
					<p className='text-xl font-bold text-pink-600'>
						{formatCurrency(product.online_price)}
					</p>
				</div>
			</div>

			{/* Info Grid */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
				{/* Categories */}
				{product.categories && product.categories.length > 0 && (
					<div className='bg-white rounded-xl border border-gray-200 p-6'>
						<div className='flex items-center space-x-reverse space-x-2 mb-5'>
							<div className='w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center'>
								<Package className='w-4 h-4 text-purple-600' />
							</div>
							<h3 className='font-bold text-gray-900'>
								دسته‌بندی‌ها ({product.categories.length})
							</h3>
						</div>
						<div className='space-y-3'>
							{product.categories.map(category => (
								<div
									key={category.id}
									className='bg-gray-50 rounded-lg p-3 border border-gray-200'
								>
									<p className='text-sm font-semibold text-gray-900 mb-1'>
										{category.title}
									</p>
									<p className='text-xs text-gray-600'>کد: {category.code}</p>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Product Settings */}
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-5'>
						<div className='w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center'>
							<Package className='w-4 h-4 text-green-600' />
						</div>
						<h3 className='font-bold text-gray-900'>تنظیمات محصول</h3>
					</div>
					<div className='space-y-4'>
						<label className='flex items-center space-x-reverse space-x-3 cursor-pointer'>
							<input
								type='checkbox'
								id='is_special'
								checked={isSpecial}
								onChange={e => setIsSpecial(e.target.checked)}
								className='w-5 h-5 cursor-pointer rounded border-2 border-gray-300 bg-white text-purple-600 transition-all focus:ring-2 focus:ring-purple-500/20 checked:bg-purple-600 checked:border-purple-600'
							/>
							<div>
								<p className='text-sm font-semibold text-gray-900'>محصول ویژه</p>
								<p className='text-xs text-gray-500'>
									نمایش این محصول به عنوان محصول ویژه
								</p>
							</div>
						</label>
						<label className='flex items-center space-x-reverse space-x-3 cursor-pointer'>
							<input
								type='checkbox'
								id='is_online'
								checked={isOnline}
								onChange={e => setIsOnline(e.target.checked)}
								className='w-5 h-5 cursor-pointer rounded border-2 border-gray-300 bg-white text-blue-600 transition-all focus:ring-2 focus:ring-blue-500/20 checked:bg-blue-600 checked:border-blue-600'
							/>
							<div>
								<p className='text-sm font-semibold text-gray-900'>نمایش در سایت</p>
								<p className='text-xs text-gray-500'>
									این محصول در سایت نمایش داده شود
								</p>
							</div>
						</label>
					</div>
				</div>
			</div>

			{/* Description */}
			<div className='bg-white rounded-xl border border-gray-200 p-6 mb-6'>
				<div className='flex items-center space-x-reverse space-x-2 mb-5'>
					<div className='w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center'>
						<Package className='w-4 h-4 text-indigo-600' />
					</div>
					<h3 className='font-bold text-gray-900'>توضیحات محصول</h3>
				</div>
				<textarea
					value={description}
					onChange={e => setDescription(e.target.value)}
					placeholder='توضیحات محصول را وارد کنید...'
					className='w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all bg-gray-50'
				/>
			</div>

			{/* Image Upload */}
			<div className='bg-white rounded-xl border border-gray-200 p-6'>
				<div className='flex items-center space-x-reverse space-x-2 mb-5'>
					<div className='w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center'>
						<Camera className='w-4 h-4 text-cyan-600' />
					</div>
					<h3 className='font-bold text-gray-900'>آپلود تصاویر محصول</h3>
				</div>
				<div className='space-y-4'>
					<div>
						<input
							type='file'
							id='product-images'
							accept='image/*'
							multiple
							onChange={handleFileSelect}
							className='hidden'
						/>
						<label
							htmlFor='product-images'
							className='flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50'
						>
							<div className='text-center'>
								<Upload className='w-8 h-8 text-gray-400 mx-auto mb-2' />
								<p className='text-sm text-gray-600'>
									{selectedFiles.length > 0
										? `${selectedFiles.length} فایل انتخاب شده`
										: 'انتخاب تصاویر (چندتایی)'}
								</p>
							</div>
						</label>
					</div>

					{selectedFiles.length > 0 && (
						<div className='space-y-2'>
							<p className='text-xs font-semibold text-gray-700'>
								فایل‌های انتخاب شده:
							</p>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
								{selectedFiles.map((file, index) => (
									<div
										key={index}
										className='flex items-center justify-between bg-gray-50 rounded-lg p-2 border border-gray-200'
									>
										<span className='text-xs text-gray-700 truncate flex-1'>
											{file.name}
										</span>
										<button
											onClick={() => removeSelectedFile(index)}
											className='text-red-500 hover:text-red-700 p-1'
										>
											<X className='w-4 h-4' />
										</button>
									</div>
								))}
							</div>
						</div>
					)}

					{selectedFiles.length > 0 && uploadedFiles.length === 0 && (
						<button
							onClick={handleFileUpload}
							disabled={uploading}
							className='w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center space-x-reverse space-x-2 text-sm'
						>
							{uploading ? (
								<>
									<RefreshCw className='w-4 h-4 animate-spin' />
									<span>در حال آپلود...</span>
								</>
							) : (
								<>
									<Upload className='w-4 h-4' />
									<span>آپلود فایل‌ها</span>
								</>
							)}
						</button>
					)}

					{uploadedFiles.length > 0 && (
						<div className='space-y-3'>
							<p className='text-xs font-semibold text-gray-700'>
								فایل‌های آپلود شده:
							</p>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
								{uploadedFiles.map((file, index) => (
									<div
										key={file.id}
										className='flex items-center justify-between bg-green-50 rounded-lg p-2 border border-green-200'
									>
										<div className='flex items-center space-x-reverse space-x-2 flex-1'>
											<div className='w-6 h-6 bg-green-500 rounded-md flex items-center justify-center'>
												<Upload className='w-3 h-3 text-white' />
											</div>
											<div className='flex-1 min-w-0'>
												<p className='text-xs font-semibold text-gray-900 truncate'>
													{file.name}
												</p>
												<p className='text-xs text-gray-600'>{file.size} بایت</p>
											</div>
										</div>
										<button
											onClick={() => removeUploadedFile(index)}
											className='text-red-500 hover:text-red-700 p-1'
										>
											<X className='w-4 h-4' />
										</button>
									</div>
								))}
							</div>
						</div>
					)}

					{(uploadedFiles.length > 0 ||
						description !== product.description ||
						isSpecial !== (product.is_special || false) ||
						isOnline !== (product.is_online || false)) && (
						<button
							onClick={handleProductUpdate}
							disabled={uploading}
							className='w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center space-x-reverse space-x-2 text-sm'
						>
							{uploading ? (
								<>
									<RefreshCw className='w-4 h-4 animate-spin' />
									<span>در حال بروزرسانی...</span>
								</>
							) : (
								<>
									<Package className='w-4 h-4' />
									<span>بروزرسانی محصول</span>
								</>
							)}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
