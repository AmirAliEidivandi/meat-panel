import { Building2, Edit2, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { customerService, fileUrl } from '../../services/api';
import type { CustomerInfoResponse, UpdateCustomerSelfDto } from '../../types';

export default function UserBusiness() {
	const [customerInfo, setCustomerInfo] = useState<CustomerInfoResponse | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [formData, setFormData] = useState<UpdateCustomerSelfDto>({});
	const [error, setError] = useState('');

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			setLoading(true);
			const customer = await customerService.getCustomerInfo();
			setCustomerInfo(customer);
			setFormData({
				title: customer.title,
				description: customer.description || undefined,
				phone: customer.phone || undefined,
				address: customer.address || undefined,
				age: customer.age || undefined,
				is_property_owner: customer.is_property_owner || undefined,
				type: customer.category || undefined,
				category: customer.category || undefined,
			});
		} catch (err: any) {
			setError('خطا در بارگذاری اطلاعات');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await customerService.updateCustomerInfo(formData);
			await loadData();
			setEditing(false);
		} catch (err: any) {
			setError('خطا در به‌روزرسانی اطلاعات');
			console.error(err);
		}
	};

	const getCategoryText = (category: string) => {
		const categoryMap: { [key: string]: string } = {
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
		return categoryMap[category] || category;
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<div className='w-8 h-8 border-[3px] border-primary-600 border-t-transparent rounded-full animate-spin'></div>
			</div>
		);
	}

	if (!customerInfo) {
		return (
			<div className='text-center py-12'>
				<p className='text-gray-600'>خطا در بارگذاری اطلاعات</p>
			</div>
		);
	}

	return (
		<div className='max-w-4xl mx-auto'>
			<div className='bg-white rounded-xl shadow-lg p-8'>
				<div className='flex items-center justify-between mb-8'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
							<Building2 className='w-6 h-6 text-green-600' />
						</div>
						<h2 className='text-2xl font-bold text-gray-900'>
							اطلاعات کسب و کار
						</h2>
					</div>
					{!editing ? (
						<button
							onClick={() => setEditing(true)}
							className='flex items-center space-x-reverse space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'
						>
							<Edit2 className='w-5 h-5' />
							<span>ویرایش</span>
						</button>
					) : (
						<div className='flex items-center space-x-reverse space-x-2'>
							<button
								onClick={handleSubmit}
								className='flex items-center space-x-reverse space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
							>
								<Save className='w-5 h-5' />
								<span>ذخیره</span>
							</button>
							<button
								onClick={() => {
									setEditing(false);
									loadData();
								}}
								className='flex items-center space-x-reverse space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors'
							>
								<X className='w-5 h-5' />
								<span>لغو</span>
							</button>
						</div>
					)}
				</div>

				{error && (
					<div className='mb-4 bg-red-50 border-2 border-red-200 rounded-lg p-4'>
						<p className='text-red-600'>{error}</p>
					</div>
				)}

				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					{/* Title */}
					<div className='md:col-span-2'>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							عنوان کسب و کار
						</label>
						{editing ? (
							<input
								type='text'
								value={formData.title || ''}
								onChange={e =>
									setFormData(prev => ({ ...prev, title: e.target.value }))
								}
								className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
							/>
						) : (
							<p className='text-gray-900 text-lg font-semibold'>
								{customerInfo.title}
							</p>
						)}
					</div>

					{/* Code */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							کد مشتری
						</label>
						<p className='text-gray-900'>{customerInfo.code}</p>
					</div>

					{/* Category */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							دسته‌بندی
						</label>
						<p className='text-gray-900'>{getCategoryText(customerInfo.category)}</p>
					</div>

					{/* Phone */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							تلفن
						</label>
						{editing ? (
							<input
								type='tel'
								value={formData.phone || ''}
								onChange={e =>
									setFormData(prev => ({ ...prev, phone: e.target.value }))
								}
								className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
							/>
						) : (
							<p className='text-gray-900'>{customerInfo.phone || '-'}</p>
						)}
					</div>

					{/* Address */}
					<div className='md:col-span-2'>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							آدرس
						</label>
						{editing ? (
							<textarea
								value={formData.address || ''}
								onChange={e =>
									setFormData(prev => ({ ...prev, address: e.target.value }))
								}
								rows={3}
								className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
							/>
						) : (
							<p className='text-gray-900'>{customerInfo.address || '-'}</p>
						)}
					</div>

					{/* Age */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							سن
						</label>
						{editing ? (
							<input
								type='number'
								value={formData.age || ''}
								onChange={e =>
									setFormData(prev => ({
										...prev,
										age: e.target.value ? parseInt(e.target.value) : undefined,
									}))
								}
								className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
							/>
						) : (
							<p className='text-gray-900'>{customerInfo.age || '-'}</p>
						)}
					</div>

					{/* Is Property Owner */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							مالک ملک
						</label>
						{editing ? (
							<select
								value={formData.is_property_owner ? 'true' : 'false'}
								onChange={e =>
									setFormData(prev => ({
										...prev,
										is_property_owner: e.target.value === 'true',
									}))
								}
								className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
							>
								<option value='false'>خیر</option>
								<option value='true'>بله</option>
							</select>
						) : (
							<p className='text-gray-900'>
								{customerInfo.is_property_owner ? 'بله' : 'خیر'}
							</p>
						)}
					</div>

					{/* Description */}
					<div className='md:col-span-2'>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							توضیحات
						</label>
						{editing ? (
							<textarea
								value={formData.description || ''}
								onChange={e =>
									setFormData(prev => ({
										...prev,
										description: e.target.value || undefined,
									}))
								}
								rows={4}
								className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
							/>
						) : (
							<p className='text-gray-900'>{customerInfo.description || '-'}</p>
						)}
					</div>

					{/* Files */}
					{customerInfo.files && customerInfo.files.length > 0 && (
						<div className='md:col-span-2'>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								فایل‌ها
							</label>
							<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
								{customerInfo.files.map(file => (
									<div key={file.id} className='relative'>
										<img
											src={fileUrl(file.thumbnail) || ''}
											alt={'File'}
											className='w-full h-32 object-cover rounded-lg border-2 border-gray-200'
										/>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
