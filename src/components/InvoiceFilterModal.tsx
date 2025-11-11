
import { Filter, Search, X } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import {
  customerService,
  employeeService,
  orderService,
  warehouseService,
} from "../services/api";
import type {
  CustomerListItem,
  Employee,
  Order,
  QueryInvoiceDto,
  Warehouse,
} from "../types";
import PersianDatePicker from "./PersianDatePicker";

interface InvoiceFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: QueryInvoiceDto) => void;
  currentFilters: QueryInvoiceDto;
}

export default function InvoiceFilterModal({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
}: InvoiceFilterModalProps) {
  const [filters, setFilters] = useState<QueryInvoiceDto>(currentFilters);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchWarehouses();
      fetchEmployees();
      fetchOrders();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const response = await customerService.getAllCustomers();
      setCustomers(response.data || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      setLoadingWarehouses(true);
      const response = await warehouseService.getWarehouses();
      setWarehouses(response || []);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
    } finally {
      setLoadingWarehouses(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await employeeService.getAllEmployees();
      setEmployees(response || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await orderService.getOrders({
        page: 1,
        "page-size": 1000,
      });
      setOrders(response.data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleFilterChange = (
    key: keyof QueryInvoiceDto,
    value: string | number | undefined
  ) => {
    setFilters((prev) => {
      if (value === "" || value === undefined || value === null) {
        const { [key]: _, ...restWithoutKey } = prev;
        return restWithoutKey;
      }

      return { ...prev, [key]: value };
    });
  };

  const handleClearAll = () => {
    setFilters({});
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (filters.cargo_id) count++;
    if (filters.customer_id) count++;
    if (filters.seller_id) count++;
    if (filters.warehouse_id) count++;
    if (filters.order_id) count++;
    if (filters.driver_id) count++;
    if (filters.due_date_min) count++;
    if (filters.due_date_max) count++;
    if (filters.from) count++;
    if (filters.to) count++;
    if (filters.amount_min) count++;
    if (filters.amount_max) count++;
    if (filters.code) count++;
    if (filters.hp_code) count++;
    if (filters.hp_title) count++;
    if (filters.date) count++;
    return count;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/90 to-gray-900/80 backdrop-blur-md" />
        </Transition.Child>

        {/* Modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 px-10 py-8 border-b-2 border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-reverse space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Filter className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <Dialog.Title className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          فیلترهای پیشرفته فاکتورها
                        </Dialog.Title>
                        <p className="text-sm text-gray-600 mt-1">
                          {getActiveFiltersCount() > 0
                            ? `${getActiveFiltersCount()} فیلتر فعال`
                            : "فیلترهای خود را انتخاب کنید"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white hover:bg-red-50 border-2 border-slate-200 hover:border-red-300 transition-all duration-200 hover:rotate-90"
                    >
                      <X className="w-5 h-5 text-gray-600 hover:text-red-600 transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Filter Content */}
                <div className="max-h-[calc(90vh-250px)] overflow-y-auto custom-scrollbar p-8 space-y-8 bg-gradient-to-b from-slate-50/50 to-white">
                  {/* Search Term - Code */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                      <Search className="w-4 h-4 ml-2 text-orange-600" />
                      جستجو (کد فاکتور)
                    </label>
                    <input
                      type="number"
                      value={filters.code || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "code",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="کد فاکتور را وارد کنید..."
                      className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 shadow-sm transition-all duration-200 hover:border-orange-400 hover:bg-white hover:shadow-md focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                    />
                  </div>

                  {/* Customer, Order, Warehouse */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                    <h3 className="text-base font-bold text-slate-800 mb-4">
                      اطلاعات اصلی
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          مشتری
                        </label>
                        <select
                          value={filters.customer_id || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "customer_id",
                              e.target.value || undefined
                            )
                          }
                          disabled={loadingCustomers}
                          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 shadow-sm transition-all duration-200 hover:border-orange-400 hover:bg-white hover:shadow-md focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed disabled:hover:border-slate-200"
                        >
                          <option value="">همه مشتریان</option>
                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.title} (#{customer.code})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          سفارش
                        </label>
                        <select
                          value={filters.order_id || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "order_id",
                              e.target.value || undefined
                            )
                          }
                          disabled={loadingOrders}
                          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 shadow-sm transition-all duration-200 hover:border-orange-400 hover:bg-white hover:shadow-md focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed disabled:hover:border-slate-200"
                        >
                          <option value="">همه سفارشات</option>
                          {orders.map((order) => (
                            <option key={order.id} value={order.id}>
                              سفارش #{order.code}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          انبار
                        </label>
                        <select
                          value={filters.warehouse_id || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "warehouse_id",
                              e.target.value || undefined
                            )
                          }
                          disabled={loadingWarehouses}
                          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 shadow-sm transition-all duration-200 hover:border-orange-400 hover:bg-white hover:shadow-md focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed disabled:hover:border-slate-200"
                        >
                          <option value="">همه انبارها</option>
                          {warehouses.map((warehouse) => (
                            <option key={warehouse.id} value={warehouse.id}>
                              {warehouse.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Seller, Driver, Cargo */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                    <h3 className="text-base font-bold text-slate-800 mb-4">
                      اطلاعات مربوطه
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          فروشنده
                        </label>
                        <select
                          value={filters.seller_id || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "seller_id",
                              e.target.value || undefined
                            )
                          }
                          disabled={loadingEmployees}
                          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 shadow-sm transition-all duration-200 hover:border-orange-400 hover:bg-white hover:shadow-md focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed disabled:hover:border-slate-200"
                        >
                          <option value="">همه فروشندگان</option>
                          {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                              {employee.profile.first_name}{" "}
                              {employee.profile.last_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          راننده
                        </label>
                        <select
                          value={filters.driver_id || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "driver_id",
                              e.target.value || undefined
                            )
                          }
                          disabled={loadingEmployees}
                          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 shadow-sm transition-all duration-200 hover:border-orange-400 hover:bg-white hover:shadow-md focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed disabled:hover:border-slate-200"
                        >
                          <option value="">همه رانندگان</option>
                          {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                              {employee.profile.first_name}{" "}
                              {employee.profile.last_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          مرسوله
                        </label>
                        <input
                          type="text"
                          value={filters.cargo_id || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "cargo_id",
                              e.target.value || undefined
                            )
                          }
                          placeholder="شناسه مرسوله..."
                          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 shadow-sm transition-all duration-200 hover:border-orange-400 hover:bg-white hover:shadow-md focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Amount Range */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                    <h3 className="text-base font-bold text-slate-800 mb-4">
                      محدوده مبلغ
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          حداقل مبلغ (ریال)
                        </label>
                        <input
                          type="number"
                          value={filters.amount_min || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "amount_min",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          placeholder="حداقل مبلغ..."
                          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 shadow-sm transition-all duration-200 hover:border-orange-400 hover:bg-white hover:shadow-md focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          حداکثر مبلغ (ریال)
                        </label>
                        <input
                          type="number"
                          value={filters.amount_max || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "amount_max",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          placeholder="حداکثر مبلغ..."
                          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 shadow-sm transition-all duration-200 hover:border-orange-400 hover:bg-white hover:shadow-md focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                    <h3 className="text-base font-bold text-slate-800 mb-4">
                      محدوده تاریخ فاکتور
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          از تاریخ
                        </label>
                        <PersianDatePicker
                          value={filters.from || ""}
                          onChange={(value) =>
                            handleFilterChange("from", value || undefined)
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          تا تاریخ
                        </label>
                        <PersianDatePicker
                          value={filters.to || ""}
                          onChange={(value) =>
                            handleFilterChange("to", value || undefined)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Due Date Range */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                    <h3 className="text-base font-bold text-slate-800 mb-4">
                      محدوده تاریخ سررسید
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          از تاریخ
                        </label>
                        <PersianDatePicker
                          value={filters.due_date_min || ""}
                          onChange={(value) =>
                            handleFilterChange(
                              "due_date_min",
                              value || undefined
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          تا تاریخ
                        </label>
                        <PersianDatePicker
                          value={filters.due_date_max || ""}
                          onChange={(value) =>
                            handleFilterChange(
                              "due_date_max",
                              value || undefined
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Specific Date */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      تاریخ خاص
                    </label>
                    <PersianDatePicker
                      value={filters.date || ""}
                      onChange={(value) =>
                        handleFilterChange("date", value || undefined)
                      }
                    />
                  </div>

                  {/* HP Code and Title */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                    <h3 className="text-base font-bold text-slate-800 mb-4">
                      اطلاعات HP
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          کد HP
                        </label>
                        <input
                          type="number"
                          value={filters.hp_code || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "hp_code",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          placeholder="کد HP..."
                          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 shadow-sm transition-all duration-200 hover:border-orange-400 hover:bg-white hover:shadow-md focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          عنوان HP
                        </label>
                        <input
                          type="text"
                          value={filters.hp_title || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "hp_title",
                              e.target.value || undefined
                            )
                          }
                          placeholder="عنوان HP..."
                          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 shadow-sm transition-all duration-200 hover:border-orange-400 hover:bg-white hover:shadow-md focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white px-10 py-7">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleClearAll}
                      className="rounded-xl border-2 border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:border-slate-400 hover:bg-slate-50 hover:shadow-lg hover:scale-105 active:scale-95"
                    >
                      پاک کردن همه
                    </button>
                    <button
                      onClick={handleApply}
                      className="rounded-xl bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 px-8 py-3.5 text-sm font-extrabold text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95 relative overflow-hidden group"
                    >
                      <span className="relative z-10">اعمال فیلتر</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
