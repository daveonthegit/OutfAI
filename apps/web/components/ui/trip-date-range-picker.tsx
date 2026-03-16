"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface TripDateRangePickerProps {
  /** Controlled date range (from = start, to = end). */
  value?: DateRange | undefined;
  /** Called when the user selects a range. */
  onChange?: (range: DateRange | undefined) => void;
  /** Optional label above the trigger. */
  label?: string;
  /** Placeholder when no range selected. */
  placeholder?: string;
  /** Minimum date selectable (e.g. today). */
  minDate?: Date;
  /** Extra class for the trigger button. */
  className?: string;
  /** Id for the trigger (for label htmlFor). */
  id?: string;
  /** Disabled state. */
  disabled?: boolean;
}

/**
 * OutfAI-styled date range picker for trip start/end. Uses Calendar in range
 * mode inside a popover; trigger shows selected range or placeholder.
 */
export function TripDateRangePicker({
  value,
  onChange,
  label = "Trip dates",
  placeholder = "Select start and end date",
  minDate,
  className,
  id = "trip-dates",
  disabled,
}: TripDateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internalRange, setInternalRange] = React.useState<
    DateRange | undefined
  >(value);

  const range = value ?? internalRange;

  const handleSelect = React.useCallback(
    (next: DateRange | undefined) => {
      setInternalRange(next);
      onChange?.(next);
      if (next?.from && next?.to) setOpen(false);
    },
    [onChange]
  );

  const displayText =
    range?.from && range?.to
      ? `${format(range.from, "MMM d, yyyy")} – ${format(range.to, "MMM d, yyyy")}`
      : range?.from
        ? format(range.from, "MMM d, yyyy")
        : placeholder;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <Label
          htmlFor={id}
          className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium"
        >
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal text-left",
              "border-border bg-background hover:bg-secondary/50",
              "focus-visible:ring-signal-orange focus-visible:ring-offset-background",
              !range?.from && "text-muted-foreground"
            )}
            aria-label={label}
            aria-expanded={open}
          >
            <span className="text-[11px] uppercase tracking-[0.15em] truncate">
              {displayText}
            </span>
            <ChevronDownIcon
              className={cn("size-4 shrink-0 opacity-70", open && "rotate-180")}
              aria-hidden
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0 border-border bg-card"
          align="start"
          sideOffset={8}
        >
          <Calendar
            mode="range"
            defaultMonth={range?.from ?? minDate ?? new Date()}
            selected={range}
            onSelect={handleSelect}
            disabled={minDate ? { before: minDate } : undefined}
            captionLayout="dropdown"
            classNames={{
              range_start: "rounded-l-md bg-signal-orange/20 text-foreground",
              range_end: "rounded-r-md bg-signal-orange/20 text-foreground",
              range_middle: "rounded-none bg-signal-orange/10 text-foreground",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
