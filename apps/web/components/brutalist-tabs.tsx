"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

interface BrutalistTabsProps {
  tabs?: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  children?: React.ReactNode;
}

interface BrutalistTabProps {
  active?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function BrutalistTab({ active, onClick, children }: BrutalistTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-3 text-[11px] uppercase tracking-widest font-medium transition-all duration-100 relative",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-signal-orange" />
      )}
    </button>
  );
}

export function BrutalistTabs({
  tabs,
  defaultTab,
  onChange,
  className,
  children,
}: BrutalistTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs?.[0]?.id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  if (children) {
    return (
      <div className={cn("flex border-b border-border", className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("flex border-b border-border", className)}>
      {tabs?.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={cn(
            "px-4 py-3 text-[11px] uppercase tracking-widest font-medium transition-all duration-100 relative",
            activeTab === tab.id
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-signal-orange" />
          )}
        </button>
      ))}
    </div>
  );
}
