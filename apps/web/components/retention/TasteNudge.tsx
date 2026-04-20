"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";

type Pending = { threshold: number; label: string };

type TasteNudgeProps = {
  pending: Pending[] | undefined;
};

export function TasteNudge({ pending }: TasteNudgeProps) {
  const ack = useMutation(api.userPreferences.acknowledgeTasteNudge);
  const fired = useRef(false);

  useEffect(() => {
    if (!pending?.length || fired.current) return;
    const first = pending[0];
    if (!first) return;
    fired.current = true;
    toast.message("OutfAI noticed your taste", {
      description: `You often lean toward ${first.label}.`,
      duration: 6000,
    });
    void ack({ threshold: first.threshold }).catch(() => {
      fired.current = false;
    });
  }, [pending, ack]);

  return null;
}
