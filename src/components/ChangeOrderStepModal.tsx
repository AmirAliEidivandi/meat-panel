import {
	AlertCircle,
	ArrowLeft,
	ArrowRight,
	CheckCircle,
	X,
	XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { orderService } from '../services/api';
import type { ChangeOrderStepDto, OrderDetails, OrderStepEnum } from '../types';
import { OrderStepEnumValues } from '../types';

interface ChangeOrderStepModalProps {
	order: OrderDetails;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

const STEP_LABELS: Record<OrderStepEnum, string> = {
	[OrderStepEnumValues.Seller]: 'فروشنده',
	[OrderStepEnumValues.SalesManager]: 'مدیر فروش',
	[OrderStepEnumValues.Processing]: 'آماده سازی',
	[OrderStepEnumValues.Inventory]: 'انبار',
	[OrderStepEnumValues.Accounting]: 'حسابداری',
	[OrderStepEnumValues.Cargo]: 'مرسوله',
	[OrderStepEnumValues.PartiallyDelivered]: 'تحویل جزئی',
	[OrderStepEnumValues.Delivered]: 'تحویل کامل',
	[OrderStepEnumValues.PartiallyReturned]: 'مرجوعی جزئی',
	[OrderStepEnumValues.Returned]: 'مرجوعی کامل',
};

export default function ChangeOrderStepModal({
	order,
	isOpen,
	onClose,
	onSuccess,
}: ChangeOrderStepModalProps) {
	const [rejected, setRejected] = useState(false);
	const [description, setDescription] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');

	// Determine next and previous steps based on backend logic
	const getNextStep = (currentStep: OrderStepEnum): OrderStepEnum | null => {
		switch (currentStep) {
			case OrderStepEnumValues.Seller:
				return OrderStepEnumValues.SalesManager;
			case OrderStepEnumValues.SalesManager:
				return OrderStepEnumValues.Processing;
			case OrderStepEnumValues.Processing:
				return OrderStepEnumValues.Inventory;
			case OrderStepEnumValues.Inventory:
				return OrderStepEnumValues.Accounting;
			case OrderStepEnumValues.Accounting:
				return OrderStepEnumValues.Cargo;
			case OrderStepEnumValues.Cargo:
				return OrderStepEnumValues.PartiallyDelivered;
			default:
				return null;
		}
	};

	const getPreviousStep = (
		currentStep: OrderStepEnum,
	): OrderStepEnum | null => {
		switch (currentStep) {
			case OrderStepEnumValues.SalesManager:
				return OrderStepEnumValues.Seller;
			case OrderStepEnumValues.Processing:
				return OrderStepEnumValues.SalesManager;
			case OrderStepEnumValues.Inventory:
				return OrderStepEnumValues.Processing;
			case OrderStepEnumValues.Accounting:
				return OrderStepEnumValues.Inventory;
			case OrderStepEnumValues.Cargo:
				return OrderStepEnumValues.Accounting;
			case OrderStepEnumValues.PartiallyDelivered:
				return OrderStepEnumValues.Cargo;
			default:
				return null;
		}
	};

	const nextStep = getNextStep(order.step as OrderStepEnum);
	const previousStep = getPreviousStep(order.step as OrderStepEnum);

	// Check if we can go forward or backward (based on backend restrictions)
	const restrictedForwardSteps: OrderStepEnum[] = [
		OrderStepEnumValues.Delivered,
		OrderStepEnumValues.PartiallyReturned,
		OrderStepEnumValues.Returned,
	];
	const restrictedBackwardSteps: OrderStepEnum[] = [
		OrderStepEnumValues.Seller,
		OrderStepEnumValues.Delivered,
		OrderStepEnumValues.Returned,
	];
	const canGoForward =
		nextStep !== null &&
		!restrictedForwardSteps.includes(order.step as OrderStepEnum);
	const canGoBackward =
		previousStep !== null &&
		!restrictedBackwardSteps.includes(order.step as OrderStepEnum);

	const handleSubmit = async () => {
		if (rejected && !description.trim()) {
			setError('در صورت رد شدن، توضیحات اجباری است');
			return;
		}

		if (!canGoForward && !rejected) {
			setError('امکان انتقال به مرحله بعد وجود ندارد');
			return;
		}

		if (!canGoBackward && rejected) {
			setError('امکان برگشت به مرحله قبل وجود ندارد');
			return;
		}

		try {
			setSubmitting(true);
			setError('');

			const targetStep = rejected ? previousStep : nextStep;
			if (!targetStep) {
				setError('مرحله هدف مشخص نیست');
				return;
			}

			const stepData: ChangeOrderStepDto = {
				step: targetStep,
				description: description.trim() || undefined,
				rejected: rejected || undefined,
			};

			await orderService.changeOrderStep(order.id, stepData);
			onSuccess();
			onClose();
			// Reset form
			setRejected(false);
			setDescription('');
		} catch (err: any) {
			console.error('Error changing order step:', err);
			setError(err.response?.data?.message || 'خطا در تغییر مرحله سفارش');
		} finally {
			setSubmitting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
			<div className='bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4'>
				{/* Header */}
				<div className='flex items-center justify-between p-6 border-b border-gray-200'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<AlertCircle className='w-6 h-6 text-blue-600' />
						<h2 className='text-xl font-bold text-gray-900'>
							تغییر مرحله سفارش
						</h2>
					</div>
					<button
						onClick={onClose}
						className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
					>
						<X className='w-5 h-5 text-gray-600' />
					</button>
				</div>

				{/* Content */}
				<div className='p-6 space-y-6'>
					{error && (
						<div className='bg-red-50 border border-red-200 rounded-lg p-4'>
							<p className='text-red-600'>{error}</p>
						</div>
					)}

					{/* Current Step */}
					<div className='bg-blue-50 rounded-lg p-4 border border-blue-200'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-gray-600 mb-1'>مرحله فعلی</p>
								<p className='text-lg font-bold text-blue-900'>
									{STEP_LABELS[order.step as OrderStepEnum] || order.step}
								</p>
							</div>
							<div className='w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center'>
								<AlertCircle className='w-6 h-6 text-white' />
							</div>
						</div>
					</div>

					{/* Action Selection */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-3'>
							انتخاب عملیات *
						</label>
						<div className='flex items-center space-x-reverse space-x-4'>
							<label
								className={`flex-1 flex items-center justify-center space-x-reverse space-x-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
									!rejected
										? 'border-green-500 bg-green-50'
										: 'border-gray-300 bg-white hover:bg-gray-50'
								} ${!canGoForward ? 'opacity-50 cursor-not-allowed' : ''}`}
							>
								<input
									type='radio'
									name='action'
									checked={!rejected}
									onChange={() => {
										setRejected(false);
										setError('');
									}}
									disabled={!canGoForward}
									className='w-4 h-4 text-green-600'
								/>
								<CheckCircle
									className={`w-5 h-5 ${
										!rejected ? 'text-green-600' : 'text-gray-400'
									}`}
								/>
								<div className='flex-1'>
									<p className='font-semibold text-gray-900'>
										تایید و انتقال به مرحله بعد
									</p>
									{nextStep && (
										<p className='text-sm text-gray-600'>
											{STEP_LABELS[nextStep] || nextStep}
										</p>
									)}
									{!canGoForward && (
										<p className='text-xs text-red-600 mt-1'>
											امکان انتقال به مرحله بعد وجود ندارد
										</p>
									)}
								</div>
								<ArrowRight
									className={`w-5 h-5 ${
										!rejected ? 'text-green-600' : 'text-gray-400'
									}`}
								/>
							</label>
							<label
								className={`flex-1 flex items-center justify-center space-x-reverse space-x-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
									rejected
										? 'border-red-500 bg-red-50'
										: 'border-gray-300 bg-white hover:bg-gray-50'
								} ${!canGoBackward ? 'opacity-50 cursor-not-allowed' : ''}`}
							>
								<input
									type='radio'
									name='action'
									checked={rejected}
									onChange={() => {
										setRejected(true);
										setError('');
									}}
									disabled={!canGoBackward}
									className='w-4 h-4 text-red-600'
								/>
								<XCircle
									className={`w-5 h-5 ${
										rejected ? 'text-red-600' : 'text-gray-400'
									}`}
								/>
								<div className='flex-1'>
									<p className='font-semibold text-gray-900'>
										رد و برگشت به مرحله قبل
									</p>
									{previousStep && (
										<p className='text-sm text-gray-600'>
											{STEP_LABELS[previousStep] || previousStep}
										</p>
									)}
									{!canGoBackward && (
										<p className='text-xs text-red-600 mt-1'>
											امکان برگشت به مرحله قبل وجود ندارد
										</p>
									)}
								</div>
								<ArrowLeft
									className={`w-5 h-5 ${
										rejected ? 'text-red-600' : 'text-gray-400'
									}`}
								/>
							</label>
						</div>
					</div>

					{/* Description */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							توضیحات {rejected && <span className='text-red-600'>*</span>}
						</label>
						<textarea
							value={description}
							onChange={e => {
								setDescription(e.target.value);
								setError('');
							}}
							placeholder={
								rejected
									? 'لطفاً دلیل رد شدن را توضیح دهید'
									: 'توضیحات (اختیاری)'
							}
							rows={4}
							className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
								rejected && !description.trim()
									? 'border-red-300'
									: 'border-gray-300'
							}`}
						/>
						{rejected && (
							<p className='text-xs text-red-600 mt-1'>
								در صورت رد شدن، توضیحات اجباری است
							</p>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className='flex items-center justify-end space-x-reverse space-x-3 p-6 border-t border-gray-200'>
					<button
						onClick={onClose}
						className='px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold'
					>
						انصراف
					</button>
					<button
						onClick={handleSubmit}
						disabled={submitting || (rejected && !description.trim())}
						className={`px-6 py-2 rounded-lg text-white font-semibold flex items-center space-x-reverse space-x-2 transition-colors ${
							rejected
								? 'bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
								: 'bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
						}`}
					>
						{submitting ? (
							<>
								<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
								<span>در حال تغییر...</span>
							</>
						) : rejected ? (
							<>
								<ArrowLeft className='w-5 h-5' />
								<span>رد و برگشت</span>
							</>
						) : (
							<>
								<ArrowRight className='w-5 h-5' />
								<span>تایید و انتقال</span>
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
