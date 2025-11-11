import type { LucideIcon } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	icon: LucideIcon;
	iconColor?:
		| 'blue'
		| 'green'
		| 'orange'
		| 'purple'
		| 'pink'
		| 'teal'
		| 'amber';
	backUrl?: string;
	actions?: React.ReactNode;
}

const iconColorMap = {
	blue: 'from-blue-500 to-indigo-600',
	green: 'from-green-500 to-emerald-600',
	orange: 'from-orange-500 to-amber-600',
	purple: 'from-purple-500 to-violet-600',
	pink: 'from-pink-500 to-rose-600',
	teal: 'from-teal-500 to-cyan-600',
	amber: 'from-amber-500 to-orange-600',
};

export default function PageHeader({
	title,
	subtitle,
	icon: Icon,
	iconColor = 'blue',
	backUrl,
	actions,
}: PageHeaderProps) {
	const navigate = useNavigate();

	return (
		<div className='flex items-center justify-between mb-6 enhanced-header'>
			<div className='flex items-center space-x-reverse space-x-3'>
				{backUrl && (
					<button
						onClick={() => navigate(backUrl)}
						className='w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-md hover:scale-105 transition-transform'
					>
						<ArrowLeft className='w-5 h-5 text-white' />
					</button>
				)}
				<div
					className={`w-10 h-10 bg-gradient-to-br ${iconColorMap[iconColor]} rounded-xl flex items-center justify-center shadow-md`}
				>
					<Icon className='w-5 h-5 text-white' />
				</div>
				<div>
					<h1 className='text-xl font-bold gradient-text'>{title}</h1>
					{subtitle && <p className='text-gray-600 text-sm'>{subtitle}</p>}
				</div>
			</div>
			{actions && (
				<div className='flex items-center space-x-reverse space-x-2'>
					{actions}
				</div>
			)}
		</div>
	);
}
