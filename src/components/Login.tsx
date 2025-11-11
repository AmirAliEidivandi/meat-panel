import { Eye, EyeOff, Lock, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, profileService } from '../services/api';
import { getUserPanelType } from '../lib/roleUtils';
import type { LoginRequest } from '../types';
import RoleSelection from './RoleSelection';

interface LoginProps {
	onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
	const navigate = useNavigate();
	const [formData, setFormData] = useState<LoginRequest>({
		mobile: '',
		password: '',
	});
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [showRoleSelection, setShowRoleSelection] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const response = await authService.login(formData);
			console.log('Login response:', response);
			
			// Save tokens
			if (response.access_token) {
				localStorage.setItem('access_token', response.access_token);
			}
			if (response.refresh_token) {
				localStorage.setItem('refresh_token', response.refresh_token);
			}
			
			// Get user roles to determine panel type
			try {
				const roles = await profileService.getRoles();
				const panelType = getUserPanelType(roles);
				
				if (panelType === 'both') {
					// Show role selection
					setShowRoleSelection(true);
				} else if (panelType === 'admin') {
					// Redirect to admin panel
					localStorage.setItem('panel_type', 'admin');
					onLoginSuccess();
					// Use setTimeout to ensure state update before navigation
					setTimeout(() => navigate('/manage'), 0);
				} else {
					// Redirect to customer panel
					localStorage.setItem('panel_type', 'customer');
					onLoginSuccess();
					// Use setTimeout to ensure state update before navigation
					setTimeout(() => navigate('/user'), 0);
				}
			} catch (roleError) {
				console.error('Error fetching roles:', roleError);
				// Default to customer panel if role fetch fails
				localStorage.setItem('panel_type', 'customer');
				onLoginSuccess();
				// Use setTimeout to ensure state update before navigation
				setTimeout(() => navigate('/user'), 0);
			}
		} catch (err: any) {
			console.error('Login error:', err);
			setError(err.response?.data?.message || err.message || 'خطا در ورود به سیستم');
		} finally {
			setLoading(false);
		}
	};

	const handleRoleSelected = (role: 'admin' | 'customer') => {
		localStorage.setItem('panel_type', role);
		onLoginSuccess();
		// Use setTimeout to ensure state update before navigation
		setTimeout(() => {
			if (role === 'admin') {
				navigate('/manage');
			} else {
				navigate('/user');
			}
		}, 0);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData(prev => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	if (showRoleSelection) {
		return <RoleSelection onRoleSelected={handleRoleSelected} />;
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center p-6'>
			<div className='max-w-lg w-full'>
				<div className='bg-white rounded-2xl shadow-xl p-10'>
					<div className='text-center mb-10'>
						<div className='w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-5'>
							<Lock className='w-10 h-10 text-primary-600' />
						</div>
						<h1 className='text-3xl font-bold text-gray-900'>ورود به سیستم</h1>
						<p className='text-gray-600 mt-3 text-base'>لطفاً اطلاعات خود را وارد کنید</p>
					</div>

					<form onSubmit={handleSubmit} className='space-y-7'>
						<div>
							<label
								htmlFor='mobile'
								className='block text-base font-semibold text-gray-700 mb-3'
							>
								شماره موبایل
							</label>
							<div className='relative'>
								<Smartphone className='absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400' />
								<input
									type='tel'
									id='mobile'
									name='mobile'
									value={formData.mobile}
									onChange={handleChange}
									className='flex h-12 w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-base placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 pr-12 w-full'
									placeholder='09123456789'
									required
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor='password'
								className='block text-base font-semibold text-gray-700 mb-3'
							>
								رمز عبور
							</label>
							<div className='relative'>
								<Lock className='absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400' />
								<input
									type={showPassword ? 'text' : 'password'}
									id='password'
									name='password'
									value={formData.password}
									onChange={handleChange}
									className='flex h-12 w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-base placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 pr-12 pl-12 w-full'
									placeholder='رمز عبور خود را وارد کنید'
									required
								/>
								<button
									type='button'
									onClick={() => setShowPassword(!showPassword)}
									className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
								>
									{showPassword ? (
										<EyeOff className='w-6 h-6' />
									) : (
										<Eye className='w-6 h-6' />
									)}
								</button>
							</div>
						</div>

						{error && (
							<div className='bg-red-50 border-2 border-red-200 rounded-lg p-4'>
								<p className='text-red-600 text-base font-semibold'>{error}</p>
							</div>
						)}

						<button
							type='submit'
							disabled={loading}
							className='inline-flex items-center justify-center rounded-lg text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg active:scale-95 w-full py-4 text-lg'
						>
							{loading ? (
								<div className='flex items-center justify-center'>
									<div className='w-6 h-6 border-[3px] border-white border-t-transparent rounded-full animate-spin ml-3'></div>
									<span>در حال ورود...</span>
								</div>
							) : (
								'ورود به سیستم'
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
