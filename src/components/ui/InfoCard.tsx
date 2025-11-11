import type { LucideIcon } from "lucide-react";

interface InfoCardProps {
  label: string;
  value: string | React.ReactNode;
  color?: "blue" | "green" | "purple" | "orange" | "amber" | "pink" | "teal";
  icon?: LucideIcon;
  className?: string;
}

const colorMap = {
  blue: "from-blue-50 to-indigo-100 border-blue-200 text-blue-900",
  green: "from-green-50 to-emerald-100 border-green-200 text-green-900",
  purple: "from-purple-50 to-violet-100 border-purple-200 text-purple-900",
  orange: "from-orange-50 to-amber-100 border-orange-200 text-orange-900",
  amber: "from-amber-50 to-orange-100 border-amber-200 text-amber-900",
  pink: "from-pink-50 to-rose-100 border-pink-200 text-pink-900",
  teal: "from-teal-50 to-cyan-100 border-teal-200 text-teal-900",
};

export default function InfoCard({
  label,
  value,
  color = "blue",
  icon: Icon,
  className = "",
}: InfoCardProps) {
  return (
    <div
      className={`bg-gradient-to-br ${colorMap[color]} rounded-lg p-3 border ${className}`}
    >
      {Icon && (
        <div className="mb-2">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <p className="text-xs text-gray-600 mb-1 font-medium">{label}</p>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}
