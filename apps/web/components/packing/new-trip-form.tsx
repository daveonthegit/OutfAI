"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { BrutalistButton } from "@/components/brutalist-button";
import { TripDateRangePicker } from "@/components/ui/trip-date-range-picker";

export function NewTripForm({
  onSubmit,
  onCancel,
  creating,
}: {
  onSubmit: (payload: {
    name: string;
    dateRange: DateRange | undefined;
  }) => void;
  onCancel: () => void;
  creating: boolean;
}) {
  const [name, setName] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, dateRange });
      }}
      className="space-y-4"
    >
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Dates default to today if you leave them blank.
      </p>
      <div>
        <label className="block mb-2 text-[11px] uppercase tracking-widest">
          Trip name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Weekend away"
          className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange"
          aria-label="Trip name"
        />
      </div>
      <TripDateRangePicker
        label="Trip dates"
        placeholder="Select start and end date"
        value={dateRange}
        onChange={setDateRange}
        minDate={new Date()}
        id="trip-dates"
      />
      <div className="flex gap-3 pt-2">
        <BrutalistButton type="submit" disabled={creating}>
          {creating ? "Creating…" : "Create trip"}
        </BrutalistButton>
        <BrutalistButton
          type="button"
          variant="ghost"
          onClick={() => {
            onCancel();
            setName("");
            setDateRange(undefined);
          }}
        >
          Cancel
        </BrutalistButton>
      </div>
    </form>
  );
}
