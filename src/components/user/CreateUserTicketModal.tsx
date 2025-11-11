import { MessageSquare, Paperclip, Send, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { fileService, ticketService } from '../../services/api';
import type { FileUploadResponse } from '../../types';

interface CreateUserTicketModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	customerId: string;
}

export default function CreateUserTicketModal({
	isOpen,
	onClose,
	onSuccess,
	customerId,
}: CreateUserTicketModalProps) {
	const [subject, setSubject] = useState('');
	const [message, setMessage] = useState('');
	const [priority, setPriority] = useState<
		'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
	>('MEDIUM');
	const [uploadedFiles, setUploadedFiles] = useState<
		Array<{ id: string; file: File; preview?: string }>
	>([]);
	const [uploading, setUploading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');

	const handleFileUpload = async (files: FileList | null) => {
		if (!files || files.length === 0) return;

		try {
			setUploading(true);
			const fileArray = Array.from(files);

			// Create previews for images
			const filesWithPreview = await Promise.all(
				fileArray.map(async file => {
					let preview: string | undefined;
					if (file.type.startsWith('image/')) {
						preview = URL.createObjectURL(file);
					}
					return {
						id: `${Date.now()}-${Math.random()}`,
						file,
						preview,
					};
				}),
			);

			setUploadedFiles(prev => [...prev, ...filesWithPreview]);
		} catch (err) {
			console.error('Error processing files:', err);
		} finally {
			setUploading(false);
		}
	};

	const uploadFilesToServer = async (): Promise<string[]> => {
		if (uploadedFiles.length === 0) return [];

		try {
			const filesToUpload = uploadedFiles.map(f => f.file);
			const uploadResponse: FileUploadResponse[] =
				await fileService.uploadFiles(filesToUpload);
			return uploadResponse.map(f => f.id);
		} catch (err: any) {
			console.error('Error uploading files:', err);
			throw new Error('خطا در آپلود فایل‌ها');
		}
	};

	const handleRemoveFile = (fileId: string) => {
		setUploadedFiles(prev => {
			const file = prev.find(f => f.id === fileId);
			if (file?.preview) {
				URL.revokeObjectURL(file.preview);
			}
			return prev.filter(f => f.id !== fileId);
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!subject.trim()) {
			setError('لطفاً موضوع تیکت را وارد کنید');
			return;
		}

		if (!message.trim()) {
			setError('لطفاً پیام خود را وارد کنید');
			return;
		}

		try {
			setSubmitting(true);
			setError('');

			// Upload files first
			const attachmentIds = await uploadFilesToServer();

			// Create ticket
			await ticketService.createTicket({
				customer_id: customerId,
				subject: subject.trim(),
				priority,
				message: message.trim(),
				attachment_ids: attachmentIds,
			});

			// Reset form
			setSubject('');
			setMessage('');
			setPriority('MEDIUM');
			setUploadedFiles([]);

			onSuccess();
		} catch (err: any) {
			console.error('Error creating ticket:', err);
			setError(
				err.response?.data?.message || err.message || 'خطا در ایجاد تیکت',
			);
		} finally {
			setSubmitting(false);
		}
	};

	const handleClose = () => {
		// Clean up preview URLs
		uploadedFiles.forEach(file => {
			if (file.preview) {
				URL.revokeObjectURL(file.preview);
			}
		});
		setSubject('');
		setMessage('');
		setPriority('MEDIUM');
		setUploadedFiles([]);
		setError('');
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
			<div className='bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
				{/* Header */}
				<div className='flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10'>
					<div className='flex items-center space-x-reverse space-x-3'>
						<div className='w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center'>
							<MessageSquare className='w-5 h-5 text-indigo-600' />
						</div>
						<h2 className='text-xl font-bold text-gray-900'>ایجاد تیکت جدید</h2>
					</div>
					<button
						onClick={handleClose}
						className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
					>
						<X className='w-5 h-5 text-gray-600' />
					</button>
				</div>

				{/* Body */}
				<form onSubmit={handleSubmit} className='p-6 space-y-6'>
					{error && (
						<div className='bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg text-sm'>
							{error}
						</div>
					)}

					{/* Subject */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							موضوع <span className='text-red-500'>*</span>
						</label>
						<input
							type='text'
							value={subject}
							onChange={e => {
								setSubject(e.target.value);
								setError('');
							}}
							placeholder='موضوع تیکت خود را وارد کنید'
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
							required
						/>
					</div>

					{/* Priority */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							اولویت <span className='text-red-500'>*</span>
						</label>
						<select
							value={priority}
							onChange={e =>
								setPriority(
									e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
								)
							}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
						>
							<option value='LOW'>کم</option>
							<option value='MEDIUM'>متوسط</option>
							<option value='HIGH'>بالا</option>
							<option value='URGENT'>فوری</option>
						</select>
					</div>

					{/* Message */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							پیام <span className='text-red-500'>*</span>
						</label>
						<textarea
							value={message}
							onChange={e => {
								setMessage(e.target.value);
								setError('');
							}}
							placeholder='پیام خود را وارد کنید...'
							rows={6}
							className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none'
							required
						/>
					</div>

					{/* File Upload */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							فایل‌های پیوست (اختیاری)
						</label>
						<div className='border-2 border-dashed border-gray-300 rounded-lg p-4'>
							<label className='flex flex-col items-center justify-center cursor-pointer'>
								<input
									type='file'
									multiple
									className='hidden'
									onChange={e => handleFileUpload(e.target.files)}
									disabled={uploading}
								/>
								<div className='flex flex-col items-center'>
									<Upload className='w-8 h-8 text-gray-400 mb-2' />
									<span className='text-sm text-gray-600'>
										{uploading
											? 'در حال آپلود...'
											: 'برای آپلود فایل کلیک کنید یا فایل را بکشید'}
									</span>
								</div>
							</label>
						</div>

						{/* Uploaded Files Preview */}
						{uploadedFiles.length > 0 && (
							<div className='mt-4 space-y-2'>
								{uploadedFiles.map(file => (
									<div
										key={file.id}
										className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200'
									>
										<div className='flex items-center space-x-reverse space-x-3 flex-1 min-w-0'>
											{file.preview ? (
												<img
													src={file.preview}
													alt='Preview'
													className='w-12 h-12 object-cover rounded'
												/>
											) : (
												<div className='w-12 h-12 bg-gray-200 rounded flex items-center justify-center'>
													<Paperclip className='w-5 h-5 text-gray-600' />
												</div>
											)}
											<div className='flex-1 min-w-0'>
												<p className='text-sm font-medium text-gray-900 truncate'>
													{file.file.name}
												</p>
												<p className='text-xs text-gray-500'>
													{(file.file.size / 1024).toFixed(2)} KB
												</p>
											</div>
										</div>
										<button
											type='button'
											onClick={() => handleRemoveFile(file.id)}
											className='p-2 hover:bg-red-50 rounded-lg transition-colors'
										>
											<X className='w-4 h-4 text-red-600' />
										</button>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Footer */}
					<div className='flex justify-end space-x-reverse space-x-3 pt-4 border-t border-gray-200'>
						<button
							type='button'
							onClick={handleClose}
							className='px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold'
							disabled={submitting}
						>
							انصراف
						</button>
						<button
							type='submit'
							className='px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold flex items-center space-x-reverse space-x-2'
							disabled={submitting}
						>
							{submitting ? (
								'در حال ثبت...'
							) : (
								<>
									<Send className='w-4 h-4' />
									<span>ایجاد تیکت</span>
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
