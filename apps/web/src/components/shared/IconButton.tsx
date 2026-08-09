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
        "text-white transition-colors duration-150 hover:bg-icon-hover hover:text-white active:bg-icon-hover/80 active:text-white [&_svg]:size-[1.2rem] [&_svg]:stroke-[1.85] [&_svg]:text-white",
        size === "icon-sm" && "[&_svg]:size-[1.05rem]",
        size === "icon-xs" && "[&_svg]:size-[0.95rem]",
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
      <TooltipContent className="text-[13px]">{tooltip}</TooltipContent>
    </Tooltip>
  );
}
