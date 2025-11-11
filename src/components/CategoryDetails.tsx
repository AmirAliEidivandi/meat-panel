import {
	ArrowRight,
	Camera,
	FolderOpen,
	Loader2,
	RefreshCw,
	Thermometer,
	Upload,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService, fileService } from '../services/api';
import type { Category, FileUploadResponse } from '../types';
import type { TemperatureTypeEnum } from '../types';
import { TemperatureTypeEnumValues } from '../types';

export default function CategoryDetails() {
	const navigate = useNavigate();
	const { id: categoryId } = useParams<{ id: string }>();
	const [category, setCategory] = useState<Category | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [uploading, setUploading] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [uploadedFile, setUploadedFile] = useState<FileUploadResponse | null>(
		null,
	);
	const [temperatureType, setTemperatureType] =
		useState<TemperatureTypeEnum | null>(null);
	const [updating, setUpdating] = useState(false);

	const fetchCategoryDetails = async () => {
		if (!categoryId) return;

		try {
			setLoading(true);
			setError('');
			const data = await categoryService.getCategoryById(categoryId);

			// Validate data
			if (!data || !data.id) {
				throw new Error('Invalid category data received');
			}

			setCategory(data);

			// Convert string to enum if needed
			const tempType = data.temperature_type as
				| string
				| TemperatureTypeEnum
				| null
				| undefined;
			if (tempType === TemperatureTypeEnumValues.HOT || tempType === 'HOT') {
				setTemperatureType(TemperatureTypeEnumValues.HOT);
			} else if (tempType === TemperatureTypeEnumValues.COLD || tempType === 'COLD') {
				setTemperatureType(TemperatureTypeEnumValues.COLD);
			} else {
				setTemperatureType(null);
			}
		} catch (err: any) {
			console.error('Error fetching category details:', err);
			setError(err?.message || 'خطا در بارگذاری جزئیات دسته‌بندی');
			setCategory(null);
			setTemperatureType(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (categoryId) {
			fetchCategoryDetails();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [categoryId]);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			setUploadedFile(null);
		}
	};

	const handleFileUpload = async () => {
		if (!selectedFile) return;

		try {
			setUploading(true);
			const uploadedFiles = await fileService.uploadFiles([selectedFile]);
			if (uploadedFiles.length > 0) {
				setUploadedFile(uploadedFiles[0]);
			}
		} catch (err: any) {
			setError('خطا در آپلود فایل');
		} finally {
			setUploading(false);
		}
	};

	const handleImageUpdate = async () => {
		if (!uploadedFile || !categoryId) return;

		try {
			setUploading(true);
			await categoryService.uploadCategoryImage(categoryId, uploadedFile.id);
			// Refresh category details
			await fetchCategoryDetails();
			setSelectedFile(null);
			setUploadedFile(null);
		} catch (err: any) {
			setError('خطا در بروزرسانی تصویر دسته‌بندی');
		} finally {
			setUploading(false);
		}
	};

	const handleTemperatureTypeUpdate = async () => {
		if (!category || !categoryId) return;

		try {
			setUpdating(true);
			await categoryService.updateCategory(categoryId, {
				temperature_type: temperatureType || null,
			});
			// Refresh category details
			await fetchCategoryDetails();
		} catch (err: any) {
			setError('خطا در بروزرسانی نوع دما');
		} finally {
			setUpdating(false);
		}
	};

	if (!categoryId) {
		return (
			<div className='text-center py-12'>
				<div className='text-red-500 mb-4'>شناسه دسته‌بندی یافت نشد</div>
				<button
					onClick={() => navigate('/manage/categories')}
					className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors'
				>
					بازگشت به لیست
				</button>
			</div>
		);
	}

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

	if (error && !category) {
		return (
			<div className='text-center py-12'>
				<div className='text-red-500 mb-4'>{error}</div>
				<button
					onClick={fetchCategoryDetails}
					className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors mr-2'
				>
					تلاش مجدد
				</button>
				<button
					onClick={() => navigate('/manage/categories')}
					className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
				>
					بازگشت به لیست
				</button>
			</div>
		);
	}

	if (!category) {
		return (
			<div className='text-center py-12'>
				<div className='text-red-500 mb-4'>دسته‌بندی یافت نشد</div>
				<button
					onClick={() => navigate('/manage/categories')}
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
					onClick={() => navigate('/manage/categories')}
					className='mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm'
				>
					<ArrowRight className='w-4 h-4 ml-2' />
					بازگشت
				</button>
				<div className='flex items-start justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900 mb-2'>
							{category?.title || 'بدون نام'}
						</h1>
						<p className='text-gray-500'>جزئیات و مدیریت دسته‌بندی</p>
					</div>
					<button
						onClick={fetchCategoryDetails}
						className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold flex items-center space-x-reverse space-x-2 text-sm'
					>
						<RefreshCw className='w-4 h-4' />
						<span>بروزرسانی</span>
					</button>
				</div>
			</div>

			{/* Summary Cards */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center'>
							<FolderOpen className='w-4 h-4 text-blue-600' />
						</div>
						<h3 className='font-bold text-gray-900'>کد دسته‌بندی</h3>
					</div>
					<p className='text-xl font-bold text-blue-600'>
						{category?.code ?? 'N/A'}
					</p>
				</div>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center'>
							<FolderOpen className='w-4 h-4 text-purple-600' />
						</div>
						<h3 className='font-bold text-gray-900'>اولویت</h3>
					</div>
					<p className='text-xl font-bold text-purple-600'>
						{category?.priority ?? 0}
					</p>
				</div>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center'>
							<FolderOpen className='w-4 h-4 text-green-600' />
						</div>
						<h3 className='font-bold text-gray-900'>انبار</h3>
					</div>
					<p className='text-sm font-semibold text-gray-900'>
						{category?.warehouse_id ?? 'N/A'}
					</p>
				</div>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center'>
							<FolderOpen className='w-4 h-4 text-orange-600' />
						</div>
						<h3 className='font-bold text-gray-900'>وضعیت</h3>
					</div>
					<p className='text-sm font-semibold text-green-600'>فعال</p>
				</div>
			</div>

			{/* Info Grid */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
				{/* Parent Category */}
				{category.parent && (
					<div className='bg-white rounded-xl border border-gray-200 p-6'>
						<div className='flex items-center space-x-reverse space-x-2 mb-5'>
							<div className='w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center'>
								<FolderOpen className='w-4 h-4 text-blue-600' />
							</div>
							<h3 className='font-bold text-gray-900'>دسته‌بندی والد</h3>
						</div>
						<div className='space-y-4'>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>نام</p>
								<p className='text-sm font-semibold text-gray-900'>
									{category.parent?.title || 'بدون نام'}
								</p>
							</div>
							<div>
								<p className='text-xs text-gray-500 mb-1.5'>کد</p>
								<p className='text-sm font-semibold text-gray-900'>
									{category.parent?.code ?? 'N/A'}
								</p>
							</div>
							<button
								onClick={() => navigate(`/manage/categories/${category.parent?.id}`)}
								className='w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold'
							>
								مشاهده دسته‌بندی والد
							</button>
						</div>
					</div>
				)}

				{/* Temperature Type */}
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-5'>
						<div className='w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center'>
							<Thermometer className='w-4 h-4 text-red-600' />
						</div>
						<h3 className='font-bold text-gray-900'>نوع دما</h3>
					</div>
					<div className='space-y-4'>
						<div className='space-y-3'>
							<label className='flex items-center space-x-reverse space-x-3 cursor-pointer'>
								<input
									type='radio'
									name='temperature_type'
									value='HOT'
									checked={temperatureType === TemperatureTypeEnumValues.HOT}
									onChange={() => setTemperatureType(TemperatureTypeEnumValues.HOT)}
									className='w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500'
								/>
								<span className='text-sm font-semibold text-gray-900'>گرم (HOT)</span>
							</label>
							<label className='flex items-center space-x-reverse space-x-3 cursor-pointer'>
								<input
									type='radio'
									name='temperature_type'
									value='COLD'
									checked={temperatureType === TemperatureTypeEnumValues.COLD}
									onChange={() => setTemperatureType(TemperatureTypeEnumValues.COLD)}
									className='w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500'
								/>
								<span className='text-sm font-semibold text-gray-900'>
									سرد / منجمد (COLD)
								</span>
							</label>
							<label className='flex items-center space-x-reverse space-x-3 cursor-pointer'>
								<input
									type='radio'
									name='temperature_type'
									value=''
									checked={temperatureType === null}
									onChange={() => setTemperatureType(null)}
									className='w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500'
								/>
								<span className='text-sm font-semibold text-gray-600'>
									تعریف نشده
								</span>
							</label>
						</div>
						<p className='text-xs text-gray-500'>
							این فیلد برای دسته‌بندی‌های زیرمجموعه مانند "گوساله گرم" یا "گوساله
							منجمد" استفاده می‌شود
						</p>
						{(() => {
							if (!category) return false;
							const currentTempType =
								category.temperature_type === TemperatureTypeEnumValues.HOT
									? TemperatureTypeEnumValues.HOT
									: category.temperature_type === TemperatureTypeEnumValues.COLD
										? TemperatureTypeEnumValues.COLD
										: null;
							return temperatureType !== currentTempType;
						})() && (
							<button
								onClick={handleTemperatureTypeUpdate}
								disabled={updating}
								className='w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center space-x-reverse space-x-2 text-sm'
							>
								{updating ? (
									<>
										<RefreshCw className='w-4 h-4 animate-spin' />
										<span>در حال بروزرسانی...</span>
									</>
								) : (
									<>
										<Thermometer className='w-4 h-4' />
										<span>بروزرسانی نوع دما</span>
									</>
								)}
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Children Categories */}
			{Array.isArray(category.children) && category.children.length > 0 && (
				<div className='bg-white rounded-xl border border-gray-200 p-6 mb-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-5'>
						<div className='w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center'>
							<FolderOpen className='w-4 h-4 text-green-600' />
						</div>
						<h3 className='font-bold text-gray-900'>
							زیردسته‌ها ({category.children.length})
						</h3>
					</div>
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						{category.children.map((child: Category) => {
							if (!child || !child.id) return null;
							return (
								<div
									key={child.id}
									onClick={() => navigate(`/manage/categories/${child.id}`)}
									className='bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 hover:border-gray-300 hover:shadow-md transition-all'
								>
									<div className='flex items-center space-x-reverse space-x-3'>
										<div className='w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center'>
											<FolderOpen className='w-4 h-4 text-green-600' />
										</div>
										<div className='flex-1'>
											<p className='text-sm font-semibold text-gray-900 mb-1'>
												{child.title || 'بدون نام'}
											</p>
											<div className='flex items-center space-x-reverse space-x-2 text-xs text-gray-600'>
												<span>کد: {child.code ?? 'N/A'}</span>
												<span>•</span>
												<span>اولویت: {child.priority ?? 0}</span>
												{child.temperature_type && (
													<>
														<span>•</span>
														<span
															className={`font-semibold ${
																child.temperature_type ===
																TemperatureTypeEnumValues.HOT
																	? 'text-red-600'
																	: 'text-blue-600'
															}`}
														>
															{child.temperature_type ===
															TemperatureTypeEnumValues.HOT
																? 'گرم'
																: 'سرد'}
														</span>
													</>
												)}
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Image Upload */}
			<div className='bg-white rounded-xl border border-gray-200 p-6'>
				<div className='flex items-center space-x-reverse space-x-2 mb-5'>
					<div className='w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center'>
						<Camera className='w-4 h-4 text-cyan-600' />
					</div>
					<h3 className='font-bold text-gray-900'>آپلود تصویر دسته‌بندی</h3>
				</div>
				<div className='space-y-4'>
					<div>
						<input
							type='file'
							id='category-image'
							accept='image/*'
							onChange={handleFileSelect}
							className='hidden'
						/>
						<label
							htmlFor='category-image'
							className='flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50'
						>
							<div className='text-center'>
								<Upload className='w-8 h-8 text-gray-400 mx-auto mb-2' />
								<p className='text-sm text-gray-600'>
									{selectedFile ? selectedFile.name : 'انتخاب تصویر'}
								</p>
							</div>
						</label>
					</div>

					{selectedFile && !uploadedFile && (
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
									<span>آپلود فایل</span>
								</>
							)}
						</button>
					)}

					{uploadedFile && (
						<div className='space-y-3'>
							<div className='bg-green-50 border border-green-200 rounded-lg p-3'>
								<div className='flex items-center space-x-reverse space-x-2'>
									<div className='w-6 h-6 bg-green-500 rounded-md flex items-center justify-center'>
										<Upload className='w-3 h-3 text-white' />
									</div>
									<div>
										<p className='text-sm font-semibold text-gray-900'>
											فایل آپلود شد
										</p>
										<p className='text-xs text-gray-600'>
											{uploadedFile.name} ({uploadedFile.size} بایت)
										</p>
									</div>
								</div>
							</div>
							<button
								onClick={handleImageUpdate}
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
										<Camera className='w-4 h-4' />
										<span>بروزرسانی تصویر دسته‌بندی</span>
									</>
								)}
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
