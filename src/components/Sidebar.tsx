import {
  Activity,
  AlertCircle,
  ArrowDownCircle,
  BarChart3,
  Bell,
  ChevronDown,
  ChevronUp,
  CreditCard,
  FileBarChart,
  FileText,
  FolderOpen,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  PhoneCall,
  Receipt,
  ShoppingCart,
  TrendingUp,
  UserCheck,
  UserCog,
  Users,
  Wallet,
  Warehouse,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface SidebarProps {
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  color: string;
  path: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: "customers",
    label: "مشتریان",
    icon: Users,
    color: "text-blue-600",
    path: "/manage/customers",
    children: [
      {
        id: "customers-list",
        label: "لیست مشتریان",
        icon: Users,
        color: "text-blue-600",
        path: "/manage/customers",
      },
      {
        id: "customers-by-debt",
        label: "مشتریان بدهکار",
        icon: AlertCircle,
        color: "text-red-600",
        path: "/manage/customers/by-debt",
      },
      {
        id: "customers-report",
        label: "گزارش مشتری‌ها",
        icon: FileBarChart,
        color: "text-green-600",
        path: "/manage/customers/report",
      },
    ],
  },
  {
    id: "orders",
    label: "سفارشات",
    icon: ShoppingCart,
    color: "text-blue-600",
    path: "/manage/orders",
  },
  {
    id: "order-history",
    label: "تاریخچه سفارشات",
    icon: FileText,
    color: "text-green-600",
    path: "/manage/order-history",
  },
  {
    id: "payment-history",
    label: "تاریخچه پرداخت‌ها",
    icon: CreditCard,
    color: "text-purple-600",
    path: "/manage/payment-history",
  },
  {
    id: "invoices",
    label: "فاکتورها",
    icon: Receipt,
    color: "text-orange-600",
    path: "/manage/invoices",
  },
  {
    id: "invoice-history",
    label: "تاریخچه فاکتورها",
    icon: FileText,
    color: "text-orange-600",
    path: "/manage/invoice-history",
  },
  {
    id: "cargo-history",
    label: "تاریخچه مرسوله‌ها",
    icon: Package,
    color: "text-indigo-600",
    path: "/manage/cargo-history",
  },
  {
    id: "customer-requests",
    label: "درخواست‌های مشتریان",
    icon: UserCheck,
    color: "text-pink-600",
    path: "/manage/customer-requests",
  },
  {
    id: "return-requests",
    label: "درخواست های مرجوعی",
    icon: FileText,
    color: "text-rose-600",
    path: "/manage/return-requests",
  },
  {
    id: "categories",
    label: "دسته‌بندی‌ها",
    icon: FolderOpen,
    color: "text-teal-600",
    path: "/manage/categories",
  },
  {
    id: "products",
    label: "محصولات",
    icon: Package,
    color: "text-cyan-600",
    path: "/manage/products",
  },
  {
    id: "warehouses",
    label: "لیست انبارها",
    icon: Warehouse,
    color: "text-amber-600",
    path: "/manage/warehouses",
  },
  {
    id: "capillary-sales-lines",
    label: "لیست خط فروش",
    icon: TrendingUp,
    color: "text-purple-600",
    path: "/manage/capillary-sales-lines",
  },
  {
    id: "stats",
    label: "آمارها",
    icon: BarChart3,
    color: "text-red-600",
    path: "/manage/stats",
    children: [
      {
        id: "stats-customers",
        label: "آمار مشتریان",
        icon: Users,
        color: "text-blue-600",
        path: "/manage/stats/customers",
      },
      {
        id: "stats-orders",
        label: "آمار سفارشات",
        icon: ShoppingCart,
        color: "text-green-600",
        path: "/manage/stats/orders",
      },
      {
        id: "stats-sellers",
        label: "آمار فروشندگان",
        icon: BarChart3,
        color: "text-purple-600",
        path: "/manage/stats/sellers",
      },
    ],
  },
  {
    id: "tickets",
    label: "تیکت‌ها",
    icon: MessageSquare,
    color: "text-indigo-600",
    path: "/manage/tickets",
  },
  {
    id: "wallets",
    label: "کیف پول‌ها",
    icon: Wallet,
    color: "text-purple-600",
    path: "/manage/wallets",
  },
  {
    id: "wallet-history",
    label: "تاریخچه کیف پول",
    icon: Wallet,
    color: "text-yellow-600",
    path: "/manage/wallet-history",
  },
  {
    id: "withdrawal-requests",
    label: "درخواست های برداشت",
    icon: ArrowDownCircle,
    color: "text-cyan-600",
    path: "/manage/withdrawal-requests",
  },
  {
    id: "bank-cards",
    label: "کارت‌های بانکی",
    icon: CreditCard,
    color: "text-indigo-600",
    path: "/manage/bank-cards",
  },
  {
    id: "profiles",
    label: "مدیریت کاربران",
    icon: UserCog,
    color: "text-teal-600",
    path: "/manage/profiles",
    children: [
      {
        id: "profiles-employees",
        label: "کارمندان",
        icon: Users,
        color: "text-blue-600",
        path: "/manage/profiles/employees",
      },
      {
        id: "profiles-others",
        label: "بقیه کاربران",
        icon: UserCog,
        color: "text-green-600",
        path: "/manage/profiles/others",
      },
    ],
  },
  {
    id: "logs",
    label: "لاگ‌ها و رهگیری",
    icon: Activity,
    color: "text-slate-600",
    path: "/manage/logs",
  },
  {
    id: "checks",
    label: "چک‌ها",
    icon: CreditCard,
    color: "text-teal-600",
    path: "/manage/checks",
  },
  {
    id: "reminders",
    label: "یادآورها",
    icon: Bell,
    color: "text-emerald-600",
    path: "/manage/reminders",
  },
  {
    id: "follow-ups",
    label: "پیگیری‌ها",
    icon: PhoneCall,
    color: "text-blue-600",
    path: "/manage/follow-ups",
  },
];

export default function Sidebar({ onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const hasActiveChild = (item: MenuItem) => {
    if (!item.children) return false;
    return item.children.some((child) => isActive(child.path, true));
  };

  // Auto-open submenu if any child is active
  const getOpenSubmenus = () => {
    const openSet = new Set<string>();
    menuItems.forEach((item) => {
      if (item.children && hasActiveChild(item)) {
        openSet.add(item.path);
      }
    });
    return openSet;
  };

  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(
    getOpenSubmenus()
  );

  // Update open submenus when location changes
  useEffect(() => {
    setOpenSubmenus(getOpenSubmenus());
  }, [location.pathname]);

  const handleMenuClick = (path: string, hasChildren?: boolean) => {
    if (hasChildren) {
      // Toggle submenu
      setOpenSubmenus((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(path)) {
          newSet.delete(path);
        } else {
          newSet.add(path);
        }
        return newSet;
      });
    } else {
      navigate(path);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="p-3 bg-white rounded-lg shadow-md border border-gray-200"
        >
          <Menu className="w-7 h-7 text-gray-600" />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 z-40 w-80 bg-white border-l border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-gray-200">
            <div className="flex items-center space-x-reverse space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">پنل مدیریت</h1>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-6 py-8 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = !!item.children;
              const isSubmenuOpen = openSubmenus.has(item.path);
              const active = isActive(item.path) || hasActiveChild(item);

              return (
                <div key={item.id}>
                  <button
                    onClick={() => handleMenuClick(item.path, hasChildren)}
                    className={`w-full flex items-center justify-between space-x-reverse space-x-4 px-6 py-4 rounded-xl transition-all duration-200 group ${
                      active
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-sm"
                        : "hover:bg-gray-50 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center space-x-reverse space-x-4">
                      <Icon
                        className={`w-6 h-6 transition-colors ${
                          active
                            ? item.color
                            : "text-gray-500 group-hover:text-gray-700"
                        }`}
                      />
                      <span
                        className={`text-base font-semibold transition-colors ${
                          active
                            ? "text-gray-900"
                            : "text-gray-600 group-hover:text-gray-800"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    {hasChildren && (
                      <>
                        {isSubmenuOpen ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </>
                    )}
                  </button>
                  {/* Submenu */}
                  {hasChildren && isSubmenuOpen && (
                    <div className="mr-8 mt-2 space-y-1">
                      {item.children?.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = isActive(child.path, true);
                        return (
                          <button
                            key={child.id}
                            onClick={() => handleMenuClick(child.path)}
                            className={`w-full flex items-center space-x-reverse space-x-3 px-5 py-3 rounded-lg transition-all duration-200 group ${
                              childActive
                                ? "bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 shadow-sm"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            <ChildIcon
                              className={`w-5 h-5 transition-colors ${
                                childActive
                                  ? child.color
                                  : "text-gray-400 group-hover:text-gray-600"
                              }`}
                            />
                            <span
                              className={`text-sm font-medium transition-colors ${
                                childActive
                                  ? "text-gray-900 font-bold"
                                  : "text-gray-600 group-hover:text-gray-800"
                              }`}
                            >
                              {child.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-reverse space-x-4 px-6 py-4 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
            >
              <LogOut className="w-6 h-6" />
              <span className="text-base font-semibold">خروج از سیستم</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
