"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

const BrutalistDialog = DialogPrimitive.Root;

const BrutalistDialogTrigger = DialogPrimitive.Trigger;

const BrutalistDialogPortal = DialogPrimitive.Portal;

const BrutalistDialogClose = DialogPrimitive.Close;

function BrutalistDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 glass-veil",
        className
      )}
      {...props}
    />
  );
}

export type BrutalistDialogSize = "md" | "lg";

const sizeToMax: Record<BrutalistDialogSize, string> = {
  md: "max-w-md",
  lg: "max-w-2xl",
};

export interface BrutalistDialogContentProps extends React.ComponentProps<
  typeof DialogPrimitive.Content
> {
  size?: BrutalistDialogSize;
  showCloseButton?: boolean;
}

function BrutalistDialogContent({
  className,
  children,
  size = "md",
  showCloseButton = true,
  ...props
}: BrutalistDialogContentProps) {
  return (
    <BrutalistDialogPortal>
      <BrutalistDialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "glass-panel data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-none border border-border p-6 shadow-none duration-200",
          sizeToMax[size],
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            className="ring-offset-background focus-visible:ring-signal-orange absolute top-4 right-4 text-muted-foreground opacity-90 transition-opacity hover:opacity-100 hover:text-foreground focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
            aria-label="Close"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </BrutalistDialogPortal>
  );
}

function BrutalistDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function BrutalistDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

function BrutalistDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "font-serif text-xl font-normal italic leading-tight tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  );
}

function BrutalistDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-body text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  BrutalistDialog,
  BrutalistDialogPortal,
  BrutalistDialogOverlay,
  BrutalistDialogTrigger,
  BrutalistDialogClose,
  BrutalistDialogContent,
  BrutalistDialogHeader,
  BrutalistDialogFooter,
  BrutalistDialogTitle,
  BrutalistDialogDescription,
};
