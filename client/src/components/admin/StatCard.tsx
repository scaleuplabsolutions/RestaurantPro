import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  subtitle
}: StatCardProps) {
  return (
    <div className="bg-white border rounded-lg p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-neutral-500 text-sm">{title}</h3>
        <Icon className="text-primary" size={18} />
      </div>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      {trend && (
        <p className={`text-xs ${trendUp ? 'text-green-600' : 'text-red-600'} mt-1`}>{trend}</p>
      )}
      {subtitle && (
        <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
