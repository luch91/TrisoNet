import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getColor(name: string): string {
  const colors = [
    "bg-primary-200 text-primary-800",
    "bg-secondary-200 text-secondary-800",
    "bg-purple-200 text-purple-800",
    "bg-pink-200 text-pink-800",
    "bg-amber-200 text-amber-800",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export default function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const sizes = { xs: "w-6 h-6 text-[10px]", sm: "w-8 h-8 text-caption", md: "w-10 h-10 text-small", lg: "w-14 h-14 text-body", xl: "w-20 h-20 text-h3" };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover shrink-0", sizes[size], className)}
      />
    );
  }

  return (
    <div className={cn("rounded-full flex items-center justify-center font-semibold shrink-0", sizes[size], getColor(name), className)}>
      {getInitials(name)}
    </div>
  );
}
