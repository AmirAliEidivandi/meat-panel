import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { employeeService } from '../services/api';
import type { Employee, QueryOrderHistoryDto } from '../types';

interface OrderHistoryFilterModalProps {
	isOpen: boolean;
	onClose: () => void;
	onApplyFilters: (filters: QueryOrderHistoryDto) => void;
	currentFilters: QueryOrderHistoryDto;
}

const orderChangeTypes = [
	{ value: 'CREATED', label: 'ایجاد سفارش' },
	{ value: 'STEP_CHANGED', label: 'تغییر مرحله' },
	{ value: 'PAYMENT_STATUS_CHANGED', label: 'تغییر وضعیت پرداخت' },
	{ value: 'FULFILLED_STATUS_CHANGED', label: 'تغییر وضعیت تحویل' },
	{ value: 'ARCHIVED_STATUS_CHANGED', label: 'تغییر وضعیت آرشیو' },
	{ value: 'DELIVERY_DATE_CHANGED', label: 'تغییر تاریخ تحویل' },
	{ value: 'DELIVERY_METHOD_CHANGED', label: 'تغییر روش تحویل' },
	{ value: 'SELLER_CHANGED', label: 'تغییر فروشنده' },
	{ value: 'VISITOR_CHANGED', label: 'تغییر بازدیدکننده' },
	{ value: 'WAREHOUSE_CHANGED', label: 'تغییر انبار' },
	{ value: 'PRODUCTS_CHANGED', label: 'تغییر محصولات' },
	{ value: 'CUSTOMER_CHANGED', label: 'تغییر مشتری' },
	{ value: 'DELETED', label: 'حذف سفارش' },
	{ value: 'RESTORED', label: 'بازیابی سفارش' },
];

const orderSteps = [
	{ value: 'SELLER', label: 'فروشنده' },
	{ value: 'SALES_MANAGER', label: 'مدیر فروش' },
	{ value: 'PROCESSING', label: 'آماده سازی' },
	{ value: 'INVENTORY', label: 'انبار' },
	{ value: 'ACCOUNTING', label: 'حسابداری' },
	{ value: 'CARGO', label: 'مرسوله' },
	{ value: 'PARTIALLY_DELIVERED', label: 'تحویل جزئی' },
	{ value: 'DELIVERED', label: 'تحویل داده شده' },
	{ value: 'PARTIALLY_RETURNED', label: 'مرجوعی جزئی' },
	{ value: 'RETURNED', label: 'مرجوعی کامل' },
];

const sortOptions = [{ value: 'created_at', label: 'تاریخ ایجاد' }];

export default function OrderHistoryFilterModal({
	isOpen,
	onClose,
	onApplyFilters,
	currentFilters,
}: OrderHistoryFilterModalProps) {
	const [filters, setFilters] = useState<QueryOrderHistoryDto>(currentFilters);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [loadingEmployees, setLoadingEmployees] = useState(false);

	useEffect(() => {
		setFilters(currentFilters);
	}, [currentFilters]);

	useEffect(() => {
		if (isOpen) {
			fetchEmployees();
		}
	}, [isOpen]);

	const fetchEmployees = async () => {
		try {
			setLoadingEmployees(true);
			const response = await employeeService.getAllEmployees();
			setEmployees(response || []);
		} catch (err) {
			console.error('Error fetching employees:', err);
		} finally {
			setLoadingEmployees(false);
		}
	};

	const handleFilterChange = (
		key: keyof QueryOrderHistoryDto,
		value: string | boolean | undefined,
	) => {
		setFilters(prev => {
			if (value === '' || value === undefined) {
				const { [key]: _, ...restWithoutKey } = prev;
				return restWithoutKey;
			}

			return { ...prev, [key]: value };
		});
	};

	const handleClearAll = () => {
		setFilters({});
	};

	const handleApply = () => {
		onApplyFilters(filters);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
			<div className='bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar'>
				{/* Header */}
				<div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<Search className='w-5 h-5 text-green-600' />
						<h2 className='text-xl font-bold text-gray-900'>
							فیلترهای پیشرفته تاریخچه سفارشات
						</h2>
					</div>
					<button
						onClick={onClose}
						className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
					>
						<X className='w-5 h-5 text-gray-600' />
					</button>
				</div>

				{/* Filter Content */}
				<div className='p-6 space-y-6'>
					{/* Employee */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							کارمند
						</label>
						<select
							value={filters.employee_id || ''}
							onChange={e =>
								handleFilterChange('employee_id', e.target.value || undefined)
							}
							disabled={loadingEmployees}
							className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-green-400 hover:shadow-sm cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:shadow-none'
						>
							<option value=''>همه کارمندان</option>
							{employees.map(employee => (
								<option key={employee.id} value={employee.id}>
									{employee.profile.first_name} {employee.profile.last_name}
								</option>
							))}
						</select>
					</div>

					{/* Change Type and Step Row */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								نوع تغییر
							</label>
							<select
								value={filters.change_type || ''}
								onChange={e =>
									handleFilterChange('change_type', e.target.value || undefined)
								}
								className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-green-400 hover:shadow-sm cursor-pointer'
							>
								<option value=''>همه انواع</option>
								{orderChangeTypes.map(type => (
									<option key={type.value} value={type.value}>
										{type.label}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								مرحله
							</label>
							<select
								value={filters.step_after || ''}
								onChange={e =>
									handleFilterChange('step_after', e.target.value || undefined)
								}
								className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-green-400 hover:shadow-sm cursor-pointer'
							>
								<option value=''>همه مراحل</option>
								{orderSteps.map(step => (
									<option key={step.value} value={step.value}>
										{step.label}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* System and Deleted Row */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								نوع تغییرات
							</label>
							<select
								value={
									filters.by_system === undefined
										? ''
										: filters.by_system
											? 'true'
											: 'false'
								}
								onChange={e => {
									const value = e.target.value;
									if (value === '') {
										handleFilterChange('by_system', undefined);
									} else {
										handleFilterChange('by_system', value === 'true');
									}
								}}
								className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-green-400 hover:shadow-sm cursor-pointer'
							>
								<option value=''>همه</option>
								<option value='true'>خودکار</option>
								<option value='false'>دستی</option>
							</select>
						</div>

						<div>
							<label className='flex items-center space-x-reverse space-x-2 cursor-pointer h-full items-center justify-center'>
								<input
									type='checkbox'
									checked={filters.deleted_changed === true}
									onChange={e =>
										handleFilterChange(
											'deleted_changed',
											e.target.checked ? true : undefined,
										)
									}
									className='w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500'
								/>
								<span className='text-sm font-semibold text-gray-700'>
									نمایش تغییرات حذف
								</span>
							</label>
						</div>
					</div>

					{/* Sort Options */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								مرتب‌سازی بر اساس
							</label>
							<select
								value={filters.sort_by || ''}
								onChange={e =>
									handleFilterChange('sort_by', e.target.value || undefined)
								}
								className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-green-400 hover:shadow-sm cursor-pointer'
							>
								<option value=''>پیش‌فرض</option>
								{sortOptions.map(option => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								ترتیب
							</label>
							<select
								value={filters.sort_order || ''}
								onChange={e =>
									handleFilterChange(
										'sort_order',
										(e.target.value as 'asc' | 'desc') || undefined,
									)
								}
								className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-green-400 hover:shadow-sm cursor-pointer'
							>
								<option value=''>پیش‌فرض</option>
								<option value='asc'>صعودی</option>
								<option value='desc'>نزولی</option>
							</select>
						</div>
					</div>
				</div>

				{/* Footer Actions */}
				<div className='sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between'>
					<button
						onClick={handleClearAll}
						className='px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-semibold'
					>
						پاک کردن همه
					</button>
					<div className='flex items-center space-x-reverse space-x-3'>
						<button
							onClick={onClose}
							className='px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold'
						>
							انصراف
						</button>
						<button
							onClick={handleApply}
							className='px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold'
						>
							اعمال فیلتر
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

