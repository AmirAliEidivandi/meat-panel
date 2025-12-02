import {
	ArrowRight,
	ChevronDown,
	Loader2,
	MessageSquare,
	Paperclip,
	Send,
	Upload,
	User,
	UserCheck,
	UserPlus,
	X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import {
	employeeService,
	fileService,
	fileUrl,
	ticketService,
} from '../services/api';
import type {
	Employee,
	ReplyTicketDto,
	TicketDetails as TicketDetailsType,
	TicketMessageListItem,
} from '../types';

export default function TicketDetails() {
	const navigate = useNavigate();
	const { id: ticketId } = useParams();
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const [ticket, setTicket] = useState<TicketDetailsType | null>(null);
	const [messages, setMessages] = useState<TicketMessageListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [replyMessage, setReplyMessage] = useState('');
	const [replying, setReplying] = useState(false);
	const [uploadedFiles, setUploadedFiles] = useState<
		Array<{ id: string; file: File; preview?: string }>
	>([]);
	const [uploading, setUploading] = useState(false);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [showAssignModal, setShowAssignModal] = useState(false);
	const [assigning, setAssigning] = useState(false);
	const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
	const [showStatusDropdown, setShowStatusDropdown] = useState(false);
	const [updatingStatus, setUpdatingStatus] = useState(false);

	useEffect(() => {
		if (ticketId) {
			fetchTicketDetails();
			fetchTicketMessages();
		}
	}, [ticketId]);

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	const fetchTicketDetails = async () => {
		if (!ticketId) return;
		try {
			setLoading(true);
			setError('');
			const response = await ticketService.getTicketById(ticketId);
			setTicket(response);
		} catch (err: any) {
			console.error('Error fetching ticket details:', err);
			setError('خطا در بارگذاری جزئیات تیکت');
		} finally {
			setLoading(false);
		}
	};

	const fetchTicketMessages = async () => {
		if (!ticketId) return;
		try {
			const response = await ticketService.getTicketMessages(ticketId, {});
			setMessages(response.data || []);
		} catch (err: any) {
			console.error('Error fetching ticket messages:', err);
		}
	};

	const fetchEmployees = async () => {
		try {
			const response = await employeeService.getAllEmployees();
			setEmployees(response || []);
		} catch (err: any) {
			console.error('Error fetching employees:', err);
		}
	};

	const handleAssign = async () => {
		if (!ticketId || !selectedEmployeeId) return;

		try {
			setAssigning(true);
			await ticketService.assignTicket(ticketId, selectedEmployeeId);
			await fetchTicketDetails();
			setShowAssignModal(false);
			setSelectedEmployeeId('');
		} catch (err: any) {
			console.error('Error assigning ticket:', err);
			alert('خطا در ارجاع تیکت');
		} finally {
			setAssigning(false);
		}
	};

	const handleStatusChange = async (newStatus: string) => {
		if (!ticketId || !ticket || newStatus === ticket.status) return;

		try {
			setUpdatingStatus(true);
			await ticketService.updateTicketStatus(ticketId, newStatus);
			await fetchTicketDetails();
			setShowStatusDropdown(false);
		} catch (err: any) {
			console.error('Error updating ticket status:', err);
			alert('خطا در تغییر وضعیت تیکت');
		} finally {
			setUpdatingStatus(false);
		}
	};

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

	const handleRemoveFile = (fileId: string) => {
		setUploadedFiles(prev => {
			const file = prev.find(f => f.id === fileId);
			if (file?.preview) {
				URL.revokeObjectURL(file.preview);
			}
			return prev.filter(f => f.id !== fileId);
		});
	};

	const handleReply = async () => {
		if (!ticketId || (!replyMessage.trim() && uploadedFiles.length === 0))
			return;

		try {
			setReplying(true);

			// Upload files first
			let attachmentIds: string[] = [];
			if (uploadedFiles.length > 0) {
				const uploadResponse = await fileService.uploadFiles(
					uploadedFiles.map(f => f.file),
				);
				attachmentIds = uploadResponse.map(f => f.id);
			}

			// Send reply with attachments
			const dto: ReplyTicketDto = {
				message: replyMessage.trim() || '',
				attachment_ids: attachmentIds.length > 0 ? attachmentIds : undefined,
			};

			const response = await ticketService.replyTicket(ticketId, dto);

			// Add the new message to the messages list immediately (optimistic update)
			if (response.message) {
				const newMessage: TicketMessageListItem = {
					id: response.message.id,
					ticket_id: ticketId,
					sender_type: response.message.sender_type,
					employee_id:
						response.message.employee_id ??
						response.message.employee?.id ??
						null,
					person_id:
						response.message.person_id ?? response.message.person?.id ?? null,
					message: response.message.message,
					created_at: response.message.created_at,
					updated_at: response.message.created_at,
					deleted_at: null,
					employee: response.message.employee ?? null,
					person: response.message.person ?? null,
					attachments: response.message.attachments || [],
				};

				setMessages(prev => [...prev, newMessage]);
			}

			// Update ticket status if changed
			if (response.ticket && ticket) {
				setTicket({
					...ticket,
					status: response.ticket.status,
					updated_at: new Date().toISOString(),
				});
			}

			// Clean up
			uploadedFiles.forEach(f => {
				if (f.preview) {
					URL.revokeObjectURL(f.preview);
				}
			});
			setReplyMessage('');
			setUploadedFiles([]);
		} catch (err: any) {
			console.error('Error replying to ticket:', err);
			alert('خطا در ارسال پاسخ');
		} finally {
			setReplying(false);
		}
	};

	const ticketStatuses = [
		{ value: 'OPEN', label: 'باز' },
		{ value: 'WAITING_CUSTOMER', label: 'در انتظار مشتری' },
		{ value: 'WAITING_SUPPORT', label: 'در انتظار پشتیبانی' },
		{ value: 'CLOSED', label: 'بسته شده' },
		{ value: 'RESOLVED', label: 'حل شده' },
		{ value: 'REOPENED', label: 'باز شده' },
	];

	const getStatusText = (status: string) => {
		const statusMap: { [key: string]: string } = {
			OPEN: 'باز',
			WAITING_CUSTOMER: 'در انتظار مشتری',
			WAITING_SUPPORT: 'در انتظار پشتیبانی',
			CLOSED: 'بسته شده',
			RESOLVED: 'حل شده',
			REOPENED: 'باز شده',
		};
		return statusMap[status] || status;
	};

	const getStatusColor = (status: string) => {
		const colorMap: { [key: string]: string } = {
			OPEN: 'bg-green-100 text-green-800',
			WAITING_CUSTOMER: 'bg-blue-100 text-blue-800',
			WAITING_SUPPORT: 'bg-purple-100 text-purple-800',
			CLOSED: 'bg-gray-100 text-gray-800',
			RESOLVED: 'bg-green-100 text-green-800',
			REOPENED: 'bg-yellow-100 text-yellow-800',
		};
		return colorMap[status] || 'bg-gray-100 text-gray-800';
	};

	const getPriorityText = (priority: string) => {
		const priorityMap: { [key: string]: string } = {
			LOW: 'پایین',
			NORMAL: 'متوسط',
			HIGH: 'بالا',
			URGENT: 'فوری',
		};
		return priorityMap[priority] || priority;
	};

	const getPriorityColor = (priority: string) => {
		const colorMap: { [key: string]: string } = {
			LOW: 'bg-blue-100 text-blue-800',
			NORMAL: 'bg-yellow-100 text-yellow-800',
			HIGH: 'bg-orange-100 text-orange-800',
			URGENT: 'bg-red-100 text-red-800',
		};
		return colorMap[priority] || 'bg-gray-100 text-gray-800';
	};

	const getCustomerTypeText = (type: string) => {
		const typeMap: { [key: string]: string } = {
			PERSONAL: 'حقیقی',
			CORPORATE: 'حقوقی',
		};
		return typeMap[type] || type;
	};

	const getCustomerCategoryText = (category: string) => {
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

	const isMessageFromSupport = (message: TicketMessageListItem) => {
		return message.sender_type === 'EMPLOYEE' || message.employee_id !== null;
	};

	const getSenderName = (message: TicketMessageListItem) => {
		if (message.employee) {
			return `${message.employee.profile.first_name} ${message.employee.profile.last_name}`;
		}
		if (message.person) {
			return `${message.person.profile.first_name} ${message.person.profile.last_name}`;
		}
		return 'نامشخص';
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

	if (error || !ticket) {
		return (
			<div className='text-center py-12'>
				<div className='text-red-500 mb-4'>{error || 'تیکت یافت نشد'}</div>
				<button
					onClick={() => navigate('/manage/tickets')}
					className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors'
				>
					بازگشت به لیست تیکت‌ها
				</button>
			</div>
		);
	}

	return (
		<div className='space-y-6 fade-in font-vazir'>
			{/* Header */}
			<div className='bg-white rounded-xl border-2 border-gray-200 p-6'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center space-x-reverse space-x-4'>
						<button
							onClick={() => navigate('/manage/tickets')}
							className='flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors'
						>
							<ArrowRight className='w-5 h-5 text-gray-600' />
						</button>
						<div className='w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg'>
							<MessageSquare className='w-7 h-7 text-white' />
						</div>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>
								{ticket.subject}
							</h1>
							<p className='text-gray-600 text-sm mt-1'>
								تیکت #{ticket.id.substring(0, 8)}
							</p>
						</div>
					</div>
					<div className='flex items-center space-x-reverse space-x-3'>
						<button
							onClick={() => {
								setShowAssignModal(true);
								fetchEmployees();
							}}
							className='inline-flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-semibold space-x-reverse space-x-2'
						>
							<UserPlus className='w-4 h-4' />
							<span>
								{ticket.assigned_to ? 'تغییر ارجاع' : 'ارجاع به کارمند'}
							</span>
						</button>
						{/* Status Dropdown */}
						<div className='relative'>
							<button
								onClick={() => setShowStatusDropdown(!showStatusDropdown)}
								disabled={updatingStatus}
								className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 hover:shadow-md ${getStatusColor(
									ticket.status,
								)} ${updatingStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
							>
								<span>{getStatusText(ticket.status)}</span>
								<ChevronDown className='w-4 h-4 mr-2' />
							</button>

							{/* Dropdown Menu */}
							{showStatusDropdown && (
								<>
									<div
										className='fixed inset-0 z-40'
										onClick={() => setShowStatusDropdown(false)}
									/>
									<div className='absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden'>
										<div className='py-2'>
											{ticketStatuses.map(status => (
												<button
													key={status.value}
													onClick={() => {
														if (status.value !== ticket.status) {
															handleStatusChange(status.value);
														}
													}}
													disabled={
														status.value === ticket.status || updatingStatus
													}
													className={`w-full text-right px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
														status.value === ticket.status
															? 'bg-emerald-50 text-emerald-700 cursor-default'
															: 'text-gray-700 hover:bg-gray-50 cursor-pointer'
													} ${
														updatingStatus
															? 'opacity-50 cursor-not-allowed'
															: ''
													}`}
												>
													<div className='flex items-center justify-between'>
														<span>{status.label}</span>
														{status.value === ticket.status && (
															<span className='text-emerald-600'>✓</span>
														)}
													</div>
												</button>
											))}
										</div>
									</div>
								</>
							)}
						</div>
						<span
							className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${getPriorityColor(
								ticket.priority,
							)}`}
						>
							{getPriorityText(ticket.priority)}
						</span>
					</div>
				</div>
			</div>

			{/* Ticket Info Cards */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* Customer Info */}
				<div className='bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<User className='w-5 h-5 text-gray-600' />
						<h2 className='text-lg font-bold text-gray-900'>اطلاعات مشتری</h2>
					</div>
					<div className='space-y-2'>
						<div className='flex justify-between'>
							<span className='text-sm font-medium text-gray-600'>نام:</span>
							<span className='text-sm font-semibold text-gray-900'>
								{ticket.customer.title}
							</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-sm font-medium text-gray-600'>کد:</span>
							<span className='text-sm font-semibold text-gray-900'>
								{ticket.customer.code}
							</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-sm font-medium text-gray-600'>نوع:</span>
							<span className='text-sm font-semibold text-gray-900'>
								{getCustomerTypeText(ticket.customer.type)}
							</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-sm font-medium text-gray-600'>
								حوزه فعالیت:
							</span>
							<span className='text-sm font-semibold text-gray-900'>
								{getCustomerCategoryText(ticket.customer.category)}
							</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-sm font-medium text-gray-600'>
								خط فروش:
							</span>
							<span className='text-sm font-semibold text-gray-900'>
								{ticket.customer?.capillary_sales_line?.title || 'نامشخص'}
							</span>
						</div>
					</div>
				</div>

				{/* Ticket Details */}
				<div className='bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6'>
					<div className='flex items-center space-x-reverse space-x-2 mb-4'>
						<MessageSquare className='w-5 h-5 text-gray-600' />
						<h2 className='text-lg font-bold text-gray-900'>جزئیات تیکت</h2>
					</div>
					<div className='space-y-2'>
						<div className='flex justify-between'>
							<span className='text-sm font-medium text-gray-600'>
								ایجاد کننده:
							</span>
							<span className='text-sm font-semibold text-gray-900'>
								{ticket.creator_person
									? `${ticket.creator_person.profile.first_name} ${ticket.creator_person.profile.last_name}`
									: 'نامشخص'}
							</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-sm font-medium text-gray-600'>
								ارجاع شده به:
							</span>
							<span className='text-sm font-semibold text-gray-900'>
								{ticket.assigned_to
									? `${ticket.assigned_to.profile.first_name} ${ticket.assigned_to.profile.last_name}`
									: 'ارجاع نشده'}
							</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-sm font-medium text-gray-600'>
								تاریخ ایجاد:
							</span>
							<span className='text-sm font-semibold text-gray-900'>
								{formatDate(ticket.created_at)}
							</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-sm font-medium text-gray-600'>
								آخرین بروزرسانی:
							</span>
							<span className='text-sm font-semibold text-gray-900'>
								{formatDate(ticket.updated_at)}
							</span>
						</div>
						{ticket.closed_at && (
							<div className='flex justify-between'>
								<span className='text-sm font-medium text-gray-600'>
									تاریخ بسته شدن:
								</span>
								<span className='text-sm font-semibold text-gray-900'>
									{formatDate(ticket.closed_at)}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Messages Chat Container */}
			<div
				className='bg-white rounded-xl border-2 border-gray-200 overflow-hidden flex flex-col'
				style={{ height: '600px' }}
			>
				{/* Messages Header */}
				<div className='p-4 border-b border-gray-200 bg-gray-50'>
					<div className='flex items-center space-x-reverse space-x-2'>
						<MessageSquare className='w-5 h-5 text-gray-600' />
						<h2 className='text-lg font-bold text-gray-900'>
							پیام‌های تیکت ({messages.length})
						</h2>
					</div>
				</div>

				{/* Messages List */}
				<div
					ref={messagesContainerRef}
					className='flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar'
				>
					{messages.length === 0 ? (
						<div className='flex flex-col items-center justify-center h-full text-center'>
							<MessageSquare className='w-16 h-16 text-gray-300 mb-4' />
							<p className='text-gray-500 text-lg font-semibold'>
								هنوز پیامی ارسال نشده است
							</p>
						</div>
					) : (
						messages.map(message => {
							const isSupport = isMessageFromSupport(message);
							const senderName = getSenderName(message);

							return (
								<div
									key={message.id}
									className={`flex items-start space-x-reverse space-x-3 ${
										isSupport ? 'justify-start' : 'justify-end'
									}`}
								>
									{/* Avatar - فقط برای پشتیبان در سمت چپ */}
									{isSupport && (
										<div className='w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-md'>
											<UserCheck className='w-5 h-5 text-white' />
										</div>
									)}

									{/* Message Bubble */}
									<div
										className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${
											isSupport
												? 'bg-emerald-50 border border-emerald-200'
												: 'bg-gray-100 border border-gray-200'
										}`}
									>
										{/* Message Header */}
										<div className='mb-2'>
											<div className='flex items-center space-x-reverse space-x-2 mb-1'>
												<p className='text-sm font-bold text-gray-900'>
													{senderName}
												</p>
												<span
													className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
														isSupport
															? 'bg-emerald-200 text-emerald-800'
															: 'bg-gray-200 text-gray-800'
													}`}
												>
													{isSupport ? 'پشتیبان' : 'مشتری'}
												</span>
											</div>
										</div>

										{/* Message Content */}
										<p className='text-sm text-gray-800 mb-2 whitespace-pre-wrap'>
											{message.message}
										</p>

										{/* Message Attachments with Preview */}
										{message.attachments && message.attachments.length > 0 && (
											<div className='mt-3 space-y-2'>
												{message.attachments.map(attachment => {
													const url = fileUrl(attachment.url) || attachment.url;
													const thumbnail =
														fileUrl(attachment.thumbnail) ||
														attachment.thumbnail ||
														url;
													const isImage =
														attachment.url.match(
															/\.(jpg|jpeg|png|gif|webp)$/i,
														) || attachment.thumbnail;

													return (
														<div
															key={attachment.id}
															className='border border-gray-300 rounded-lg p-2 bg-white'
														>
															{isImage ? (
																<a
																	href={url}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='block'
																>
																	<img
																		src={thumbnail}
																		alt='پیوست'
																		className='w-full h-auto max-h-48 object-contain rounded'
																		onError={e => {
																			const target =
																				e.target as HTMLImageElement;
																			target.style.display = 'none';
																		}}
																	/>
																</a>
															) : (
																<a
																	href={url}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='flex items-center space-x-reverse space-x-2 text-sm text-indigo-600 hover:text-indigo-800'
																>
																	<Paperclip className='w-4 h-4' />
																	<span>فایل پیوست</span>
																</a>
															)}
														</div>
													);
												})}
											</div>
										)}

										{/* Message Time */}
										<p className='text-xs text-gray-500 mt-2'>
											{formatDate(message.created_at)}
										</p>
									</div>

									{/* Avatar - فقط برای مشتری در سمت راست */}
									{!isSupport && (
										<div className='w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0 shadow-md'>
											<User className='w-5 h-5 text-white' />
										</div>
									)}
								</div>
							);
						})
					)}
					<div ref={messagesEndRef} />
				</div>

				{/* Reply Section */}
				{ticket.status !== 'CLOSED' && (
					<div className='border-t border-gray-200 p-4 bg-gray-50'>
						{/* Uploaded Files Preview */}
						{uploadedFiles.length > 0 && (
							<div className='mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200'>
								<div className='flex items-center justify-between mb-2'>
									<p className='text-sm font-semibold text-gray-700'>
										فایل‌های انتخاب شده ({uploadedFiles.length})
									</p>
								</div>
								<div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
									{uploadedFiles.map(file => (
										<div
											key={file.id}
											className='relative border border-gray-300 rounded-lg p-2 bg-white group'
										>
											{file.preview ? (
												<>
													<img
														src={file.preview}
														alt={file.file.name}
														className='w-full h-24 object-cover rounded'
													/>
													<button
														onClick={() => handleRemoveFile(file.id)}
														className='absolute top-1 left-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
													>
														<X className='w-3 h-3' />
													</button>
												</>
											) : (
												<div className='flex flex-col items-center justify-center h-24'>
													<Paperclip className='w-6 h-6 text-gray-400 mb-1' />
													<p className='text-xs text-gray-600 truncate w-full text-center'>
														{file.file.name}
													</p>
													<button
														onClick={() => handleRemoveFile(file.id)}
														className='absolute top-1 left-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
													>
														<X className='w-3 h-3' />
													</button>
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						)}

						{/* File Upload Button */}
						<div className='mb-3'>
							<label className='inline-flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg cursor-pointer transition-colors'>
								<Upload className='w-4 h-4 ml-2 text-gray-700' />
								<span className='text-sm font-medium text-gray-700'>
									افزودن فایل
								</span>
								<input
									type='file'
									multiple
									className='hidden'
									onChange={e => handleFileUpload(e.target.files)}
									disabled={uploading}
								/>
							</label>
						</div>

						{/* Message Input and Send */}
						<div className='flex items-end space-x-reverse space-x-3'>
							<div className='flex-1'>
								<textarea
									value={replyMessage}
									onChange={e => setReplyMessage(e.target.value)}
									onKeyDown={e => {
										if (e.key === 'Enter' && !e.shiftKey) {
											e.preventDefault();
											if (
												!replying &&
												(replyMessage.trim() || uploadedFiles.length > 0)
											) {
												handleReply();
											}
										}
									}}
									placeholder='پیام خود را وارد کنید...'
									className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
									rows={3}
								/>
							</div>
							<button
								onClick={handleReply}
								disabled={
									(!replyMessage.trim() && uploadedFiles.length === 0) ||
									replying ||
									uploading
								}
								className='px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-reverse space-x-2'
							>
								{replying || uploading ? (
									<Loader2 className='w-4 h-4 animate-spin' />
								) : (
									<Send className='w-4 h-4' />
								)}
								<span>
									{replying || uploading ? 'در حال ارسال...' : 'ارسال'}
								</span>
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Assign Ticket Modal */}
			{showAssignModal && (
				<div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'>
					<div className='bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl'>
						<div className='flex items-center justify-between mb-4'>
							<h2 className='text-xl font-bold text-gray-900'>
								ارجاع تیکت به کارمند
							</h2>
							<button
								onClick={() => {
									setShowAssignModal(false);
									setSelectedEmployeeId('');
								}}
								className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
							>
								<X className='w-5 h-5 text-gray-600' />
							</button>
						</div>

						<div className='mb-4'>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								انتخاب کارمند
							</label>
							<select
								value={selectedEmployeeId}
								onChange={e => setSelectedEmployeeId(e.target.value)}
								className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
								disabled={assigning}
							>
								<option value=''>کارمند را انتخاب کنید...</option>
								{employees.map(employee => (
									<option key={employee.id} value={employee.id}>
										{employee.profile.first_name} {employee.profile.last_name}
									</option>
								))}
							</select>
						</div>

						<div className='flex items-center space-x-reverse space-x-3'>
							<button
								onClick={handleAssign}
								disabled={!selectedEmployeeId || assigning}
								className='flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold'
							>
								{assigning ? 'در حال ارجاع...' : 'ارجاع تیکت'}
							</button>
							<button
								onClick={() => {
									setShowAssignModal(false);
									setSelectedEmployeeId('');
								}}
								disabled={assigning}
								className='px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold'
							>
								انصراف
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
