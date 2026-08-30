import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-mono text-[11px] font-medium tracking-wide px-2.5 py-1",
  {
    variants: {
      variant: {
        neutral: "bg-surface-2 text-text-muted border border-border",
        accent: "bg-accent-tint text-accent-ink",
        mock: "bg-taupe-tint text-taupe-ink",
        source: "bg-accent2-tint text-accent-ink",
        danger: "bg-danger-tint text-danger",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
