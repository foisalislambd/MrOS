import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[64px] w-full resize-none rounded-[var(--radius-control)] bg-transparent px-2 py-1.5 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/80 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[72px]",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
