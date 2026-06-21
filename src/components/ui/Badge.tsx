import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/lib/mock-data";

interface BadgeProps {
  variant?: "default" | "pending" | "qc_approved" | "live" | "rejected" | "pending_platform" | "success" | "warning" | "info";
  children: React.ReactNode;
  className?: string;
}

const statusMap: Record<string, { label: string; class: string }> = {
  pending:           { label: "Pending QC",        class: "bg-warning-100 text-warning-600 border border-warning-200" },
  qc_approved:       { label: "QC Approved",        class: "bg-primary-100 text-primary-700 border border-primary-200" },
  live:              { label: "Live",               class: "bg-success-100 text-success-600 border border-green-200" },
  rejected:          { label: "Rejected",           class: "bg-error-100 text-error-600 border border-error-200" },
  pending_platform:  { label: "Pending Validation", class: "bg-warning-100 text-warning-600 border border-warning-200" },
  success:           { label: "Success",            class: "bg-success-100 text-success-600" },
  warning:           { label: "Warning",            class: "bg-warning-100 text-warning-600" },
  info:              { label: "Info",               class: "bg-primary-100 text-primary-700" },
};

export function StatusBadge({ status, className }: { status: ProductStatus; className?: string }) {
  const config = statusMap[status] ?? { label: status, class: "bg-gray-100 text-gray-600" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium", config.class, className)}>
      {config.label}
    </span>
  );
}

export default function Badge({ variant = "default", children, className }: BadgeProps) {
  const variantClass = variant !== "default" && statusMap[variant]
    ? statusMap[variant].class
    : "bg-primary-100 text-primary-700";
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium", variantClass, className)}>
      {children}
    </span>
  );
}
