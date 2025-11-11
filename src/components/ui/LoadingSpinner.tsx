interface LoadingSpinnerProps {
	size?: 'sm' | 'md' | 'lg';
	color?: 'blue' | 'green' | 'gray';
	text?: string;
	fullScreen?: boolean;
}

const sizeMap = {
	sm: 'h-6 w-6',
	md: 'h-8 w-8',
	lg: 'h-12 w-12',
};

const colorMap = {
	blue: 'border-blue-600',
	green: 'border-green-600',
	gray: 'border-gray-600',
};

export default function LoadingSpinner({
	size = 'md',
	color = 'blue',
	text,
	fullScreen = false,
}: LoadingSpinnerProps) {
	const spinner = (
		<div className='flex items-center space-x-reverse space-x-2'>
			<div
				className={`animate-spin rounded-full border-b-2 ${sizeMap[size]} ${colorMap[color]}`}
			></div>
			{text && <span className='text-gray-600'>{text}</span>}
		</div>
	);

	if (fullScreen) {
		return (
			<div className='flex items-center justify-center h-64'>{spinner}</div>
		);
	}

	return spinner;
}

