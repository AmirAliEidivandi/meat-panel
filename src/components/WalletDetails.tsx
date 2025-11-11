import {
	ArrowRight,
	CreditCard,
	DollarSign,
	Loader2,
	Settings,
	User,
	Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { walletService } from '../services/api';
import type { WalletDetails as WalletDetailsType } from '../types';
import AddInitialBalanceModal from './AddInitialBalanceModal';
import CreatePaymentModal from './CreatePaymentModal';
import UpdateCreditCapModal from './UpdateCreditCapModal';

export default function WalletDetails() {
	const navigate = useNavigate();
	const { id: walletId } = useParams();
	const [wallet, setWallet] = useState<WalletDetailsType | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [showCreatePaymentModal, setShowCreatePaymentModal] = useState(false);
	const [showUpdateCreditCapModal, setShowUpdateCreditCapModal] = useState(false);
	const [showAddInitialBalanceModal, setShowAddInitialBalanceModal] =
		useState(false);

	useEffect(() => {
		if (walletId) {
			fetchWalletDetails();
		}
	}, [walletId]);

	const fetchWalletDetails = async () => {
		try {
			setLoading(true);
			setError('');
			const data = await walletService.getWalletById(walletId as string);
			setWallet(data);
		} catch (err: any) {
			console.error('Error fetching wallet details:', err);
			setError('خطا در بارگذاری جزئیات کیف پول');
		} finally {
			setLoading(false);
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

	const handlePaymentCreated = () => {
		setShowCreatePaymentModal(false);
		fetchWalletDetails();
	};

	const handleCreditCapUpdated = () => {
		setShowUpdateCreditCapModal(false);
		fetchWalletDetails();
	};

	const handleInitialBalanceAdded = () => {
		setShowAddInitialBalanceModal(false);
		fetchWalletDetails();
	};

	const getCustomerTypeText = (type: string) => {
		const typeMap: { [key: string]: string } = {
			PERSONAL: 'شخصی',
			CORPORATE: 'سازمانی',
		};
		return typeMap[type] || type;
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

	if (error || !wallet) {
		return (
			<div className='text-center py-12'>
				<div className='text-red-500 mb-4'>{error || 'کیف پول یافت نشد'}</div>
				<button
					onClick={() => navigate('/manage/wallets')}
					className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors'
				>
					بازگشت به لیست کیف پول‌ها
				</button>
			</div>
		);
	}

	return (
		<div className='fade-in font-vazir max-w-7xl mx-auto'>
			{/* Header */}
			<div className='mb-8'>
				<button
					onClick={() => navigate('/manage/wallets')}
					className='mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm'
				>
					<ArrowRight className='w-4 h-4 ml-2' />
					بازگشت
				</button>
				<div className='flex items-start justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900 mb-2'>
							{wallet.customer.title}
						</h1>
						<p className='text-gray-500'>
							کد: {wallet.customer.code} - جزئیات کیف پول
						</p>
					</div>
				</div>
			</div>

			{/* Wallet Summary Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center'>
							<Wallet className='w-4 h-4 text-gray-600' />
						</div>
						<h3 className='font-bold text-gray-900'>موجودی حسابداری</h3>
					</div>
					<p
						className={`text-2xl font-bold ${
							wallet.balance >= 0 ? 'text-green-600' : 'text-red-600'
						}`}
					>
						{formatCurrency(wallet.balance)}
					</p>
				</div>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center'>
							<Wallet className='w-4 h-4 text-green-600' />
						</div>
						<h3 className='font-bold text-gray-900'>موجودی واقعی</h3>
					</div>
					<p
						className={`text-2xl font-bold ${
							(wallet.actual_balance ?? wallet.balance) >= 0
								? 'text-green-600'
								: 'text-red-600'
						}`}
					>
						{formatCurrency(wallet.actual_balance ?? wallet.balance)}
					</p>
				</div>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center'>
							<CreditCard className='w-4 h-4 text-blue-600' />
						</div>
						<h3 className='font-bold text-gray-900'>حد اعتبار</h3>
					</div>
					<p className='text-2xl font-bold text-blue-600'>
						{formatCurrency(wallet.credit_cap)}
					</p>
				</div>
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center'>
							<CreditCard className='w-4 h-4 text-indigo-600' />
						</div>
						<h3 className='font-bold text-gray-900'>حد اعتبار واقعی</h3>
					</div>
					<p
						className={`text-2xl font-bold ${
							(wallet.actual_credit ?? wallet.balance - wallet.credit_cap) >= 0
								? 'text-green-600'
								: 'text-red-600'
						}`}
					>
						{formatCurrency(
							wallet.actual_credit ?? wallet.balance - wallet.credit_cap,
						)}
					</p>
				</div>
			</div>

			{/* Pending Cheques Info */}
			{(wallet.pending_cheques_count ?? 0) > 0 && (
				<div className='bg-white rounded-xl border border-orange-200 p-6 mb-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center'>
							<CreditCard className='w-4 h-4 text-orange-600' />
						</div>
						<h3 className='font-bold text-gray-900'>چک‌های در انتظار</h3>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div>
							<p className='text-xs text-gray-500 mb-1.5'>تعداد چک‌ها</p>
							<p className='text-xl font-bold text-gray-900'>
								{wallet.pending_cheques_count} چک
							</p>
						</div>
						<div>
							<p className='text-xs text-gray-500 mb-1.5'>مجموع مبلغ چک‌ها</p>
							<p className='text-xl font-bold text-orange-600'>
								{formatCurrency(wallet.pending_cheques_total ?? 0)}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Customer Info */}
			<div className='bg-white rounded-xl border border-gray-200 p-6 mb-6'>
				<div className='flex items-center space-x-reverse space-x-2 mb-5'>
					<div className='w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center'>
						<User className='w-4 h-4 text-gray-600' />
					</div>
					<h3 className='font-bold text-gray-900'>اطلاعات مشتری</h3>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
					<div>
						<p className='text-xs text-gray-500 mb-1.5'>نام مشتری</p>
						<p className='text-sm font-semibold text-gray-900'>
							{wallet.customer.title}
						</p>
					</div>
					<div>
						<p className='text-xs text-gray-500 mb-1.5'>کد مشتری</p>
						<p className='text-sm font-semibold text-gray-900'>
							{wallet.customer.code}
						</p>
					</div>
					<div>
						<p className='text-xs text-gray-500 mb-1.5'>نوع</p>
						<p className='text-sm font-semibold text-gray-900'>
							{getCustomerTypeText(wallet.customer.type)}
						</p>
					</div>
					<div>
						<p className='text-xs text-gray-500 mb-1.5'>دسته‌بندی</p>
						<p className='text-sm font-semibold text-gray-900'>
							{getCategoryText(wallet.customer.category)}
						</p>
					</div>
				</div>
			</div>

			{/* Description */}
			{wallet.description && (
				<div className='bg-white rounded-xl border border-gray-200 p-6 mb-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<div className='w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center'>
							<Wallet className='w-4 h-4 text-gray-600' />
						</div>
						<h3 className='font-bold text-gray-900'>توضیحات</h3>
					</div>
					<p className='text-sm text-gray-700 bg-gray-50 rounded-lg p-3'>
						{wallet.description}
					</p>
				</div>
			)}

			{/* Actions */}
			<div className='bg-white rounded-xl border border-gray-200 p-6'>
				<div className='flex items-center space-x-reverse space-x-2 mb-5'>
					<div className='w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center'>
						<Settings className='w-4 h-4 text-emerald-600' />
					</div>
					<h3 className='font-bold text-gray-900'>عملیات</h3>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					<button
						onClick={() => setShowCreatePaymentModal(true)}
						className='flex items-center justify-center space-x-reverse space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all'
					>
						<div className='w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center'>
							<CreditCard className='w-5 h-5 text-white' />
						</div>
						<div className='text-right flex-1'>
							<p className='text-sm font-semibold text-gray-900'>ثبت پرداخت</p>
							<p className='text-xs text-gray-600'>ثبت پرداخت جدید</p>
						</div>
					</button>
					<button
						onClick={() => setShowUpdateCreditCapModal(true)}
						className='flex items-center justify-center space-x-reverse space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all'
					>
						<div className='w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center'>
							<Settings className='w-5 h-5 text-white' />
						</div>
						<div className='text-right flex-1'>
							<p className='text-sm font-semibold text-gray-900'>
								تعیین حد اعتبار
							</p>
							<p className='text-xs text-gray-600'>تغییر حد اعتبار مشتری</p>
						</div>
					</button>
					<button
						onClick={() => setShowAddInitialBalanceModal(true)}
						className='flex items-center justify-center space-x-reverse space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all'
					>
						<div className='w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center'>
							<DollarSign className='w-5 h-5 text-white' />
						</div>
						<div className='text-right flex-1'>
							<p className='text-sm font-semibold text-gray-900'>
								ثبت بدهی اولیه
							</p>
							<p className='text-xs text-gray-600'>ثبت موجودی اولیه</p>
						</div>
					</button>
				</div>
			</div>

			{/* Modals */}
			{showCreatePaymentModal && wallet && (
				<CreatePaymentModal
					isOpen={showCreatePaymentModal}
					onClose={() => setShowCreatePaymentModal(false)}
					customerId={wallet.customer.id}
					onSuccess={handlePaymentCreated}
				/>
			)}
			{showUpdateCreditCapModal && wallet && (
				<UpdateCreditCapModal
					isOpen={showUpdateCreditCapModal}
					onClose={() => setShowUpdateCreditCapModal(false)}
					customerId={wallet.customer.id}
					currentCreditCap={wallet.credit_cap}
					onSuccess={handleCreditCapUpdated}
				/>
			)}
			{showAddInitialBalanceModal && wallet && (
				<AddInitialBalanceModal
					isOpen={showAddInitialBalanceModal}
					onClose={() => setShowAddInitialBalanceModal(false)}
					customerId={wallet.customer.id}
					onSuccess={handleInitialBalanceAdded}
				/>
			)}
		</div>
	);
}
