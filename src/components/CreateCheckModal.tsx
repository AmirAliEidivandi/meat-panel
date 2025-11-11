import { Loader2, Upload, X } from 'lucide-react';
// @ts-ignore - jalaali-js doesn't have type definitions
import { jalaaliToDateObject, toJalaali } from 'jalaali-js';
import { useEffect, useState } from 'react';
import { accountantsService, customerService, fileService } from '../services/api';
import type { CreateCheckDto, CustomerListItem, FileUploadResponse } from '../types';
import PersianDatePicker from './PersianDatePicker';

interface CreateCheckModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

// Helper function to get bank options
const getBankOptions = () => [
	{ value: 'SEPAH', label: 'بانک سپه' },
	{ value: 'MELLI', label: 'بانک ملی' },
	{ value: 'TEJARAT', label: 'بانک تجارت' },
	{ value: 'REFAH', label: 'بانک رفاه' },
	{ value: 'MASKAN', label: 'بانک مسکن' },
	{ value: 'KESHAVARZI', label: 'بانک کشاورزی' },
	{ value: 'SANAT_VA_MADAN', label: 'بانک صنعت و معدن' },
	{ value: 'POST_BANK', label: 'پست بانک' },
	{ value: 'MELLAT', label: 'بانک ملت' },
	{ value: 'SADERAT', label: 'بانک صادرات' },
	{ value: 'PARSIAN', label: 'بانک پارسیان' },
	{ value: 'PASARGAD', label: 'بانک پاسارگاد' },
	{ value: 'SAMAN', label: 'بانک سامان' },
	{ value: 'EGHTESAD_NOVIN', label: 'بانک اقتصاد نوین' },
	{ value: 'DEY', label: 'بانک دی' },
	{ value: 'KARAFARIN', label: 'بانک کارآفرین' },
	{ value: 'SINA', label: 'بانک سینا' },
	{ value: 'SARMAYEH', label: 'بانک سرمایه' },
	{ value: 'SHAHR', label: 'بانک شهر' },
	{ value: 'AYANDEH', label: 'بانک آینده' },
	{ value: 'ANSAR', label: 'بانک انصار' },
	{ value: 'GARDESHGARI', label: 'بانک گردشگری' },
	{ value: 'HEKMAT_IRANIAN', label: 'بانک حکمت ایرانیان' },
	{ value: 'MEHREGAN', label: 'بانک مهرگان' },
	{ value: 'RESALAT', label: 'بانک رسالت' },
	{ value: 'KOSAR', label: 'بانک کوثر' },
	{ value: 'MIDDLE_EAST', label: 'بانک خاورمیانه' },
	{ value: 'IRAN_ZAMIN', label: 'بانک ایران زمین' },
	{ value: 'MEHR_EGHTESAD', label: 'موسسه اعتباری مهر اقتصاد' },
	{ value: 'TOSEE_TAAVON', label: 'موسسه اعتباری توسعه تعاون' },
	{ value: 'NOOR', label: 'موسسه اعتباری نور' },
	{ value: 'OTHER', label: 'سایر' },
];

export default function CreateCheckModal({
	isOpen,
	onClose,
	onSuccess,
}: CreateCheckModalProps) {
	const getTodayPersian = () => {
		const today = new Date();
		const jalaali = toJalaali(today);
		return `${jalaali.jy}/${String(jalaali.jm).padStart(2, '0')}/${String(jalaali.jd).padStart(2, '0')}`;
	};

	const [formData, setFormData] = useState<CreateCheckDto>({
		check_date: getTodayPersian(),
		check_number: '',
		account_number: '',
		issuer_bank: '',
		amount: 0,
		destination_bank: undefined,
		customer_id: undefined,
		description: undefined,
		image_id: undefined,
	});
	const [customers, setCustomers] = useState<CustomerListItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState('');
	const [uploadedFile, setUploadedFile] = useState<{
		id: string;
		file: File;
		preview?: string;
	} | null>(null);

	useEffect(() => {
		if (isOpen) {
			fetchCustomers();
		}
	}, [isOpen]);

	const fetchCustomers = async () => {
		try {
			const response = await customerService.getAllCustomers();
			setCustomers(response.data || []);
		} catch (err) {
			console.error('Error fetching customers:', err);
		}
	};

	const convertPersianToGregorian = (persianDate: string): string => {
		if (!persianDate || persianDate.trim() === '') {
			throw new Error('تاریخ خالی است');
		}

		const dateParts = persianDate.split('/');
		if (dateParts.length !== 3) {
			throw new Error('فرمت تاریخ نامعتبر است');
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
			throw new Error('تاریخ وارد شده نامعتبر است');
		}

		try {
			const dateObj = jalaaliToDateObject(
				persianYear,
				persianMonth,
				persianDay,
			);
			if (!dateObj || isNaN(dateObj.getTime())) {
				throw new Error('تاریخ ایجاد شده نامعتبر است');
			}

			const now = new Date();
			dateObj.setHours(now.getHours());
			dateObj.setMinutes(now.getMinutes());
			dateObj.setSeconds(now.getSeconds());
			dateObj.setMilliseconds(now.getMilliseconds());

			return dateObj.toISOString();
		} catch (err: any) {
			throw new Error(
				'خطا در تبدیل تاریخ: ' + (err.message || 'تاریخ نامعتبر است'),
			);
		}
	};

	const handleFileUpload = async (files: FileList | null) => {
		if (!files || files.length === 0) return;

		try {
			setUploading(true);
			const file = files[0];

			let preview: string | undefined;
			if (file.type.startsWith('image/')) {
				preview = URL.createObjectURL(file);
			}

			setUploadedFile({
				id: `${Date.now()}-${Math.random()}`,
				file,
				preview,
			});
		} catch (err) {
			console.error('Error processing file:', err);
		} finally {
			setUploading(false);
		}
	};

	const uploadFileToServer = async (): Promise<string | undefined> => {
		if (!uploadedFile) return undefined;

		try {
			const uploadResponse: FileUploadResponse[] =
				await fileService.uploadFiles([uploadedFile.file]);
			return uploadResponse[0]?.id;
		} catch (err: any) {
			console.error('Error uploading file:', err);
			throw new Error('خطا در آپلود فایل');
		}
	};

	const handleRemoveFile = () => {
		if (uploadedFile?.preview) {
			URL.revokeObjectURL(uploadedFile.preview);
		}
		setUploadedFile(null);
		setFormData(prev => ({ ...prev, image_id: undefined }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (!formData.check_number.trim()) {
			setError('لطفاً شماره چک را وارد کنید');
			return;
		}

		if (!formData.account_number.trim()) {
			setError('لطفاً شماره حساب را وارد کنید');
			return;
		}

		if (!formData.issuer_bank) {
			setError('لطفاً بانک صادرکننده را انتخاب کنید');
			return;
		}

		if (formData.amount <= 0) {
			setError('مبلغ باید بیشتر از صفر باشد');
			return;
		}

		try {
			setLoading(true);

			// Convert Persian date to Gregorian
			let gregorianDate: string;
			try {
				gregorianDate = convertPersianToGregorian(formData.check_date);
			} catch (err: any) {
				setError(err.message || 'خطا در تبدیل تاریخ');
				setLoading(false);
				return;
			}

			// Upload file if exists
			let imageId = formData.image_id;
			if (uploadedFile && !imageId) {
				imageId = await uploadFileToServer();
			}

			// Create check
			await accountantsService.createCheck({
				...formData,
				check_date: gregorianDate,
				image_id: imageId,
			});

			onSuccess();
			onClose();
			// Reset form
			setFormData({
				check_date: getTodayPersian(),
				check_number: '',
				account_number: '',
				issuer_bank: '',
				amount: 0,
				destination_bank: undefined,
				customer_id: undefined,
				description: undefined,
				image_id: undefined,
			});
			if (uploadedFile?.preview) {
				URL.revokeObjectURL(uploadedFile.preview);
			}
			setUploadedFile(null);
		} catch (err: any) {
			console.error('Error creating check:', err);
			setError(
				err.response?.data?.message || 'خطا در ثبت چک. لطفاً دوباره تلاش کنید.',
			);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
			<div className='bg-white rounded-xl border-2 border-gray-200 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
				<div className='flex items-center justify-between mb-6'>
					<h2 className='text-2xl font-bold text-gray-900'>ثبت چک جدید</h2>
					<button
						onClick={onClose}
						className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
					>
						<X className='w-6 h-6 text-gray-600' />
					</button>
				</div>

				{error && (
					<div className='bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4'>
						<p className='text-red-800 font-semibold'>{error}</p>
					</div>
				)}

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						{/* Check Number */}
						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								شماره چک *
							</label>
							<input
								type='text'
								value={formData.check_number}
								onChange={e =>
									setFormData(prev => ({
										...prev,
										check_number: e.target.value,
									}))
								}
								required
								className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
							/>
						</div>

						{/* Account Number */}
						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								شماره حساب *
							</label>
							<input
								type='text'
								value={formData.account_number}
								onChange={e =>
									setFormData(prev => ({
										...prev,
										account_number: e.target.value,
									}))
								}
								required
								className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
							/>
						</div>

						{/* Issuer Bank */}
						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								بانک صادرکننده *
							</label>
							<select
								value={formData.issuer_bank}
								onChange={e =>
									setFormData(prev => ({
										...prev,
										issuer_bank: e.target.value,
									}))
								}
								required
								className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
							>
								<option value=''>انتخاب کنید</option>
								{getBankOptions().map(bank => (
									<option key={bank.value} value={bank.value}>
										{bank.label}
									</option>
								))}
							</select>
						</div>

						{/* Destination Bank */}
						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								بانک مقصد
							</label>
							<select
								value={formData.destination_bank || ''}
								onChange={e =>
									setFormData(prev => ({
										...prev,
										destination_bank: e.target.value || undefined,
									}))
								}
								className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
							>
								<option value=''>انتخاب کنید</option>
								{getBankOptions().map(bank => (
									<option key={bank.value} value={bank.value}>
										{bank.label}
									</option>
								))}
							</select>
						</div>

						{/* Amount */}
						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								مبلغ (ریال) *
							</label>
							<input
								type='number'
								min='0'
								step='1'
								value={formData.amount || ''}
								onChange={e =>
									setFormData(prev => ({
										...prev,
										amount: parseFloat(e.target.value) || 0,
									}))
								}
								required
								className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
							/>
						</div>

						{/* Check Date */}
						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								تاریخ چک *
							</label>
							<PersianDatePicker
								value={formData.check_date}
								onChange={date =>
									setFormData(prev => ({ ...prev, check_date: date }))
								}
								placeholder='انتخاب تاریخ'
								className='w-full'
							/>
						</div>

						{/* Customer */}
						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								مشتری
							</label>
							<select
								value={formData.customer_id || ''}
								onChange={e =>
									setFormData(prev => ({
										...prev,
										customer_id: e.target.value || undefined,
									}))
								}
								className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
							>
								<option value=''>انتخاب کنید</option>
								{customers.map(customer => (
									<option key={customer.id} value={customer.id}>
										{customer.title} (کد: {customer.code})
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Description */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							توضیحات
						</label>
						<textarea
							value={formData.description || ''}
							onChange={e =>
								setFormData(prev => ({
									...prev,
									description: e.target.value || undefined,
								}))
							}
							rows={3}
							className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
						/>
					</div>

					{/* File Upload */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							تصویر چک
						</label>
						{!uploadedFile ? (
							<div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
								<input
									type='file'
									accept='image/*'
									onChange={e => handleFileUpload(e.target.files)}
									className='hidden'
									id='check-image-upload'
								/>
								<label
									htmlFor='check-image-upload'
									className='cursor-pointer flex flex-col items-center space-y-2'
								>
									<Upload className='w-8 h-8 text-gray-400' />
									<span className='text-sm text-gray-600 font-semibold'>
										کلیک کنید یا فایل را بکشید
									</span>
								</label>
							</div>
						) : (
							<div className='relative'>
								{uploadedFile.preview ? (
									<img
										src={uploadedFile.preview}
										alt='Check preview'
										className='w-full h-48 object-contain rounded-lg border-2 border-gray-300'
									/>
								) : (
									<div className='w-full h-48 bg-gray-100 rounded-lg border-2 border-gray-300 flex items-center justify-center'>
										<span className='text-gray-600'>فایل آپلود شده</span>
									</div>
								)}
								<button
									type='button'
									onClick={handleRemoveFile}
									className='absolute top-2 left-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors'
								>
									<X className='w-4 h-4' />
								</button>
							</div>
						)}
					</div>

					{/* Actions */}
					<div className='flex items-center justify-end space-x-reverse space-x-3 pt-4'>
						<button
							type='button'
							onClick={onClose}
							disabled={loading}
							className='px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-semibold'
						>
							انصراف
						</button>
						<button
							type='submit'
							disabled={loading || uploading}
							className='px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 transition-all font-semibold flex items-center space-x-reverse space-x-2'
						>
							{loading || uploading ? (
								<>
									<Loader2 className='w-5 h-5 animate-spin' />
									<span>در حال ثبت...</span>
								</>
							) : (
								<span>ثبت چک</span>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

