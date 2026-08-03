import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  icon?: string;
  title?: string;
}

export function GlassCard({ children, className, icon, title }: GlassCardProps) {
  return (
    <div className={cn("glass-card p-6 animate-fade-in-up overflow-hidden", className)}>
      {(icon || title) && (
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          {title && <span className="text-gradient">{title}</span>}
        </h3>
      )}
      {children}
    </div>
  );
}