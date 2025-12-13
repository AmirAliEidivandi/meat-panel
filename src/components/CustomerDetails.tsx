import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle,
  CreditCard,
  Edit,
  FileText,
  Loader2,
  Lock,
  Package,
  Receipt,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { formatCurrency, formatDate } from "../lib/utils";
import {
  customerService,
  invoiceService,
  orderService,
  paymentService,
  walletService,
} from "../services/api";
import type {
  CustomerDetails,
  CustomerTransaction,
  GetCustomerInformationResponse,
  InvoiceListItem,
  Order,
  PaymentListItem,
  QueryCustomerTransactionDto,
  QueryInvoiceDto,
  QueryOrderDto,
  QueryPaymentDto,
} from "../types";
import Pagination from "./Pagination";
import UpdateCapillarySalesLineModal from "./UpdateCapillarySalesLineModal";
import UpdateSellerModal from "./UpdateSellerModal";

type TabType =
  | "details"
  | "overview"
  | "orders"
  | "invoices"
  | "payments"
  | "wallet";

export default function CustomerDetails() {
  const navigate = useNavigate();
  const { id: customerId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get active tab from URL query parameter, default to 'details'
  const tabFromUrl = searchParams.get("tab") as TabType;
  const [activeTab, setActiveTab] = useState<TabType>(
    tabFromUrl &&
      [
        "details",
        "overview",
        "orders",
        "invoices",
        "payments",
        "wallet",
      ].includes(tabFromUrl)
      ? tabFromUrl
      : "details"
  );
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Customer Information state
  const [customerInformation, setCustomerInformation] =
    useState<GetCustomerInformationResponse | null>(null);
  const [customerInformationLoading, setCustomerInformationLoading] =
    useState(false);
  const [customerInformationError, setCustomerInformationError] = useState("");

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotal, setOrdersTotal] = useState(0);

  // Invoices state
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesPage, setInvoicesPage] = useState(1);
  const [invoicesTotal, setInvoicesTotal] = useState(0);

  // Payments state
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string>("");
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsTotal, setPaymentsTotal] = useState(0);

  // Transactions state
  const [transactions, setTransactions] = useState<
    CustomerTransaction["transactions"]
  >([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsView, setTransactionsView] = useState<
    "simple" | "detailed"
  >("simple");

  // Modals state
  const [showUpdateSellerModal, setShowUpdateSellerModal] = useState(false);
  const [
    showUpdateCapillarySalesLineModal,
    setShowUpdateCapillarySalesLineModal,
  ] = useState(false);
  const [showDeletePaymentModal, setShowDeletePaymentModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [deletingPayment, setDeletingPayment] = useState(false);

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails();
      fetchWallet();
    }
  }, [customerId]);

  useEffect(() => {
    if (customerId && activeTab === "orders") {
      fetchOrders();
    }
  }, [customerId, activeTab, ordersPage]);

  useEffect(() => {
    if (customerId && activeTab === "invoices") {
      fetchInvoices();
    }
  }, [customerId, activeTab, invoicesPage]);

  useEffect(() => {
    if (customerId && activeTab === "payments") {
      fetchPayments();
    }
  }, [customerId, activeTab, paymentsPage]);

  useEffect(() => {
    if (customerId && activeTab === "wallet") {
      fetchTransactions();
    }
  }, [customerId, activeTab, transactionsView]);

  useEffect(() => {
    if (customerId && activeTab === "overview") {
      fetchCustomerInformation();
    }
  }, [customerId, activeTab]);

  const fetchCustomerDetails = async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      setError("");
      const data = await customerService.getCustomerById(customerId);
      setCustomer(data);
    } catch (err: any) {
      console.error("Error fetching customer details:", err);
      setError("خطا در بارگذاری جزئیات مشتری");
    } finally {
      setLoading(false);
    }
  };

  const fetchWallet = async () => {
    if (!customerId) return;

    try {
      const data = await walletService.getWalletByCustomerId(customerId);
      setWallet(data);
      setWalletId(data?.id || null);
    } catch (err) {
      console.error("Error fetching wallet:", err);
    }
  };

  const fetchOrders = async () => {
    if (!customerId) return;

    try {
      setOrdersLoading(true);
      const query: QueryOrderDto = {
        page: ordersPage,
        "page-size": 10,
        customer_id: customerId,
      };
      const response = await orderService.getOrders(query);
      setOrders(response.data || []);
      setOrdersTotal(response.count || 0);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchInvoices = async () => {
    if (!customerId) return;

    try {
      setInvoicesLoading(true);
      const query: QueryInvoiceDto = {
        page: invoicesPage,
        "page-size": 10,
        customer_id: customerId,
      };
      const response = await invoiceService.getInvoices(query);
      setInvoices(response.data || []);
      setInvoicesTotal(response.count || 0);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setInvoicesLoading(false);
    }
  };

  const fetchPayments = async () => {
    if (!customerId) return;

    try {
      setPaymentsLoading(true);
      setPaymentsError("");
      const query: QueryPaymentDto = {
        page: paymentsPage,
        "page-size": 10,
        customer_id: customerId,
      };
      const response = await paymentService.getPayments(query);
      setPayments(response?.data || []);
      setPaymentsTotal(response?.count || 0);
    } catch (err: any) {
      console.error("Error fetching payments:", err);
      setPaymentsError(err?.message || "خطا در بارگذاری پرداخت‌ها");
      setPayments([]);
      setPaymentsTotal(0);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!customerId) return;

    try {
      setTransactionsLoading(true);
      const query: QueryCustomerTransactionDto | undefined =
        transactionsView === "detailed" ? { view: "detailed" } : undefined;
      const response = await customerService.getCustomerTransactions(
        customerId,
        query
      );
      setTransactions(response.transactions || []);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchCustomerInformation = async () => {
    if (!customerId) return;

    try {
      setCustomerInformationLoading(true);
      setCustomerInformationError("");
      const response = await customerService.getCustomerInformation(customerId);
      setCustomerInformation(response);
    } catch (err: any) {
      console.error("Error fetching customer information:", err);
      setCustomerInformationError(
        err.response?.data?.message || "خطا در بارگذاری اطلاعات کلی"
      );
    } finally {
      setCustomerInformationLoading(false);
    }
  };

  const getCustomerTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      PERSONAL: "حقیقی",
      CORPORATE: "حقوقی",
    };
    return typeMap[type] || type;
  };

  const getCustomerCategoryText = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      RESTAURANT: "رستوران",
      HOTEL: "هتل",
      CHAIN_STORE: "فروشگاه زنجیره‌ای",
      GOVERNMENTAL: "دولتی",
      FAST_FOOD: "فست فود",
      CHARITY: "خیریه",
      BUTCHER: "قصابی",
      WHOLESALER: "عمده‌فروش",
      FELLOW: "همکار",
      CATERING: "کترینگ",
      KEBAB: "کبابی",
      DISTRIBUTOR: "پخش‌کننده",
      HOSPITAL: "بیمارستان",
      FACTORY: "کارخانه",
      OTHER: "سایر",
    };
    return categoryMap[category] || category;
  };

  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;

    try {
      setDeletingPayment(true);
      await paymentService.deletePayment(paymentToDelete);
      // Refresh payments list
      await fetchPayments();
      // Refresh wallet balance
      if (walletId) {
        await fetchWallet();
      }
      // Close modal
      setShowDeletePaymentModal(false);
      setPaymentToDelete(null);
    } catch (err: any) {
      console.error("Error deleting payment:", err);
      alert(err.response?.data?.message || "خطا در حذف پرداخت");
    } finally {
      setDeletingPayment(false);
    }
  };

  const openDeletePaymentModal = (paymentId: string) => {
    setPaymentToDelete(paymentId);
    setShowDeletePaymentModal(true);
  };

  const closeDeletePaymentModal = () => {
    setShowDeletePaymentModal(false);
    setPaymentToDelete(null);
  };

  const getPaymentStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      NOT_PAID: "پرداخت نشده",
      PARTIALLY_PAID: "پرداخت جزئی",
      PAID: "پرداخت شده",
    };
    return statusMap[status] || status;
  };

  const getPaymentMethodText = (method: string) => {
    const methodMap: { [key: string]: string } = {
      CASH: "نقدی",
      DEPOSIT_TO_ACCOUNT: "واریز به حساب",
      CHEQUE: "چک",
      CREDIT: "اعتبار",
      WALLET: "کیف پول",
      ONLINE: "آنلاین",
    };
    return methodMap[method] || method;
  };

  const getPaymentMethodColor = (method: string) => {
    const colorMap: { [key: string]: string } = {
      CASH: "bg-green-100 text-green-800",
      DEPOSIT_TO_ACCOUNT: "bg-blue-100 text-blue-800",
      CHEQUE: "bg-yellow-100 text-yellow-800",
      CREDIT: "bg-purple-100 text-purple-800",
      WALLET: "bg-indigo-100 text-indigo-800",
      ONLINE: "bg-cyan-100 text-cyan-800",
    };
    return colorMap[method] || "bg-gray-100 text-gray-800";
  };

  const getStepText = (step: string) => {
    const stepMap: { [key: string]: string } = {
      SELLER: "فروشنده",
      SALES_MANAGER: "مدیر فروش",
      PROCESSING: "آماده سازی",
      INVENTORY: "انبار",
      ACCOUNTING: "حسابداری",
      CARGO: "مرسوله",
      PARTIALLY_DELIVERED: "تحویل جزئی",
      DELIVERED: "تحویل داده شده",
      PARTIALLY_RETURNED: "مرجوعی جزئی",
      RETURNED: "مرجوعی کامل",
    };
    return stepMap[step] || step;
  };

  const getStepColor = (step: string) => {
    const colorMap: { [key: string]: string } = {
      SELLER: "bg-blue-100 text-blue-800",
      SALES_MANAGER: "bg-purple-100 text-purple-800",
      PROCESSING: "bg-yellow-100 text-yellow-800",
      INVENTORY: "bg-indigo-100 text-indigo-800",
      ACCOUNTING: "bg-green-100 text-green-800",
      CARGO: "bg-teal-100 text-teal-800",
      PARTIALLY_DELIVERED: "bg-orange-100 text-orange-800",
      DELIVERED: "bg-emerald-100 text-emerald-800",
      PARTIALLY_RETURNED: "bg-red-100 text-red-800",
      RETURNED: "bg-gray-100 text-gray-800",
    };
    return colorMap[step] || "bg-gray-100 text-gray-800";
  };

  // Sync activeTab with URL when it changes
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as TabType;
    if (
      tabFromUrl &&
      [
        "details",
        "overview",
        "orders",
        "invoices",
        "payments",
        "wallet",
      ].includes(tabFromUrl) &&
      tabFromUrl !== activeTab
    ) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  // Update URL when activeTab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const tabs = [
    { id: "details" as TabType, label: "جزئیات", icon: User },
    { id: "overview" as TabType, label: "اطلاعات کلی", icon: BarChart3 },
    { id: "orders" as TabType, label: "سفارشات", icon: Package },
    { id: "invoices" as TabType, label: "فاکتورها", icon: Receipt },
    { id: "payments" as TabType, label: "پرداخت‌ها", icon: CreditCard },
    { id: "wallet" as TabType, label: "گردش حساب", icon: Wallet },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <span className="mr-3 text-gray-600 font-semibold">
          در حال بارگذاری...
        </span>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error || "مشتری یافت نشد"}</div>
        <button
          onClick={() => navigate("/manage/customers")}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          بازگشت به لیست مشتریان
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in font-vazir max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/manage/customers")}
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {customer.title}
            </h1>
            <p className="text-gray-500">
              کد: {customer.code} • {getCustomerTypeText(customer.type)}
            </p>
          </div>
          <div className="flex items-center space-x-reverse space-x-2">
            {customer.deleted ? (
              <span className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-semibold bg-red-100 text-red-800">
                <XCircle className="w-4 h-4 ml-1.5" />
                حذف شده
              </span>
            ) : customer.locked ? (
              <span className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-semibold bg-orange-100 text-orange-800">
                <Lock className="w-4 h-4 ml-1.5" />
                قفل شده
              </span>
            ) : (
              <span className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-semibold bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 ml-1.5" />
                فعال
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex space-x-reverse space-x-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-reverse space-x-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center space-x-reverse space-x-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">کد مشتری</h3>
                  </div>
                  <p className="text-xl font-bold text-blue-600">
                    {customer.code}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center space-x-reverse space-x-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">نوع</h3>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {getCustomerTypeText(customer.type)}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center space-x-reverse space-x-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <User className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">دسته‌بندی</h3>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {getCustomerCategoryText(customer.category)}
                  </p>
                </div>
                {wallet && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-reverse space-x-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="font-bold text-gray-900">موجودی واقعی</h3>
                    </div>
                    <p
                      className={`text-xl font-bold ${
                        (wallet.actual_balance ?? wallet.balance) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(wallet.actual_balance ?? wallet.balance)}
                    </p>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-reverse space-x-2 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">اطلاعات اصلی</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">تلفن</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {customer.phone || "ثبت نشده"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">آدرس</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {customer.address || "ثبت نشده"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Wallet Info */}
              {wallet && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center space-x-reverse space-x-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">اطلاعات کیف پول</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">
                        موجودی حسابداری
                      </p>
                      <p
                        className={`text-xl font-bold ${
                          wallet.balance >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(wallet.balance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">
                        موجودی واقعی
                      </p>
                      <p
                        className={`text-xl font-bold ${
                          (wallet.actual_balance ?? wallet.balance) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(
                          wallet.actual_balance ?? wallet.balance
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">حد اعتبار</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(wallet.credit_cap)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">
                        حد اعتبار واقعی
                      </p>
                      <p
                        className={`text-xl font-bold ${
                          (wallet.actual_credit ??
                            wallet.balance - wallet.credit_cap) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(
                          wallet.actual_credit ??
                            wallet.balance - wallet.credit_cap
                        )}
                      </p>
                    </div>
                  </div>
                  {(wallet.pending_cheques_count ?? 0) > 0 && (
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="flex items-center space-x-reverse space-x-2 mb-3">
                        <CreditCard className="w-4 h-4 text-orange-600" />
                        <h4 className="font-semibold text-gray-900">
                          چک‌های در انتظار
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            تعداد چک‌ها
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {wallet.pending_cheques_count} چک
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            مجموع مبلغ چک‌ها
                          </p>
                          <p className="text-sm font-bold text-orange-600">
                            {formatCurrency(wallet.pending_cheques_total ?? 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Seller Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center space-x-reverse space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">فروشنده</h3>
                  </div>
                  <button
                    onClick={() => setShowUpdateSellerModal(true)}
                    className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-semibold flex items-center space-x-reverse space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>ویرایش</span>
                  </button>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">
                    نام و نام خانوادگی
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {customer.seller
                      ? `${customer.seller.profile.first_name} ${customer.seller.profile.last_name}`
                      : "تعیین نشده"}
                  </p>
                </div>
              </div>

              {/* Capillary Sales Line Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center space-x-reverse space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <User className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">خط فروش</h3>
                  </div>
                  <button
                    onClick={() => setShowUpdateCapillarySalesLineModal(true)}
                    className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-semibold flex items-center space-x-reverse space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>ویرایش</span>
                  </button>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">خط فروش</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {customer.capillary_sales_line
                      ? customer.capillary_sales_line.title
                      : "تعیین نشده"}
                  </p>
                </div>
              </div>

              {/* People (Representatives) */}
              {customer.people && customer.people.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center space-x-reverse space-x-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <Users className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">
                      نمایندگان ({customer.people.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customer.people.map((person) => (
                      <div
                        key={person.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          {person.profile.first_name} {person.profile.last_name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {person.profile.mobile} • {person.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {customerInformationLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                  <span className="mr-3 text-gray-600 font-semibold">
                    در حال بارگذاری اطلاعات...
                  </span>
                </div>
              ) : customerInformationError ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-red-800 font-semibold">
                    {customerInformationError}
                  </p>
                </div>
              ) : customerInformation ? (
                <>
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center space-x-reverse space-x-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-gray-900">عنوان</h3>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {customerInformation.title}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center space-x-reverse space-x-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <h3 className="font-bold text-gray-900">نوع</h3>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {getCustomerTypeText(customerInformation.type)}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center space-x-reverse space-x-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                          <User className="w-4 h-4 text-emerald-600" />
                        </div>
                        <h3 className="font-bold text-gray-900">دسته‌بندی</h3>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {getCustomerCategoryText(customerInformation.category)}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center space-x-reverse space-x-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-orange-600" />
                        </div>
                        <h3 className="font-bold text-gray-900">سن</h3>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {customerInformation.age} سال
                      </p>
                    </div>
                  </div>

                  {/* Wallet Information */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-reverse space-x-2 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-emerald-600" />
                      </div>
                      <h3 className="font-bold text-gray-900">
                        اطلاعات کیف پول
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">موجودی</p>
                        <p
                          className={`text-xl font-bold ${
                            customerInformation.wallet.balance >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(customerInformation.wallet.balance)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          حد اعتبار
                        </p>
                        <p className="text-xl font-bold text-blue-600">
                          {formatCurrency(
                            customerInformation.wallet.credit_limit
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          مبلغ بدهی
                        </p>
                        <p
                          className={`text-xl font-bold ${
                            customerInformation.wallet.debt_amount > 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {formatCurrency(
                            customerInformation.wallet.debt_amount
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Statistics */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-reverse space-x-2 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-gray-900">آمار سفارشات</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          تعداد کل سفارشات
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {customerInformation.order_statistics.total_orders}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          سفارشات موفق
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {
                            customerInformation.order_statistics
                              .successful_orders
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          سفارشات ناموفق
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          {customerInformation.order_statistics.failed_orders}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          مجموع خرید
                        </p>
                        <p className="text-xl font-bold text-emerald-600">
                          {formatCurrency(
                            customerInformation.order_statistics
                              .total_purchase_amount
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          میانگین ارزش سفارش
                        </p>
                        <p className="text-xl font-bold text-blue-600">
                          {formatCurrency(
                            customerInformation.order_statistics
                              .average_order_value
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          آخرین سفارش
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(
                            customerInformation.order_statistics.last_order_date.toString()
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          اولین سفارش
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(
                            customerInformation.order_statistics.first_order_date.toString()
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Statistics */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-reverse space-x-2 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-purple-600" />
                      </div>
                      <h3 className="font-bold text-gray-900">
                        آمار پرداخت‌ها
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          تعداد کل پرداخت‌ها
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {
                            customerInformation.payment_statistics
                              .total_payments
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          مجموع مبلغ پرداختی
                        </p>
                        <p className="text-xl font-bold text-emerald-600">
                          {formatCurrency(
                            customerInformation.payment_statistics
                              .total_paid_amount
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          میانگین پرداخت
                        </p>
                        <p className="text-xl font-bold text-blue-600">
                          {formatCurrency(
                            customerInformation.payment_statistics
                              .average_payment_amount
                          )}
                        </p>
                      </div>
                      {customerInformation.payment_statistics
                        .last_payment_date && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1.5">
                            آخرین پرداخت
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatDate(
                              customerInformation.payment_statistics.last_payment_date.toString()
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Most Purchased Product */}
                  {customerInformation.most_purchased_product && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center space-x-reverse space-x-2 mb-5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                          <Package className="w-4 h-4 text-amber-600" />
                        </div>
                        <h3 className="font-bold text-gray-900">
                          پرفروش‌ترین محصول
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                          <p className="text-xs text-gray-500 mb-1.5">
                            نام محصول
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {
                              customerInformation.most_purchased_product
                                .product_title
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1.5">
                            تعداد خرید
                          </p>
                          <p className="text-xl font-bold text-blue-600">
                            {
                              customerInformation.most_purchased_product
                                .total_quantity
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1.5">
                            مجموع مبلغ
                          </p>
                          <p className="text-xl font-bold text-emerald-600">
                            {formatCurrency(
                              customerInformation.most_purchased_product
                                .total_amount
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1.5">
                            موجودی فعلی
                          </p>
                          <p className="text-xl font-bold text-gray-900">
                            {
                              customerInformation.most_purchased_product
                                .current_inventory
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Top Products */}
                  {customerInformation.top_products &&
                    customerInformation.top_products.length > 0 && (
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center space-x-reverse space-x-2 mb-5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-indigo-600" />
                          </div>
                          <h3 className="font-bold text-gray-900">
                            محصولات برتر
                          </h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                  محصول
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                  تعداد
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                  مبلغ کل
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                  تعداد سفارش
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {customerInformation.top_products.map(
                                (product) => (
                                  <tr key={product.product_id}>
                                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                                      {product.product_title}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-700">
                                      {product.total_quantity}
                                    </td>
                                    <td className="px-4 py-4 text-sm font-bold text-emerald-600">
                                      {formatCurrency(product.total_amount)}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-700">
                                      {product.order_count}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  {/* Behavior Analysis */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-reverse space-x-2 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-pink-600" />
                      </div>
                      <h3 className="font-bold text-gray-900">
                        تحلیل رفتار خرید
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          فرکانس خرید
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {customerInformation.behavior_analysis
                            .purchase_frequency === "DAILY"
                            ? "روزانه"
                            : customerInformation.behavior_analysis
                                .purchase_frequency === "WEEKLY"
                            ? "هفتگی"
                            : customerInformation.behavior_analysis
                                .purchase_frequency === "MONTHLY"
                            ? "ماهانه"
                            : "نامنظم"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          روش پرداخت ترجیحی
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {getPaymentMethodText(
                            customerInformation.behavior_analysis
                              .preferred_payment_method
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          میانگین فاصله سفارش (روز)
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {
                            customerInformation.behavior_analysis
                              .average_order_interval_days
                          }{" "}
                          روز
                        </p>
                      </div>
                      {customerInformation.behavior_analysis.seasonal_patterns
                        .length > 0 && (
                        <div className="md:col-span-2 lg:col-span-3">
                          <p className="text-xs text-gray-500 mb-1.5">
                            الگوهای فصلی
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {customerInformation.behavior_analysis.seasonal_patterns.map(
                              (pattern, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-semibold"
                                >
                                  {pattern}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-reverse space-x-2 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-cyan-600" />
                      </div>
                      <h3 className="font-bold text-gray-900">
                        فعالیت اخیر (30 روز گذشته)
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          تعداد سفارشات
                        </p>
                        <p className="text-xl font-bold text-blue-600">
                          {
                            customerInformation.recent_activity
                              .last_30_days_orders
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">مبلغ کل</p>
                        <p className="text-xl font-bold text-emerald-600">
                          {formatCurrency(
                            customerInformation.recent_activity
                              .last_30_days_amount
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          تعداد پرداخت‌ها
                        </p>
                        <p className="text-xl font-bold text-purple-600">
                          {
                            customerInformation.recent_activity
                              .last_30_days_payments
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          روند فعالیت
                        </p>
                        <div className="flex items-center space-x-reverse space-x-2">
                          {customerInformation.recent_activity
                            .activity_trend === "INCREASING" ? (
                            <>
                              <TrendingUp className="w-5 h-5 text-green-600" />
                              <p className="text-sm font-semibold text-green-600">
                                افزایشی
                              </p>
                            </>
                          ) : customerInformation.recent_activity
                              .activity_trend === "DECREASING" ? (
                            <>
                              <TrendingDown className="w-5 h-5 text-red-600" />
                              <p className="text-sm font-semibold text-red-600">
                                کاهشی
                              </p>
                            </>
                          ) : (
                            <>
                              <Activity className="w-5 h-5 text-gray-600" />
                              <p className="text-sm font-semibold text-gray-600">
                                پایدار
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {ordersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">سفارشی یافت نشد</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => navigate(`/manage/orders/${order.id}`)}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900">
                              سفارش #{order.code}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                          <span
                            className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${getStepColor(
                              order.step
                            )}`}
                          >
                            {getStepText(order.step)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {ordersTotal > 10 && (
                    <Pagination
                      currentPage={ordersPage}
                      totalPages={Math.ceil(ordersTotal / 10)}
                      totalItems={ordersTotal}
                      itemsPerPage={10}
                      onPageChange={setOrdersPage}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === "invoices" && (
            <div className="space-y-4">
              {invoicesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">فاکتوری یافت نشد</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        onClick={() =>
                          navigate(`/manage/invoices/${invoice.id}`)
                        }
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900">
                              فاکتور #{invoice.code}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {formatDate(invoice.date)} •{" "}
                              {formatCurrency(invoice.amount)}
                            </p>
                          </div>
                          <span
                            className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${
                              invoice.payment_status === "PAID"
                                ? "bg-green-100 text-green-800"
                                : invoice.payment_status === "PARTIALLY_PAID"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {getPaymentStatusText(invoice.payment_status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {invoicesTotal > 10 && (
                    <Pagination
                      currentPage={invoicesPage}
                      totalPages={Math.ceil(invoicesTotal / 10)}
                      totalItems={invoicesTotal}
                      itemsPerPage={10}
                      onPageChange={setInvoicesPage}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div className="space-y-4">
              {paymentsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
              ) : paymentsError ? (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-red-300 mx-auto mb-4" />
                  <p className="text-red-600 font-semibold">{paymentsError}</p>
                  <button
                    onClick={fetchPayments}
                    className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    تلاش مجدد
                  </button>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">پرداختی یافت نشد</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div
                            onClick={() =>
                              navigate(`/manage/payments/${payment.id}`)
                            }
                            className="flex-1 cursor-pointer"
                          >
                            <p className="font-bold text-gray-900">
                              پرداخت #{payment.code}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {formatDate(payment.date)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-reverse space-x-3">
                            <span
                              className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${getPaymentMethodColor(
                                payment.method
                              )}`}
                            >
                              {getPaymentMethodText(payment.method)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeletePaymentModal(payment.id);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="حذف پرداخت"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">مبلغ</p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(payment.amount)}
                            </p>
                          </div>
                          {payment.cheque_due_date && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500 mb-1">
                                تاریخ سررسید چک
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {formatDate(payment.cheque_due_date)}
                              </p>
                            </div>
                          )}
                        </div>
                        {payment.description && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500">توضیحات</p>
                            <p className="text-sm text-gray-900 mt-1">
                              {payment.description}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {paymentsTotal > 10 && (
                    <Pagination
                      currentPage={paymentsPage}
                      totalPages={Math.ceil(paymentsTotal / 10)}
                      totalItems={paymentsTotal}
                      itemsPerPage={10}
                      onPageChange={setPaymentsPage}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* Wallet History Tab */}
          {activeTab === "wallet" && (
            <div className="space-y-6">
              {wallet && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center space-x-reverse space-x-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">
                      وضعیت فعلی کیف پول
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">
                        موجودی حسابداری
                      </p>
                      <p
                        className={`text-xl font-bold ${
                          wallet.balance >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(wallet.balance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">
                        موجودی واقعی
                      </p>
                      <p
                        className={`text-xl font-bold ${
                          (wallet.actual_balance ?? wallet.balance) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(
                          wallet.actual_balance ?? wallet.balance
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">حد اعتبار</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(wallet.credit_cap)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">
                        حد اعتبار واقعی
                      </p>
                      <p
                        className={`text-xl font-bold ${
                          (wallet.actual_credit ??
                            wallet.balance - wallet.credit_cap) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(
                          wallet.actual_credit ??
                            wallet.balance - wallet.credit_cap
                        )}
                      </p>
                    </div>
                  </div>
                  {(wallet.pending_cheques_count ?? 0) > 0 && (
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="flex items-center space-x-reverse space-x-2 mb-3">
                        <CreditCard className="w-4 h-4 text-orange-600" />
                        <h4 className="font-semibold text-gray-900">
                          چک‌های در انتظار
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            تعداد چک‌ها
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {wallet.pending_cheques_count} چک
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            مجموع مبلغ چک‌ها
                          </p>
                          <p className="text-sm font-bold text-orange-600">
                            {formatCurrency(wallet.pending_cheques_total ?? 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* View Toggle Buttons */}
              <div className="flex items-center space-x-reverse space-x-3 bg-white rounded-xl border border-gray-200 p-3">
                <button
                  onClick={() => setTransactionsView("simple")}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    transactionsView === "simple"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Wallet className="w-4 h-4 inline ml-2" />
                  گردش حساب
                </button>
                <button
                  onClick={() => setTransactionsView("detailed")}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    transactionsView === "detailed"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FileText className="w-4 h-4 inline ml-2" />
                  ریز گردش حساب
                </button>
              </div>

              {/* Simple Transactions View */}
              {transactionsView === "simple" && (
                <>
                  {transactionsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-12">
                      <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">گردش حسابی یافت نشد</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-3 text-right font-bold text-gray-900 text-sm">
                                #
                              </th>
                              <th className="px-4 py-3 text-right font-bold text-gray-900 text-sm">
                                نوع
                              </th>
                              <th className="px-4 py-3 text-right font-bold text-gray-900 text-sm">
                                کد
                              </th>
                              <th className="px-4 py-3 text-right font-bold text-gray-900 text-sm">
                                تاریخ
                              </th>
                              <th className="px-4 py-3 text-right font-bold text-gray-900 text-sm">
                                بدهکار
                              </th>
                              <th className="px-4 py-3 text-right font-bold text-gray-900 text-sm">
                                بستانکار
                              </th>
                              <th className="px-4 py-3 text-right font-bold text-gray-900 text-sm">
                                مانده حساب
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {transactions.map((transaction, index) => {
                              const isPayment = transaction.type === "PAYMENT";
                              const isReturn =
                                transaction.type === "RETURN_FROM_PURCHASE";
                              const debtor =
                                !isPayment && transaction.amount
                                  ? Math.abs(transaction.amount)
                                  : null;
                              const creditor =
                                isPayment && transaction.amount
                                  ? Math.abs(transaction.amount)
                                  : null;

                              const getTransactionTypeText = (type: string) => {
                                if (type === "PAYMENT") return "پرداخت";
                                if (type === "INVOICE" || type === "PURCHASE")
                                  return "خرید";
                                if (type === "RETURN_FROM_PURCHASE")
                                  return "مرجوعی";
                                if (type === "SELL") return "فروش";
                                return type || "تراکنش";
                              };

                              return (
                                <tr
                                  key={transaction.id || index}
                                  className="hover:bg-gray-50 transition-colors"
                                >
                                  <td className="px-4 py-3 text-sm text-gray-700 font-semibold text-right">
                                    {index + 1}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <span
                                      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${
                                        isPayment
                                          ? "bg-green-100 text-green-800"
                                          : isReturn
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-orange-100 text-orange-800"
                                      }`}
                                    >
                                      {getTransactionTypeText(transaction.type)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 font-semibold text-right">
                                    {transaction.code || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700 text-right font-medium whitespace-nowrap">
                                    {formatDate(transaction.date)}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-red-600 font-semibold text-right">
                                    {debtor ? formatCurrency(debtor) : "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-green-700 font-semibold text-right">
                                    {creditor ? formatCurrency(creditor) : "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-bold text-right">
                                    {transaction.remaining !== undefined ? (
                                      <span
                                        className={
                                          transaction.remaining < 0
                                            ? "text-red-600"
                                            : transaction.remaining > 0
                                            ? "text-blue-600"
                                            : "text-gray-900"
                                        }
                                      >
                                        {formatCurrency(transaction.remaining)}
                                      </span>
                                    ) : (
                                      "-"
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Detailed Transactions View */}
              {transactionsView === "detailed" && (
                <>
                  {transactionsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">تراکنشی یافت نشد</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="w-12 px-3 py-3 text-right font-bold text-gray-900 text-sm">
                                #
                              </th>
                              <th className="w-24 px-3 py-3 text-right font-bold text-gray-900 text-sm">
                                نوع
                              </th>
                              <th className="w-20 px-3 py-3 text-right font-bold text-gray-900 text-sm">
                                کد
                              </th>
                              <th className="w-40 px-3 py-3 text-right font-bold text-gray-900 text-sm">
                                تاریخ
                              </th>
                              <th className="px-3 py-3 text-right font-bold text-gray-900 text-sm">
                                توضیحات / نام محصول
                              </th>
                              <th className="w-28 px-3 py-3 text-right font-bold text-gray-900 text-sm">
                                وزن
                              </th>
                              <th className="w-36 px-3 py-3 text-right font-bold text-gray-900 text-sm">
                                قیمت
                              </th>
                              <th className="w-40 px-3 py-3 text-right font-bold text-gray-900 text-sm">
                                بدهکار
                              </th>
                              <th className="w-40 px-3 py-3 text-right font-bold text-gray-900 text-sm">
                                بستانکار
                              </th>
                              <th className="w-40 px-3 py-3 text-right font-bold text-gray-900 text-sm">
                                مانده حساب
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {transactions.map((transaction, index) => {
                              const isPayment = transaction.type === "PAYMENT";
                              const isReturn =
                                transaction.type === "RETURN_FROM_PURCHASE";
                              const debtor =
                                !isPayment && transaction.amount
                                  ? Math.abs(transaction.amount)
                                  : null;
                              const creditor =
                                isPayment && transaction.amount
                                  ? Math.abs(transaction.amount)
                                  : null;

                              const getTransactionTypeText = (type: string) => {
                                if (type === "PAYMENT") return "پرداخت";
                                if (type === "INVOICE" || type === "PURCHASE")
                                  return "خرید";
                                if (type === "RETURN_FROM_PURCHASE")
                                  return "مرجوعی";
                                if (type === "SELL") return "فروش";
                                return type || "تراکنش";
                              };

                              // اگر محصولات وجود دارد، برای هر محصول یک ردیف جداگانه
                              const products = transaction.products;
                              if (products && products.length > 0) {
                                return products.map((product, prodIndex) => (
                                  <tr
                                    key={`${
                                      transaction.id || index
                                    }-${prodIndex}`}
                                    className="hover:bg-gray-50 transition-colors"
                                  >
                                    {prodIndex === 0 && (
                                      <>
                                        <td
                                          rowSpan={products.length}
                                          className="px-3 py-3 text-sm text-gray-700 font-semibold text-right"
                                        >
                                          {index + 1}
                                        </td>
                                        <td
                                          rowSpan={products.length}
                                          className="px-3 py-3 text-right"
                                        >
                                          <span
                                            className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${
                                              isPayment
                                                ? "bg-green-100 text-green-800"
                                                : isReturn
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-orange-100 text-orange-800"
                                            }`}
                                          >
                                            {getTransactionTypeText(
                                              transaction.type
                                            )}
                                          </span>
                                        </td>
                                        <td
                                          rowSpan={products.length}
                                          className="px-3 py-3 text-sm text-gray-900 font-semibold text-right"
                                        >
                                          {transaction.code || "-"}
                                        </td>
                                        <td
                                          rowSpan={products.length}
                                          className="px-3 py-3 text-sm text-gray-700 text-right font-medium whitespace-nowrap"
                                        >
                                          {formatDate(transaction.date)}
                                        </td>
                                        <td
                                          rowSpan={products.length}
                                          className="px-3 py-3 text-sm text-red-600 font-semibold text-right tabular-nums"
                                        >
                                          {debtor
                                            ? formatCurrency(debtor)
                                            : "-"}
                                        </td>
                                        <td
                                          rowSpan={products.length}
                                          className="px-3 py-3 text-sm text-green-700 font-semibold text-right tabular-nums"
                                        >
                                          {creditor
                                            ? formatCurrency(creditor)
                                            : "-"}
                                        </td>
                                        <td
                                          rowSpan={products.length}
                                          className="px-3 py-3 text-sm font-bold text-right tabular-nums"
                                        >
                                          {transaction.remaining !==
                                          undefined ? (
                                            <span
                                              className={
                                                transaction.remaining < 0
                                                  ? "text-red-600"
                                                  : transaction.remaining > 0
                                                  ? "text-blue-600"
                                                  : "text-gray-900"
                                              }
                                            >
                                              {formatCurrency(
                                                transaction.remaining
                                              )}
                                            </span>
                                          ) : (
                                            "-"
                                          )}
                                        </td>
                                      </>
                                    )}
                                    <td className="px-3 py-3 text-sm text-gray-900 text-right">
                                      {product.product_title || "-"}
                                    </td>
                                    <td className="px-3 py-3 text-sm text-gray-700 text-right tabular-nums">
                                      {product.net_weight
                                        ? `${product.net_weight} کیلوگرم`
                                        : "-"}
                                    </td>
                                    <td className="px-3 py-3 text-sm text-gray-700 font-semibold text-right tabular-nums">
                                      {product.price
                                        ? formatCurrency(product.price)
                                        : "-"}
                                    </td>
                                  </tr>
                                ));
                              }

                              // اگر محصولی نیست، یک ردیف ساده
                              return (
                                <tr
                                  key={transaction.id || index}
                                  className="hover:bg-gray-50 transition-colors"
                                >
                                  <td className="px-3 py-3 text-sm text-gray-700 font-semibold text-right">
                                    {index + 1}
                                  </td>
                                  <td className="px-3 py-3 text-right">
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${
                                        isPayment
                                          ? "bg-green-100 text-green-800"
                                          : isReturn
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-orange-100 text-orange-800"
                                      }`}
                                    >
                                      {getTransactionTypeText(transaction.type)}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3 text-sm text-gray-900 font-semibold text-right">
                                    {transaction.code || "-"}
                                  </td>
                                  <td className="px-3 py-3 text-sm text-gray-700 text-right font-medium whitespace-nowrap">
                                    {formatDate(transaction.date)}
                                  </td>
                                  <td className="px-3 py-3 text-sm text-gray-900 text-right">
                                    {(() => {
                                      if (isPayment) {
                                        return transaction.description || "-";
                                      }
                                      return (
                                        (transaction as any).product_title ||
                                        (transaction as any).title ||
                                        transaction.description ||
                                        "-"
                                      );
                                    })()}
                                  </td>
                                  <td className="px-3 py-3 text-sm text-gray-700 text-right tabular-nums">
                                    {(transaction as any).net_weight
                                      ? `${
                                          (transaction as any).net_weight
                                        } کیلوگرم`
                                      : "-"}
                                  </td>
                                  <td className="px-3 py-3 text-sm text-gray-700 font-semibold text-right tabular-nums">
                                    {(transaction as any).price
                                      ? formatCurrency(
                                          (transaction as any).price
                                        )
                                      : "-"}
                                  </td>
                                  <td className="px-3 py-3 text-sm text-red-600 font-semibold text-right tabular-nums">
                                    {debtor ? formatCurrency(debtor) : "-"}
                                  </td>
                                  <td className="px-3 py-3 text-sm text-green-700 font-semibold text-right tabular-nums">
                                    {creditor ? formatCurrency(creditor) : "-"}
                                  </td>
                                  <td className="px-3 py-3 text-sm font-bold text-right tabular-nums">
                                    {transaction.remaining !== undefined ? (
                                      <span
                                        className={
                                          transaction.remaining < 0
                                            ? "text-red-600"
                                            : transaction.remaining > 0
                                            ? "text-blue-600"
                                            : "text-gray-900"
                                        }
                                      >
                                        {formatCurrency(transaction.remaining)}
                                      </span>
                                    ) : (
                                      "-"
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {customerId && (
        <>
          <UpdateSellerModal
            isOpen={showUpdateSellerModal}
            onClose={() => setShowUpdateSellerModal(false)}
            customerId={customerId}
            currentSellerId={customer.seller?.id}
            onSuccess={() => {
              fetchCustomerDetails();
              setShowUpdateSellerModal(false);
            }}
          />
          <UpdateCapillarySalesLineModal
            isOpen={showUpdateCapillarySalesLineModal}
            onClose={() => setShowUpdateCapillarySalesLineModal(false)}
            customerId={customerId}
            currentCapillarySalesLineId={customer.capillary_sales_line?.id}
            onSuccess={() => {
              fetchCustomerDetails();
              setShowUpdateCapillarySalesLineModal(false);
            }}
          />
        </>
      )}

      {/* Delete Payment Confirmation Modal */}
      {showDeletePaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                تایید حذف پرداخت
              </h3>
              <button
                onClick={closeDeletePaymentModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={deletingPayment}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-gray-700 text-center mb-2">
                آیا مطمئن هستید که می‌خواهید این پرداخت را حذف کنید؟
              </p>
              <p className="text-sm text-gray-500 text-center">
                این عمل قابل بازگشت نیست و موجودی کیف پول مشتری تغییر خواهد کرد.
              </p>
            </div>

            <div className="flex items-center space-x-reverse space-x-3">
              <button
                onClick={closeDeletePaymentModal}
                disabled={deletingPayment}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handleDeletePayment}
                disabled={deletingPayment}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center space-x-reverse space-x-2"
              >
                {deletingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>در حال حذف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    <span>حذف</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
