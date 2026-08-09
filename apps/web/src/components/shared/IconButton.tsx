"use client";

import * as React from "react";
import { type VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type IconButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    label: string;
    tooltip?: string;
  };

export function IconButton({
  className,
  label,
  tooltip,
  size = "icon",
  variant = "ghost",
  children,
  ...props
}: IconButtonProps) {
  const button = (
    <Button
      type="button"
      variant={variant}
      size={size}
      aria-label={label}
      className={cn(
        "text-icon transition-colors duration-200 hover:bg-icon-hover hover:text-icon-active active:bg-icon-hover/80 active:text-icon-active [&_svg]:size-[1.05rem] [&_svg]:stroke-[1.55]",
        size === "icon-sm" && "[&_svg]:size-[0.9rem]",
        size === "icon-xs" && "[&_svg]:size-[0.85rem]",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );

  if (!tooltip) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
