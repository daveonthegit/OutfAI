"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

const BrutalistDropdown = DropdownMenuPrimitive.Root;

const BrutalistDropdownTrigger = DropdownMenuPrimitive.Trigger;

const BrutalistDropdownGroup = DropdownMenuPrimitive.Group;

const BrutalistDropdownPortal = DropdownMenuPrimitive.Portal;

const BrutalistDropdownSub = DropdownMenuPrimitive.Sub;

const BrutalistDropdownRadioGroup = DropdownMenuPrimitive.RadioGroup;

function BrutalistDropdownSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      className={cn(
        "focus:bg-accent data-[state=open]:bg-accent flex cursor-pointer items-center rounded-none px-2 py-1.5 text-label outline-none select-none",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function BrutalistDropdownSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-none border border-border p-1 shadow-none",
        className
      )}
      {...props}
    />
  );
}

function BrutalistDropdownContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <BrutalistDropdownPortal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "bg-card text-card-foreground z-50 min-w-[10rem] overflow-hidden rounded-none border border-border p-1 shadow-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </BrutalistDropdownPortal>
  );
}

function BrutalistDropdownItem({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-pointer items-center rounded-none px-2 py-2 text-label outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  );
}

function BrutalistDropdownSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

export {
  BrutalistDropdown,
  BrutalistDropdownTrigger,
  BrutalistDropdownContent,
  BrutalistDropdownItem,
  BrutalistDropdownSeparator,
  BrutalistDropdownGroup,
  BrutalistDropdownPortal,
  BrutalistDropdownSub,
  BrutalistDropdownSubContent,
  BrutalistDropdownSubTrigger,
  BrutalistDropdownRadioGroup,
};
