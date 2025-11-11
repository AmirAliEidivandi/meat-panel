import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	onPageChange: (page: number) => void;
}

export default function Pagination({
	currentPage,
	totalPages,
	totalItems,
	itemsPerPage,
	onPageChange,
}: PaginationProps) {
	const startItem = (currentPage - 1) * itemsPerPage + 1;
	const endItem = Math.min(currentPage * itemsPerPage, totalItems);

	const getVisiblePages = () => {
		const delta = 2;
		const range = [];
		const rangeWithDots = [];

		for (
			let i = Math.max(2, currentPage - delta);
			i <= Math.min(totalPages - 1, currentPage + delta);
			i++
		) {
			range.push(i);
		}

		if (currentPage - delta > 2) {
			rangeWithDots.push(1, '...');
		} else {
			rangeWithDots.push(1);
		}

		rangeWithDots.push(...range);

		if (currentPage + delta < totalPages - 1) {
			rangeWithDots.push('...', totalPages);
		} else {
			rangeWithDots.push(totalPages);
		}

		return rangeWithDots;
	};

	if (totalPages <= 1) return null;

	return (
		<div className='mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
			<div className='flex flex-col md:flex-row items-center justify-between px-6 py-5 gap-4'>
				{/* Info */}
				<div className='text-base text-gray-700 font-medium'>
					نمایش <span className='font-bold text-indigo-600'>{startItem}</span>{' '}
					تا <span className='font-bold text-indigo-600'>{endItem}</span> از{' '}
					<span className='font-bold text-indigo-600'>{totalItems}</span> مورد
				</div>

				{/* Pagination Controls */}
				<div className='flex items-center space-x-reverse space-x-2'>
					{/* Previous Button */}
					<button
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className={`
							flex items-center justify-center px-6 py-3 text-base font-bold rounded-xl transition-all duration-200 shadow-sm
							${
								currentPage === 1
									? 'text-gray-400 bg-gray-100 cursor-not-allowed opacity-50'
									: 'text-white bg-gradient-to-l from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-lg active:scale-95 transform'
							}
						`}
					>
						<ChevronRight className='w-5 h-5 ml-2' />
						<span>صفحه قبل</span>
					</button>

					{/* Page Numbers */}
					<div className='flex items-center space-x-reverse space-x-1 bg-gray-50 p-1 rounded-xl'>
						{getVisiblePages().map((page, index) => (
							<button
								key={index}
								onClick={() => typeof page === 'number' && onPageChange(page)}
								disabled={page === '...'}
								className={`
									min-w-12 h-12 px-4 text-base font-bold rounded-lg transition-all duration-200
									${
										page === currentPage
											? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
											: page === '...'
												? 'text-gray-400 cursor-default bg-transparent'
												: 'text-gray-700 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md active:scale-95 transform'
									}
								`}
							>
								{page}
							</button>
						))}
					</div>

					{/* Next Button */}
					<button
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						className={`
							flex items-center justify-center px-6 py-3 text-base font-bold rounded-xl transition-all duration-200 shadow-sm
							${
								currentPage === totalPages
									? 'text-gray-400 bg-gray-100 cursor-not-allowed opacity-50'
									: 'text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-lg active:scale-95 transform'
							}
						`}
					>
						<span>صفحه بعد</span>
						<ChevronLeft className='w-5 h-5 mr-2' />
					</button>
				</div>
			</div>
		</div>
	);
}
