"use client";

import Image from "next/image";
import { useId } from "react";
import type { RefObject } from "react";

type AddGarmentUploadPanelProps = {
  fileInputRef: RefObject<HTMLInputElement | null>;
  dragActive: boolean;
  previewUrl: string | null;
  analyzeLoading: boolean;
  analyzeError: string | null;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  onClearImage: () => void;
};

export function AddGarmentUploadPanel({
  fileInputRef,
  dragActive,
  previewUrl,
  analyzeLoading,
  analyzeError,
  onDrag,
  onDrop,
  onFileInputChange,
  onAnalyze,
  onClearImage,
}: AddGarmentUploadPanelProps) {
  const uploadHintId = useId();

  return (
    <section>
      <p id={uploadHintId} className="sr-only">
        Drop an image file here, or activate this control to browse for a
        garment image.
      </p>
      <button
        type="button"
        className={`relative block aspect-[3/4] w-full cursor-pointer border-2 border-dashed text-left transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          dragActive
            ? "border-signal-orange bg-signal-orange/5"
            : previewUrl
              ? "border-border"
              : "border-border hover:border-foreground"
        }`}
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        aria-label={
          previewUrl ? "Change garment image" : "Upload garment image"
        }
        aria-describedby={uploadHintId}
      >
        {previewUrl ? (
          <Image
            src={previewUrl || "/placeholder.svg"}
            alt="Selected garment preview"
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-muted-foreground mb-4"
              aria-hidden
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Drop image here
            </p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">
              or click to browse
            </p>
          </div>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileInputChange}
        className="sr-only"
        tabIndex={-1}
      />

      {previewUrl && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onAnalyze}
            disabled={analyzeLoading}
            className="text-[10px] uppercase tracking-[0.2em] text-signal-orange hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
          >
            {analyzeLoading ? "Analyzing…" : "Auto-fill from image"}
          </button>
          <button
            type="button"
            onClick={onClearImage}
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-signal-orange transition-colors duration-100 cursor-pointer"
          >
            Remove image
          </button>
          {analyzeError && (
            <span className="text-[10px] text-destructive" role="alert">
              {analyzeError}
            </span>
          )}
        </div>
      )}
    </section>
  );
}
