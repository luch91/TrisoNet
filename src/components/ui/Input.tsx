import { cn } from "@/lib/utils";
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && <label htmlFor={inputId} className="text-small font-medium text-ink">{label}</label>}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3 py-2.5 rounded-md border bg-surface text-ink text-body",
            "border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "placeholder:text-ink-subtle disabled:bg-bg disabled:cursor-not-allowed",
            error && "border-error focus:ring-error",
            className
          )}
          {...props}
        />
        {error && <p className="text-caption text-error">{error}</p>}
        {hint && !error && <p className="text-caption text-ink-subtle">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && <label htmlFor={inputId} className="text-small font-medium text-ink">{label}</label>}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3 py-2.5 rounded-md border bg-surface text-ink text-body resize-vertical",
            "border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "placeholder:text-ink-subtle disabled:bg-bg disabled:cursor-not-allowed",
            error && "border-error focus:ring-error",
            className
          )}
          {...props}
        />
        {error && <p className="text-caption text-error">{error}</p>}
        {hint && !error && <p className="text-caption text-ink-subtle">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
