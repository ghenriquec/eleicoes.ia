import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Select nativo (acessibilidade/teclado de graça) com chevron e estados
 * próprios — o `<select>` puro do navegador destoava do resto do design
 * system (seta padrão do SO, sem hover/focus consistentes).
 */
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "w-full appearance-none rounded-xl border border-border-strong bg-surface px-4 py-2.5 pr-10 text-[15px] text-text transition-colors",
          "hover:border-accent focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-tint",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={16} strokeWidth={2.25} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-taupe-ink" />
    </div>
  ),
);
Select.displayName = "Select";
