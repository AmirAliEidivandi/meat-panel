import { Loader2, Package, Truck, User, X } from "lucide-react";
import { useEffect, useState } from "react";
// @ts-ignore
import { jalaaliToDateObject, toJalaali } from "jalaali-js";
import {
  cargoService,
  employeeService,
  truckService,
  warehouseService,
} from "../services/api";
import type {
  CreateReturnCargoDto,
  Employee,
  OrderCargo,
  OrderDetails,
  Truck as TruckType,
  Warehouse,
} from "../types";
import CustomDropdown from "./CustomDropdown";
import CustomInput from "./CustomInput";
import CustomTextarea from "./CustomTextarea";
import PersianDatePicker from "./PersianDatePicker";

interface CreateReturnCargoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  order: OrderDetails;
  dispatchCargo: OrderCargo; // مرسوله ارسالی که میخوایم براش مرجوعی ثبت کنیم
}

interface ReturnProduct {
  product_id: string;
  product_code: string;
  product_title: string;
  sec_unit_amount: number;
  net_weight: number;
  box_weight: number;
  gross_weight: number;
  maxAvailable: number; // حداکثر مقدار قابل مرجوع
}

export default function CreateReturnCargoModal({
  isOpen,
  onClose,
  onSuccess,
  order,
  dispatchCargo,
}: CreateReturnCargoModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Data lists
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [trucks, setTrucks] = useState<TruckType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Form fields
  const [date, setDate] = useState<string>("");
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [truckId, setTruckId] = useState<string>("");
  const [deliveryMethod, setDeliveryMethod] = useState<string>("");
  const [employeeId, setEmployeeId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [products, setProducts] = useState<ReturnProduct[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      initializeProducts();

      // تاریخ امروز رو ست کن
      const today = new Date();
      const jalaali = toJalaali(today);
      setDate(
        `${jalaali.jy}/${String(jalaali.jm).padStart(2, "0")}/${String(
          jalaali.jd
        ).padStart(2, "0")}`
      );
    } else {
      resetForm();
    }
  }, [isOpen, dispatchCargo]);

  const fetchData = async () => {
    try {
      const [warehousesRes, employeesRes] = await Promise.all([
        warehouseService.getWarehouses(),
        employeeService.getAllEmployees(),
      ]);

      setWarehouses(warehousesRes || []);
      setEmployees(employeesRes || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("خطا در بارگذاری اطلاعات");
    }
  };

  // Fetch trucks when warehouse is selected
  useEffect(() => {
    if (warehouseId) {
      fetchTrucks(warehouseId);
    } else {
      setTrucks([]);
      setTruckId("");
    }
  }, [warehouseId]);

  const fetchTrucks = async (warehouseId: string) => {
    try {
      const response = await truckService.getTrucksByWarehouse(warehouseId);
      setTrucks(response.data || []);
    } catch (err) {
      console.error("Error fetching trucks:", err);
      setTrucks([]);
    }
  };

  const initializeProducts = () => {
    // محصولات مرسوله ارسالی رو init کن
    const returnProducts: ReturnProduct[] = dispatchCargo.products.map((p) => ({
      product_id: p.product_id,
      product_code: p.product_code.toString(),
      product_title: p.product_title,
      sec_unit_amount: 0, // کاربر باید مقدار مرجوعی رو وارد کنه
      net_weight: 0,
      box_weight: 0,
      gross_weight: 0,
      maxAvailable: p.sec_unit_amount, // حداکثر مقداری که میشه مرجوع کرد
    }));
    setProducts(returnProducts);
  };

  const resetForm = () => {
    setDate("");
    setWarehouseId("");
    setTruckId("");
    setDeliveryMethod("");
    setEmployeeId("");
    setDescription("");
    setProducts([]);
    setError("");
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

  const handleUpdateProduct = (
    productId: string,
    field: keyof ReturnProduct,
    value: number
  ) => {
    setProducts(
      products.map((p) =>
        p.product_id === productId ? { ...p, [field]: value } : p
      )
    );
  };

  const validate = (): boolean => {
    if (!date) {
      setError("لطفاً تاریخ را انتخاب کنید");
      return false;
    }
    if (!warehouseId) {
      setError("لطفاً انبار را انتخاب کنید");
      return false;
    }
    if (!deliveryMethod) {
      setError("لطفاً روش تحویل را انتخاب کنید");
      return false;
    }
    if (!employeeId) {
      setError("لطفاً کارمند را انتخاب کنید");
      return false;
    }

    // حداقل یک محصول باید مرجوع شده باشه
    const hasProducts = products.some((p) => p.sec_unit_amount > 0);
    if (!hasProducts) {
      setError("لطفاً حداقل یک محصول برای مرجوعی انتخاب کنید");
      return false;
    }

    // چک کن که مقادیر از حداکثر بیشتر نباشن
    for (const product of products) {
      if (product.sec_unit_amount > product.maxAvailable) {
        setError(
          `مقدار مرجوعی ${product.product_title} نمی‌تواند بیشتر از ${product.maxAvailable} باشد`
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    setError("");

    if (!validate()) return;

    try {
      setLoading(true);

      // فقط محصولاتی که مقدار مرجوعی دارن رو بفرست
      const returnProductsData = products
        .filter((p) => p.sec_unit_amount > 0)
        .map((p) => ({
          product_id: p.product_id,
          sec_unit_amount: p.sec_unit_amount,
          net_weight: p.net_weight,
          box_weight: p.box_weight,
          gross_weight: p.gross_weight,
        }));

      const cargoData: CreateReturnCargoDto = {
        order_id: order.id,
        date: convertPersianToDate(date),
        warehouse_id: warehouseId,
        truck_id: truckId || undefined,
        delivery_method: deliveryMethod as any,
        employee_id: employeeId,
        dispatch_cargo_id: dispatchCargo.id,
        description: description || undefined,
        products: returnProductsData,
      };

      await cargoService.createReturn(cargoData);
      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      console.error("Error creating return cargo:", err);
      setError(err.response?.data?.message || "خطا در ثبت مرسوله بازگشتی");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-vazir">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                ثبت مرسوله بازگشتی
              </h2>
              <p className="text-sm text-red-100">
                مرجوعی برای مرسوله #{dispatchCargo.code}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* تاریخ و انبار */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  تاریخ بازگشت <span className="text-red-500">*</span>
                </label>
                <PersianDatePicker
                  value={date}
                  onChange={(date) => setDate(date)}
                  placeholder="انتخاب تاریخ"
                />
              </div>

              <CustomDropdown
                label="انبار"
                isRequired
                value={warehouseId}
                onChange={(value) => setWarehouseId(value)}
                options={[
                  { value: "", label: "انتخاب انبار" },
                  ...warehouses.map((w) => ({
                    value: w.id,
                    label: `${w.name} (${w.code})`,
                  })),
                ]}
                placeholder="انتخاب انبار"
                icon={<Package className="w-5 h-5" />}
              />
            </div>

            {/* روش تحویل و ماشین */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomDropdown
                label="روش تحویل"
                isRequired
                value={deliveryMethod}
                onChange={(value) => setDeliveryMethod(value)}
                options={[
                  { value: "", label: "انتخاب روش تحویل" },
                  {
                    value: "FREE_OUR_TRUCK",
                    label: "بازگشت با ماشین شرکت (رایگان)",
                  },
                  {
                    value: "FREE_OTHER_SERVICES",
                    label: "بازگشت با سرویس خارجی (رایگان)",
                  },
                  { value: "PAID", label: "بازگشت با هزینه" },
                  { value: "AT_INVENTORY", label: "درب انبار" },
                ]}
                placeholder="انتخاب روش تحویل"
              />

              {deliveryMethod === "FREE_OUR_TRUCK" && (
                <div>
                  <CustomDropdown
                    label="ماشین (اختیاری)"
                    value={truckId}
                    onChange={(value) => setTruckId(value)}
                    options={[
                      { value: "", label: "بدون ماشین" },
                      ...trucks.map((t) => ({
                        value: t.id,
                        label: `${t.license_plate}`,
                      })),
                    ]}
                    placeholder={
                      !warehouseId
                        ? "ابتدا انبار را انتخاب کنید"
                        : trucks.length === 0
                        ? "ماشینی برای این انبار یافت نشد"
                        : "انتخاب ماشین"
                    }
                    icon={<Truck className="w-5 h-5" />}
                  />
                  {!warehouseId && (
                    <p className="text-xs text-amber-600 mt-1.5">
                      ⚠️ برای مشاهده لیست ماشین‌ها، ابتدا انبار را انتخاب کنید
                    </p>
                  )}
                  {warehouseId && trucks.length === 0 && (
                    <p className="text-xs text-red-600 mt-1.5">
                      ماشینی برای انبار انتخاب شده وجود ندارد
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* کارمند */}
            <CustomDropdown
              label="کارمند"
              isRequired
              value={employeeId}
              onChange={(value) => setEmployeeId(value)}
              options={[
                { value: "", label: "انتخاب کارمند" },
                ...employees.map((e) => ({
                  value: e.id,
                  label: `${e.profile.first_name} ${e.profile.last_name}`,
                })),
              ]}
              placeholder="انتخاب کارمند"
              icon={<User className="w-5 h-5" />}
            />

            {/* محصولات */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                محصولات مرجوعی
              </h3>
              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product.product_id}
                    className="bg-red-50 border-2 border-red-200 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {product.product_title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          کد: {product.product_code}
                        </p>
                        <p className="text-xs text-red-600 font-medium mt-1">
                          حداکثر قابل مرجوع: {product.maxAvailable} واحد
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <CustomInput
                        label="تعداد (واحد)"
                        type="number"
                        value={product.sec_unit_amount || ""}
                        onChange={(val) =>
                          handleUpdateProduct(
                            product.product_id,
                            "sec_unit_amount",
                            typeof val === "number" ? val : 0
                          )
                        }
                        placeholder="0"
                        className="text-sm"
                      />
                      <CustomInput
                        label="وزن خالص (کیلوگرم)"
                        type="number"
                        value={product.net_weight || ""}
                        onChange={(val) =>
                          handleUpdateProduct(
                            product.product_id,
                            "net_weight",
                            typeof val === "number" ? val : 0
                          )
                        }
                        placeholder="0"
                        className="text-sm"
                      />
                      <CustomInput
                        label="وزن بسته (کیلوگرم)"
                        type="number"
                        value={product.box_weight || ""}
                        onChange={(val) =>
                          handleUpdateProduct(
                            product.product_id,
                            "box_weight",
                            typeof val === "number" ? val : 0
                          )
                        }
                        placeholder="0"
                        className="text-sm"
                      />
                      <CustomInput
                        label="وزن ناخالص (کیلوگرم)"
                        type="number"
                        value={product.gross_weight || ""}
                        onChange={(val) =>
                          handleUpdateProduct(
                            product.product_id,
                            "gross_weight",
                            typeof val === "number" ? val : 0
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

            {/* توضیحات */}
            <CustomTextarea
              label="توضیحات"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="توضیحات اضافی در مورد مرجوعی..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-reverse space-x-3 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold disabled:opacity-50"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all font-semibold disabled:opacity-50 flex items-center space-x-reverse space-x-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>{loading ? "در حال ثبت..." : "ثبت مرسوله بازگشتی"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
