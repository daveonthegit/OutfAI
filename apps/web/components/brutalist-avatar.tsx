import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrutalistAvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: "sm" | "md" | "lg";
  status?: "online" | "offline" | "away";
}

export function BrutalistAvatar({
  src,
  alt = "Avatar",
  initials,
  size = "md",
  status,
}: BrutalistAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-[10px]",
    md: "w-10 h-10 text-xs",
    lg: "w-14 h-14 text-sm",
  };

  const statusColors = {
    online: "bg-acid-lime",
    offline: "bg-muted-foreground",
    away: "bg-signal-orange",
  };

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          "relative border border-border bg-secondary overflow-hidden flex items-center justify-center",
          sizeClasses[size]
        )}
      >
        {src ? (
          <Image
            src={src || "/placeholder.svg"}
            alt={alt}
            fill
            className="object-cover"
          />
        ) : (
          <span className="uppercase tracking-wider font-medium text-foreground">
            {initials || "?"}
          </span>
        )}
      </div>
      {status && (
        <div
          className={cn(
            "absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-background",
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}
