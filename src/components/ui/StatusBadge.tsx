interface StatusBadgeProps {
	label: string;
	variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
	size?: 'sm' | 'md' | 'lg';
	icon?: React.ReactNode;
	className?: string;
}

const variantMap = {
	success: 'bg-green-100 text-green-800',
	warning: 'bg-yellow-100 text-yellow-800',
	error: 'bg-red-100 text-red-800',
	info: 'bg-blue-100 text-blue-800',
	default: 'bg-gray-100 text-gray-800',
};

const sizeMap = {
	sm: 'px-2 py-1 text-xs',
	md: 'px-3 py-1.5 text-sm',
	lg: 'px-4 py-2 text-base',
};

export default function StatusBadge({
	label,
	variant = 'default',
	size = 'md',
	icon,
	className = '',
}: StatusBadgeProps) {
	return (
		<span
			className={`inline-flex items-center rounded-full font-semibold ${variantMap[variant]} ${sizeMap[size]} ${className}`}
		>
			{icon && <span className='ml-1'>{icon}</span>}
			{label}
		</span>
	);
}

