"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function TripPageHeader({
  tripName,
  startDate,
  endDate,
}: {
  tripName: string;
  startDate: number;
  endDate: number;
}) {
  return (
    <>
      <Breadcrumb className="mb-6">
        <BreadcrumbList className="text-[10px] uppercase tracking-[0.2em]">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/plan">Hub</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/plan/packing">Packing</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[200px] truncate">
              {tripName}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="font-serif italic text-3xl mb-1">{tripName}</h1>
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-6">
        {format(startDate, "MMM d, yyyy")} – {format(endDate, "MMM d, yyyy")}
      </p>
    </>
  );
}
