import { Calendar, Filter, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { customerService, employeeService } from '../services/api';
import type { Customer, Employee } from '../types';
import PersianDatePicker from './PersianDatePicker';

export interface FilterOptions {
	searchTerm?: string;
	customer_id?: string;
	employee_id?: string;
	change_type?: string;
	by_system?: boolean;
	date_from?: string;
	date_to?: string;
	sort_by?: string;
	sort_order?: 'asc' | 'desc';
	// Additional filters for categories and products
	priority?: number;
	has_children?: boolean;
	min_price?: number;
	max_price?: number;
	min_weight?: number;
	max_weight?: number;
	locked?: boolean;
	// Order-specific filters
	step?: string;
	payment_status?: string;
	delivery_method?: string;
	bought?: boolean;
	fulfilled?: boolean;
	archived?: boolean;
	seller_id?: string;
}

interface FilterModalProps {
	isOpen: boolean;
	onClose: () => void;
	onApplyFilters: (filters: FilterOptions) => void;
	currentFilters: FilterOptions;
}

const changeTypes = [
	{ value: 'BALANCE_INCREASE', label: 'افزایش موجودی' },
	{ value: 'BALANCE_DECREASE', label: 'کاهش موجودی' },
	{ value: 'CREDIT_CAP_INCREASE', label: 'افزایش اعتبار' },
	{ value: 'CREDIT_CAP_DECREASE', label: 'کاهش اعتبار' },
	{ value: 'PAYMENT_RECEIVED', label: 'دریافت پرداخت' },
	{ value: 'INVOICE_CREATED', label: 'ایجاد فاکتور' },
	{ value: 'MANUAL_ADJUSTMENT', label: 'تغییر دستی' },
];

const sortOptions = [
	{ value: 'created_at', label: 'تاریخ ایجاد' },
	{ value: 'balance_diff', label: 'مقدار تغییر' },
	{ value: 'change_type', label: 'نوع تغییر' },
	{ value: 'code', label: 'کد سفارش' },
	{ value: 'delivery_date', label: 'تاریخ تحویل' },
];

const orderSteps = [
	{ value: 'SELLER', label: 'فروشنده' },
	{ value: 'SALES_MANAGER', label: 'مدیر فروش' },
	{ value: 'PROCESSING', label: 'آماده سازی' },
	{ value: 'INVENTORY', label: 'انبار' },
	{ value: 'ACCOUNTING', label: 'حسابداری' },
	{ value: 'CARGO', label: 'مرسوله' },
	{ value: 'PARTIALLY_DELIVERED', label: 'تحویل جزیی' },
	{ value: 'DELIVERED', label: 'تحویل کامل' },
	{ value: 'PARTIALLY_RETURNED', label: 'برگشت جزیی' },
	{ value: 'RETURNED', label: 'برگشت کامل' },
];

const paymentStatuses = [
	{ value: 'PAID', label: 'پرداخت شده' },
	{ value: 'NOT_PAID', label: 'پرداخت نشده' },
	{ value: 'PARTIAL', label: 'پرداخت جزئی' },
];

const deliveryMethods = [
	{ value: 'AT_INVENTORY', label: 'در انبار' },
	{ value: 'FREE_OUR_TRUCK', label: 'رایگان با ماشین شرکت' },
	{ value: 'FREE_OTHER_SERVICES', label: 'رایگان با سرویس خارجی' },
	{ value: 'PAID', label: 'ارسال با هزینه مشتری' },
];

export default function FilterModal({
	isOpen,
	onClose,
	onApplyFilters,
	currentFilters,
}: FilterModalProps) {
	const [filters, setFilters] = useState<FilterOptions>(currentFilters);
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [loadingCustomers, setLoadingCustomers] = useState(false);
	const [loadingEmployees, setLoadingEmployees] = useState(false);

	useEffect(() => {
		setFilters(currentFilters);
	}, [currentFilters]);

	useEffect(() => {
		if (isOpen) {
			fetchCustomers();
			fetchEmployees();
		}
	}, [isOpen]);

	const fetchCustomers = async () => {
		try {
			setLoadingCustomers(true);
			const data = await customerService.getAllCustomers();
			setCustomers(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error('Error fetching customers:', error);
			setCustomers([]);
		} finally {
			setLoadingCustomers(false);
		}
	};

	const fetchEmployees = async () => {
		try {
			setLoadingEmployees(true);
			const data = await employeeService.getAllEmployees();
			setEmployees(data);
		} catch (error) {
			console.error('Error fetching employees:', error);
			setEmployees([]);
		} finally {
			setLoadingEmployees(false);
		}
	};

	const handleFilterChange = (key: keyof FilterOptions, value: any) => {
		setFilters(prev => ({
			...prev,
			[key]: value,
		}));
	};

	const handleApply = () => {
		onApplyFilters(filters);
		onClose();
	};

	const handleReset = () => {
		const resetFilters: FilterOptions = {};
		setFilters(resetFilters);
		onApplyFilters(resetFilters);
	};

	const hasActiveFilters = Object.values(filters).some(
		value => value !== undefined && value !== '' && value !== null,
	);

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm'>
			<div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-in-out scale-100 hover:scale-[1.01]'>
				{/* Header */}
				<div className='bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white rounded-t-2xl'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center space-x-reverse space-x-3'>
							<div className='w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm'>
								<Filter className='w-5 h-5' />
							</div>
							<div>
								<h2 className='text-xl font-bold'>فیلترهای پیشرفته</h2>
								<p className='text-blue-100 text-sm'>
									جستجو و فیلتر تاریخچه کیف پول
								</p>
							</div>
						</div>
						<button
							onClick={onClose}
							className='w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-all duration-300 ease-in-out backdrop-blur-sm hover:scale-110'
						>
							<X className='w-4 h-4' />
						</button>
					</div>
				</div>

				{/* Content */}
				<div className='p-6 overflow-y-auto max-h-[calc(90vh-200px)]'>
					<div className='space-y-6'>
						{/* Search Term */}
						<div className='space-y-2'>
							<label className='text-sm font-semibold text-gray-700 flex items-center space-x-reverse space-x-2'>
								<Search className='w-4 h-4 text-gray-500' />
								جستجو در متن
							</label>
							<input
								type='text'
								placeholder='جستجو در توضیحات، کدها، نام مشتری...'
								value={filters.searchTerm || ''}
								onChange={e => handleFilterChange('searchTerm', e.target.value)}
								className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 shadow-sm hover:shadow-md'
							/>
						</div>

						{/* Customer Selection */}
						<div className='space-y-2'>
							<label className='text-sm font-semibold text-gray-700'>
								انتخاب مشتری
							</label>
							<select
								value={filters.customer_id || ''}
								onChange={e =>
									handleFilterChange('customer_id', e.target.value)
								}
								className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 shadow-sm hover:shadow-md'
								disabled={loadingCustomers}
							>
								<option value=''>همه مشتریان</option>
								{customers.map(customer => (
									<option key={customer.id} value={customer.id}>
										{customer.title}
									</option>
								))}
							</select>
							{loadingCustomers && (
								<p className='text-xs text-gray-500'>
									در حال بارگذاری مشتریان...
								</p>
							)}
						</div>

						{/* Employee Selection */}
						<div className='space-y-2'>
							<label className='text-sm font-semibold text-gray-700'>
								انتخاب کارمند
							</label>
							<select
								value={filters.employee_id || ''}
								onChange={e =>
									handleFilterChange('employee_id', e.target.value)
								}
								className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 shadow-sm hover:shadow-md'
								disabled={loadingEmployees}
							>
								<option value=''>همه کارمندان</option>
								{employees.map(employee => (
									<option key={employee.id} value={employee.id}>
										{employee.profile.first_name} {employee.profile.last_name}
									</option>
								))}
							</select>
							{loadingEmployees && (
								<p className='text-xs text-gray-500'>
									در حال بارگذاری کارمندان...
								</p>
							)}
						</div>

						{/* Change Type */}
						<div className='space-y-2'>
							<label className='text-sm font-semibold text-gray-700'>
								نوع تغییر
							</label>
							<select
								value={filters.change_type || ''}
								onChange={e =>
									handleFilterChange('change_type', e.target.value)
								}
								className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 shadow-sm hover:shadow-md'
							>
								<option value=''>همه انواع</option>
								{changeTypes.map(type => (
									<option key={type.value} value={type.value}>
										{type.label}
									</option>
								))}
							</select>
						</div>

						{/* System Changes */}
						<div className='space-y-2'>
							<label className='text-sm font-semibold text-gray-700'>
								تغییرات سیستم
							</label>
							<select
								value={
									filters.by_system === undefined
										? ''
										: filters.by_system.toString()
								}
								onChange={e => {
									const value =
										e.target.value === ''
											? undefined
											: e.target.value === 'true';
									handleFilterChange('by_system', value);
								}}
								className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 shadow-sm hover:shadow-md'
							>
								<option value=''>همه تغییرات</option>
								<option value='true'>فقط تغییرات خودکار</option>
								<option value='false'>فقط تغییرات دستی</option>
							</select>
						</div>

						{/* Order Step */}
						<div className='space-y-2'>
							<label className='text-sm font-semibold text-gray-700'>
								مرحله سفارش
							</label>
							<select
								value={filters.step || ''}
								onChange={e => handleFilterChange('step', e.target.value)}
								className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 shadow-sm hover:shadow-md'
							>
								<option value=''>همه مراحل</option>
								{orderSteps.map(step => (
									<option key={step.value} value={step.value}>
										{step.label}
									</option>
								))}
							</select>
						</div>

						{/* Payment Status */}
						<div className='space-y-2'>
							<label className='text-sm font-semibold text-gray-700'>
								وضعیت پرداخت
							</label>
							<select
								value={filters.payment_status || ''}
								onChange={e =>
									handleFilterChange('payment_status', e.target.value)
								}
								className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 shadow-sm hover:shadow-md'
							>
								<option value=''>همه وضعیت‌ها</option>
								{paymentStatuses.map(status => (
									<option key={status.value} value={status.value}>
										{status.label}
									</option>
								))}
							</select>
						</div>

						{/* Delivery Method */}
						<div className='space-y-2'>
							<label className='text-sm font-semibold text-gray-700'>
								روش تحویل
							</label>
							<select
								value={filters.delivery_method || ''}
								onChange={e =>
									handleFilterChange('delivery_method', e.target.value)
								}
								className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 shadow-sm hover:shadow-md'
							>
								<option value=''>همه روش‌ها</option>
								{deliveryMethods.map(method => (
									<option key={method.value} value={method.value}>
										{method.label}
									</option>
								))}
							</select>
						</div>

						{/* Bought Status */}
						<div className='space-y-2'>
							<label className='text-sm font-semibold text-gray-700'>
								وضعیت خرید
							</label>
							<select
								value={
									filters.bought === undefined ? '' : filters.bought.toString()
								}
								onChange={e => {
									const value =
										e.target.value === ''
											? undefined
											: e.target.value === 'true';
									handleFilterChange('bought', value);
								}}
								className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 shadow-sm hover:shadow-md'
							>
								<option value=''>همه وضعیت‌ها</option>
								<option value='true'>خریداری شده</option>
								<option value='false'>خریداری نشده</option>
							</select>
						</div>

						{/* Fulfilled Status */}
						<div className='space-y-2'>
							<label className='text-sm font-semibold text-gray-700'>
								وضعیت تحویل
							</label>
							<select
								value={
									filters.fulfilled === undefined
										? ''
										: filters.fulfilled.toString()
								}
								onChange={e => {
									const value =
										e.target.value === ''
											? undefined
											: e.target.value === 'true';
									handleFilterChange('fulfilled', value);
								}}
								className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 shadow-sm hover:shadow-md'
							>
								<option value=''>همه وضعیت‌ها</option>
								<option value='true'>تحویل شده</option>
								<option value='false'>در انتظار تحویل</option>
							</select>
						</div>

						{/* Archived Status */}
						<div className='space-y-2'>
							<label className='text-sm font-semibold text-gray-700'>
								وضعیت آرشیو
							</label>
							<select
								value={
									filters.archived === undefined
										? ''
										: filters.archived.toString()
								}
								onChange={e => {
									const value =
										e.target.value === ''
											? undefined
											: e.target.value === 'true';
									handleFilterChange('archived', value);
								}}
								className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 shadow-sm hover:shadow-md'
							>
								<option value=''>همه وضعیت‌ها</option>
								<option value='true'>آرشیو شده</option>
								<option value='false'>فعال</option>
							</select>
						</div>

						{/* Seller Selection */}
						<div className='space-y-2'>
							<label className='text-sm font-semibold text-gray-700'>
								انتخاب فروشنده
							</label>
							<select
								value={filters.seller_id || ''}
								onChange={e => handleFilterChange('seller_id', e.target.value)}
								className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 shadow-sm hover:shadow-md'
								disabled={loadingEmployees}
							>
								<option value=''>همه فروشندگان</option>
								{employees.map(employee => (
									<option key={employee.id} value={employee.id}>
										{employee.profile.first_name} {employee.profile.last_name}
									</option>
								))}
							</select>
							{loadingEmployees && (
								<p className='text-xs text-gray-500'>
									در حال بارگذاری فروشندگان...
								</p>
							)}
						</div>

						{/* Date Range */}
						<div className='space-y-2'>
							<label className='text-sm font-semibold text-gray-700 flex items-center space-x-reverse space-x-2'>
								<Calendar className='w-4 h-4 text-gray-500' />
								محدوده تاریخ
							</label>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<label className='text-xs text-gray-600 block mb-2'>
										از تاریخ
									</label>
									<PersianDatePicker
										value={filters.date_from || ''}
										onChange={date => handleFilterChange('date_from', date)}
										placeholder='انتخاب تاریخ شروع'
									/>
								</div>
								<div>
									<label className='text-xs text-gray-600 block mb-2'>
										تا تاریخ
									</label>
									<PersianDatePicker
										value={filters.date_to || ''}
										onChange={date => handleFilterChange('date_to', date)}
										placeholder='انتخاب تاریخ پایان'
									/>
								</div>
							</div>
						</div>

						{/* Sort Options */}
						<div className='space-y-2'>
							<label className='text-sm font-semibold text-gray-700'>
								مرتب‌سازی
							</label>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<label className='text-xs text-gray-600 block mb-1'>
										مرتب‌سازی بر اساس
									</label>
									<select
										value={filters.sort_by || 'created_at'}
										onChange={e =>
											handleFilterChange('sort_by', e.target.value)
										}
										className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 shadow-sm hover:shadow-md'
									>
										{sortOptions.map(option => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className='text-xs text-gray-600 block mb-1'>
										ترتیب
									</label>
									<select
										value={filters.sort_order || 'desc'}
										onChange={e =>
											handleFilterChange(
												'sort_order',
												e.target.value as 'asc' | 'desc',
											)
										}
										className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 shadow-sm hover:shadow-md'
									>
										<option value='desc'>نزولی (جدیدترین)</option>
										<option value='asc'>صعودی (قدیمی‌ترین)</option>
									</select>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className='bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex items-center justify-between border-t border-gray-200 rounded-b-2xl'>
					<div className='flex items-center space-x-reverse space-x-3'>
						{hasActiveFilters && (
							<span className='text-sm text-gray-600'>
								{
									Object.values(filters).filter(
										v => v !== undefined && v !== '' && v !== null,
									).length
								}{' '}
								فیلتر فعال
							</span>
						)}
					</div>
					<div className='flex items-center space-x-reverse space-x-3'>
						<button
							onClick={handleReset}
							className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-all duration-300 ease-in-out hover:scale-105'
						>
							پاک کردن همه
						</button>
						<button
							onClick={onClose}
							className='px-6 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-300 ease-in-out hover:scale-105 shadow-sm hover:shadow-md'
						>
							انصراف
						</button>
						<button
							onClick={handleApply}
							className='px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl hover:scale-105'
						>
							اعمال فیلتر
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
