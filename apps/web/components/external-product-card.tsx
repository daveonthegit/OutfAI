"use client";

import Image from "next/image";
import type { ProductRecommendation } from "@shared/types";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

interface ExternalProductCardProps {
  recommendation: ProductRecommendation;
  /** When true, log click to commerceInteractionLogs (consent-aware; no-op if not implemented) */
  onTrackClick?: (productId: string) => void;
}

export function ExternalProductCard({
  recommendation,
  onTrackClick,
}: ExternalProductCardProps) {
  const logCommerce = useMutation(api.commerceInteractionLogs.log);
  const { product, reason } = recommendation;
  const url = product.affiliateUrl || product.productUrl;

  const handleClick = () => {
    if (onTrackClick) {
      try {
        logCommerce({
          productId:
            product.id as import("@convex/_generated/dataModel").Id<"external_products">,
          action: "clicked",
        });
      } catch {
        // Optional; ignore if consent not set or logging fails
      }
      onTrackClick(product.id);
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <article className="relative border border-border bg-card transition-colors duration-200 hover:bg-secondary/30 overflow-hidden group text-left">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.preventDefault();
          handleClick();
        }}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2"
      >
        <div className="aspect-square relative bg-secondary">
          <Image
            src={product.imageUrl || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
        <div className="p-4 border-t border-border">
          <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground mb-1">
            Suggested purchase
          </p>
          <h3 className="text-[11px] uppercase tracking-widest text-foreground font-medium mb-1 line-clamp-2">
            {product.name}
          </h3>
          {product.brand && (
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-2">
              {product.brand}
            </p>
          )}
          {product.price != null && (
            <p className="text-[11px] text-foreground mb-2">
              {product.currency === "USD" && "$"}
              {product.price.toFixed(2)}
              {product.currency &&
                product.currency !== "USD" &&
                ` ${product.currency}`}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
            {reason}
          </p>
          <span className="inline-flex items-center gap-1 mt-2 text-[10px] uppercase tracking-[0.2em] text-signal-orange group-hover:underline">
            View product
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </span>
        </div>
      </a>
      <div className="absolute top-0 left-0 w-0.5 h-full bg-border group-hover:bg-signal-orange transition-colors duration-200" />
    </article>
  );
}
