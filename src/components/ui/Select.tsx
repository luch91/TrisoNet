import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && <label htmlFor={selectId} className="text-small font-medium text-ink">{label}</label>}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full px-3 py-2.5 pr-10 rounded-md border bg-surface text-ink text-body appearance-none",
              "border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "disabled:bg-bg disabled:cursor-not-allowed",
              error && "border-error focus:ring-error",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle pointer-events-none" />
        </div>
        {error && <p className="text-caption text-error">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
export default Select;
