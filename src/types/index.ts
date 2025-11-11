export interface LoginRequest {
  mobile: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface WalletHistory {
  id: string;
  wallet_id: string;
  old_wallet: any;
  new_wallet: any;
  employee_id: string | null;
  by_system: boolean;
  change_type: string | null;
  balance_before: number | null;
  balance_after: number | null;
  balance_diff: number | null;
  credit_before: number | null;
  credit_after: number | null;
  related_payment_id: string | null;
  related_invoice_id: string | null;
  reason: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  wallet?: {
    id: string;
    customer_id: string | null;
    balance: number;
    credit_cap: number;
    description: string | null;
    initial_balance: number | null;
    customer?: {
      id: string;
      title: string | null;
      code: number;
    };
  };
  employee?: {
    id: string;
    kid: string;
    profile: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      email: string | null;
    };
  };
  payment?: {
    id: string;
    code: number;
    amount: number;
    method: string;
  };
  invoice?: {
    id: string;
    code: number;
    amount: number;
    payment_status: string;
  };
}

export interface OrderHistory {
  id: string;
  order_id: string | null;
  old_order: any;
  new_order: any;
  employee_id: string | null;
  by_system: boolean;
  change_type: string | null;
  step_before: string | null;
  step_after: string | null;
  payment_status_before: string | null;
  payment_status_after: string | null;
  fulfilled_before: boolean | null;
  fulfilled_after: boolean | null;
  archived_before: boolean | null;
  archived_after: boolean | null;
  delivery_date_before: string | null;
  delivery_date_after: string | null;
  delivery_method_before: string | null;
  delivery_method_after: string | null;
  seller_id_before: string | null;
  seller_id_after: string | null;
  deleted_changed: boolean;
  reason: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PaymentHistory {
  id: string;
  payment_id: string;
  old_payment: any;
  new_payment: any;
  employee_id: string | null;
  by_system: boolean;
  change_type: string | null;
  amount_before: number | null;
  amount_after: number | null;
  amount_diff: number | null;
  method_before: string | null;
  method_after: string | null;
  date_before: string | null;
  date_after: string | null;
  deleted_changed: boolean;
  reason: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  payment?: {
    id: string;
    code: number;
    amount: number;
    method: string;
    customer?: {
      id: string;
      title: string;
      code: number;
    };
  };
  employee?: {
    id: string;
    kid: string;
    profile: {
      id: string;
      first_name: string | null;
      last_name: string | null;
    };
  };
}

export interface InvoiceHistory {
  id: string;
  invoice_id: string | null;
  old_invoice: any;
  new_invoice: any;
  employee_id: string | null;
  by_system: boolean;
  change_type: string | null;
  amount_before: number | null;
  amount_after: number | null;
  amount_diff: number | null;
  payment_status_before: string | null;
  payment_status_after: string | null;
  due_date_before: string | null;
  due_date_after: string | null;
  date_before: string | null;
  date_after: string | null;
  type_before: string | null;
  type_after: string | null;
  seller_id_before: string | null;
  seller_id_after: string | null;
  driver_id_before: string | null;
  driver_id_after: string | null;
  deleted_changed: boolean;
  reason: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  invoice?: {
    id: string;
    code: number;
    customer?: {
      id: string;
      title: string;
      code: number;
    };
  };
  employee?: {
    id: string;
    kid: string;
    profile: {
      id: string;
      first_name: string | null;
      last_name: string | null;
    };
  };
}

export interface CargoHistory {
  id: string;
  cargo_id: string | null;
  old_cargo: any;
  new_cargo: any;
  employee_id: string | null;
  by_system: boolean;
  change_type: string | null;
  driver_id_before: string | null;
  driver_id_after: string | null;
  truck_id_before: string | null;
  truck_id_after: string | null;
  warehouse_id_before: string | null;
  warehouse_id_after: string | null;
  date_before: string | null;
  date_after: string | null;
  reason: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  cargo?: {
    id: string;
    code: number;
    status: string;
    driver?: {
      id: string;
      name: string;
    };
    truck?: {
      id: string;
      plate_number: string;
    };
    warehouse?: {
      id: string;
      name: string;
    };
  };
  employee?: {
    id: string;
    kid: string;
    profile: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      email: string | null;
    };
  };
}

export interface CustomerRequest {
  id: string;
  code: number;
  status: string;
  payment_method: string;
  total_price: number | null;
  created_at: string;
  freight_cost: number;
  total_items: number;
  customer: {
    id: string;
    title: string | null;
    code: number;
    phone: string | null;
    address: string | null;
  };
  representative_name: string | null;
}

export interface CustomerRequestDetails {
  id: string;
  code: number;
  status: string;
  payment_method: string;
  total_price: number | null;
  created_at: string;
  freight_cost: number;
  address: string | null;
  representative_name: string | null;
  orders: {
    id: string;
    step: string;
    created_at: string;
    delivery_date: string | null;
    delivery_method: string;
    payment_status: string;
    address: string | null;
    ordered_basket: {
      product_id: string;
      product_title: string;
      product_code: string;
      online_price: number;
      weight: number;
      price: number;
      fulfilled: boolean;
      fulfilled_weight: number;
      returned_weight: number;
      sec_unit_amount: number;
      cancelled_weight: number;
      inventory_net_weight: number;
    }[];
  }[];
  customer: {
    id: string;
    title: string | null;
    code: number;
    phone: string | null;
    address: string | null;
  };
  request_items: {
    product_id: string;
    product_title: string;
    product_code: string;
    weight: number;
    online_price: number | null;
    total_price: number | null;
  }[];
}

export interface Warehouse {
  id: string;
  name: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  address: string;
  manager_id: string;
  branch_id: string;
  deleted: boolean;
  are_prices_updated: boolean;
  code: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  branch: {
    id: string;
    name: string;
    locked: boolean;
    address: string;
    manager_id: string;
    are_prices_updated: true;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  manager: {
    profile: {
      id: string;
      first_name: string;
      last_name: string;
    };
  };
}

export const TemperatureTypeEnumValues = {
  HOT: "HOT",
  COLD: "COLD",
} as const;

export type TemperatureTypeEnum =
  (typeof TemperatureTypeEnumValues)[keyof typeof TemperatureTypeEnumValues];

export interface Category {
  id: string;
  title: string;
  code: number;
  priority: number;
  parent_id: string | null;
  warehouse_id: string;
  temperature_type?: TemperatureTypeEnum | null;
  parent?: Category;
  children?: Category[];
}

export interface Product {
  id: string;
  title: string;
  code: number;
  description: string | null;
  net_weight: number;
  gross_weight: number;
  retail_price: number;
  wholesale_price: number;
  online_price: number;
  warehouse_id: string;
  category_ids: string[];
  deleted: boolean;
  locked: boolean;
  is_special?: boolean;
  is_online?: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  categories?: Category[];
  warehouse?: Warehouse;
}

export interface UpdateProductRequest {
  image_ids?: string[];
  description?: string;
  is_special?: boolean;
  is_online?: boolean;
}

export interface FileUploadResponse {
  id: string;
  name: string;
  type: string;
  size: number;
}

export interface Customer {
  id: string;
  title: string;
  type: string;
  category: string;
  is_property_owner: boolean;
  did_we_contact: boolean;
  phone: string;
  address: string;
  age: number;
  credibility_by_seller: string;
  credibility_by_sales_manager: string;
  behavior_tags: string[];
  national_id: string;
  branch_id: string;
  seller_id: string;
  support_id: string;
  capillary_sales_line_id: string;
  deleted: boolean;
  chat_id: string | null;
  description: string;
  locked: false;
  location: {
    type: string;
    coordinates: [number, number];
  };
  code: number;
  status: string | null;
  status_history: any[];
  hp_code: number;
  hp_title: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  people: {
    id: string;
    profile_id: string;
    title: string;
    deleted: boolean;
    locked: boolean;
    branch_id: string;
    kid: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    profile: {
      id: string;
      kid: string;
      first_name: string;
      last_name: string;
      email: string | null;
      mobile: string;
      mobile_prefix: string;
      mobile_country_code: string;
      mobile_verified: boolean;
      enabled: boolean;
      gender: string;
      groups: string[];
      clients: string[];
      username: string;
      national_code: string | null;
      timestamps: any[];
      roles: {
        id: string;
        title: string;
        client_id: string;
      }[];
      third_party_provider: string | null;
      is_verified_via_third_party: boolean;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
      birth_date: string | null;
    };
  }[];
  seller: {
    id: string;
    profile: {
      id: string;
      first_name: string;
      last_name: string;
      kid: string;
    };
  };
  support: {
    id: string;
    profile: {
      id: string;
      first_name: string;
      last_name: string;
      kid: string;
    };
  };
  capillary_sales_line: {
    id: string;
    line_number: number;
    title: string;
    description: string;
    branch_id: string;
    deleted: boolean;
    locked: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  representative_name: string;
}

export interface Employee {
  id: string;
  profile_id: string;
  kid: string;
  deleted: boolean;
  locked: boolean;
  roles: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  profile: {
    id: string;
    kid: string;
    first_name: string;
    last_name: string;
  };
  capillary_sales_lines: {
    id: string;
    title: string;
  }[];
  branches: {
    id: string;
    name: string;
  }[];
}

export interface SellerReportStats {
  report: {
    seller_id: string;
    seller_name: string;
    total_calls: number;
    successful_calls: number;
    failed_calls: number;
    successful_orders: number;
    failed_orders: number;
    delivered_orders: number;
    failed_order_reasons: string[];
    total_sales_amount: number;
    average_order_amount: number;
    highest_order_amount: number;
    lowest_order_amount: number;
    conversion_rate: number;
    finalization_rate: number;
    total_weight_sold: number;
    average_weight_per_order: number;
    unique_customers: number;
    new_customers: number;
    returning_customers: number;
    total_product_items: number;
    top_products: {
      product_title: string;
      total_weight: number;
      total_amount: number;
      order_count: number;
    }[];
    top_categories: {
      category_title: string;
      total_weight: number;
      total_amount: number;
    }[];
    performance_score: number;
  }[];
  generated_at: string;
  filters: {
    period: string;
    seller_id: string;
    from: string;
    to: string;
  };
}

export interface NegativeInventoryReportStats {
  total_products: number;
  report: {
    product_id: string;
    product_code: number;
    product_title: string;
    net_weight: number;
    gross_weight: number;
    sec_unit_amount: number;
    box_weight: number;
    categories: string;
    retail_price: number;
    wholesale_price: number;
  }[];
  generated_at: string;
  branch: string;
}

export interface ActualCustomerDebtReportStats {
  total_customers: number;
  totals: {
    total_accounting_debt: number;
    total_pending_cheques: number;
    total_actual_debt: number;
  };
  report: {
    customer_id: string;
    customer_code: number;
    customer_title: string;
    accounting_debt: number;
    pending_cheques_count: number;
    pending_cheques_total: number;
    actual_debt: number;
    pending_cheques_detail: {
      payment_id: string;
      amount: number;
      cheque_due_date?: string | null;
      date: string;
    }[];
  }[];
  generated_at: string;
  branch: string;
}

export interface ReturnedOrdersReportStats {
  summary: {
    total_orders: number;
    fully_returned_count: number;
    partially_returned_count: number;
    total_returned_weight: number;
    total_returned_amount: number;
    average_return_percentage: number;
  };
  report: ReturnedOrderReportItem[];
  generated_at: string;
  branch: string;
  filters: {
    from: string | null;
    to: string | null;
  };
}

export interface ReturnedOrderReportItem {
  order_id: string;
  order_code: number;
  order_step: string;
  created_date: string;
  delivery_date: string;
  customer_id: string;
  customer_code: number;
  customer_title: string;
  seller_id: string;
  seller_name: string;
  person_name: string;
  person_mobile: string;
  total_ordered_weight: number;
  total_returned_weight: number;
  total_returned_amount: number;
  return_percentage: number;
  returned_products_count: number;
  returned_products: ReturnedProduct[];
}

export interface ReturnedProduct {
  product_id: string;
  product_code: number;
  product_title: string;
  ordered_weight: number;
  fulfilled_weight: number;
  returned_weight: number;
  price: number;
  returned_amount: number;
}

export interface ReturnedProductsReportStats {
  summary: {
    total_unique_products: number;
    total_return_incidents: number;
    total_returned_weight: number;
    total_returned_amount: number;
    average_return_percentage: number;
    top_5_products: {
      product_title: string;
      returned_weight: number;
    }[];
  };
  report: {
    product_id: string;
    product_code: number;
    product_title: string;
    categories: string;
    total_return_count: number;
    total_returned_weight: number;
    total_ordered_weight: number;
    total_fulfilled_weight: number;
    total_returned_amount: number;
    return_percentage: number;
    avg_price: number;
    affected_orders_count: number;
    affected_customers_count: number;
    current_net_weight: number;
    current_gross_weight: number;
  }[];
  generated_at: string;
  branch: string;
  filters: {
    from: string | null;
    to: string | null;
  };
}

export interface InactiveCustomersReportStats {
  summary: InactiveCustomersSummary;
  report: InactiveCustomerReportItem[];
  generated_at: string;
  branch: string;
  filters: InactiveCustomersFilters;
}

export interface InactiveCustomersSummary {
  total_inactive_customers: number;
  total_lost_revenue: number;
  avg_customer_value: number;
  avg_days_inactive: number;
  risk_breakdown: {
    high: number;
    medium: number;
    low: number;
  };
  top_5_valuable_customers: {
    customer_title: string;
    total_spent: number;
    days_inactive: number;
  }[];
}

export interface InactiveCustomerReportItem {
  customer_id: string;
  customer_code: number;
  customer_title: string;
  customer_category: string;
  customer_phone: string | null;
  customer_address: string;
  seller_name: string;
  total_purchases: number;
  total_spent: number;
  avg_order_value: number;
  first_purchase_date: string;
  last_purchase_date: string;
  days_since_last_purchase: number;
  customer_lifetime_days: number;
  purchase_frequency: number;
  risk_level: string;
}

export interface InactiveCustomersFilters {
  min_purchases: number;
  inactive_days: number;
  cutoff_date: string;
}

export interface CustomersWithoutPurchaseReportStats {
  summary: CustomersWithoutPurchaseSummary;
  report: CustomersWithoutPurchaseItem[];
  generated_at: string;
  branch: string;
}

export interface CustomersWithoutPurchaseSummary {
  total_customers_without_purchase: number;
  never_contacted: number;
  contacted_no_purchase: number;
  total_failed_attempts: number;
  avg_days_since_registration: number;
  top_5_not_purchased_reasons: string[];
  oldest_registered: OldestRegisteredCustomer[];
}

export interface OldestRegisteredCustomer {
  customer_title: string;
  days_since_registration: number;
  total_contacts: number;
}

export interface CustomersWithoutPurchaseItem {
  customer_id: string;
  customer_code: number;
  customer_title: string;
  customer_category: string;
  customer_type: string;
  customer_phone: string | null;
  customer_address: string;
  seller_name: string;
  registered_date: string;
  days_since_registration: number;
  total_contacts: number;
  failed_orders: number;
  last_contact_date: string | null;
  days_since_last_contact: number | null;
  most_common_not_purchased_reason: string | null;
  all_not_purchased_reasons: Record<string, number>;
  status: string;
}

// Order Types
export interface OrderSettlement {
  date: string;
  method: string;
  description: string | null;
}

export interface OrderCustomer {
  id: string;
  title: string;
  type: string;
  category: string;
  is_property_owner: boolean;
  did_we_contact: boolean;
  phone: string;
  address: string;
  age: number;
  credibility_by_seller: string;
  credibility_by_sales_manager: string;
  behavior_tags: string[];
  national_id: string;
  branch_id: string;
  seller_id: string;
  support_id: string;
  capillary_sales_line_id: string;
  deleted: boolean;
  chat_id: string | null;
  description: string;
  locked: boolean;
  location: {
    type: string;
    coordinates: [number, number];
  };
  code: number;
  status: string | null;
  status_history: any[];
  hp_code: number;
  hp_title: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  people: OrderPerson[];
}

export interface OrderPerson {
  id: string;
  profile_id: string;
  title: string;
  deleted: boolean;
  locked: boolean;
  branch_id: string;
  kid: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  profile: {
    first_name: string;
    last_name: string;
  };
}

export interface OrderSeller {
  id: string;
  profile: {
    id: string;
    kid: string;
    first_name: string;
    last_name: string;
  };
}

export interface OrderPersonDetail {
  id: string;
  profile_id: string;
  title: string;
  deleted: boolean;
  locked: boolean;
  branch_id: string;
  kid: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  profile: {
    id: string;
    kid: string;
    first_name: string;
    last_name: string;
    email: string | null;
    mobile: string;
    mobile_prefix: string;
    mobile_country_code: string;
    mobile_verified: boolean;
    enabled: boolean;
    gender: string;
    groups: string[];
    clients: string[];
    username: string;
    national_code: string | null;
    timestamps: any[];
    roles: any[];
    third_party_provider: string | null;
    is_verified_via_third_party: boolean | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    birth_date: string | null;
  };
}

export interface Order {
  id: string;
  code: number;
  customer_id: string;
  did_we_contact: boolean;
  new_customer: boolean;
  person_id: string;
  answered: boolean;
  call_duration: number;
  bought: boolean;
  not_purchased_reason: string | null;
  settlements: OrderSettlement[];
  delivery_date: string;
  consumption_time: string | null;
  created_date: string;
  delivery_method: string;
  location: any | null;
  behavior_tags: string[];
  description: string | null;
  seller_id: string;
  visitor_id: string | null;
  warehouse_id: string;
  payment_status: string;
  order_creator_id: string;
  archived: boolean;
  step: string;
  address: string;
  day_index: number;
  fulfilled: boolean;
  branch_id: string;
  in_person_order: boolean;
  follow_up_id: string | null;
  hp_invoice_code: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  customer_request_id: string | null;
  customer: OrderCustomer;
  seller: OrderSeller;
  person: OrderPersonDetail;
  representative_name: string;
}

export interface QueryOrderDto {
  page?: number;
  "page-size"?: number;
  search?: string;
  customer_id?: string;
  seller_id?: string;
  step?: string;
  payment_status?: string;
  delivery_method?: string;
  bought?: boolean;
  fulfilled?: boolean;
  archived?: boolean;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// Order Details Types
export interface OrderBasketItem {
  price: number;
  weight: number;
  fulfilled_weight?: number;
  cancelled_weight?: number;
  inventory_net_weight?: number;
  fulfilled?: boolean;
  product_title: string;
  product_id: string;
  product_code: number;
  online_price: number;
  retail_price: number;
  wholesale_price: number;
  sec_unit_amount: number;
}

export interface FailedBasketItem {
  price: number;
  weight: number;
  reason: string;
  product_title: string;
  product_id: string;
  product_code: number;
  online_price: number;
  retail_price: number;
  wholesale_price: number;
  locked: boolean;
}

export interface CargoProduct {
  product_id: string;
  product_title: string;
  product_code: number;
  net_weight: number;
  box_weight: number;
  gross_weight: number;
  sec_unit_amount: number;
  online_price: number;
  retail_price: number;
  wholesale_price: number;
}

export interface OrderCargo {
  id: string;
  description: string;
  code: number;
  type: string;
  date: string;
  delivery_method: string;
  truck_license_plate?: string;
  truck_driver?: {
    first_name: string;
    last_name: string;
  };
  employee_id: string;
  employee: any;
  products: CargoProduct[];
  created_at: string;
  created_date: string;
}

export interface OrderDetails {
  id: string;
  code: number;
  customer_id: string;
  did_we_contact: boolean;
  new_customer: boolean;
  person_id: string;
  answered: boolean;
  call_duration: number;
  bought: boolean;
  not_purchased_reason?: string;
  settlements?: OrderSettlement[];
  delivery_date: string;
  consumption_time?: string;
  created_date: string;
  delivery_method: string;
  location?: any;
  behavior_tags: string[];
  description?: string;
  seller_id: string;
  visitor_id?: string;
  warehouse_id: string;
  payment_status: string;
  order_creator_id: string;
  archived: boolean;
  step: string;
  address: string;
  day_index: number;
  fulfilled: boolean;
  branch_id: string;
  in_person_order: boolean;
  follow_up_id?: string;
  hp_invoice_code?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  customer_request_id?: string;
  customer: OrderCustomer;
  seller: OrderSeller;
  person: OrderPersonDetail;
  representative_name: string;
  ordered_basket: OrderBasketItem[];
  failed_basket: FailedBasketItem[];
  cargos: OrderCargo[];
  creator?: {
    id: string;
    profile: {
      first_name: string;
      last_name: string;
    };
  };
}

export interface TicketListItem {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  customer: {
    id: string;
    title: string;
    code: number;
    type: string;
    category: string;
    capillary_sales_line: {
      id: string;
      line_number: number;
      title: string;
    };
  };
  creator_person: {
    id: string;
    profile: {
      first_name: string;
      last_name: string;
    };
  } | null;
  assigned_to: {
    id: string;
    profile: {
      id: string;
      kid: string;
      first_name: string;
      last_name: string;
    };
  } | null;
  messages_count: number;
  last_message: {
    id: string;
    sender_type: string;
    message: string;
    created_at: string;
    sender_profile: {
      id: string;
      kid: string;
      first_name: string;
      last_name: string;
    };
  } | null;
}

export interface TicketListResponse {
  count: number;
  page: number;
  page_size: number;
  data: TicketListItem[];
}

export interface TicketDetails {
  id: string;
  customer_id: string;
  creator_person_id: string;
  subject: string;
  status: string;
  priority: string;
  assigned_to_id: string | null;
  closed_at: string | null;
  deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  customer: {
    id: string;
    title: string;
    code: number;
    type: string;
    category: string;
    capillary_sales_line: {
      id: string;
      line_number: number;
      title: string;
    };
  };
  creator_person: {
    id: string;
    profile: {
      id: string;
      kid: string;
      first_name: string;
      last_name: string;
    };
  } | null;
  assigned_to: {
    id: string;
    profile: {
      id: string;
      kid: string;
      first_name: string;
      last_name: string;
    };
  } | null;
  attachments: FileSummary[];
}

export interface FileSummary {
  id: string;
  url: string;
  thumbnail: string;
}

export interface TicketMessageListItem {
  id: string;
  ticket_id: string;
  sender_type: string;
  employee_id: string | null;
  person_id: string | null;
  message: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  employee: {
    id: string;
    profile: {
      id: string;
      kid: string;
      first_name: string;
      last_name: string;
    };
  } | null;
  person: {
    id: string;
    profile: {
      id: string;
      kid: string;
      first_name: string;
      last_name: string;
    };
  } | null;
  attachments: FileSummary[];
}

export interface TicketMessageResponse {
  count: number;
  data: TicketMessageListItem[];
}

export interface QueryTicketDto {
  page?: number;
  "page-size"?: number;
  last_sender_type?: string;
  sort_by?: "last_message" | "updated_at";
  sort_order?: "asc" | "desc";
  created_at_min?: string;
  created_at_max?: string;
  deleted?: boolean;
  customer_id?: string;
  person_id?: string;
  creator_person_id?: string;
  employee_id?: string;
  assigned_to_id?: string;
  status?: string;
  priority?: string;
  search?: string;
}

export interface ReplyTicketDto {
  message: string;
  attachment_ids?: string[];
}

export interface TicketCreatedResponse {
  ticket: {
    id: string;
    subject: string;
    priority: string;
    assigned_to_id: string | null;
    closed_at: string | null;
    deleted: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  message: {
    message: string;
    sender_type: string;
    created_at: string;
  };
  attachments: FileSummary[];
}

export interface TicketRepliedResponse {
  ticket: {
    id: string;
    status: string;
  };
  message: {
    id: string;
    message: string;
    sender_type: string;
    created_at: string;
    attachments: FileSummary[];
    employee_id?: string | null;
    person_id?: string | null;
    employee?: {
      id: string;
      profile: {
        id: string;
        kid: string;
        first_name: string;
        last_name: string;
      };
    } | null;
    person?: {
      id: string;
      profile: {
        id: string;
        kid: string;
        first_name: string;
        last_name: string;
      };
    } | null;
  };
}

export interface TicketStatusEnum {
  OPEN: "OPEN";
  CLOSED: "CLOSED";
  RESOLVED: "RESOLVED";
  REOPENED: "REOPENED";
  WAITING_CUSTOMER: "WAITING_CUSTOMER";
  WAITING_SUPPORT: "WAITING_SUPPORT";
}

export interface QueryWalletHistoryDto {
  page?: number;
  "page-size"?: number;
  wallet_id?: string;
  employee_id?: string;
  customer_id?: string;
  change_type?: string;
  by_system?: boolean;
  related_payment_id?: string;
  related_invoice_id?: string;
  sort_by?: "created_at";
  sort_order?: "asc" | "desc";
  created_at_min?: string;
  created_at_max?: string;
  deleted?: boolean;
}

export interface QueryPaymentHistoryDto {
  page?: number;
  "page-size"?: number;
  payment_id?: string;
  employee_id?: string;
  customer_id?: string;
  change_type?: string;
  by_system?: boolean;
  deleted_changed?: boolean;
  related_payment_id?: string;
  related_invoice_id?: string;
  sort_by?: "created_at";
  sort_order?: "asc" | "desc";
  created_at_min?: string;
  created_at_max?: string;
}

export interface QueryInvoiceHistoryDto {
  page?: number;
  "page-size"?: number;
  invoice_id?: string;
  employee_id?: string;
  change_type?: string;
  payment_status_after?: string;
  type_after?: string;
  by_system?: boolean;
  deleted_changed?: boolean;
  related_payment_id?: string;
  related_invoice_id?: string;
  sort_by?: "created_at";
  sort_order?: "asc" | "desc";
  created_at_min?: string;
  created_at_max?: string;
}

export interface QueryOrderHistoryDto {
  order_id?: string;
  employee_id?: string;
  change_type?: string;
  step_after?: string;
  by_system?: boolean;
  deleted_changed?: boolean;
  related_payment_id?: string;
  related_invoice_id?: string;
  sort_by?: "created_at";
  sort_order?: "asc" | "desc";
  created_at_min?: string;
  created_at_max?: string;
  page?: number;
  "page-size"?: number;
}

export interface QueryCargoHistoryDto {
  cargo_id?: string;
  employee_id?: string;
  change_type?: string;
  deleted_changed?: boolean;
  sort_by?: "created_at";
  sort_order?: "asc" | "desc";
  page?: number;
  "page-size"?: number;
  by_system?: boolean;
  created_at_min?: string;
  created_at_max?: string;
}

export interface ProfileListItem {
  id: string;
  first_name: string;
  last_name: string;
  mobile: string;
  username: string;
  enabled: boolean;
}

export interface ProfileListResponse {
  success: boolean;
  count: number;
  msg: string;
  data: ProfileListItem[];
}

export interface ProfileDetails {
  id: string;
  kid: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  national_code: string;
  username: string;
  enabled: boolean;
  groups: {
    id: string;
    name: string;
    path: string;
  }[];
  clients: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  birth_date: string | null;
  roles: {
    id: string;
    title: string;
    client_id: string;
  }[];
  gender: string;
  mobile_prefix: string;
  mobile_country_code: string;
  mobile_verified: boolean;
  timestamps: string[];
  third_party_provider: string | null;
  is_verified_via_third_party: boolean | null;
  person?: {
    id: string;
    title: string;
    branch_id: string | null;
  } | null;
  employee?: {
    id: string;
    profile_id: string;
    kid: string;
  } | null;
}

export interface ProfileDetailsResponse {
  success: boolean;
  count: number;
  msg: string;
  data: [ProfileDetails];
}

export interface ClientListItem {
  id: string;
  clientId: string;
  name: string;
  description: string;
  surrogateAuthRequired: boolean;
  enabled: boolean;
  alwaysDisplayInConsole: boolean;
  clientAuthenticatorType: string;
  secret: string;
  redirectUris: string[];
  webOrigins: string[];
  notBefore: number;
  bearerOnly: boolean;
  consentRequired: boolean;
  standardFlowEnabled: boolean;
  implicitFlowEnabled: boolean;
  directAccessGrantsEnabled: boolean;
  serviceAccountsEnabled: boolean;
  authorizationServicesEnabled: boolean;
  publicClient: boolean;
  frontchannelLogout: boolean;
  protocol: string;
  attributes: Record<string, string>;
  authenticationFlowBindingOverrides: object;
  fullScopeAllowed: boolean;
  nodeReRegistrationTimeout: number;
  protocolMappers: {
    id: string;
    name: string;
    protocol: string;
    protocolMapper: string;
    consentRequired: boolean;
    config: Record<string, string>;
  }[];
  defaultClientScopes: string[];
  optionalClientScopes: string[];
  access: {
    view: boolean;
    configure: boolean;
    manage: boolean;
  };
}

export interface ClientListResponse {
  success: boolean;
  count: number;
  msg: string;
  data: ClientListItem[];
}

export interface GroupsListWithClientIdResponse {
  success: boolean;
  count: number;
  msg: string;
  data: {
    id: string;
    name: string;
  }[];
}

export interface GroupsListItem {
  id: string;
  name: string;
  path: string;
  attributes: {
    client: string[];
  };
  realmRoles: string[];
  clientRoles: Record<string, string[]>;
  subGroups: any[];
  access: {
    view: boolean;
    manage: boolean;
    manageMembership: boolean;
  };
  roles: {
    id: string;
    name: string;
    description?: string;
  }[];
  clientId: string;
}

export interface GroupsListResponse {
  success: boolean;
  count: number;
  msg: string;
  data: GroupsListItem[];
}

export interface InvoiceListItem {
  id: string;
  customer_id: string;
  seller_id: string;
  order_id: string;
  code: number;
  amount: number;
  due_date: string;
  payment_status: string;
  warehouse_id: string;
  wallet_id: string;
  cargo_id: string;
  driver_id: string | null;
  deleted: boolean;
  date: string;
  description: string | null;
  type: string;
  receiving_id: string | null;
  hp_code: number | null;
  hp_title: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  order: {
    id: string;
    code: number;
    customer_id: string;
    did_we_contact: boolean;
    new_customer: boolean;
    person_id: string;
    answered: boolean;
    call_duration: number;
    bought: boolean;
    not_purchased_reason: string | null;
    settlements: {
      date: string;
      method: string;
      description: string;
    }[];
    delivery_date: string;
    consumption_time: string | null;
    created_date: string;
    delivery_method: string;
    location: {
      type: string;
      coordinates: any[];
    };
    behavior_tags: string[];
    description: string | null;
    seller_id: string;
    visitor_id: string | null;
    warehouse_id: string;
    payment_status: string;
    order_creator_id: string;
    archived: boolean;
    step: string;
    address: string;
    day_index: number;
    fulfilled: boolean;
    branch_id: string;
    in_person_order: boolean;
    follow_up_id: string | null;
    hp_invoice_code: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    customer_request_id: string | null;
  };
  customer: {
    id: string;
    title: string;
    type: string;
    category: string;
    is_property_owner: boolean;
    did_we_contact: boolean;
    phone: string;
    address: string;
    age: number;
    credibility_by_seller: string;
    credibility_by_sales_manager: string;
    behavior_tags: string[];
    national_id: string;
    branch_id: string;
    seller_id: string;
    support_id: string;
    capillary_sales_line_id: string;
    deleted: boolean;
    chat_id: string | null;
    description: string;
    locked: boolean;
    location: {
      type: string;
      coordinates: number[];
    };
    code: number;
    status: string | null;
    status_history: any[];
    hp_code: number;
    hp_title: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
}

export interface InvoiceListResponse {
  count: number;
  data: InvoiceListItem[];
}

export interface InvoiceById {
  id: string;
  customer_id: string;
  seller_id: string;
  order_id: string | null;
  code: number;
  amount: number;
  due_date: string;
  payment_status: string;
  warehouse_id: string;
  wallet_id: string;
  cargo_id: string | null;
  driver_id: string | null;
  deleted: boolean;
  date: string;
  description: string;
  type: string;
  receiving_id: string | null;
  hp_code: number | null;
  hp_title: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  cargo: {
    id: string;
    code: number;
    date: string;
    delivery_method: string;
    created_at: string;
    truck: {
      license_plate: string;
      driver: {
        first_name: string;
        last_name: string;
      };
    } | null;
  };
  customer: {
    id: string;
    title: string;
    code: number;
    phone: string;
    address: string;
  } | null;
  receiving: {
    id: string;
    date: string;
    license_plate: string;
    driver_name: string;
    employee_id: string;
    warehouse_id: string;
    code: number;
    source: string;
    customer_id: string;
    deleted: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  } | null;
  order: {
    id: string;
    code: number;
    customer_id: string;
    did_we_contact: boolean;
    new_customer: boolean;
    person_id: string;
    answered: boolean;
    call_duration: number;
    bought: boolean;
    not_purchased_reason: string | null;
    settlements: OrderSettlement[];
    delivery_date: string;
    consumption_time: string | null;
    created_date: string;
    delivery_method: string;
    location: {
      type: string;
      coordinates: number[];
    };
    behavior_tags: string[];
    description: string | null;
    seller_id: string;
    visitor_id: string | null;
    warehouse_id: string;
    payment_status: string;
    order_creator_id: string;
    archived: boolean;
    step: string;
    address: string;
    day_index: number;
    fulfilled: boolean;
    branch_id: string;
    in_person_order: boolean;
    follow_up_id: string | null;
    hp_invoice_code: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    customer_request_id: string | null;
  } | null;
  products: {
    price: number;
    net_weight: number;
    product_title: string;
    product_id: string;
  }[];
}

export interface QueryInvoiceDto {
  cargo_id?: string;
  customer_id?: string;
  seller_id?: string;
  warehouse_id?: string;
  order_id?: string;
  driver_id?: string;
  due_date_min?: string;
  due_date_max?: string;
  from?: string;
  to?: string;
  amount_min?: number;
  amount_max?: number;
  code?: number;
  hp_code?: number;
  hp_title?: string;
  date?: string;
  page?: number;
  "page-size"?: number;
}

export interface CustomerListItem {
  id: string;
  title: string;
  type: string;
  category: string;
  is_property_owner: boolean;
  did_we_contact: boolean;
  phone: string;
  address: string;
  age: number;
  credibility_by_seller: string;
  credibility_by_sales_manager: string;
  behavior_tags: string[];
  national_id: string;
  branch_id: string;
  seller_id: string;
  support_id: string;
  capillary_sales_line_id: string;
  deleted: boolean;
  chat_id: string | null;
  description: string;
  locked: boolean;
  location: {
    type: string;
    coordinates: number[];
  };
  code: number;
  status: string | null;
  status_history: any[];
  hp_code: number;
  hp_title: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  capillary_sales_line: {
    id: string;
    line_number: number;
    title: string;
    description: string;
    branch_id: string;
    deleted: boolean;
    locked: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  seller: {
    id: string;
    profile: {
      id: string;
      kid: string;
      first_name: string;
      last_name: string;
    };
  };
  people: {
    id: string;
    profile_id: string;
    title: string;
    deleted: boolean;
    locked: boolean;
    branch_id: string;
    kid: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    profile: {
      id: string;
      kid: string;
      first_name: string;
      last_name: string;
      mobile: string;
    };
  }[];
  representative_name: string;
  wallet: {
    id: string;
    customer_id: string;
    balance: number;
    credit_cap: number;
    description: string | null;
    initial_balance: number | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
}

export interface CustomerListResponse {
  count: number;
  data: CustomerListItem[];
}

export interface CustomerDetails {
  id: string;
  title: string;
  type: string;
  category: string;
  is_property_owner: boolean;
  did_we_contact: boolean;
  phone: string;
  address: string;
  age: number;
  credibility_by_seller: string;
  credibility_by_sales_manager: string;
  behavior_tags: string[];
  national_id: string;
  branch_id: string;
  seller_id: string;
  support_id: string;
  capillary_sales_line_id: string;
  deleted: boolean;
  chat_id: string | null;
  description: string;
  locked: boolean;
  location: {
    type: string;
    coordinates: [number, number];
  };
  code: number;
  status: string | null;
  status_history: any[];
  hp_code: number;
  hp_title: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  capillary_sales_line: {
    id: string;
    line_number: number;
    title: string;
    description: string;
    branch_id: string;
    deleted: boolean;
    locked: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };

  people: {
    id: string;
    profile_id: string;
    title: string;
    deleted: boolean;
    locked: boolean;
    branch_id: string;
    kid: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    profile: {
      id: string;
      kid: string;
      first_name: string;
      last_name: string;
      email: string | null;
      mobile: string;
      mobile_prefix: string;
      mobile_country_code: string;
      mobile_verified: boolean;
      enabled: boolean;
      gender: string;
      groups: string[];
      clients: string[];
      username: string;
      national_code: string | null;
      timestamps: string[];
      roles: {
        id: string;
        title: string;
        client_id: string;
      }[];
      third_party_provider: string | null;
      is_verified_via_third_party: boolean | null;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
      birth_date: string | null;
    };
  }[];
  seller: {
    id: string;
    profile: {
      id: string;
      first_name: string;
      last_name: string;
    };
  };
  wallet: {
    id: string;
    customer_id: string;
    balance: number;
    credit_cap: number;
    description: string | null;
    initial_balance: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  representative_name: string;
  files: FileSummary[];
}

export interface QueryCustomerDto {
  page?: number;
  "page-size"?: number;
  deleted?: boolean;
  branch?: string;
  locked?: boolean;
  created_at_min?: string;
  created_at_max?: string;
  code?: number;
  id?: string;
  person_id?: string;
  min_order_count?: number;
  lat?: string;
  long?: string;
  mobile?: string;
  title?: string;
  phone?: string;
  address?: string;
  hp_title?: string;
  category?: string;
  type?: string;
  credibility_by_seller?: string;
  credibility_by_sales_manager?: string;
}

export interface WalletDetails {
  id: string;
  balance: number;
  initial_balance: number;
  credit_cap: number;
  description: string | null;
  actual_balance?: number;
  actual_credit?: number;
  pending_cheques_total?: number;
  pending_cheques_count?: number;
  customer: {
    id: string;
    code: number;
    title: string;
    type: string;
    category: string;
  };
  payments?: any[];
  invoices?: any[];
}

export interface WalletListItem {
  id: string;
  customer_id: string;
  balance: number;
  initial_balance: number;
  credit_cap: number;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  customer: {
    id: string;
    code: number;
    title: string;
    type: string;
    category: string;
    capillary_sales_line: {
      id: string;
      line_number: number;
    };
  };
}

export interface WalletListResponse {
  count: number;
  data: WalletListItem[];
}

export interface QueryWalletDto {
  page?: number;
  "page-size"?: number;
  customer_id?: string;
}

export interface PaymentListItem {
  id: string;
  code: number;
  amount: number;
  description: string | null;
  customer_id: string;
  wallet_id: string;
  order_id: string | null;
  deleted: boolean;
  method: string;
  date: string;
  cheque_due_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PaymentListResponse {
  count: number;
  data: PaymentListItem[];
}

export interface PaymentDetails {
  id: string;
  code: number;
  amount: number;
  description: string | null;
  customer_id: string;
  wallet_id: string;
  order_id: string | null;
  deleted: boolean;
  method: string;
  date: string;
  cheque_due_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  customer: {
    id: string;
    title: string;
    type: "PERSONAL" | "ORGANIZATIONAL" | string;
    category: "WHOLESALER" | "RETAILER" | string;
    is_property_owner: boolean;
    did_we_contact: boolean;
    phone: string;
    address: string;
    age: number;
    credibility_by_seller: string;
    credibility_by_sales_manager: string;
    behavior_tags: string[];
    national_id: string;
    branch_id: string;
    seller_id: string;
    support_id: string;
    capillary_sales_line_id: string;
    deleted: boolean;
    chat_id: string | null;
    description: string | null;
    locked: boolean;
    location: {
      type: "Point";
      coordinates: [number, number];
    };
    code: number;
    status: string | null;
    status_history: any[];
    hp_code: number;
    hp_title: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
}

export interface QueryPaymentDto {
  page?: number;
  "page-size"?: number;
  customer_id?: string;
  wallet_id?: string;
  order_id?: string;
  method?: string;
  date_min?: string;
  date_max?: string;
}

export interface CustomerTransaction {
  customer: {
    id: string;
    title: string;
    type: string;
    category: string;
    is_property_owner: boolean;
    did_we_contact: boolean;
    phone: string;
    address: string;
    age: number;
    credibility_by_seller: string;
    credibility_by_sales_manager: string;
    behavior_tags: string[];
    national_id: string;
    branch_id: string;
    seller_id: string;
    support_id: string;
    capillary_sales_line_id: string;
    deleted: boolean;
    chat_id: string | null;
    description: string | null;
    locked: boolean;
    location: {
      type: string;
      coordinates: number[];
    };
    code: number;
    status: string | null;
    status_history: any[];
    hp_code: number;
    hp_title: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    wallet: {
      id: string;
      customer_id: string;
      balance: number;
      credit_cap: number;
      description: string;
      initial_balance: number;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    };
    people: {
      id: string;
      profile_id: string;
      title: string;
      deleted: boolean;
      locked: boolean;
      branch_id: string;
      kid: string;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
      profile: {
        id: string;
        kid: string;
        first_name: string;
        last_name: string;
        email: string | null;
        mobile: string;
        mobile_prefix: string;
        mobile_country_code: string;
        mobile_verified: boolean;
        enabled: boolean;
        gender: string;
        groups: string[];
        clients: string[];
        username: string;
        national_code: string | null;
        timestamps: any[];
        roles: any[];
        third_party_provider: string | null;
        is_verified_via_third_party: boolean | null;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
        birth_date: string | null;
      };
    }[];
    seller: {
      id: string;
      profile: {
        id: string;
        kid?: string;
        first_name: string;
        last_name: string;
      };
    };
    support: {
      id: string;
      profile: {
        id: string;
        first_name: string;
        last_name: string;
      };
    };
    branch: {
      id: string;
      name: string;
      locked: boolean;
      address: string;
      manager_id: string;
      are_prices_updated: boolean;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    };
    capillary_sales_line: {
      id: string;
      line_number: number;
      title: string;
      description: string;
      branch_id: string;
      deleted: boolean;
      locked: boolean;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    };
  };
  transactions: {
    id: string;
    code: number;
    amount: number;
    description?: string | null;
    method?: string;
    date: string;
    type: string;
    order_id?: string;
    order?: {
      id: string;
      code: number;
    };
    cargo_id?: string;
    cargo?: {
      id: string;
      date: string;
      truck_id: string;
      warehouse_id: string;
      description: string | null;
      code: number;
      order_id: string;
      type: string;
      delivery_method: string | null;
      employee_id: string;
      dispatch_cargo_id: string | null;
      deleted: boolean;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    };
    payment_status?: string;
    due_date?: string;
    created_at?: string;
    products?: {
      product_id: string;
      product_title: string;
      price: number;
      net_weight: number;
      amount: number;
      remaining?: number;
    }[];
    remaining: number;
  }[];
}

export interface CustomerTransactionDetaild {
  customer: {
    id: string;
    title: string;
    type: string;
    category: string;
    is_property_owner: boolean;
    did_we_contact: boolean;
    phone: string;
    address: string;
    age: number;
    credibility_by_seller: string;
    credibility_by_sales_manager: string;
    behavior_tags: string[];
    national_id: string;
    branch_id: string;
    seller_id: string;
    support_id: string;
    capillary_sales_line_id: string;
    deleted: boolean;
    chat_id: string | null;
    description: string | null;
    locked: boolean;
    location: {
      type: string;
      coordinates: number[];
    };
    code: number;
    status: string | null;
    status_history: any[];
    hp_code: number;
    hp_title: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    wallet: {
      id: string;
      customer_id: string;
      balance: number;
      credit_cap: number;
      description: string;
      initial_balance: number;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    };
    people: {
      id: string;
      profile_id: string;
      title: string;
      deleted: boolean;
      locked: boolean;
      branch_id: string;
      kid: string;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
      profile: {
        id: string;
        kid: string;
        first_name: string;
        last_name: string;
        email: string | null;
        mobile: string;
        mobile_prefix: string;
        mobile_country_code: string;
        mobile_verified: boolean;
        enabled: boolean;
        gender: string;
        groups: string[];
        clients: string[];
        username: string;
        national_code: string | null;
        timestamps: any[];
        roles: any[];
        third_party_provider: string | null;
        is_verified_via_third_party: boolean | null;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
        birth_date: string | null;
      };
    }[];
    seller: {
      id: string;
      profile: {
        id: string;
        kid: string;
        first_name: string;
        last_name: string;
      };
    };
    support: {
      id: string;
      profile: {
        id: string;
        first_name: string;
        last_name: string;
      };
    };
    branch: {
      id: string;
      name: string;
      locked: boolean;
      address: string;
      manager_id: string;
      are_prices_updated: boolean;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    };
    capillary_sales_line: {
      id: string;
      line_number: number;
      title: string;
      description: string;
      branch_id: string;
      deleted: boolean;
      locked: boolean;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    };
  };
  transactions: {
    id?: string;
    code?: number;
    amount?: number;
    description?: string | null;
    method?: string;
    date: string;
    type: string;
    remaining?: number;
    title?: string | null;
    product_id?: string;
    product_title?: string;
    price?: number;
    net_weight?: number;
  }[];
}

export interface QueryCustomerTransactionDto {
  "date-min"?: string;
  "date-max"?: string;
  view?: "detailed";
}

export interface CustomerDebtListResponse {
  count: number;
  metadata: {
    total_debt: number;
  };
  data: CustomerListItem[];
}

export interface CustomerByLastOrderListItem {
  id: string;
  title: string;
  hp_code: number;
  hp_title: string;
  code: number;
  category: string;
  type: string;
  representative_name: string;
  people: {
    id: string;
    profile_id: string;
    title: string;
    deleted: boolean;
    locked: boolean;
    branch_id: string;
    kid: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    profile: {
      id: string;
      kid: string;
      first_name: string;
      last_name: string;
      mobile: string;
    };
  }[];
  seller: {
    id: string;
    profile: {
      id: string;
      first_name: string;
      last_name: string;
      kid: string;
      mobile: string;
    };
  };
  support: {
    id: string;
    profile: {
      id: string;
      first_name: string;
      last_name: string;
      kid: string;
      mobile: string;
    };
  };
  wallet: {
    id: string;
    customer_id: string;
    balance: number;
    credit_cap: number;
    description: string | null;
    initial_balance: number | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  last_order: {
    id: string;
    code: number;
    customer_id: string;
    did_we_contact: boolean;
    new_customer: boolean;
    person_id: string;
    answered: boolean;
    call_duration: number;
    bought: boolean;
    not_purchased_reason: string | null;
    settlements: {
      date: string;
      method: string;
      description: string;
    }[];
    delivery_date: string;
    consumption_time: string | null;
    created_date: string;
    delivery_method: string;
    location: {
      type: string;
      coordinates: any[];
    };
    behavior_tags: string[];
    description: string;
    seller_id: string;
    visitor_id: string | null;
    warehouse_id: string;
    payment_status: string;
    order_creator_id: string;
    archived: boolean;
    step: string;
    address: string;
    day_index: number;
    fulfilled: boolean;
    branch_id: string;
    in_person_order: boolean;
    follow_up_id: string | null;
    hp_invoice_code: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    customer_request_id: string | null;
    cargos: {
      id: string;
      date: string;
      truck_id: string | null;
      warehouse_id: string;
      description: string | null;
      code: number;
      order_id: string;
      type: string;
      delivery_method: string | null;
      employee_id: string;
      dispatch_cargo_id: string | null;
      deleted: boolean;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    }[];
    invoices: {
      amount: number;
    }[];
    total_amount: number;
  };
}

export interface CustomerLastOrderListResponse {
  count: number;
  data: CustomerByLastOrderListItem[];
}

export interface GetProductKardexResponse {
  product_id: string;
  product: {
    title: string;
    id: string;
    net_weight: number;
    gross_weight: number;
    sec_unit_amount: number;
    warehouse_id: string;
    code: number;
  };
  warehouse_id: string;
  date: string;
  items: {
    net_weight: number;
    remaining: number;
    type: string;
    code: number;
    date: string;
    fee: number;
    amount: number;
    customer?: { id: string; title: string; code: number } | null;
  }[];
}

export interface QueryProductKardexDto {
  page: number;
  "page-size": number;
  product_id: string;
  from: string;
  to: string;
}

export interface WarehouseDetailsResponse {
  id: string;
  name: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  address: string;
  manager_id: string;
  branch_id: string;
  deleted: boolean;
  are_prices_updated: boolean;
  code: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  branch: {
    id: string;
    name: string;
    locked: boolean;
    address: string;
    manager_id: string;
    are_prices_updated: true;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  manager: {
    id: string;
    profile: {
      id: string;
      first_name: string;
      last_name: string;
    };
  };
}

export interface ReceivingListItem {
  id: string;
  code: number;
  date: string;
  created_at: string;
  license_plate: string;
  driver_name: string;
  source: string;
  customer: {
    id: string;
    title: string;
    code: number;
    type: string;
    category: string;
    is_property_owner: boolean;
    did_we_contact: boolean;
    phone: string;
    address: string;
    age: number;
    credibility_by_seller: string;
    credibility_by_sales_manager: string;
    behavior_tags: string[];
    national_id: string;
    branch_id: string;
    seller_id: string;
    support_id: string;
    capillary_sales_line_id: string;
    deleted: boolean;
    chat_id: string | null;
    description: string;
    locked: boolean;
    location: {
      type: string;
      coordinates: [number, number];
    };
    status: string | null;
    status_history: any[];
    hp_code: number;
    hp_title: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  employee: {
    id: string;
    profile: {
      id: string;
      first_name: string;
      last_name: string;
    };
  };
  products_count: number;
  products: {
    product_id: string;
    product_title: string;
    net_weight: number;
    gross_weight: number;
    sec_unit_amount: number;
    purchase_price: number;
    origin_net_weight: number;
    origin_gross_weight: number;
  }[];
}

export interface ReceivingListResponse {
  data: ReceivingListItem[];
  count: number;
}

export interface QueryReceivingDto {
  page?: number;
  "page-size"?: number;
  from?: string;
  to?: string;
  product_id?: string;
  customer_id?: string;
  source?: string;
  code?: number;
}

export interface Receiving {
  id: string;
  code: number;
  date: string;
  created_at: string;
  license_plate: string;
  driver_name: string;
  source: string;
  customer: {
    id: string;
    title: string;
    code: number;
    type: string;
    category: string;
    is_property_owner: boolean;
    did_we_contact: boolean;
    phone: string;
    address: string;
    age: number;
    credibility_by_seller: string;
    credibility_by_sales_manager: string;
    behavior_tags: string[];
    national_id: string;
    branch_id: string;
    seller_id: string;
    support_id: string;
    capillary_sales_line_id: string;
    deleted: boolean;
    chat_id: string | null;
    description: string;
    locked: boolean;
    location: {
      type: string;
      coordinates: [number, number];
    };
    status: string | null;
    status_history: any[];
    hp_code: number;
    hp_title: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  employee: {
    id: string;
    profile: {
      id: string;
      first_name: string;
      last_name: string;
    };
  };
  products_count: number;
  products: {
    product_id: string;
    product_title: string;
    net_weight: number;
    gross_weight: number;
    sec_unit_amount: number;
    purchase_price: number;
    origin_net_weight: number;
    origin_gross_weight: number;
  }[];
  invoices: {
    id: string;
    customer_id: string;
    seller_id: string;
    order_id: string | null;
    receiving_id: string;
    code: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    amount: number;
    due_date: string;
    cargo_id: string | null;
    driver_id: string | null;
    deleted: boolean;
    date: string;
    description: string | null;
    type: string;
    hp_code: number | null;
    hp_title: string | null;
    payment_status: string;
  }[];
  waybill: FileSummary;
  veterinary: FileSummary;
  origin_scale: FileSummary;
  destination_scale: FileSummary;
  other_files: FileSummary[];
}

export interface UpdateProductPricesRequest {
  id: string;
  retail_price: number;
  wholesale_price: number;
  online_price: number;
}

export interface CreateOrderedProductDto {
  id?: string;
  price: number;
  weight: number;
  sec_unit_amount?: number;
  retail_price?: number;
  wholesale_price?: number;
  online_price?: number;
  inventory_net_weight: number;
}

export interface CreateFailedProductDto {
  id?: string;
  price?: number;
  weight?: number;
  locked: boolean;
  not_purchased_reason: string;
  retail_price?: number;
  wholesale_price?: number;
  online_price?: number;
}

export interface SettlementDto {
  method: string;
  date: string;
  description?: string;
}

export interface CreateOrderFromRequestDto {
  customer_request_id: string;
  customer_id: string;
  person_id: string;
  bought: boolean;
  not_purchased_reason?: string;
  ordered_basket?: CreateOrderedProductDto[];
  failed_basket?: CreateFailedProductDto[];
  settlements?: SettlementDto[];
  delivery_date?: string;
  consumption_time?: number;
  created_date?: string;
  delivery_method?: string;
  location?: {
    lat: number;
    long: number;
  };
  behavior_tags?: string[];
  description?: string;
  address?: string;
  warehouse_id?: string;
  in_person_order?: boolean;
  follow_up_id?: string;
  hp_invoice_code?: number;
}

export type OrderStepEnum =
  | "SELLER"
  | "SALES_MANAGER"
  | "PROCESSING"
  | "INVENTORY"
  | "ACCOUNTING"
  | "CARGO"
  | "PARTIALLY_DELIVERED"
  | "DELIVERED"
  | "PARTIALLY_RETURNED"
  | "RETURNED";

export const OrderStepEnumValues = {
  Seller: "SELLER" as const,
  SalesManager: "SALES_MANAGER" as const,
  Processing: "PROCESSING" as const,
  Inventory: "INVENTORY" as const,
  Accounting: "ACCOUNTING" as const,
  Cargo: "CARGO" as const,
  PartiallyDelivered: "PARTIALLY_DELIVERED" as const,
  Delivered: "DELIVERED" as const,
  PartiallyReturned: "PARTIALLY_RETURNED" as const,
  Returned: "RETURNED" as const,
};

export interface ChangeOrderStepDto {
  step: OrderStepEnum;
  description?: string;
  rejected?: boolean;
}

export type DeliveryMethodEnum =
  | "AT_INVENTORY"
  | "FREE_OUR_TRUCK"
  | "FREE_OTHER_SERVICES"
  | "PAID";

export const DeliveryMethodEnumValues = {
  AtInventory: "AT_INVENTORY" as const,
  FreeOurTruck: "FREE_OUR_TRUCK" as const,
  FreeOtherServices: "FREE_OTHER_SERVICES" as const,
  Paid: "PAID" as const,
};

export interface ProductInCargoDto {
  product_id: string;
  net_weight: number;
  gross_weight: number;
  sec_unit_amount: number;
  box_weight?: number;
  remained_weight?: number;
}

export interface CreateDispatchCargoDto {
  order_id: string;
  date: Date | string;
  truck_id?: string;
  warehouse_id: string;
  delivery_method: DeliveryMethodEnum;
  employee_id: string;
  description?: string;
  products: ProductInCargoDto[];
}

export interface ProfileByGroupsResponse {
  success: boolean;
  count: number;
  msg: string;
  data: Array<{
    id: string;
    first_name: string;
    last_name: string;
    employee: {
      id: string;
    };
  }>;
}

export interface TruckDriver {
  id: string;
  kid: string;
  first_name: string;
  last_name: string;
  email: string | null;
  mobile: string;
  mobile_prefix: string;
  mobile_country_code: string;
  mobile_verified: boolean;
  enabled: boolean;
  gender: string;
  groups: string[];
  clients: string[];
  username: string;
  national_code: string | null;
  timestamps: string[];
  roles: any[];
  third_party_provider: string | null;
  is_verified_via_third_party: boolean | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  birth_date: string | null;
}

export interface Truck {
  id: string;
  driver_id: string;
  license_plate: string;
  type: string;
  capacity: number;
  insurance_exp_date: string;
  body_insurance_exp_date: string;
  warehouse_id: string;
  locked: boolean;
  deleted: boolean;
  code: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  driver: TruckDriver;
}

export interface TrucksListResponse {
  data: Truck[];
  count: number;
}

export interface ProfileInfoResponse {
  id: string;
  kid: string;
  first_name: string;
  last_name: string;
  email: string | null;
  mobile: string | null;
  mobile_prefix: string | null;
  mobile_country_code: string | null;
  mobile_verified: boolean;
  enabled: boolean;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  username: string | null;
  birth_date: string | null;
  created_at: string;
  updated_at: string;
  profile_image: FileSummary | null;
  national_code: string | null;
}

export interface UpdateProfileSelfDto {
  first_name?: string;
  last_name?: string;
  email?: string | null;
  mobile?: string | null;
  mobile_prefix?: string | null;
  mobile_country_code?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  birth_date?: string | null;
  username?: string | null;
  national_code?: string | null;
  profile_image_id?: string | null;
}

export interface CustomerInfoResponse {
  id: string;
  title: string;
  code: number;
  category: string;
  is_property_owner: boolean;
  address: string;
  phone: string;
  age: number;
  description: string | null;
  created_at: string;
  updated_at: string;
  files: FileSummary[];
}

export interface UpdatePersonSelfDto {
  title?: string;
}

export interface UpdateCustomerSelfDto {
  title?: string;
  description?: string | null;
  phone?: string | null;
  address?: string | null;
  age?: number | null;
  is_property_owner?: boolean | null;
  type?: string | null;
  category?: string | null;
}

export interface PeopleInfoResponse {
  id: string;
  title: string;
  locked: boolean;
  profile: {
    id: string;
    kid: string;
    first_name: string;
    last_name: string;
  };
}

export interface WalletInfoResponse {
  id: string;
  customer_id: string;
  balance: number;
  credit_cap: number;
  description: string | null;
  initial_balance: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface EmployeeInfoResponse {
  id: string;
  locked: boolean;
  deleted: boolean;
  roles: string[];
  profile: {
    id: string;
    kid: string;
    first_name: string;
    last_name: string;
    email: string | null;
    username: string | null;
    mobile_verified: boolean;
  };
}

export interface MyRequestsResponse {
  data: {
    id: string;
    code: number | null;
    status: string;
    payment_method: string;
    total_price: number;
    freight_cost: number;
    address: string | null;
    products_count: number;
    created_at: string;
  }[];
  count: number;
}

export interface MyRequestDetailsResponse {
  id: string;
  code: number | null;
  status: string;
  payment_method: string;
  freight_cost: number;
  address: string | null;
  products_count: number;
  created_at: string;
  total_price: number;
  request_items: {
    product_id: string;
    product_title: string;
    product_code: string;
    weight: number;
    online_price: number;
    total_price: number;
    images: FileSummary[];
  }[];
}

export interface ZarinpalWalletTopupResponse {
  authority: string;
  redirect_url: string;
}

export interface ZarinpalWalletTopupCallbackResponse {
  success: boolean;
  message: string;
  ref_id: number | null;
}

export interface ZibalWalletTopupResponse {
  authority: string;
  redirect_url: string;
}

export interface ZibalWalletTopupCallbackResponse {
  success: boolean;
  message: string;
  ref_id: number | null;
}

export interface CreatePaymentDto {
  amount: number;
  customer_id: string;
  method: string;
  description: string | null;
  date: string;
  cheque_due_date?: string;
}

export interface CreatePaymentResponse {
  id: string;
  customer_id: string;
  description: string | null;
  method: string;
  date: string;
  deleted: boolean;
  code: number;
  order_id: string | null;
  wallet_id: string;
  cheque_due_date?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface UpdateCustomerCreditCapResponse {
  id: string;
  customer_id: string;
  credit_cap: number;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  balance: number;
  initial_balance: number | null;
}

export interface AddCustomerInitialBalanceDto {
  initial_balance: number;
  description?: string;
}

export interface AddCustomerInitialBalanceResponse {
  id: string;
  customer_id: string;
  initial_balance: number;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  balance: number;
}

// Log Types
export interface Log {
  id: string;
  service: string;
  message: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  metadata: Record<string, any>;
  error: {
    name: string;
    message: string;
    stack?: string;
  } | null;
  ip_address: string | null;
  user_id: string | null;
  method: string | null;
  path: string | null;
  status_code: number | null;
  response_time: number | null;
  request_id: string | null;
  trace_id: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface QueryLogDto {
  page?: number;
  "page-size"?: number;
  service?: string;
  level?: string;
  statusCode?: number;
  userId?: string;
  ipAddress?: string;
  method?: string;
  path?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface LogListResponse {
  data: Log[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PublicProductListItem {
  id: string;
  title: string;
  code: number;
  online_price?: number;
  temperature_type?: TemperatureTypeEnum;
  images: FileSummary[];
  is_favorite?: boolean;
}

export interface PublicProductListResponse {
  data: PublicProductListItem[];
  count: number;
}

export interface PublicProductDetails {
  id: string;
  title: string;
  code: number;
  description: string | null;
  online_price?: number;
  temperature_type?: TemperatureTypeEnum;
  images: FileSummary[];
  is_favorite?: boolean;
}

export interface QueryPublicDto {
  page?: number;
  "page-size"?: number;
  category_id?: string;
  search?: string;
  temperature_type?: TemperatureTypeEnum;
  meat_type?: string;
  warehouse_id?: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product_title: string;
  product_code: number;
  weight: number;
  online_price: number;
  total_price: number;
  images: FileSummary[];
}

export interface GetMyCartResponse {
  id: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  total_price: number;
  items: CartItem[];
}

export interface AddCartItemDto {
  product_id: string;
  weight: number;
}

export interface AddCartItemResponse {
  id: string;
  product_id: string;
  product_title: string;
  weight: number;
  online_price: number;
  total_price: number;
}

export interface UpdateCartItemDto {
  cart_item_id: string;
  weight: number;
}

export interface UpdateCartItemResponse {
  id: string;
  product_id: string;
  product_title: string;
  weight: number;
  online_price: number;
  total_price: number;
}

export interface CheckoutCartDto {
  address: string;
  payment_method: string;
  freight_cost: number;
}

export interface RequestItem {
  product_id: string;
  product_title: string;
  weight: number;
  online_price: number;
  total_price: number;
}

export interface CheckoutCartResponse {
  id: string;
  code: number;
  customer_id: string;
  cart_id: string;
  status: string;
  address: string;
  total_price: number;
  freight_cost: number;
  payment_method: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  request_items: RequestItem[];
}

export interface CreateCheckDto {
  check_date: string;
  check_number: string;
  account_number: string;
  issuer_bank: string;
  amount: number;
  destination_bank?: string;
  customer_id?: string;
  description?: string;
  image_id?: string;
}

export interface CreateCheckResponse {
  id: string;
  account_number: string;
  amount: number;
  status: string;
  check_date: string;
  check_number: string;
  customer_id?: string;
  description?: string;
  destination_bank?: string;
  issuer_bank: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CheckListItem {
  id: string;
  account_number: string;
  amount: number;
  status: string;
  check_date: string;
  check_number: string;
  customer_id?: string;
  description?: string;
  destination_bank?: string;
  issuer_bank: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CheckListResponse {
  data: CheckListItem[];
  count: number;
}

export interface CheckDetailsResponse {
  id: string;
  account_number: string;
  amount: number;
  status: string;
  check_date: string;
  check_number: string;
  customer_id?: string;
  description?: string;
  destination_bank?: string;
  issuer_bank: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  customer: {
    id: string;
    title: string;
  };
  image?: FileSummary;
}

export interface QueryCheckDto {
  check_number?: string;
  account_number?: string;
  issuer_bank?: string;
  destination_bank?: string;
  customer_id?: string;
  check_date_min?: string;
  check_date_max?: string;
  amount_min?: number;
  amount_max?: number;
  page?: number;
  "page-size"?: number;
}

export interface ReminderListItem {
  id: string;
  message: string;
  date: string;
  seen: boolean;
  created_at: string;
  customer: {
    id: string;
    title: string;
    code: number;
  };
  representative_name: string | null;
}

export interface ReminderDetails {
  id: string;
  date: string;
  seen: boolean;
  created_at: string;
  message: string;
  customer: {
    id: string;
    title: string;
    code: number;
  };
  order: {
    id: string;
    code: number;
    payment_status: string;
    fulfilled: boolean;
  } | null;
  representative_name: string | null;
}

export interface ReminderListResponse {
  data: ReminderListItem[];
  count: number;
}

export interface QueryReminderDto {
  customer_id?: string | null;
  order_id?: string | null;
  message?: string | null;
  from?: string | null;
  to?: string | null;
  seen?: boolean | null;
  page?: number;
  "page-size"?: number;
}

export interface CreateReminderDto {
  customer_id: string;
  order_id?: string;
  message: string;
  date: Date;
  hour?: string;
}

export interface CreateReminderResponse {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  message: string;
  hour?: string;
  date: Date;
  seen?: boolean;
  employee_id: string;
  customer_id: string;
  order_id?: string;
  branch_id: string;
}

export interface AddFavoriteProductDto {
  product_id: string;
}

export interface AddFavoriteProductResponse {
  message: string;
  is_favorite: boolean;
  action: "removed" | "added";
  favorite: {
    product: {
      id: string;
      title: string;
    };
  };
}

export interface RemoveFavorite {
  message: string;
  is_favorite: boolean;
  action: "removed" | "added";
}

export interface FavoriteProduct {
  id: string;
  profile_id: string;
  product_id: string;
  created_at: string;
  product?: PublicProductListItem;
}

export interface GetFavoriteProductsResponse {
  data: FavoriteProduct[];
  count: number;
}
