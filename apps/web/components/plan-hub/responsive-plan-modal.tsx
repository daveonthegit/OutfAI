"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMdUp } from "@/hooks/use-media-query";

/**
 * Bottom sheet on small viewports, centered dialog on md+.
 */
export function ResponsivePlanModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  dialogClassName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Extra classes for DialogContent (e.g. max width) */
  dialogClassName?: string;
}) {
  const isMd = useIsMdUp();

  if (isMd) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton
          className={
            dialogClassName ??
            "max-h-[min(90vh,900px)] flex flex-col gap-0 p-0 overflow-hidden sm:max-w-4xl"
          }
        >
          <DialogHeader className="px-6 pt-6 pb-2 border-b border-border shrink-0 text-left">
            <DialogTitle className="text-sm uppercase tracking-widest not-italic font-sans">
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription className="text-[11px] uppercase tracking-[0.2em]">
                {description}
              </DialogDescription>
            ) : null}
          </DialogHeader>
          <div className="px-6 py-4 flex-1 min-h-0 overflow-y-auto flex flex-col gap-4">
            {children}
          </div>
          {footer != null ? (
            <DialogFooter className="px-6 pb-6 pt-2 border-t border-border shrink-0 sm:justify-start">
              {footer}
            </DialogFooter>
          ) : null}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] flex flex-col gap-0 p-0 overflow-hidden"
      >
        <SheetHeader className="px-4 pt-4 pb-2 border-b border-border shrink-0">
          <SheetTitle className="text-sm uppercase tracking-widest not-italic font-sans">
            {title}
          </SheetTitle>
          {description ? (
            <SheetDescription className="text-[11px] uppercase tracking-[0.2em]">
              {description}
            </SheetDescription>
          ) : null}
        </SheetHeader>
        <div className="px-4 py-4 flex-1 min-h-0 overflow-y-auto flex flex-col gap-4">
          {children}
        </div>
        {footer != null ? (
          <SheetFooter className="px-4 pb-6 pt-2 border-t border-border shrink-0">
            {footer}
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
