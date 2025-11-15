import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Loader2,
  Package,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
// @ts-ignore - jalaali-js doesn't have type definitions
import { jalaaliToDateObject, toJalaali } from "jalaali-js";
import {
  customerService,
  orderService,
  productService,
  warehouseService,
} from "../services/api";
import type {
  CreateFailedProductDto,
  CreateOrderDto,
  CreateOrderedProductDto,
  CustomerDetails,
  CustomerListItem,
  Product,
  SettlementDto,
  Warehouse,
} from "../types";
import CustomDropdown from "./CustomDropdown";
import CustomInput from "./CustomInput";
import CustomTextarea from "./CustomTextarea";
import PersianDatePicker from "./PersianDatePicker";

interface CreateOrderWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

type Step = 1 | 2 | 3 | 4;

interface OrderedProduct extends CreateOrderedProductDto {
  product_id: string;
  product_title: string;
  product_code: number;
  warehouse_id?: string;
}

interface FailedProduct extends CreateFailedProductDto {
  product_id: string;
  product_title: string;
  product_code: number;
}

export default function CreateOrderWizard({
  isOpen,
  onClose,
  onSuccess,
}: CreateOrderWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Basic Info
  const [customerId, setCustomerId] = useState<string>("");
  const [personId, setPersonId] = useState<string>("");
  const [didWeContact, setDidWeContact] = useState<boolean>(false);
  const [newCustomer, setNewCustomer] = useState<boolean>(false);
  const [answered, setAnswered] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [bought, setBought] = useState<boolean>(true);
  const [notPurchasedReason, setNotPurchasedReason] = useState<string>("");

  // Step 2: Products
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [orderedProducts, setOrderedProducts] = useState<OrderedProduct[]>([]);
  const [failedProducts, setFailedProducts] = useState<FailedProduct[]>([]);

  // Step 3: Additional Info
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [deliveryMethod, setDeliveryMethod] = useState<string>("");
  const [consumptionTime, setConsumptionTime] = useState<number | undefined>();
  const [address, setAddress] = useState<string>("");
  const [location, setLocation] = useState<
    { lat: number; long: number } | undefined
  >();
  const [behaviorTags, setBehaviorTags] = useState<string[]>([]);
  const [description, setDescription] = useState<string>("");
  const [settlements, setSettlements] = useState<SettlementDto[]>([]);
  const [newSettlement, setNewSettlement] = useState<SettlementDto>({
    method: "",
    date: "",
    description: "",
  });
  const [inPersonOrder, setInPersonOrder] = useState<boolean>(false);
  const [followUpId, setFollowUpId] = useState<string>("");
  const [hpInvoiceCode, setHpInvoiceCode] = useState<number | undefined>();

  // Data
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchWarehouses();
      const today = new Date();
      const jalaali = toJalaali(today);
      setDeliveryDate(
        `${jalaali.jy}/${String(jalaali.jm).padStart(2, "0")}/${String(
          jalaali.jd
        ).padStart(2, "0")}`
      );
      setCreatedDate(
        `${jalaali.jy}/${String(jalaali.jm).padStart(2, "0")}/${String(
          jalaali.jd
        ).padStart(2, "0")}`
      );
    } else {
      // Reset form when closing
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (customerId && isOpen) {
      fetchCustomerDetails();
    } else {
      setCustomer(null);
      setPersonId("");
    }
  }, [customerId, isOpen]);

  useEffect(() => {
    if (selectedWarehouse && isOpen) {
      fetchProducts();
    } else {
      setAvailableProducts([]);
    }
  }, [selectedWarehouse, isOpen]);

  const [createdDate, setCreatedDate] = useState<string>("");

  const resetForm = () => {
    setCurrentStep(1);
    setCustomerId("");
    setPersonId("");
    setDidWeContact(false);
    setNewCustomer(false);
    setAnswered(false);
    setCallDuration(0);
    setBought(true);
    setNotPurchasedReason("");
    setSelectedWarehouse("");
    setOrderedProducts([]);
    setFailedProducts([]);
    setDeliveryDate("");
    setDeliveryMethod("");
    setConsumptionTime(undefined);
    setAddress("");
    setLocation(undefined);
    setBehaviorTags([]);
    setDescription("");
    setSettlements([]);
    setNewSettlement({
      method: "",
      date: "",
      description: "",
    });
    setInPersonOrder(false);
    setFollowUpId("");
    setHpInvoiceCode(undefined);
    setError("");
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getAllCustomers({
        page: 1,
        "page-size": 1000,
      });
      setCustomers(response.data || []);
    } catch (err: any) {
      console.error("Error fetching customers:", err);
      setError("خطا در دریافت لیست مشتریان");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      const data = await customerService.getCustomerById(customerId);
      setCustomer(data);
      if (data.people && data.people.length > 0) {
        setPersonId(data.people[0].id);
        setAddress(data.address || "");
      }
    } catch (err: any) {
      console.error("Error fetching customer details:", err);
      setError("خطا در بارگذاری اطلاعات مشتری");
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const data = await warehouseService.getWarehouses();
      setWarehouses(data || []);
      if (data && data.length > 0) {
        setSelectedWarehouse(data[0].id);
      }
    } catch (err: any) {
      console.error("Error fetching warehouses:", err);
    }
  };

  const fetchProducts = async () => {
    if (!selectedWarehouse) return;

    try {
      setLoading(true);
      const data = await productService.getProductsByWarehouse(
        selectedWarehouse
      );
      setAvailableProducts(data || []);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError("خطا در دریافت لیست محصولات");
    } finally {
      setLoading(false);
    }
  };

  const convertPersianToDate = (persianDate: string): Date => {
    if (!persianDate || persianDate.trim() === "") {
      return new Date();
    }

    const parts = persianDate.split("/");
    if (parts.length !== 3) return new Date();

    const jy = parseInt(parts[0]);
    const jm = parseInt(parts[1]);
    const jd = parseInt(parts[2]);

    if (
      isNaN(jy) ||
      isNaN(jm) ||
      isNaN(jd) ||
      jy < 1300 ||
      jy > 1500 ||
      jm < 1 ||
      jm > 12 ||
      jd < 1 ||
      jd > 31
    ) {
      return new Date();
    }

    try {
      const dateObj = jalaaliToDateObject(jy, jm, jd);
      if (!dateObj || isNaN(dateObj.getTime())) {
        return new Date();
      }
      // حفظ ساعت فعلی سیستم (بدون تغییر)
      return dateObj;
    } catch (error) {
      console.error("Error converting Persian date:", error);
      return new Date();
    }
  };

  const convertPersianToGregorian = (persianDate: string): string => {
    if (!persianDate || persianDate.trim() === "") {
      return "";
    }

    const parts = persianDate.split("/");
    if (parts.length !== 3) return "";

    const jy = parseInt(parts[0]);
    const jm = parseInt(parts[1]);
    const jd = parseInt(parts[2]);

    if (
      isNaN(jy) ||
      isNaN(jm) ||
      isNaN(jd) ||
      jy < 1300 ||
      jy > 1500 ||
      jm < 1 ||
      jm > 12 ||
      jd < 1 ||
      jd > 31
    ) {
      return "";
    }

    try {
      const dateObj = jalaaliToDateObject(jy, jm, jd);
      if (!dateObj || isNaN(dateObj.getTime())) {
        return "";
      }
      // حفظ ساعت فعلی سیستم و برگرداندن به فرمت ISO-8601 DateTime
      return dateObj.toISOString();
    } catch (error) {
      console.error("Error converting Persian date:", error);
      return "";
    }
  };

  const behaviorTagOptions = [
    { value: "MANNERED", label: "خوش اخلاق" },
    { value: "POLITE", label: "مودب" },
    { value: "ANGRY", label: "عصبی" },
    { value: "PATIENCE", label: "صبور" },
    { value: "RUDE", label: "بی ادب" },
    { value: "HASTY", label: "عجول" },
  ];

  const getBehaviorTagsText = (tags: string[]): string[] => {
    const tagTranslations: Record<string, string> = {
      MANNERED: "خوش اخلاق",
      POLITE: "مودب",
      ANGRY: "عصبی",
      PATIENCE: "صبور",
      RUDE: "بی ادب",
      HASTY: "عجول",
    };
    return tags.map((tag) => tagTranslations[tag] || tag);
  };

  const getDeliveryMethodText = (method: string): string => {
    const methods: Record<string, string> = {
      AT_INVENTORY: "تحویل درب انبار",
      FREE_OUR_TRUCK: "رایگان با ماشین شرکت",
      FREE_OTHER_SERVICES: "رایگان با سرویس خارجی",
      PAID: "ارسال با هزینه مشتری",
    };
    return methods[method] || method;
  };

  const paymentMethods = [
    { value: "CASH", label: "نقدی" },
    { value: "DEPOSIT_TO_ACCOUNT", label: "واریز به حساب" },
    { value: "CHEQUE", label: "چک" },
    { value: "ONLINE", label: "آنلاین" },
  ];

  const getPaymentMethodText = (method: string): string => {
    const methodMap: Record<string, string> = {
      CASH: "نقدی",
      DEPOSIT_TO_ACCOUNT: "واریز به حساب",
      CHEQUE: "چک",
      ONLINE: "آنلاین",
    };
    return methodMap[method] || method;
  };

  const handleAddSettlement = () => {
    if (!newSettlement.method || !newSettlement.date) {
      setError("لطفاً روش پرداخت و تاریخ را وارد کنید");
      return;
    }
    setSettlements([...settlements, { ...newSettlement }]);
    setNewSettlement({
      method: "",
      date: "",
      description: "",
    });
  };

  const handleRemoveSettlement = (index: number) => {
    setSettlements(settlements.filter((_, i) => i !== index));
  };

  const handleAddOrderedProduct = (product: Product) => {
    const exists = orderedProducts.find((p) => p.product_id === product.id);
    if (exists) return;

    const newProduct: OrderedProduct = {
      product_id: product.id,
      product_title: product.title,
      product_code: product.code,
      price: 0, // خالی - کاربر باید وارد کنه
      weight: 0, // خالی - کاربر باید وارد کنه
      inventory_net_weight: product.net_weight || 0,
      warehouse_id: selectedWarehouse,
      retail_price: product.retail_price,
      wholesale_price: product.wholesale_price,
      online_price: product.online_price,
      sec_unit_amount: undefined,
    };
    setOrderedProducts([...orderedProducts, newProduct]);
  };

  const handleAddFailedProduct = (product: Product) => {
    const exists = failedProducts.find((p) => p.product_id === product.id);
    if (exists) return;

    const newProduct: FailedProduct = {
      product_id: product.id,
      product_title: product.title,
      product_code: product.code,
      price: 0, // خالی - اختیاری
      weight: 0, // خالی - اختیاری
      locked: false,
      not_purchased_reason: "",
      retail_price: product.retail_price,
      wholesale_price: product.wholesale_price,
      online_price: product.online_price,
    };
    setFailedProducts([...failedProducts, newProduct]);
  };

  const handleRemoveOrderedProduct = (productId: string) => {
    setOrderedProducts(
      orderedProducts.filter((p) => p.product_id !== productId)
    );
  };

  const handleRemoveFailedProduct = (productId: string) => {
    setFailedProducts(failedProducts.filter((p) => p.product_id !== productId));
  };

  const handleUpdateOrderedProduct = (
    productId: string,
    updates: Partial<OrderedProduct>
  ) => {
    setOrderedProducts(
      orderedProducts.map((p) =>
        p.product_id === productId ? { ...p, ...updates } : p
      )
    );
  };

  const handleUpdateFailedProduct = (
    productId: string,
    updates: Partial<FailedProduct>
  ) => {
    setFailedProducts(
      failedProducts.map((p) =>
        p.product_id === productId ? { ...p, ...updates } : p
      )
    );
  };

  const validateStep1 = (): boolean => {
    if (!customerId) {
      setError("لطفاً مشتری را انتخاب کنید");
      return false;
    }
    if (!personId) {
      setError("لطفاً نماینده را انتخاب کنید");
      return false;
    }
    if (didWeContact && !answered) {
      setError("لطفاً وضعیت پاسخ تماس را مشخص کنید");
      return false;
    }
    if (!bought && !notPurchasedReason) {
      setError("در صورت عدم خرید، دلیل را وارد کنید");
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (bought && orderedProducts.length === 0 && failedProducts.length === 0) {
      setError("لطفاً حداقل یک محصول اضافه کنید");
      return false;
    }
    if (orderedProducts.length > 0 && !selectedWarehouse) {
      setError("برای محصولات موفق، انبار را انتخاب کنید");
      return false;
    }
    for (const product of orderedProducts) {
      if (!product.price || product.price <= 0) {
        setError(`قیمت محصول ${product.product_title} باید بیشتر از صفر باشد`);
        return false;
      }
      if (!product.weight || product.weight <= 0) {
        setError(`وزن محصول ${product.product_title} باید بیشتر از صفر باشد`);
        return false;
      }
    }
    for (const product of failedProducts) {
      if (!product.not_purchased_reason) {
        setError(
          `دلیل عدم خرید برای محصول ${product.product_title} الزامی است`
        );
        return false;
      }
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!deliveryDate) {
      setError("لطفاً تاریخ تحویل را انتخاب کنید");
      return false;
    }
    if (!deliveryMethod) {
      setError("لطفاً روش تحویل را انتخاب کنید");
      return false;
    }
    if (!address) {
      setError("لطفاً آدرس را وارد کنید");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError("");
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handlePrevious = () => {
    setError("");
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      setCurrentStep(1);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const orderData: CreateOrderDto = {
        customer_id: customerId,
        did_we_contact: didWeContact,
        new_customer: newCustomer,
        person_id: personId,
        answered: answered,
        call_duration: callDuration,
        bought: bought,
        not_purchased_reason: bought ? undefined : notPurchasedReason,
        ordered_basket:
          orderedProducts.length > 0
            ? orderedProducts.map((p) => ({
                id: p.product_id,
                price: p.price,
                weight: p.weight,
                sec_unit_amount: p.sec_unit_amount,
                retail_price: p.retail_price,
                wholesale_price: p.wholesale_price,
                online_price: p.online_price,
                inventory_net_weight: p.inventory_net_weight,
              }))
            : undefined,
        failed_basket:
          failedProducts.length > 0
            ? failedProducts.map((p) => ({
                id: p.product_id,
                price: p.price,
                weight: p.weight,
                locked: p.locked,
                not_purchased_reason: p.not_purchased_reason,
                retail_price: p.retail_price,
                wholesale_price: p.wholesale_price,
                online_price: p.online_price,
              }))
            : undefined,
        settlements:
          settlements.length > 0
            ? settlements.map((s) => ({
                method: s.method,
                date: convertPersianToGregorian(s.date),
                description: s.description || undefined,
              }))
            : undefined,
        delivery_date: convertPersianToDate(deliveryDate),
        consumption_time: consumptionTime,
        created_date: convertPersianToDate(createdDate),
        delivery_method: deliveryMethod,
        location: location,
        behavior_tags: behaviorTags,
        description: description || undefined,
        address: address,
        warehouse_id:
          orderedProducts.length > 0 ? selectedWarehouse : undefined,
        in_person_order: inPersonOrder,
        follow_up_id: followUpId || undefined,
        hp_invoice_code: hpInvoiceCode,
      };

      const order = await orderService.createOrder(orderData);
      onSuccess(order.id);
      onClose();
      resetForm();
    } catch (err: any) {
      console.error("Error creating order:", err);
      setError(err.response?.data?.message || "خطا در ایجاد سفارش");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const steps = [
    { number: 1, label: "اطلاعات اولیه", icon: User },
    { number: 2, label: "سبد خرید", icon: ShoppingCart },
    { number: 3, label: "اطلاعات تکمیلی", icon: Package },
    { number: 4, label: "بازبینی", icon: CheckCircle },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl mx-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">ایجاد سفارش جدید</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : isActive
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-gray-100 border-gray-300 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-semibold ${
                        isActive ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        isCompleted ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="mr-3 text-gray-600">در حال بارگذاری...</span>
            </div>
          )}

          {!loading && (
            <>
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    اطلاعات اولیه
                  </h3>

                  {/* Customer Selection */}
                  <CustomDropdown
                    label="مشتری"
                    isRequired
                    value={customerId}
                    onChange={(value) => setCustomerId(value)}
                    options={[
                      { value: "", label: "انتخاب مشتری" },
                      ...customers.map((customer) => ({
                        value: customer.id,
                        label: `${customer.title} (${customer.code})`,
                      })),
                    ]}
                    placeholder="انتخاب مشتری"
                    icon={<User className="w-5 h-5" />}
                  />

                  {/* Person Selection */}
                  {customer &&
                    customer.people &&
                    customer.people.length > 0 && (
                      <CustomDropdown
                        label="نماینده"
                        isRequired
                        value={personId}
                        onChange={(value) => setPersonId(value)}
                        options={[
                          { value: "", label: "انتخاب نماینده" },
                          ...customer.people.map((person) => ({
                            value: person.id,
                            label: `${person.profile.first_name} ${person.profile.last_name} - ${person.title}`,
                          })),
                        ]}
                        placeholder="انتخاب نماینده"
                        icon={<User className="w-5 h-5" />}
                      />
                    )}

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-reverse space-x-2">
                      <input
                        type="checkbox"
                        id="didWeContact"
                        checked={didWeContact}
                        onChange={(e) => setDidWeContact(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="didWeContact"
                        className="text-sm text-gray-700"
                      >
                        تماس گرفته شده
                      </label>
                    </div>

                    <div className="flex items-center space-x-reverse space-x-2">
                      <input
                        type="checkbox"
                        id="newCustomer"
                        checked={newCustomer}
                        onChange={(e) => setNewCustomer(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="newCustomer"
                        className="text-sm text-gray-700"
                      >
                        مشتری جدید
                      </label>
                    </div>
                  </div>

                  {/* Answered */}
                  {didWeContact && (
                    <div className="flex items-center space-x-reverse space-x-2">
                      <input
                        type="checkbox"
                        id="answered"
                        checked={answered}
                        onChange={(e) => setAnswered(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="answered"
                        className="text-sm text-gray-700"
                      >
                        پاسخ داده شده
                      </label>
                    </div>
                  )}

                  {/* Call Duration */}
                  {didWeContact && answered && (
                    <CustomInput
                      label="مدت زمان تماس (ثانیه)"
                      type="number"
                      value={callDuration || ""}
                      onChange={(val) =>
                        setCallDuration(typeof val === "number" ? val : 0)
                      }
                      placeholder="0"
                    />
                  )}

                  {/* Bought */}
                  <div className="flex items-center space-x-reverse space-x-2">
                    <input
                      type="checkbox"
                      id="bought"
                      checked={bought}
                      onChange={(e) => setBought(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="bought" className="text-sm text-gray-700">
                      خرید انجام شده
                    </label>
                  </div>

                  {/* Not Purchased Reason */}
                  {!bought && (
                    <CustomTextarea
                      label="دلیل عدم خرید"
                      isRequired
                      value={notPurchasedReason}
                      onChange={(e) => setNotPurchasedReason(e.target.value)}
                      rows={3}
                      placeholder="دلیل عدم خرید را وارد کنید"
                    />
                  )}
                </div>
              )}

              {/* Step 2: Products */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    سبد خرید
                  </h3>

                  {/* Warehouse Selection */}
                  {bought && (
                    <CustomDropdown
                      label="انبار"
                      isRequired
                      value={selectedWarehouse}
                      onChange={(value) => {
                        setSelectedWarehouse(value);
                        setOrderedProducts([]);
                      }}
                      options={[
                        { value: "", label: "انتخاب انبار" },
                        ...warehouses.map((warehouse) => ({
                          value: warehouse.id,
                          label: `${warehouse.name} (${warehouse.code})`,
                        })),
                      ]}
                      placeholder="انتخاب انبار"
                      icon={<Package className="w-5 h-5" />}
                    />
                  )}

                  {/* Products List */}
                  {selectedWarehouse && bought && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        محصولات موجود
                      </label>
                      <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                        {availableProducts.map((product) => (
                          <div
                            key={product.id}
                            className="p-3 border-b border-gray-200 flex items-center justify-between hover:bg-gray-50"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {product.title}
                              </p>
                              <p className="text-sm text-gray-600">
                                کد: {product.code} • وزن: {product.net_weight}{" "}
                                کیلوگرم
                              </p>
                            </div>
                            <div className="flex items-center space-x-reverse space-x-2">
                              <button
                                type="button"
                                onClick={() => handleAddOrderedProduct(product)}
                                disabled={orderedProducts.some(
                                  (p) => p.product_id === product.id
                                )}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                              >
                                موفق
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddFailedProduct(product)}
                                disabled={failedProducts.some(
                                  (p) => p.product_id === product.id
                                )}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                              >
                                ناموفق
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ordered Products */}
                  {orderedProducts.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        محصولات موفق ({orderedProducts.length})
                      </h4>
                      <div className="space-y-3">
                        {orderedProducts.map((product) => (
                          <div
                            key={product.product_id}
                            className="p-4 border border-gray-200 rounded-lg bg-green-50"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {product.product_title}
                                </p>
                                <p className="text-sm text-gray-600">
                                  کد: {product.product_code}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveOrderedProduct(product.product_id)
                                }
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <CustomInput
                                  label="قیمت"
                                  type="number"
                                  value={product.price || ""}
                                  onChange={(val) =>
                                    handleUpdateOrderedProduct(
                                      product.product_id,
                                      {
                                        price:
                                          typeof val === "number" ? val : 0,
                                      }
                                    )
                                  }
                                  placeholder="0"
                                  className="text-sm"
                                />
                                {product.retail_price && (
                                  <div className="mt-1.5 flex items-center space-x-reverse space-x-2">
                                    <span className="text-xs text-gray-500">
                                      قیمت خرده‌فروشی:
                                    </span>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                      {product.retail_price.toLocaleString(
                                        "fa-IR"
                                      )}{" "}
                                      تومان
                                    </span>
                                  </div>
                                )}
                              </div>
                              <CustomInput
                                label="وزن (کیلوگرم)"
                                type="number"
                                value={product.weight || ""}
                                onChange={(val) =>
                                  handleUpdateOrderedProduct(
                                    product.product_id,
                                    {
                                      weight: typeof val === "number" ? val : 0,
                                    }
                                  )
                                }
                                placeholder="0"
                                className="text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Failed Products */}
                  {failedProducts.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        محصولات ناموفق ({failedProducts.length})
                      </h4>
                      <div className="space-y-3">
                        {failedProducts.map((product) => (
                          <div
                            key={product.product_id}
                            className="p-4 border border-gray-200 rounded-lg bg-red-50"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {product.product_title}
                                </p>
                                <p className="text-sm text-gray-600">
                                  کد: {product.product_code}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveFailedProduct(product.product_id)
                                }
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                            <CustomTextarea
                              label="دلیل عدم خرید"
                              isRequired
                              value={product.not_purchased_reason || ""}
                              onChange={(e) =>
                                handleUpdateFailedProduct(product.product_id, {
                                  not_purchased_reason: e.target.value,
                                })
                              }
                              rows={2}
                              placeholder="دلیل عدم خرید را وارد کنید"
                              className="text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Additional Info */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    اطلاعات تکمیلی
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Delivery Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تاریخ تحویل <span className="text-red-500">*</span>
                      </label>
                      <PersianDatePicker
                        value={deliveryDate}
                        onChange={setDeliveryDate}
                        placeholder="انتخاب تاریخ تحویل"
                      />
                    </div>

                    {/* Created Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تاریخ ایجاد
                      </label>
                      <PersianDatePicker
                        value={createdDate}
                        onChange={setCreatedDate}
                        placeholder="انتخاب تاریخ ایجاد"
                      />
                    </div>
                  </div>

                  {/* Delivery Method */}
                  <CustomDropdown
                    label="روش تحویل"
                    isRequired
                    value={deliveryMethod}
                    onChange={(value) => setDeliveryMethod(value)}
                    options={[
                      { value: "", label: "انتخاب روش تحویل" },
                      {
                        value: "FREE_OUR_TRUCK",
                        label: "ارسال رایگان با ماشین شرکت",
                      },
                      {
                        value: "FREE_OTHER_SERVICES",
                        label: "ارسال رایگان با سرویس خارجی",
                      },
                      { value: "PAID", label: "ارسال با هزینه مشتری" },
                      { value: "AT_INVENTORY", label: "تحویل درب انبار" },
                    ]}
                    placeholder="انتخاب روش تحویل"
                  />

                  {/* Address */}
                  <CustomTextarea
                    label="آدرس"
                    isRequired
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    placeholder="آدرس تحویل را وارد کنید"
                  />

                  {/* Settlements */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      روش‌های پرداخت
                    </label>
                    <div className="space-y-4">
                      {/* Add Settlement Form */}
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <CustomDropdown
                            label="روش پرداخت"
                            value={newSettlement.method}
                            onChange={(value) =>
                              setNewSettlement({
                                ...newSettlement,
                                method: value,
                              })
                            }
                            options={[
                              { value: "", label: "انتخاب روش" },
                              ...paymentMethods.map((method) => ({
                                value: method.value,
                                label: method.label,
                              })),
                            ]}
                            placeholder="انتخاب روش"
                            className="text-sm"
                          />
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              تاریخ
                            </label>
                            <PersianDatePicker
                              value={newSettlement.date}
                              onChange={(date) =>
                                setNewSettlement({
                                  ...newSettlement,
                                  date: date,
                                })
                              }
                              placeholder="انتخاب تاریخ"
                            />
                          </div>
                          <CustomInput
                            label="توضیحات (اختیاری)"
                            type="text"
                            value={newSettlement.description || ""}
                            onChange={(val) =>
                              setNewSettlement({
                                ...newSettlement,
                                description: String(val),
                              })
                            }
                            placeholder="توضیحات"
                            className="text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddSettlement}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                        >
                          افزودن روش پرداخت
                        </button>
                      </div>

                      {/* Settlements List */}
                      {settlements.length > 0 && (
                        <div className="space-y-2">
                          {settlements.map((settlement, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">
                                  {getPaymentMethodText(settlement.method)}
                                </p>
                                <p className="text-xs text-gray-600">
                                  تاریخ: {settlement.date}
                                  {settlement.description &&
                                    ` • ${settlement.description}`}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveSettlement(index)}
                                className="text-red-600 hover:text-red-700 p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Consumption Time */}
                  <CustomInput
                    label="زمان مصرف (ساعت)"
                    type="number"
                    value={consumptionTime || ""}
                    onChange={(val) =>
                      setConsumptionTime(
                        val ? (typeof val === "number" ? val : 0) : undefined
                      )
                    }
                    placeholder="0"
                  />

                  {/* Description */}
                  <CustomTextarea
                    label="توضیحات"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="توضیحات اضافی (اختیاری)"
                  />

                  {/* In Person Order */}
                  <div className="flex items-center space-x-reverse space-x-2">
                    <input
                      type="checkbox"
                      id="inPersonOrder"
                      checked={inPersonOrder}
                      onChange={(e) => setInPersonOrder(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="inPersonOrder"
                      className="text-sm text-gray-700"
                    >
                      سفارش حضوری
                    </label>
                  </div>

                  {/* Behavior Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      برچسب‌های رفتاری
                    </label>
                    <select
                      multiple
                      value={behaviorTags}
                      onChange={(e) => {
                        const selected = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        );
                        setBehaviorTags(selected);
                      }}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm hover:shadow-md min-h-[120px] cursor-pointer"
                      size={6}
                    >
                      {behaviorTagOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      برای انتخاب چند مورد، Ctrl (یا Cmd در Mac) را نگه دارید و
                      کلیک کنید
                    </p>
                    {behaviorTags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {getBehaviorTagsText(behaviorTags).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold flex items-center space-x-reverse space-x-1"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setBehaviorTags(
                                  behaviorTags.filter((_, i) => i !== index)
                                )
                              }
                              className="text-purple-600 hover:text-purple-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* HP Invoice Code */}
                  <CustomInput
                    label="کد فاکتور HP"
                    type="number"
                    value={hpInvoiceCode || ""}
                    onChange={(val) =>
                      setHpInvoiceCode(
                        val ? (typeof val === "number" ? val : 0) : undefined
                      )
                    }
                    placeholder="0"
                  />
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    بازبینی نهایی
                  </h3>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      اطلاعات مشتری
                    </h4>
                    <p className="text-sm text-gray-700">
                      مشتری:{" "}
                      {customers.find((c) => c.id === customerId)?.title ||
                        "N/A"}
                    </p>
                    <p className="text-sm text-gray-700">
                      نماینده:{" "}
                      {
                        customer?.people.find((p) => p.id === personId)?.profile
                          .first_name
                      }{" "}
                      {
                        customer?.people.find((p) => p.id === personId)?.profile
                          .last_name
                      }
                    </p>
                  </div>

                  {/* Products Summary */}
                  {orderedProducts.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        محصولات موفق ({orderedProducts.length})
                      </h4>
                      {orderedProducts.map((product) => (
                        <p
                          key={product.product_id}
                          className="text-sm text-gray-700"
                        >
                          {product.product_title} - {product.weight} کیلوگرم -{" "}
                          {product.price.toLocaleString()} تومان
                        </p>
                      ))}
                    </div>
                  )}

                  {failedProducts.length > 0 && (
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        محصولات ناموفق ({failedProducts.length})
                      </h4>
                      {failedProducts.map((product) => (
                        <p
                          key={product.product_id}
                          className="text-sm text-gray-700"
                        >
                          {product.product_title} -{" "}
                          {product.not_purchased_reason}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Delivery Info */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      اطلاعات تحویل
                    </h4>
                    <p className="text-sm text-gray-700">
                      تاریخ تحویل: {deliveryDate}
                    </p>
                    <p className="text-sm text-gray-700">
                      روش تحویل: {getDeliveryMethodText(deliveryMethod)}
                    </p>
                    <p className="text-sm text-gray-700">آدرس: {address}</p>
                  </div>

                  {/* Settlements */}
                  {settlements.length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        روش‌های پرداخت ({settlements.length})
                      </h4>
                      <div className="space-y-2">
                        {settlements.map((settlement, index) => (
                          <div
                            key={index}
                            className="p-2 bg-white rounded border border-yellow-200"
                          >
                            <p className="text-sm font-semibold text-gray-900">
                              {getPaymentMethodText(settlement.method)}
                            </p>
                            <p className="text-xs text-gray-600">
                              تاریخ: {settlement.date}
                              {settlement.description &&
                                ` • ${settlement.description}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Behavior Tags */}
                  {behaviorTags.length > 0 && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        برچسب‌های رفتاری
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {getBehaviorTagsText(behaviorTags).map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={currentStep === 1 ? onClose : handlePrevious}
            disabled={submitting}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-reverse space-x-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>{currentStep === 1 ? "انصراف" : "قبلی"}</span>
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={loading || submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-reverse space-x-2"
            >
              <span>بعدی</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-reverse space-x-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ثبت...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>ثبت نهایی</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
