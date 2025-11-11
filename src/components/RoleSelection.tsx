import { Building2, Shield, User } from 'lucide-react';
import { useState } from 'react';

interface RoleSelectionProps {
	onRoleSelected: (role: 'admin' | 'customer') => void;
}

export default function RoleSelection({ onRoleSelected }: RoleSelectionProps) {
	const [selectedRole, setSelectedRole] = useState<'admin' | 'customer' | null>(
		null,
	);

	const handleRoleSelect = (role: 'admin' | 'customer') => {
		setSelectedRole(role);
		onRoleSelected(role);
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center p-6'>
			<div className='max-w-2xl w-full'>
				<div className='bg-white rounded-2xl shadow-xl p-10'>
					<div className='text-center mb-10'>
						<div className='w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-5'>
							<User className='w-10 h-10 text-primary-600' />
						</div>
						<h1 className='text-3xl font-bold text-gray-900'>
							انتخاب نوع پنل
						</h1>
						<p className='text-gray-600 mt-3 text-base'>
							لطفاً نوع پنلی که می‌خواهید وارد شوید را انتخاب کنید
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						{/* Admin Panel */}
						<button
							onClick={() => handleRoleSelect('admin')}
							className={`p-8 rounded-xl border-2 transition-all duration-200 text-right ${
								selectedRole === 'admin'
									? 'border-primary-500 bg-primary-50 shadow-lg scale-105'
									: 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
							}`}
						>
							<div className='flex flex-col items-center space-y-4'>
								<div
									className={`w-16 h-16 rounded-full flex items-center justify-center ${
										selectedRole === 'admin'
											? 'bg-primary-600'
											: 'bg-gray-100'
									}`}
								>
									<Shield
										className={`w-8 h-8 ${
											selectedRole === 'admin'
												? 'text-white'
												: 'text-gray-600'
										}`}
									/>
								</div>
								<h3 className='text-xl font-bold text-gray-900'>پنل مدیریت</h3>
								<p className='text-gray-600 text-sm'>
									ورود به پنل مدیریتی برای مدیریت سیستم
								</p>
							</div>
						</button>

						{/* Customer Panel */}
						<button
							onClick={() => handleRoleSelect('customer')}
							className={`p-8 rounded-xl border-2 transition-all duration-200 text-right ${
								selectedRole === 'customer'
									? 'border-primary-500 bg-primary-50 shadow-lg scale-105'
									: 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
							}`}
						>
							<div className='flex flex-col items-center space-y-4'>
								<div
									className={`w-16 h-16 rounded-full flex items-center justify-center ${
										selectedRole === 'customer'
											? 'bg-primary-600'
											: 'bg-gray-100'
									}`}
								>
									<Building2
										className={`w-8 h-8 ${
											selectedRole === 'customer'
												? 'text-white'
												: 'text-gray-600'
										}`}
									/>
								</div>
								<h3 className='text-xl font-bold text-gray-900'>پنل کاربری</h3>
								<p className='text-gray-600 text-sm'>
									ورود به پنل کاربری برای مشاهده اطلاعات و کسب و کار
								</p>
							</div>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

