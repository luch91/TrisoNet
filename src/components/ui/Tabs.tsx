"use client";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex border-b border-primary-100 overflow-x-auto scrollbar-thin", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2.5 text-small font-medium whitespace-nowrap border-b-2 transition-colors",
            activeTab === tab.id
              ? "border-primary text-primary-700"
              : "border-transparent text-ink-subtle hover:text-ink hover:border-primary-200"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              "inline-flex items-center justify-center w-5 h-5 rounded-full text-caption font-semibold",
              activeTab === tab.id ? "bg-primary text-ink" : "bg-bg text-ink-subtle"
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
