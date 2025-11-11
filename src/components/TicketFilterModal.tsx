import { Dialog, Transition } from "@headlessui/react";
import { Filter, Search, X } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { customerService, employeeService } from "../services/api";
import type { Customer, Employee, QueryTicketDto } from "../types";
import PersianDatePicker from "./PersianDatePicker";

interface TicketFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: QueryTicketDto) => void;
  currentFilters: QueryTicketDto;
}

const ticketStatuses = [
  { value: "OPEN", label: "باز" },
  { value: "WAITING_CUSTOMER", label: "در انتظار مشتری" },
  { value: "WAITING_SUPPORT", label: "در انتظار پشتیبانی" },
  { value: "CLOSED", label: "بسته شده" },
  { value: "RESOLVED", label: "حل شده" },
  { value: "REOPENED", label: "باز شده" },
];

const ticketPriorities = [
  { value: "LOW", label: "پایین" },
  { value: "NORMAL", label: "متوسط" },
  { value: "HIGH", label: "بالا" },
  { value: "URGENT", label: "فوری" },
];

const sortOptions = [
  { value: "updated_at", label: "آخرین بروزرسانی" },
  { value: "last_message", label: "آخرین پیام" },
];

const lastSenderTypes = [
  { value: "EMPLOYEE", label: "پشتیبان" },
  { value: "CUSTOMER_PERSON", label: "مشتری" },
];

export default function TicketFilterModal({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
}: TicketFilterModalProps) {
  const [filters, setFilters] = useState<QueryTicketDto>(currentFilters);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customerPeople, setCustomerPeople] = useState<
    Array<{
      id: string;
      profile: {
        first_name: string;
        last_name: string;
      };
    }>
  >([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingCustomerPeople, setLoadingCustomerPeople] = useState(false);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchEmployees();
    } else {
      // Clear customer people when modal closes
      setCustomerPeople([]);
    }
  }, [isOpen]);

  // Fetch customer people when customer_id changes
  useEffect(() => {
    if (filters.customer_id && filters.customer_id !== "") {
      fetchCustomerPeople(filters.customer_id);
    } else {
      setCustomerPeople([]);
    }
  }, [filters.customer_id]);

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const response = await customerService.getAllCustomers();
      setCustomers(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoadingCustomers(false);
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

  const fetchCustomerPeople = async (customerId: string) => {
    try {
      setLoadingCustomerPeople(true);
      const customer = await customerService.getCustomerById(customerId);
      setCustomerPeople(customer.people || []);
    } catch (err) {
      console.error("Error fetching customer people:", err);
      setCustomerPeople([]);
    } finally {
      setLoadingCustomerPeople(false);
    }
  };

  const handleFilterChange = (
    key: keyof QueryTicketDto,
    value: string | boolean | undefined
  ) => {
    setFilters((prev) => {
      let newFilters = { ...prev };

      // Handle customer selection - fetch people and clear creator_person_id
      if (key === "customer_id") {
        if (value && value !== "") {
          fetchCustomerPeople(value as string);
        } else {
          setCustomerPeople([]);
        }
        // Clear creator_person_id when customer changes
        const { creator_person_id, ...rest } = newFilters;
        newFilters = rest;
      }

      if (value === "" || value === undefined) {
        const { [key]: _, ...restWithoutKey } = newFilters;
        return restWithoutKey;
      }

      return { ...newFilters, [key]: value };
    });
  };

  const handleClearAll = () => {
    setFilters({});
    setCustomerPeople([]);
  };

  const handleApply = () => {
    // Convert 'null' string to actual null for assigned_to_id
    const processedFilters = { ...filters };
    if (processedFilters.assigned_to_id === "null") {
      processedFilters.assigned_to_id = undefined;
    }
    onApplyFilters(processedFilters);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop with blur */}
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

        {/* Modal Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-400"
              enterFrom="opacity-0 scale-90 -translate-y-10"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-300"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-90 -translate-y-10"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
                {/* Header - Clean and Modern */}
                <div className="relative bg-gradient-to-br from-slate-50 via-white to-slate-50 px-10 py-8 border-b-2 border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-reverse space-x-5">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
                          <Filter className="h-7 w-7 text-white" />
                        </div>
                      </div>
                      <div>
                        <Dialog.Title className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          فیلترهای پیشرفته
                        </Dialog.Title>
                        <p className="mt-2 text-sm font-medium text-slate-600">
                          جستجو و فیلتر کردن تیکت‌ها با گزینه‌های مختلف
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="group relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:scale-110 active:scale-95"
                    >
                      <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
                    </button>
                  </div>
                </div>

                {/* Filter Content - Card Based Design */}
                <div className="max-h-[calc(90vh-250px)] overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate-50/50 to-white">
                  <div className="p-8 space-y-8">
                    {/* Search Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                      <label className="mb-4 block text-base font-bold text-slate-800 flex items-center space-x-reverse space-x-2">
                        <Search className="h-5 w-5 text-indigo-600" />
                        <span>جستجو</span>
                      </label>
                      <div className="relative">
                        <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
                        <input
                          type="text"
                          value={filters.search || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "search",
                              e.target.value || undefined
                            )
                          }
                          placeholder="جستجو در موضوع و محتوای تیکت..."
                          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4 pr-12 text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300 hover:bg-white"
                        />
                      </div>
                    </div>

                    {/* Status and Priority Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <label className="mb-4 block text-base font-bold text-slate-800">
                          وضعیت تیکت
                        </label>
                        <select
                          value={filters.status || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "status",
                              e.target.value || undefined
                            )
                          }
                          className="w-full cursor-pointer rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 shadow-sm transition-all duration-200 hover:border-indigo-400 hover:bg-white hover:shadow-md focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                        >
                          <option value="">همه وضعیت‌ها</option>
                          {ticketStatuses.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <label className="mb-4 block text-base font-bold text-slate-800">
                          اولویت
                        </label>
                        <select
                          value={filters.priority || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "priority",
                              e.target.value || undefined
                            )
                          }
                          className="w-full cursor-pointer rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 shadow-sm transition-all duration-200 hover:border-indigo-400 hover:bg-white hover:shadow-md focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                        >
                          <option value="">همه اولویت‌ها</option>
                          {ticketPriorities.map((priority) => (
                            <option key={priority.value} value={priority.value}>
                              {priority.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Customer and Assigned To Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <label className="mb-4 block text-base font-bold text-slate-800">
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
                          className="w-full cursor-pointer rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 shadow-sm transition-all duration-200 hover:border-indigo-400 hover:bg-white hover:shadow-md focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 disabled:border-slate-200 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:shadow-sm"
                        >
                          <option value="">همه مشتریان</option>
                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <label className="mb-4 block text-base font-bold text-slate-800">
                          ارجاع شده به
                        </label>
                        <select
                          value={filters.assigned_to_id || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "assigned_to_id",
                              e.target.value || undefined
                            )
                          }
                          disabled={loadingEmployees}
                          className="w-full cursor-pointer rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 shadow-sm transition-all duration-200 hover:border-indigo-400 hover:bg-white hover:shadow-md focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 disabled:border-slate-200 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:shadow-sm"
                        >
                          <option value="">همه کارمندان</option>
                          <option value="null">ارجاع نشده</option>
                          {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                              {employee.profile.first_name}{" "}
                              {employee.profile.last_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Creator and Last Sender Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <label className="mb-4 block text-base font-bold text-slate-800">
                          ایجاد کننده
                        </label>
                        <select
                          value={filters.creator_person_id || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "creator_person_id",
                              e.target.value || undefined
                            )
                          }
                          disabled={
                            !filters.customer_id ||
                            filters.customer_id === "" ||
                            loadingCustomerPeople
                          }
                          className="w-full cursor-pointer rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 shadow-sm transition-all duration-200 hover:border-indigo-400 hover:bg-white hover:shadow-md focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 disabled:border-slate-200 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:shadow-sm"
                        >
                          <option value="">
                            {!filters.customer_id || filters.customer_id === ""
                              ? "ابتدا مشتری را انتخاب کنید"
                              : "همه"}
                          </option>
                          {customerPeople.map((person) => (
                            <option key={person.id} value={person.id}>
                              {person.profile.first_name}{" "}
                              {person.profile.last_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <label className="mb-4 block text-base font-bold text-slate-800">
                          آخرین فرستنده
                        </label>
                        <select
                          value={filters.last_sender_type || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "last_sender_type",
                              e.target.value || undefined
                            )
                          }
                          className="w-full cursor-pointer rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 shadow-sm transition-all duration-200 hover:border-indigo-400 hover:bg-white hover:shadow-md focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                        >
                          <option value="">همه</option>
                          {lastSenderTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Date Range Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                      <label className="mb-4 block text-base font-bold text-slate-800">
                        بازه تاریخ ایجاد
                      </label>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                          <label className="mb-3 block text-sm font-semibold text-slate-600">
                            از تاریخ
                          </label>
                          <PersianDatePicker
                            value={filters.created_at_min || ""}
                            onChange={(value) =>
                              handleFilterChange(
                                "created_at_min",
                                value || undefined
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className="mb-3 block text-sm font-semibold text-slate-600">
                            تا تاریخ
                          </label>
                          <PersianDatePicker
                            value={filters.created_at_max || ""}
                            onChange={(value) =>
                              handleFilterChange(
                                "created_at_max",
                                value || undefined
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sort Options Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <label className="mb-4 block text-base font-bold text-slate-800">
                          مرتب‌سازی بر اساس
                        </label>
                        <select
                          value={filters.sort_by || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "sort_by",
                              e.target.value || undefined
                            )
                          }
                          className="w-full cursor-pointer rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 shadow-sm transition-all duration-200 hover:border-indigo-400 hover:bg-white hover:shadow-md focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                        >
                          <option value="">پیش‌فرض</option>
                          {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <label className="mb-4 block text-base font-bold text-slate-800">
                          ترتیب
                        </label>
                        <select
                          value={filters.sort_order || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "sort_order",
                              (e.target.value as "asc" | "desc") || undefined
                            )
                          }
                          className="w-full cursor-pointer rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 shadow-sm transition-all duration-200 hover:border-indigo-400 hover:bg-white hover:shadow-md focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                        >
                          <option value="">پیش‌فرض</option>
                          <option value="asc">صعودی</option>
                          <option value="desc">نزولی</option>
                        </select>
                      </div>
                    </div>

                    {/* Deleted Filter Card */}
                    <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                      <label className="flex cursor-pointer items-center space-x-reverse space-x-4">
                        <input
                          type="checkbox"
                          checked={filters.deleted === true}
                          onChange={(e) =>
                            handleFilterChange(
                              "deleted",
                              e.target.checked ? true : undefined
                            )
                          }
                          className="h-6 w-6 cursor-pointer rounded-lg border-2 border-slate-300 bg-white text-indigo-600 transition-all duration-200 focus:ring-4 focus:ring-indigo-500/20 checked:bg-indigo-600 checked:border-indigo-600"
                        />
                        <span className="text-base font-bold text-slate-800">
                          نمایش تیکت‌های حذف شده
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Footer Actions - Modern Design */}
                <div className="border-t-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white px-10 py-7">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleClearAll}
                      className="group relative overflow-hidden rounded-xl border-2 border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:border-slate-400 hover:bg-slate-50 hover:shadow-lg hover:scale-105 active:scale-95"
                    >
                      <span className="relative z-10">پاک کردن همه</span>
                    </button>
                    <div className="flex items-center space-x-reverse space-x-4">
                      <button
                        onClick={onClose}
                        className="rounded-xl border-2 border-slate-300 bg-white px-8 py-3.5 font-bold text-slate-700 shadow-sm transition-all duration-300 hover:border-slate-400 hover:bg-slate-50 hover:shadow-lg hover:scale-105 active:scale-95"
                      >
                        انصراف
                      </button>
                      <button
                        onClick={handleApply}
                        className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-10 py-3.5 font-extrabold text-white shadow-xl transition-all duration-300 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 hover:shadow-2xl hover:scale-105 active:scale-95"
                      >
                        <span className="relative z-10 flex items-center space-x-reverse space-x-2">
                          <span>اعمال فیلتر</span>
                          <Filter className="h-4 w-4" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      </button>
                    </div>
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
