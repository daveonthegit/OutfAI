"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { UserAvatar } from "@/components/user-avatar";
import { AddGarmentForm } from "@/components/add/add-garment-form";
import { useAddGarmentForm } from "@/hooks/use-add-garment-form";

export default function AddGarmentPage() {
  useRequireAuth("/add");
  const router = useRouter();
  const garmentForm = useAddGarmentForm({
    onSaved: () => router.push("/closet"),
  });

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass-bar rounded-none border-x-0 border-t-0 border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-10 xl:px-12">
          <Link
            href="/"
            className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium hover:text-signal-orange transition-colors duration-100"
          >
            OutfAI
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/closet"
              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100"
            >
              Back to closet
            </Link>
            <UserAvatar />
          </div>
        </div>
      </header>

      <div className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-24 md:pb-28">
        <PageContainer>
          <SectionHeader title="add garment" subtitle="Expand your archive" />

          <AddGarmentForm form={garmentForm} />
        </PageContainer>
      </div>
    </main>
  );
}
