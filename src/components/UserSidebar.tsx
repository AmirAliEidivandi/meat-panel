import {
  Building2,
  Heart,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  ShoppingCart,
  Store,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface UserSidebarProps {
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  color: string;
  path: string;
}

const menuItems: MenuItem[] = [
  {
    id: "profile",
    label: "اطلاعات شخصی",
    icon: User,
    color: "text-blue-600",
    path: "/user/profile",
  },
  {
    id: "business",
    label: "اطلاعات کسب و کار",
    icon: Building2,
    color: "text-green-600",
    path: "/user/business",
  },
  {
    id: "wallet",
    label: "کیف پول",
    icon: Wallet,
    color: "text-purple-600",
    path: "/user/wallet",
  },
  {
    id: "requests",
    label: "درخواست‌های من",
    icon: Package,
    color: "text-orange-600",
    path: "/user/requests",
  },
  {
    id: "tickets",
    label: "تیکت‌ها",
    icon: MessageSquare,
    color: "text-indigo-600",
    path: "/user/tickets",
  },
  {
    id: "products",
    label: "لیست محصولات",
    icon: Store,
    color: "text-emerald-600",
    path: "/user/products",
  },
  {
    id: "favorites",
    label: "علاقه‌مندی‌ها",
    icon: Heart,
    color: "text-red-600",
    path: "/user/favorites",
  },
  {
    id: "cart",
    label: "سبد خرید",
    icon: ShoppingCart,
    color: "text-amber-600",
    path: "/user/cart",
  },
];

export default function UserSidebar({ onLogout }: UserSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
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
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">پنل کاربری</h1>
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
              const active = isActive(item.path);

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.path)}
                  className={`w-full flex items-center space-x-reverse space-x-4 px-6 py-4 rounded-xl transition-all duration-200 group ${
                    active
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-sm"
                      : "hover:bg-gray-50 hover:shadow-sm"
                  }`}
                >
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
                </button>
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
