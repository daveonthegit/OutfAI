"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const brutalistButtonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center font-medium uppercase tracking-widest transition-all duration-100 motion-reduce:transform-none active:translate-y-px motion-reduce:active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        solid: "bg-foreground text-background hover:bg-foreground/90",
        outline:
          "border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
        ghost: "bg-transparent text-foreground hover:text-signal-orange",
        destructive:
          "border border-destructive bg-destructive text-destructive-foreground hover:bg-signal-orange hover:text-background hover:border-signal-orange",
      },
      size: {
        sm: "min-h-9 px-3 py-2 text-label",
        md: "min-h-11 px-5 py-3 text-xs",
        lg: "min-h-12 px-6 py-4 text-sm",
        icon: "size-9 min-h-9 p-0 [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  }
);

export type BrutalistButtonVariant = NonNullable<
  VariantProps<typeof brutalistButtonVariants>["variant"]
>;
export type BrutalistButtonSize = NonNullable<
  VariantProps<typeof brutalistButtonVariants>["size"]
>;

export interface BrutalistButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof brutalistButtonVariants> {
  asChild?: boolean;
}

export const BrutalistButton = React.forwardRef<
  HTMLButtonElement,
  BrutalistButtonProps
>(function BrutalistButton(
  {
    children,
    variant = "solid",
    size = "md",
    type = "button",
    className,
    disabled,
    asChild = false,
    ...rest
  },
  ref
) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref as React.Ref<HTMLButtonElement>}
      type={asChild ? undefined : type}
      disabled={asChild ? undefined : disabled}
      aria-disabled={asChild && disabled ? true : undefined}
      tabIndex={asChild && disabled ? -1 : undefined}
      className={cn(brutalistButtonVariants({ variant, size, className }))}
      {...rest}
    >
      {children}
    </Comp>
  );
});

BrutalistButton.displayName = "BrutalistButton";
