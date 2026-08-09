import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[6px] px-1.5 py-0.5 text-[11px] font-medium tracking-[-0.01em] transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        soft: "bg-bg-muted text-fg-muted ring-1 ring-border",
        secondary: "bg-muted text-muted-foreground",
        outline: "border border-border text-muted-foreground",
        success: "bg-success/12 text-success ring-1 ring-success/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
