import {
	ArrowRight,
	Calendar,
	CheckCircle,
	Edit,
	Mail,
	Phone,
	Save,
	User,
	UserCog,
	X,
	XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import { groupAndClientService, profileService } from '../services/api';
import type {
	ClientListItem,
	GroupsListItem,
	ProfileDetails,
} from '../types';

export default function ProfileDetails() {
	const navigate = useNavigate();
	const { id: profileId } = useParams<{ id: string }>();
	const [profile, setProfile] = useState<ProfileDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [isEditing, setIsEditing] = useState(false);
	const [updating, setUpdating] = useState(false);
	const [groups, setGroups] = useState<GroupsListItem[]>([]);
	const [clients, setClients] = useState<ClientListItem[]>([]);
	const [editData, setEditData] = useState<{
		first_name?: string;
		last_name?: string;
		email?: string;
		mobile?: string;
		national_code?: string;
		gender?: string;
		enabled?: boolean;
		person_title?: string;
	}>({});

	useEffect(() => {
		if (profileId) {
			fetchProfileDetails();
		}
		fetchGroupsAndClients();
	}, [profileId]);

	const fetchGroupsAndClients = async () => {
		try {
			const [groupsResponse, clientsResponse] = await Promise.all([
				groupAndClientService.getGroups(),
				groupAndClientService.getClients(),
			]);
			setGroups(groupsResponse.data || []);
			setClients(clientsResponse.data || []);
		} catch (err: any) {
			console.error('Error fetching groups and clients:', err);
		}
	};

	useEffect(() => {
		if (profile && !isEditing) {
			setEditData({
				first_name: profile.first_name || '',
				last_name: profile.last_name || '',
				email: profile.email || '',
				mobile: profile.mobile || '',
				national_code: profile.national_code || '',
				gender: profile.gender || '',
				enabled: profile.enabled,
				person_title: profile.person?.title || '',
			});
		}
	}, [profile, isEditing]);

	const fetchProfileDetails = async () => {
		if (!profileId) return;

		try {
			setLoading(true);
			setError('');
			const data = await profileService.getProfileDetails(profileId);
			setProfile(data);
		} catch (err: any) {
			console.error('Error fetching profile details:', err);
			setError('خطا در بارگذاری جزئیات کاربر');
		} finally {
			setLoading(false);
		}
	};

	const getGenderText = (gender: string) => {
		const genderMap: { [key: string]: string } = {
			MALE: 'مرد',
			FEMALE: 'زن',
			OTHER: 'سایر',
		};
		return genderMap[gender] || gender;
	};

	const handleSave = async () => {
		if (!profileId || !profile) return;

		try {
			setUpdating(true);
			
			// Check if this is an employee
			if (profile.employee) {
				alert('برای ویرایش کارمندان از بخش ویرایش کارمند استفاده کنید');
				return;
			}

			await profileService.updateNonEmployee(profileId, editData);
			await fetchProfileDetails();
			setIsEditing(false);
		} catch (err: any) {
			console.error('Error updating profile:', err);
			alert('خطا در بروزرسانی اطلاعات');
		} finally {
			setUpdating(false);
		}
	};

	const isEmployee = profile?.employee !== null && profile?.employee !== undefined;
	const isNonEmployee = !isEmployee;

	// Helper functions to get names from IDs
	const getGroupName = (groupId: string) => {
		const group = groups.find(g => g.id === groupId);
		return group?.name || groupId;
	};

	const getClientName = (clientId: string) => {
		const client = clients.find(c => c.id === clientId || c.clientId === clientId);
		return client?.name || clientId;
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600'></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='text-center py-12'>
				<div className='text-red-500 mb-4'>{error}</div>
				<button
					onClick={fetchProfileDetails}
					className='px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors'
				>
					تلاش مجدد
				</button>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className='text-center py-12'>
				<UserCog className='w-16 h-16 text-gray-300 mx-auto mb-4' />
				<p className='text-gray-500'>کاربر یافت نشد</p>
			</div>
		);
	}

	return (
		<div className='space-y-6 fade-in font-vazir'>
			{/* Header */}
			<div className='flex items-center justify-between mb-6'>
				<div className='flex items-center space-x-reverse space-x-4'>
					<button
						onClick={() => {
							if (isEmployee) {
								navigate('/manage/profiles/employees');
							} else {
								navigate('/manage/profiles/others');
							}
						}}
						className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
					>
						<ArrowRight className='w-6 h-6 text-gray-600' />
					</button>
					<div className='w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg'>
						<UserCog className='w-6 h-6 text-white' />
					</div>
					<div>
						<h1 className='text-2xl font-bold text-gray-900'>
							جزئیات کاربر: {profile.first_name} {profile.last_name}
						</h1>
						<p className='text-gray-600 text-base'>
							{isEmployee ? 'مشاهده اطلاعات کارمند' : 'مشاهده و مدیریت اطلاعات کاربر'}
						</p>
					</div>
				</div>
				{isNonEmployee && (
					<div className='flex items-center space-x-reverse space-x-3'>
						{isEditing ? (
							<>
								<button
									onClick={() => {
										setIsEditing(false);
										if (profile) {
											setEditData({
												first_name: profile.first_name || '',
												last_name: profile.last_name || '',
												email: profile.email || '',
												mobile: profile.mobile || '',
												national_code: profile.national_code || '',
												gender: profile.gender || '',
												enabled: profile.enabled,
												person_title: profile.person?.title || '',
											});
										}
									}}
									className='flex items-center space-x-reverse space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
								>
									<X className='w-5 h-5' />
									انصراف
								</button>
								<button
									onClick={handleSave}
									disabled={updating}
									className='flex items-center space-x-reverse space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50'
								>
									<Save className='w-5 h-5' />
									{updating ? 'در حال ذخیره...' : 'ذخیره'}
								</button>
							</>
						) : (
							<button
								onClick={() => setIsEditing(true)}
								className='flex items-center space-x-reverse space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors'
							>
								<Edit className='w-5 h-5' />
								ویرایش
							</button>
						)}
					</div>
				)}
			</div>

			{/* Basic Information */}
			<div className='bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6'>
				<h2 className='text-xl font-bold text-gray-900 mb-6 flex items-center'>
					<User className='w-6 h-6 ml-2 text-teal-600' />
					اطلاعات پایه
				</h2>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{/* Name */}
					<div className='bg-gray-50 p-4 rounded-lg'>
						<p className='text-sm font-bold text-gray-600 mb-2'>
							نام و نام خانوادگی
						</p>
						{isEditing ? (
							<div className='space-y-2'>
								<input
									type='text'
									value={editData.first_name || ''}
									onChange={e =>
										setEditData({ ...editData, first_name: e.target.value })
									}
									className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
									placeholder='نام'
								/>
								<input
									type='text'
									value={editData.last_name || ''}
									onChange={e =>
										setEditData({ ...editData, last_name: e.target.value })
									}
									className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
									placeholder='نام خانوادگی'
								/>
							</div>
						) : (
							<p className='text-lg font-bold text-gray-900'>
								{profile.first_name} {profile.last_name}
							</p>
						)}
					</div>

					{/* Username */}
					<div className='bg-blue-50 p-4 rounded-lg'>
						<p className='text-sm font-bold text-gray-600 mb-2'>نام کاربری</p>
						<p className='text-lg font-bold text-gray-900'>
							{profile.username}
						</p>
					</div>

					{/* KID */}
					<div className='bg-purple-50 p-4 rounded-lg'>
						<p className='text-sm font-bold text-gray-600 mb-2'>
							شناسه کاربری (KID)
						</p>
						<p className='text-lg font-bold text-gray-900'>{profile.kid}</p>
					</div>

					{/* Email */}
					<div className='bg-green-50 p-4 rounded-lg'>
						<p className='text-sm font-bold text-gray-600 mb-2 flex items-center'>
							<Mail className='w-4 h-4 ml-1' />
							ایمیل
						</p>
						{isEditing ? (
							<input
								type='email'
								value={editData.email || ''}
								onChange={e => setEditData({ ...editData, email: e.target.value })}
								className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
								placeholder='ایمیل'
							/>
						) : (
							<p className='text-lg font-bold text-gray-900'>
								{profile.email || 'نامشخص'}
							</p>
						)}
					</div>

					{/* Mobile */}
					<div className='bg-cyan-50 p-4 rounded-lg'>
						<p className='text-sm font-bold text-gray-600 mb-2 flex items-center'>
							<Phone className='w-4 h-4 ml-1' />
							شماره موبایل
						</p>
						{isEditing ? (
							<input
								type='text'
								value={editData.mobile || ''}
								onChange={e => setEditData({ ...editData, mobile: e.target.value })}
								className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
								placeholder='شماره موبایل'
							/>
						) : (
							<>
								<p className='text-lg font-bold text-gray-900'>{profile.mobile}</p>
								{profile.mobile_verified && (
									<span className='inline-flex items-center mt-2 text-xs text-green-600'>
										<CheckCircle className='w-3 h-3 ml-1' />
										تأیید شده
									</span>
								)}
							</>
						)}
					</div>

					{/* National Code */}
					<div className='bg-orange-50 p-4 rounded-lg'>
						<p className='text-sm font-bold text-gray-600 mb-2'>کد ملی</p>
						{isEditing ? (
							<input
								type='text'
								value={editData.national_code || ''}
								onChange={e =>
									setEditData({ ...editData, national_code: e.target.value })
								}
								className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
								placeholder='کد ملی'
							/>
						) : (
							<p className='text-lg font-bold text-gray-900'>
								{profile.national_code || 'نامشخص'}
							</p>
						)}
					</div>

					{/* Gender */}
					<div className='bg-pink-50 p-4 rounded-lg'>
						<p className='text-sm font-bold text-gray-600 mb-2'>جنسیت</p>
						{isEditing ? (
							<select
								value={editData.gender || ''}
								onChange={e => setEditData({ ...editData, gender: e.target.value })}
								className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
							>
								<option value=''>انتخاب کنید</option>
								<option value='MALE'>مرد</option>
								<option value='FEMALE'>زن</option>
								<option value='OTHER'>سایر</option>
							</select>
						) : (
							<p className='text-lg font-bold text-gray-900'>
								{getGenderText(profile.gender)}
							</p>
						)}
					</div>

					{/* Birth Date */}
					<div className='bg-yellow-50 p-4 rounded-lg'>
						<p className='text-sm font-bold text-gray-600 mb-2 flex items-center'>
							<Calendar className='w-4 h-4 ml-1' />
							تاریخ تولد
						</p>
						<p className='text-lg font-bold text-gray-900'>
							{profile.birth_date ? formatDate(profile.birth_date) : 'نامشخص'}
						</p>
					</div>

					{/* Status */}
					<div className='bg-indigo-50 p-4 rounded-lg'>
						<p className='text-sm font-bold text-gray-600 mb-2'>وضعیت حساب</p>
						{isEditing ? (
							<label className='flex items-center space-x-reverse space-x-3 cursor-pointer'>
								<input
									type='checkbox'
									checked={editData.enabled ?? false}
									onChange={e =>
										setEditData({ ...editData, enabled: e.target.checked })
									}
									className='w-5 h-5 text-teal-600 rounded focus:ring-teal-500'
								/>
								<span className='text-lg font-bold text-gray-900'>
									{editData.enabled ? 'فعال' : 'غیرفعال'}
								</span>
							</label>
						) : (
							<div className='flex items-center space-x-reverse space-x-2'>
								{profile.enabled ? (
									<>
										<CheckCircle className='w-5 h-5 text-green-600' />
										<p className='text-lg font-bold text-green-600'>فعال</p>
									</>
								) : (
									<>
										<XCircle className='w-5 h-5 text-red-600' />
										<p className='text-lg font-bold text-red-600'>غیرفعال</p>
									</>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Person Information (if exists) */}
			{profile.person && (
				<div className='bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6'>
					<h2 className='text-xl font-bold text-gray-900 mb-6 flex items-center'>
						<User className='w-6 h-6 ml-2 text-green-600' />
						اطلاعات شخص
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='bg-green-50 p-4 rounded-lg'>
							<p className='text-sm font-bold text-gray-600 mb-2'>عنوان / سمت</p>
							{isEditing ? (
								<input
									type='text'
									value={editData.person_title || ''}
									onChange={e =>
										setEditData({ ...editData, person_title: e.target.value })
									}
									className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
									placeholder='عنوان/سمت'
								/>
							) : (
								<p className='text-lg font-bold text-gray-900'>
									{profile.person.title || 'نامشخص'}
								</p>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Groups and Clients */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* Groups */}
				<div className='bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6'>
					<h2 className='text-xl font-bold text-gray-900 mb-6 flex items-center'>
						<UserCog className='w-6 h-6 ml-2 text-teal-600' />
						گروه‌ها ({profile.groups.length})
					</h2>
					{profile.groups.length > 0 ? (
						<div className='space-y-3'>
							{profile.groups.map((group, index) => {
								const groupName = getGroupName(group.id);
								const groupData = groups.find(g => g.id === group.id);
								return (
									<div
										key={group.id}
										className='flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-teal-50 hover:to-cyan-50 transition-all duration-300'
									>
										<div className='flex items-center space-x-reverse space-x-3'>
											<div className='w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md'>
												{index + 1}
											</div>
											<div>
												<p className='font-semibold text-gray-900'>
													{groupName}
												</p>
												{groupData?.path && (
													<p className='text-xs text-gray-500'>
														{groupData.path}
													</p>
												)}
												{!groupData && (
													<p className='text-xs text-gray-400'>ID: {group.id}</p>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<p className='text-gray-500 text-center py-4'>هیچ گروهی یافت نشد</p>
					)}
				</div>

				{/* Clients */}
				<div className='bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6'>
					<h2 className='text-xl font-bold text-gray-900 mb-6 flex items-center'>
						<UserCog className='w-6 h-6 ml-2 text-blue-600' />
						کلاینت‌ها ({profile.clients.length})
					</h2>
					{profile.clients.length > 0 ? (
						<div className='space-y-3'>
							{profile.clients.map((clientId, index) => {
								const clientName = getClientName(clientId);
								const clientData = clients.find(
									c => c.id === clientId || c.clientId === clientId,
								);
								return (
									<div
										key={clientId}
										className='flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-indigo-50 transition-all duration-300'
									>
										<div className='flex items-center space-x-reverse space-x-3'>
											<div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md'>
												{index + 1}
											</div>
											<div>
												<p className='font-semibold text-gray-900'>
													{clientName}
												</p>
												{clientData?.description && (
													<p className='text-xs text-gray-500'>
														{clientData.description}
													</p>
												)}
												{!clientData && (
													<p className='text-xs text-gray-400'>ID: {clientId}</p>
												)}
											</div>
										</div>
										{clientData?.enabled !== undefined && (
											<span
												className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
													clientData.enabled
														? 'bg-green-100 text-green-800'
														: 'bg-red-100 text-red-800'
												}`}
											>
												{clientData.enabled ? 'فعال' : 'غیرفعال'}
											</span>
										)}
									</div>
								);
							})}
						</div>
					) : (
						<p className='text-gray-500 text-center py-4'>
							هیچ کلاینتی یافت نشد
						</p>
					)}
				</div>
			</div>

			{/* Roles */}
			<div className='bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6'>
				<h2 className='text-xl font-bold text-gray-900 mb-6 flex items-center'>
					<UserCog className='w-6 h-6 ml-2 text-purple-600' />
					نقش‌ها ({profile.roles.length})
				</h2>
				{profile.roles.length > 0 ? (
					<div className='space-y-3'>
						{profile.roles.map((role, index) => (
							<div
								key={role.id}
								className='flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-purple-50 hover:to-indigo-50 transition-all duration-300'
							>
								<div className='flex items-center space-x-reverse space-x-3'>
									<div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md'>
										{index + 1}
									</div>
									<div>
										<p className='font-semibold text-gray-900'>{role.title}</p>
										<p className='text-xs text-gray-500'>
											کلاینت: {getClientName(role.client_id)}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className='text-gray-500 text-center py-4'>هیچ نقشی یافت نشد</p>
				)}
			</div>

			{/* Additional Information */}
			<div className='bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6'>
				<h2 className='text-xl font-bold text-gray-900 mb-6'>اطلاعات اضافی</h2>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{/* Mobile Prefix */}
					<div className='bg-blue-50 p-4 rounded-lg'>
						<p className='text-sm font-bold text-gray-600 mb-2'>
							پیش‌شماره موبایل
						</p>
						<p className='text-lg font-bold text-gray-900'>
							{profile.mobile_prefix || 'نامشخص'}
						</p>
					</div>

					{/* Mobile Country Code */}
					<div className='bg-cyan-50 p-4 rounded-lg'>
						<p className='text-sm font-bold text-gray-600 mb-2'>
							کد کشور موبایل
						</p>
						<p className='text-lg font-bold text-gray-900'>
							{profile.mobile_country_code || 'نامشخص'}
						</p>
					</div>

					{/* Third Party Provider */}
					<div className='bg-green-50 p-4 rounded-lg'>
						<p className='text-sm font-bold text-gray-600 mb-2'>
							ارائه‌دهنده شخص ثالث
						</p>
						<p className='text-lg font-bold text-gray-900'>
							{profile.third_party_provider || 'هیچکدام'}
						</p>
					</div>

					{/* Verified via Third Party */}
					<div className='bg-purple-50 p-4 rounded-lg'>
						<p className='text-sm font-bold text-gray-600 mb-2'>
							تأیید شده از طریق شخص ثالث
						</p>
						<p className='text-lg font-bold text-gray-900'>
							{profile.is_verified_via_third_party === true
								? 'بله'
								: profile.is_verified_via_third_party === false
									? 'خیر'
									: 'نامشخص'}
						</p>
					</div>

					{/* Created At */}
					<div className='bg-orange-50 p-4 rounded-lg'>
						<p className='text-sm font-bold text-gray-600 mb-2 flex items-center'>
							<Calendar className='w-4 h-4 ml-1' />
							تاریخ ایجاد
						</p>
						<p className='text-lg font-bold text-gray-900'>
							{formatDate(profile.created_at)}
						</p>
					</div>

					{/* Updated At */}
					<div className='bg-yellow-50 p-4 rounded-lg'>
						<p className='text-sm font-bold text-gray-600 mb-2 flex items-center'>
							<Calendar className='w-4 h-4 ml-1' />
							آخرین بروزرسانی
						</p>
						<p className='text-lg font-bold text-gray-900'>
							{formatDate(profile.updated_at)}
						</p>
					</div>

					{/* Deleted At */}
					{profile.deleted_at && (
						<div className='bg-red-50 p-4 rounded-lg'>
							<p className='text-sm font-bold text-gray-600 mb-2 flex items-center'>
								<Calendar className='w-4 h-4 ml-1' />
								تاریخ حذف
							</p>
							<p className='text-lg font-bold text-red-600'>
								{formatDate(profile.deleted_at)}
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Timestamps */}
			{profile.timestamps && profile.timestamps.length > 0 && (
				<div className='bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6'>
					<h2 className='text-xl font-bold text-gray-900 mb-6'>
						برچسب‌های زمانی
					</h2>
					<div className='space-y-2'>
						{profile.timestamps.map((timestamp, index) => (
							<div
								key={index}
								className='p-3 bg-gray-50 rounded-lg text-sm text-gray-700'
							>
								{formatDate(timestamp)}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
