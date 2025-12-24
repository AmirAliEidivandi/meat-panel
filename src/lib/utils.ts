import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
	if (amount === null || amount === undefined) {
		return 'N/A';
	}

	// Format with Persian numerals and proper RTL layout
	const formatted = new Intl.NumberFormat('fa-IR', {
		style: 'currency',
		currency: 'IRR',
		minimumFractionDigits: 0,
	}).format(Math.abs(amount));

	// Handle negative numbers properly for RTL
	const sign = amount < 0 ? '−' : ''; // Use proper minus sign (U+2212)
	
	// Ensure proper RTL display for currency
	const currencyFormatted = formatted.replace(/ریال/g, ' ریال');
	
	return sign ? `${sign}${currencyFormatted}` : currencyFormatted;
}

export function formatDate(dateString: string | undefined): string {
	if (!dateString) {
		return 'N/A';
	}

	try {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) {
			return 'تاریخ نامعتبر';
		}

		// استفاده از تقویم شمسی برای تمام اجزا
		const persianDateFormatter = new Intl.DateTimeFormat('fa-IR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			calendar: 'persian',
		});

		const formattedDateParts = persianDateFormatter.formatToParts(date);

		let day = '';
		let month = '';
		let year = '';

		for (const part of formattedDateParts) {
			if (part.type === 'day') {
				day = part.value;
			} else if (part.type === 'month') {
				month = part.value;
			} else if (part.type === 'year') {
				year = part.value;
			}
		}

		// زمان به فارسی با فرمت بهتر و یکدست (با padding برای یکدستی)
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		
		// تبدیل اعداد انگلیسی به فارسی
		const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
		const toPersian = (str: string) => {
			return str.replace(/\d/g, (d) => persianDigits[parseInt(d)]);
		};
		
		const time = `${toPersian(hours)}:${toPersian(minutes)}`;

		// فرمت یکدست و خوشگل با فاصله‌گذاری مناسب: ساعت:دقیقه - روز ماه سال
		return `${time} - ${day} ${month} ${year}`;
	} catch (error) {
		console.error('Error formatting date:', error);
		return 'تاریخ نامعتبر';
	}
}

export function formatDateRange(
	beforeDate: string | undefined,
	afterDate: string | undefined,
): string {
	if (!beforeDate && !afterDate) {
		return 'N/A';
	}

	if (!beforeDate) {
		return `تا ${formatDate(afterDate)}`;
	}

	if (!afterDate) {
		return `از ${formatDate(beforeDate)}`;
	}

	return `از ${formatDate(beforeDate)} تا ${formatDate(afterDate)}`;
}

// Format number with commas for display (Persian numerals)
export function formatNumberWithCommas(value: number | string | null | undefined): string {
	if (value === null || value === undefined || value === '') {
		return '';
	}
	
	const numValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
	if (isNaN(numValue)) {
		return '';
	}
	
	return new Intl.NumberFormat('fa-IR').format(numValue);
}

// Parse formatted number string back to number (removes commas and Persian digits)
export function parseFormattedNumber(value: string): number {
	if (!value) {
		return 0;
	}
	
	// Remove commas
	let cleaned = value.replace(/,/g, '');
	
	// Convert Persian digits to English
	const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
	const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
	
	persianDigits.forEach((persian, index) => {
		cleaned = cleaned.replace(new RegExp(persian, 'g'), englishDigits[index]);
	});
	
	const parsed = parseFloat(cleaned);
	return isNaN(parsed) ? 0 : parsed;
}

// Get Persian name for bank code
export function getBankName(bank: string | null | undefined): string {
	if (!bank) {
		return 'N/A';
	}

	const bankMap: Record<string, string> = {
		SEPAH: 'بانک سپه',
		MELLI: 'بانک ملی',
		TEJARAT: 'بانک تجارت',
		REFAH: 'بانک رفاه',
		MASKAN: 'بانک مسکن',
		KESHAVARZI: 'بانک کشاورزی',
		SANAT_VA_MADAN: 'بانک صنعت و معدن',
		POST_BANK: 'پست بانک',
		MELLAT: 'بانک ملت',
		SADERAT: 'بانک صادرات',
		PARSIAN: 'بانک پارسیان',
		PASARGAD: 'بانک پاسارگاد',
		SAMAN: 'بانک سامان',
		EGHTESAD_NOVIN: 'بانک اقتصاد نوین',
		DEY: 'بانک دی',
		KARAFARIN: 'بانک کارآفرین',
		SINA: 'بانک سینا',
		SARMAYEH: 'بانک سرمایه',
		SHAHR: 'بانک شهر',
		AYANDEH: 'بانک آینده',
		ANSAR: 'بانک انصار',
		GARDESHGARI: 'بانک گردشگری',
		HEKMAT_IRANIAN: 'بانک حکمت ایرانیان',
		MEHREGAN: 'بانک مهرگان',
		RESALAT: 'بانک رسالت',
		KOSAR: 'بانک کوثر',
		MIDDLE_EAST: 'بانک خاورمیانه',
		IRAN_ZAMIN: 'بانک ایران زمین',
		MEHR_EGHTESAD: 'موسسه اعتباری مهر اقتصاد',
		TOSEE_TAAVON: 'موسسه اعتباری توسعه تعاون',
		NOOR: 'موسسه اعتباری نور',
		OTHER: 'سایر',
	};
	return bankMap[bank] || bank;
}