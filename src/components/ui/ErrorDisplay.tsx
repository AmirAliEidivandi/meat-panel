import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
	message: string;
	onRetry?: () => void;
	retryText?: string;
}

export default function ErrorDisplay({
	message,
	onRetry,
	retryText = 'تلاش مجدد',
}: ErrorDisplayProps) {
	return (
		<div className='bg-red-50 border border-red-200 rounded-lg p-4'>
			<div className='flex items-center space-x-reverse space-x-2'>
				<AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0' />
				<p className='text-red-600 flex-1'>{message}</p>
			</div>
			{onRetry && (
				<button
					onClick={onRetry}
					className='mt-3 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-red-600 text-white hover:bg-red-700 px-4 py-2'
				>
					{retryText}
				</button>
			)}
		</div>
	);
}

