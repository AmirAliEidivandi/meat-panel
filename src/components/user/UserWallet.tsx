import { useState, useEffect } from 'react';
import { Wallet, CreditCard, TrendingUp, DollarSign, Plus } from 'lucide-react';
import { walletService } from '../../services/api';
import type { WalletInfoResponse } from '../../types';
import TopupModal from './TopupModal';

export default function UserWallet() {
	const [walletInfo, setWalletInfo] = useState<WalletInfoResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);

	useEffect(() => {
		loadData();
	}, []);

	// Refresh wallet data when component mounts (e.g., after returning from payment)
	useEffect(() => {
		const shouldRefresh = sessionStorage.getItem('wallet_refresh_needed');
		if (shouldRefresh === 'true') {
			loadData();
			sessionStorage.removeItem('wallet_refresh_needed');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadData = async () => {
		try {
			setLoading(true);
			const wallet = await walletService.getWalletInfo();
			setWalletInfo(wallet);
		} catch (err: any) {
			setError('خطا در بارگذاری اطلاعات');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleTopupSuccess = (redirectUrl: string) => {
		// Store callback URL in localStorage to redirect back after payment
		localStorage.setItem('wallet_topup_callback', '/user/wallet-topup/callback');
		// Redirect to payment gateway
		window.location.href = redirectUrl;
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<div className='w-8 h-8 border-[3px] border-primary-600 border-t-transparent rounded-full animate-spin'></div>
			</div>
		);
	}

	if (!walletInfo) {
		return (
			<div className='text-center py-12'>
				<p className='text-gray-600'>{error || 'خطا در بارگذاری اطلاعات'}</p>
			</div>
		);
	}

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('fa-IR').format(amount);
	};

	return (
		<div className='max-w-4xl mx-auto'>
			<div className='bg-white rounded-xl shadow-lg p-8'>
				<div className='flex items-center justify-between mb-8'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
							<Wallet className='w-6 h-6 text-purple-600' />
						</div>
						<h2 className='text-2xl font-bold text-gray-900'>اطلاعات کیف پول</h2>
					</div>
					<button
						onClick={() => setIsTopupModalOpen(true)}
						className='flex items-center space-x-reverse space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg'
					>
						<Plus className='w-5 h-5' />
						<span>افزایش موجودی</span>
					</button>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					{/* Balance */}
					<div className='bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200'>
						<div className='flex items-center justify-between mb-4'>
							<div className='flex items-center space-x-reverse space-x-3'>
								<div className='w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center'>
									<DollarSign className='w-6 h-6 text-white' />
								</div>
								<div>
									<p className='text-sm text-gray-600'>موجودی</p>
									<p className='text-2xl font-bold text-gray-900'>
										{formatCurrency(walletInfo.balance)} ریال
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Credit Cap */}
					<div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200'>
						<div className='flex items-center justify-between mb-4'>
							<div className='flex items-center space-x-reverse space-x-3'>
								<div className='w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center'>
									<CreditCard className='w-6 h-6 text-white' />
								</div>
								<div>
									<p className='text-sm text-gray-600'>سقف اعتبار</p>
									<p className='text-2xl font-bold text-gray-900'>
										{formatCurrency(walletInfo.credit_cap)} ریال
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Initial Balance */}
					<div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200'>
						<div className='flex items-center justify-between mb-4'>
							<div className='flex items-center space-x-reverse space-x-3'>
								<div className='w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center'>
									<TrendingUp className='w-6 h-6 text-white' />
								</div>
								<div>
									<p className='text-sm text-gray-600'>موجودی اولیه</p>
									<p className='text-2xl font-bold text-gray-900'>
										{formatCurrency(walletInfo.initial_balance)} ریال
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Available Credit */}
					<div className='bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200'>
						<div className='flex items-center justify-between mb-4'>
							<div className='flex items-center space-x-reverse space-x-3'>
								<div className='w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center'>
									<Wallet className='w-6 h-6 text-white' />
								</div>
								<div>
									<p className='text-sm text-gray-600'>اعتبار قابل استفاده</p>
									<p className='text-2xl font-bold text-gray-900'>
										{formatCurrency(
											walletInfo.credit_cap - walletInfo.balance,
										)}{' '}
										ریال
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Description */}
				{walletInfo.description && (
					<div className='mt-6 p-4 bg-gray-50 rounded-lg'>
						<p className='text-sm font-semibold text-gray-700 mb-2'>توضیحات:</p>
						<p className='text-gray-600'>{walletInfo.description}</p>
					</div>
				)}

				{/* Additional Info */}
				<div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
					<div>
						<p className='text-gray-600'>تاریخ ایجاد:</p>
						<p className='text-gray-900 font-semibold'>
							{new Date(walletInfo.created_at).toLocaleDateString('fa-IR')}
						</p>
					</div>
					<div>
						<p className='text-gray-600'>آخرین به‌روزرسانی:</p>
						<p className='text-gray-900 font-semibold'>
							{new Date(walletInfo.updated_at).toLocaleDateString('fa-IR')}
						</p>
					</div>
					<div>
						<p className='text-gray-600'>وضعیت:</p>
						<p
							className={`font-semibold ${
								walletInfo.deleted_at ? 'text-red-600' : 'text-green-600'
							}`}
						>
							{walletInfo.deleted_at ? 'غیرفعال' : 'فعال'}
						</p>
					</div>
				</div>
			</div>

			{/* Topup Modal */}
			<TopupModal
				isOpen={isTopupModalOpen}
				onClose={() => setIsTopupModalOpen(false)}
				onSuccess={handleTopupSuccess}
			/>
		</div>
	);
}

