import axios, { AxiosError } from "axios";
import type {
  ActualCustomerDebtReportStats,
  AddCartItemDto,
  AddCartItemResponse,
  AddCustomerInitialBalanceDto,
  AddCustomerInitialBalanceResponse,
  AddFavoriteProductDto,
  AddFavoriteProductResponse,
  CapillarySalesLineDetails,
  CargoHistory,
  Category,
  ChangeOrderStepDto,
  CheckDetailsResponse,
  CheckListResponse,
  CheckoutCartDto,
  CheckoutCartResponse,
  ClientListResponse,
  CreateCheckDto,
  CreateCheckResponse,
  CreateDispatchCargoDto,
  CreateOrderFromRequestDto,
  CreatePaymentDto,
  CreatePaymentResponse,
  CreateReminderDto,
  CreateReminderResponse,
  Customer,
  CustomerDebtListResponse,
  CustomerDetails,
  CustomerInfoResponse,
  CustomerLastOrderListResponse,
  CustomerListResponse,
  CustomerRequest,
  CustomerRequestDetails,
  CustomersWithoutPurchaseReportStats,
  CustomerTransaction,
  Employee,
  EmployeeInfoResponse,
  FileUploadResponse,
  GetCapillarySalesLinesResponse,
  GetFavoriteProductsResponse,
  GetMyCartResponse,
  GetProductKardexResponse,
  GetSellersResponse,
  GroupsListResponse,
  GroupsListWithClientIdResponse,
  InactiveCustomersReportStats,
  InvoiceById,
  InvoiceHistory,
  InvoiceListItem,
  Log,
  LoginRequest,
  LoginResponse,
  LogListResponse,
  MyRequestDetailsResponse,
  MyRequestsResponse,
  NegativeInventoryReportStats,
  Order,
  OrderCargo,
  OrderDetails,
  OrderHistory,
  PaymentDetails,
  PaymentHistory,
  PaymentListResponse,
  PeopleInfoResponse,
  Product,
  ProfileByGroupsResponse,
  ProfileDetails,
  ProfileInfoResponse,
  ProfileListResponse,
  PublicProductDetails,
  PublicProductListResponse,
  QueryCapillarySalesLineDto,
  QueryCargoHistoryDto,
  QueryCheckDto,
  QueryCustomerDto,
  QueryCustomerTransactionDto,
  QueryInvoiceDto,
  QueryInvoiceHistoryDto,
  QueryLogDto,
  QueryOrderDto,
  QueryOrderHistoryDto,
  QueryPaymentDto,
  QueryPaymentHistoryDto,
  QueryProductKardexDto,
  QueryPublicDto,
  QueryReceivingDto,
  QueryReminderDto,
  QueryTicketDto,
  QueryWalletDto,
  QueryWalletHistoryDto,
  Receiving,
  ReceivingListResponse,
  ReminderDetails,
  ReminderListResponse,
  ReplyTicketDto,
  ReturnedOrdersReportStats,
  ReturnedProductsReportStats,
  SellerReportStats,
  TicketCreatedResponse,
  TicketDetails,
  TicketListResponse,
  TicketMessageResponse,
  TicketRepliedResponse,
  TrucksListResponse,
  UpdateCartItemDto,
  UpdateCartItemResponse,
  UpdateCustomerCreditCapResponse,
  UpdateCustomerSelfDto,
  UpdatePersonSelfDto,
  UpdateProductPricesRequest,
  UpdateProductRequest,
  UpdateProfileSelfDto,
  WalletDetails,
  WalletHistory,
  WalletInfoResponse,
  WalletListResponse,
  Warehouse,
  WarehouseDetailsResponse,
  ZarinpalWalletTopupCallbackResponse,
  ZarinpalWalletTopupResponse,
  ZibalWalletTopupCallbackResponse,
  ZibalWalletTopupResponse,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL;

// IP address cache
let cachedIpAddress: string | null = null;
let ipFetchPromise: Promise<string> | null = null;

/**
 * Get client IP address from external service
 * Uses caching to avoid multiple requests
 */
async function getClientIpAddress(): Promise<string> {
  // Return cached IP if available
  if (cachedIpAddress) {
    return cachedIpAddress;
  }

  // Return existing promise if already fetching
  if (ipFetchPromise) {
    return ipFetchPromise;
  }

  // Check localStorage for cached IP
  const storedIp = localStorage.getItem("client_ip");
  if (storedIp) {
    cachedIpAddress = storedIp;
    return storedIp;
  }

  // Fetch IP from external service
  ipFetchPromise = axios
    .get("https://api.ipify.org?format=json", {
      timeout: 5000,
    })
    .then((response) => {
      const ip = response.data.ip || "unknown";
      cachedIpAddress = ip;
      localStorage.setItem("client_ip", ip);
      ipFetchPromise = null;
      return ip;
    })
    .catch((error) => {
      console.warn("Failed to fetch IP address:", error);
      ipFetchPromise = null;
      // Return 'unknown' as fallback
      const fallbackIp = "unknown";
      cachedIpAddress = fallbackIp;
      return fallbackIp;
    });

  return ipFetchPromise;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    version: "1",
    branch: "ISFAHAN",
  },
});

// Request interceptor to add auth token and IP address
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add client IP address to headers
    try {
      const clientIp = await getClientIpAddress();
      config.headers["x-forwarded-for"] = clientIp;
      config.headers["x-real-ip"] = clientIp;
    } catch (error) {
      console.warn("Failed to get client IP:", error);
      // Continue without IP if fetch fails
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 (Unauthorized), not 403 (Forbidden)
    // 403 means user doesn't have permission, but is still authenticated
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          // Use the same axios instance to maintain headers (version, branch)
          const response = await api.post("/auth/refresh", {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          localStorage.setItem("access_token", access_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Only logout if refresh fails with 401 (token expired/invalid)
          // Don't logout for network errors or other issues
          if ((refreshError as AxiosError).response?.status === 401) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
          }
          // For other errors, just reject the promise
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }

    // For 403 (Forbidden) and other errors, just reject without logout
    return Promise.reject(error);
  }
);

export const fileUrl = (path?: string) => {
  if (!path) return null;
  return `${FILE_BASE_URL}/${path}`;
};

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};

export const invoiceService = {
  getInvoices: async (
    query: QueryInvoiceDto
  ): Promise<{ data: InvoiceListItem[]; count: number }> => {
    const response = await api.get("/invoices", {
      params: {
        ...query,
      },
    });
    return response.data;
  },
  getInvoiceById: async (id: string): Promise<InvoiceById> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },
};

export const historyService = {
  getWalletHistory: async (
    query: QueryWalletHistoryDto = {}
  ): Promise<{ data: WalletHistory[]; count: number }> => {
    const response = await api.get("/wallet-history", {
      params: {
        page: 1,
        "page-size": 10,
        ...query,
      },
    });
    return response.data;
  },
  getWalletHistoryById: async (id: string): Promise<WalletHistory> => {
    const response = await api.get(`/wallet-history/${id}`);
    return response.data;
  },

  getOrderHistory: async (
    query: QueryOrderHistoryDto = {}
  ): Promise<{ data: OrderHistory[]; count: number }> => {
    const response = await api.get("/order-history", {
      params: {
        page: 1,
        "page-size": 10,
        ...query,
      },
    });
    return response.data;
  },

  getOrderHistoryById: async (id: string): Promise<OrderHistory> => {
    const response = await api.get(`/order-history/${id}`);
    return response.data;
  },

  getPaymentHistory: async (
    query: QueryPaymentHistoryDto = {}
  ): Promise<{ data: PaymentHistory[]; count: number }> => {
    const response = await api.get("/payment-history", {
      params: {
        page: 1,
        "page-size": 10,
        ...query,
      },
    });
    return response.data;
  },
  getPaymentHistoryById: async (id: string): Promise<PaymentHistory> => {
    const response = await api.get(`/payment-history/${id}`);
    return response.data;
  },

  getInvoiceHistory: async (
    query: QueryInvoiceHistoryDto = {}
  ): Promise<{ data: InvoiceHistory[]; count: number }> => {
    const response = await api.get("/invoice-history", {
      params: {
        page: 1,
        "page-size": 10,
        ...query,
      },
    });
    return response.data;
  },
  getInvoiceHistoryById: async (id: string): Promise<InvoiceHistory> => {
    const response = await api.get(`/invoice-history/${id}`);
    return response.data;
  },

  getCargoHistory: async (
    query: QueryCargoHistoryDto = {}
  ): Promise<{ data: CargoHistory[]; count: number }> => {
    const response = await api.get("/cargo-history", {
      params: {
        page: 1,
        "page-size": 10,
        ...query,
      },
    });
    return response.data;
  },

  getCustomerRequests: async (
    page = 1,
    pageSize = 10
  ): Promise<{ data: CustomerRequest[]; count: number }> => {
    const response = await api.get("/customer-requests", {
      params: {
        page,
        "page-size": pageSize,
      },
    });
    return response.data;
  },
  getCustomerRequestById: async (
    id: string
  ): Promise<CustomerRequestDetails> => {
    const response = await api.get(`/customer-requests/${id}`);
    return response.data;
  },
};

export const warehouseService = {
  getWarehouses: async (): Promise<Warehouse[]> => {
    const response = await api.get("/warehouses");
    return response.data.data || response.data;
  },
  getWarehouseById: async (id: string): Promise<WarehouseDetailsResponse> => {
    const response = await api.get(`/warehouses/${id}`);
    return response.data;
  },
};

export const categoryService = {
  getCategoriesByWarehouse: async (
    warehouseId: string
  ): Promise<Category[]> => {
    const response = await api.get(`/categories/warehouse/${warehouseId}`);
    return response.data.data || response.data;
  },

  getCategoryById: async (categoryId: string): Promise<Category> => {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data;
  },

  uploadCategoryImage: async (
    categoryId: string,
    imageId: string
  ): Promise<void> => {
    await api.patch(`/categories/${categoryId}/image`, { image_id: imageId });
  },

  updateCategory: async (
    categoryId: string,
    data: {
      title?: string;
      warehouse_id?: string;
      parent?: string;
      temperature_type?: "HOT" | "COLD" | null;
    }
  ): Promise<Category> => {
    const response = await api.put(`/categories/${categoryId}`, data);
    return response.data;
  },
};

export const productService = {
  getProductsByWarehouse: async (warehouseId: string): Promise<Product[]> => {
    const response = await api.get(`/products/warehouse/${warehouseId}`);
    return response.data.data || response.data;
  },

  getProductById: async (productId: string): Promise<Product> => {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  },

  updateProduct: async (
    productId: string,
    updateData: UpdateProductRequest
  ): Promise<void> => {
    await api.patch(`/products/${productId}/product`, updateData);
  },
  updateProductPrices: async (
    warehouseId: string,
    products: UpdateProductPricesRequest[]
  ): Promise<{ success: boolean }> => {
    const response = await api.put(`/products/prices/${warehouseId}`, products);
    return response.data;
  },
};

export const customerService = {
  getCustomerForShow: async (): Promise<Customer> => {
    const response = await api.get("/customers/show");
    return response.data;
  },
  getAllCustomers: async (
    query?: QueryCustomerDto
  ): Promise<CustomerListResponse> => {
    const response = await api.get("/customers", {
      params: {
        ...query,
      },
    });
    return response.data;
  },
  getCustomerById: async (customerId: string): Promise<CustomerDetails> => {
    const response = await api.get(`/customers/${customerId}`);
    return response.data;
  },
  getCustomerTransactions: async (
    customerId: string,
    query?: QueryCustomerTransactionDto
  ): Promise<CustomerTransaction> => {
    const response = await api.get(`/customers/transactions/${customerId}`, {
      params: {
        ...query,
      },
    });
    return response.data;
  },
  getCustomersByDebt: async (
    query: QueryCustomerDto
  ): Promise<CustomerDebtListResponse> => {
    const response = await api.get("/customers/by-debt", {
      params: {
        ...query,
      },
    });
    return response.data;
  },
  getCustomersByLastOrder: async (
    query: QueryCustomerDto
  ): Promise<CustomerLastOrderListResponse> => {
    const response = await api.get("/customers/last-order", {
      params: {
        ...query,
      },
    });
    return response.data;
  },
  getCustomerInfo: async (): Promise<CustomerInfoResponse> => {
    const response = await api.get("/customers/info");
    return response.data;
  },
  updateCustomerInfo: async (
    data: UpdateCustomerSelfDto
  ): Promise<CustomerInfoResponse> => {
    const response = await api.patch("/customers/info", data);
    return response.data;
  },
  updateSeller: async (
    customerId: string,
    sellerId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(`/customers/update-seller/${customerId}`, {
      seller_id: sellerId,
    });
    return response.data;
  },
  updateCapillarySalesLine: async (
    customerId: string,
    capillarySalesLineId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(
      `/customers/update-capillary-sales-line/${customerId}`,
      {
        capillary_sales_line_id: capillarySalesLineId,
      }
    );
    return response.data;
  },
};

export const capillarySalesLineService = {
  getCapillarySalesLines: async (
    query: QueryCapillarySalesLineDto
  ): Promise<GetCapillarySalesLinesResponse> => {
    const response = await api.get("/capillary-sales-lines", {
      params: {
        ...query,
      },
    });
    return response.data;
  },
  getCapillarySalesLineById: async (
    id: string
  ): Promise<CapillarySalesLineDetails> => {
    const response = await api.get(`/capillary-sales-lines/${id}`);
    return response.data;
  },
};

export const walletService = {
  getWalletByCustomerId: async (customerId: string): Promise<WalletDetails> => {
    const response = await api.get(`/wallets/customer/${customerId}`);
    return response.data;
  },
  getWalletList: async (query: QueryWalletDto): Promise<WalletListResponse> => {
    const response = await api.get("/wallets", {
      params: {
        ...query,
      },
    });
    return response.data;
  },
  getWalletInfo: async (): Promise<WalletInfoResponse> => {
    const response = await api.get("/wallets/info");
    return response.data;
  },
  getWalletById: async (walletId: string): Promise<WalletDetails> => {
    const response = await api.get(`/wallets/${walletId}`);
    return response.data;
  },
  updateCustomerCreditCap: async (
    customerId: string,
    creditCap: number
  ): Promise<UpdateCustomerCreditCapResponse> => {
    const response = await api.put(`/wallets/customer/${customerId}`, {
      credit_cap: creditCap,
    });
    return response.data;
  },
  addCustomerInitialBalance: async (
    customerId: string,
    data: AddCustomerInitialBalanceDto
  ): Promise<AddCustomerInitialBalanceResponse> => {
    const response = await api.put(
      `/wallets/initial-balance/${customerId}`,
      data
    );
    return response.data;
  },
};

export const orderService = {
  getOrders: async (
    query: QueryOrderDto
  ): Promise<{ data: Order[]; count: number }> => {
    const response = await api.get("/orders", {
      params: {
        ...query,
      },
    });
    return response.data;
  },
  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
  getOrderDetails: async (orderId: string): Promise<OrderDetails> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
  createOrderFromRequest: async (
    data: CreateOrderFromRequestDto
  ): Promise<OrderDetails> => {
    const response = await api.post("/orders/from-request", data);
    return response.data;
  },
  changeOrderStep: async (
    orderId: string,
    data: ChangeOrderStepDto
  ): Promise<OrderDetails> => {
    const response = await api.put(`/orders/step/${orderId}`, data);
    return response.data;
  },
  updateOrderHpCode: async (
    orderId: string,
    hpInvoiceCode: number
  ): Promise<OrderDetails> => {
    const response = await api.patch(`/orders/${orderId}/hp-code`, {
      hp_invoice_code: hpInvoiceCode,
    });
    return response.data;
  },
  fulfillProduct: async (
    orderId: string,
    productId: string
  ): Promise<OrderDetails> => {
    const response = await api.put(
      `/orders/${orderId}/fulfill-product/${productId}`
    );
    return response.data;
  },
  changePaymentStatus: async (
    orderId: string,
    paymentStatus: "NOT_PAID" | "PARTIALLY_PAID" | "PAID"
  ): Promise<OrderDetails> => {
    const response = await api.put(`/orders/payment-status/${orderId}`, {
      paymentStatus,
    });
    return response.data;
  },
};

export const cargoService = {
  createDispatch: async (data: CreateDispatchCargoDto): Promise<OrderCargo> => {
    const response = await api.post("/cargos/dispatch", data);
    return response.data;
  },
};

export const truckService = {
  getTrucksByWarehouse: async (
    warehouseId: string
  ): Promise<TrucksListResponse> => {
    const response = await api.get(`/trucks/warehouse/${warehouseId}`);
    return response.data;
  },
};

export const paymentService = {
  createPayment: async (
    data: CreatePaymentDto
  ): Promise<CreatePaymentResponse> => {
    const response = await api.post("/payments", data);
    return response.data;
  },
  getPayments: async (query: QueryPaymentDto): Promise<PaymentListResponse> => {
    const response = await api.get("/payments", {
      params: {
        ...query,
      },
    });
    return response.data;
  },
  getPaymentById: async (paymentId: string): Promise<PaymentDetails> => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },
  zarinpalInitiateWalletTopup: async (
    amount: number,
    description?: string
  ): Promise<ZarinpalWalletTopupResponse> => {
    const response = await api.post("/payments/wallets/topup/zarinpal", {
      amount,
      description,
    });
    return response.data;
  },
  zibalInitiateWalletTopup: async (
    amount: number,
    description?: string
  ): Promise<ZibalWalletTopupResponse> => {
    const response = await api.post("/payments/wallets/topup/zibal", {
      amount,
      description,
    });
    return response.data;
  },
  zarinpalWalletTopupCallback: async (
    paymentTransactionId: string,
    authority: string,
    status: string
  ): Promise<ZarinpalWalletTopupCallbackResponse> => {
    const response = await api.get(
      `/payments/wallets/topup/zarinpal/callback`,
      {
        params: {
          payment_transaction_id: paymentTransactionId,
          Authority: authority,
          Status: status,
        },
      }
    );
    return response.data;
  },
  zibalWalletTopupCallback: async (
    paymentTransactionId: string,
    trackId: number
  ): Promise<ZibalWalletTopupCallbackResponse> => {
    const response = await api.get(`/payments/wallets/topup/zibal/callback`, {
      params: {
        payment_transaction_id: paymentTransactionId,
        trackId,
      },
    });
    return response.data;
  },
};

export const ticketService = {
  createTicket: async (data: {
    customer_id: string;
    subject: string;
    priority: string;
    message: string;
    attachment_ids: string[];
  }): Promise<TicketCreatedResponse> => {
    const response = await api.post("/tickets", data);
    return response.data;
  },
  getTickets: async (query: QueryTicketDto): Promise<TicketListResponse> => {
    const response = await api.get("/tickets", {
      params: {
        ...query,
      },
    });
    return response.data;
  },
  getTicketById: async (ticketId: string): Promise<TicketDetails> => {
    const response = await api.get(`/tickets/${ticketId}`);
    return response.data;
  },
  getTicketMessages: async (
    ticketId: string,
    query: QueryTicketDto
  ): Promise<TicketMessageResponse> => {
    const response = await api.get(`/tickets/${ticketId}/messages`, {
      params: {
        ...query,
      },
    });
    return response.data;
  },
  replyTicket: async (
    ticketId: string,
    dto: ReplyTicketDto
  ): Promise<TicketRepliedResponse> => {
    const response = await api.post(`/tickets/${ticketId}/reply`, dto);
    return response.data;
  },
  assignTicket: async (ticketId: string, employeeId: string): Promise<void> => {
    await api.patch(`/tickets/${ticketId}/assign`, { employee_id: employeeId });
  },
  updateTicketStatus: async (
    ticketId: string,
    status: string
  ): Promise<void> => {
    await api.patch(`/tickets/${ticketId}/status`, { status });
  },
};

export const profileService = {
  getProfileDetails: async (profileId: string): Promise<ProfileDetails> => {
    const response = await api.get(`/profiles/${profileId}`);
    return response.data.data[0];
  },
  getByGroups: async (groupIds: string): Promise<ProfileByGroupsResponse> => {
    const response = await api.get(`/profiles/get-by-groups/${groupIds}`);
    return response.data;
  },
  getProfileList: async (): Promise<ProfileListResponse> => {
    const response = await api.get("/profiles");
    return response.data;
  },
  getEmployees: async (query?: any): Promise<ProfileListResponse> => {
    const response = await api.get("/profiles/employees", { params: query });
    return response.data;
  },
  getNonEmployees: async (query?: any): Promise<ProfileListResponse> => {
    const response = await api.get("/profiles/non-employees", {
      params: query,
    });
    return response.data;
  },
  updateNonEmployee: async (profileId: string, data: any): Promise<void> => {
    await api.put(`/profiles/non-employee/${profileId}`, data);
  },
  createEmployee: async (data: any): Promise<void> => {
    await api.post("/profiles", data);
  },
  updateEmployee: async (profileId: string, data: any): Promise<void> => {
    await api.put(`/profiles/${profileId}`, data);
  },
  getProfileInfo: async (): Promise<ProfileInfoResponse> => {
    const response = await api.get("/profiles/info");
    return response.data;
  },
  updateProfileInfo: async (
    data: UpdateProfileSelfDto
  ): Promise<ProfileInfoResponse> => {
    const response = await api.patch("/profiles/info", data);
    return response.data;
  },
  getRoles: async (): Promise<string[]> => {
    const response = await api.get("/profiles/roles");
    return response.data;
  },
};

export const peopleService = {
  getPeopleInfo: async (): Promise<PeopleInfoResponse> => {
    const response = await api.get("/people/info");
    return response.data;
  },
  updatePeopleInfo: async (
    data: UpdatePersonSelfDto
  ): Promise<PeopleInfoResponse> => {
    const response = await api.patch("/people/info", data);
    return response.data;
  },
};

export const myRequestsService = {
  getMyRequests: async (
    page = 1,
    pageSize = 10
  ): Promise<MyRequestsResponse> => {
    const response = await api.get("/customer-requests", {
      params: {
        page,
        "page-size": pageSize,
      },
    });
    return response.data;
  },
  getMyRequestById: async (id: string): Promise<MyRequestDetailsResponse> => {
    const response = await api.get(`/customer-requests/${id}`);
    return response.data;
  },
};

export const groupAndClientService = {
  getClients: async (): Promise<ClientListResponse> => {
    const response = await api.get("/clients");
    return response.data;
  },
  getGroups: async (): Promise<GroupsListResponse> => {
    const response = await api.get("/groups");
    return response.data;
  },
  getGroupsWithClientId: async (
    clientId: string
  ): Promise<GroupsListWithClientIdResponse> => {
    const response = await api.get(`/groups/client/${clientId}`);
    return response.data;
  },
};

export const employeeService = {
  getAllEmployees: async (): Promise<Employee[]> => {
    const response = await api.get("/employees");
    return response.data;
  },
  getEmployeeById: async (employeeId: string): Promise<Employee> => {
    const response = await api.get(`/employees/${employeeId}`);
    return response.data;
  },
  getEmployeeInfo: async (): Promise<EmployeeInfoResponse> => {
    const response = await api.get("/employees/info");
    return response.data;
  },
  getSellers: async (): Promise<GetSellersResponse[]> => {
    const response = await api.get("/employees/sellers");
    return response.data;
  },
};

export const statsService = {
  getSellerReport: async (): Promise<SellerReportStats> => {
    const response = await api.get("/stats/seller-report");
    return response.data;
  },
  getNegativeInventoryReport:
    async (): Promise<NegativeInventoryReportStats> => {
      const response = await api.get("/stats/negative-inventory");
      return response.data;
    },
  getActualCustomerDebtReport:
    async (): Promise<ActualCustomerDebtReportStats> => {
      const response = await api.get("/stats/actual-customer-debt");
      return response.data;
    },
  getReturnedOrdersReport: async (): Promise<ReturnedOrdersReportStats> => {
    const response = await api.get("/stats/returned-orders");
    return response.data;
  },
  getReturnedProductsReport: async (): Promise<ReturnedProductsReportStats> => {
    const response = await api.get("/stats/returned-products");
    return response.data;
  },
  getInactiveCustomersReport:
    async (): Promise<InactiveCustomersReportStats> => {
      const response = await api.get("/stats/inactive-customers");
      return response.data;
    },
  getCustomersWithoutPurchaseReport:
    async (): Promise<CustomersWithoutPurchaseReportStats> => {
      const response = await api.get("/stats/customers-without-purchase");
      return response.data;
    },
  getProductKardex: async (
    query: QueryProductKardexDto
  ): Promise<GetProductKardexResponse> => {
    const response = await api.get("/stats/product-kardex", {
      params: {
        ...query,
      },
    });
    return response.data;
  },
};

export const receivingService = {
  getReceivings: async (
    query: QueryReceivingDto,
    warehouseId: string
  ): Promise<ReceivingListResponse> => {
    const response = await api.get(`/receivings/warehouse/${warehouseId}`, {
      params: {
        ...query,
      },
    });
    return response.data;
  },
  getReceivingById: async (receivingId: string): Promise<Receiving> => {
    const response = await api.get(`/receivings/${receivingId}`);
    return response.data;
  },
};

export const logService = {
  getLogs: async (query: QueryLogDto): Promise<LogListResponse> => {
    const response = await api.get("/logs", {
      params: {
        ...query,
      },
    });
    return response.data;
  },
  getLogById: async (logId: string): Promise<Log> => {
    const response = await api.get(`/logs/${logId}`);
    return response.data;
  },
};

export const publicService = {
  getProducts: async (
    query: QueryPublicDto
  ): Promise<PublicProductListResponse> => {
    const response = await api.get("/public/products", {
      params: {
        ...query,
      },
    });
    return response.data;
  },
  getProductById: async (productId: string): Promise<PublicProductDetails> => {
    const response = await api.get(`/public/products/${productId}`);
    return response.data;
  },
  getSpecialProducts: async (
    query: QueryPublicDto
  ): Promise<PublicProductListResponse> => {
    const response = await api.get("/public/special-products", {
      params: {
        ...query,
      },
    });
    return response.data;
  },
};

export const cartService = {
  getMyCart: async (): Promise<GetMyCartResponse> => {
    const response = await api.get("/cart");
    return response.data;
  },
  addCartItem: async (dto: AddCartItemDto): Promise<AddCartItemResponse> => {
    const response = await api.post("/cart/items", dto);
    return response.data;
  },
  updateCartItem: async (
    dto: UpdateCartItemDto
  ): Promise<UpdateCartItemResponse> => {
    const response = await api.patch("/cart/items", dto);
    return response.data;
  },
  removeCartItem: async (cartItemId: string): Promise<void> => {
    await api.delete(`/cart/items/${cartItemId}`);
  },
  clearCart: async (): Promise<void> => {
    await api.delete("/cart");
  },
  checkout: async (dto: CheckoutCartDto): Promise<CheckoutCartResponse> => {
    const response = await api.post("/cart/checkout", dto);
    return response.data;
  },
};

export const accountantsService = {
  createCheck: async (dto: CreateCheckDto): Promise<CreateCheckResponse> => {
    const response = await api.post("/accountants/checks", dto);
    return response.data;
  },
  getChecks: async (query: QueryCheckDto): Promise<CheckListResponse> => {
    const response = await api.get("/accountants/checks", { params: query });
    return response.data;
  },
  getCheckById: async (checkId: string): Promise<CheckDetailsResponse> => {
    const response = await api.get(`/accountants/checks/${checkId}`);
    return response.data;
  },
  changeCheckStatus: async (checkId: string, status: string): Promise<void> => {
    await api.patch(`/accountants/checks/${checkId}/status`, { status });
  },
  deleteCheck: async (checkId: string): Promise<void> => {
    await api.delete(`/accountants/checks/${checkId}`);
  },
};

export const reminderService = {
  createReminder: async (
    dto: CreateReminderDto
  ): Promise<CreateReminderResponse> => {
    const response = await api.post("/reminders", dto);
    return response.data;
  },
  getReminders: async (
    query: QueryReminderDto
  ): Promise<ReminderListResponse> => {
    const response = await api.get("/reminders", { params: query });
    return response.data;
  },
  getReminderById: async (reminderId: string): Promise<ReminderDetails> => {
    const response = await api.get(`/reminders/${reminderId}`);
    return response.data;
  },
};

export const favoriteService = {
  addFavoriteProduct: async (
    dto: AddFavoriteProductDto
  ): Promise<AddFavoriteProductResponse> => {
    const response = await api.post("/product-favorites/toggle", dto);
    return response.data;
  },
  getFavoriteProducts: async (): Promise<GetFavoriteProductsResponse> => {
    const response = await api.get("/product-favorites");
    return response.data;
  },
};

export const fileService = {
  uploadFiles: async (files: File[]): Promise<FileUploadResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post("/files", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default api;
