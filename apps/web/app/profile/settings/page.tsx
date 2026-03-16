"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { authClient } from "@/lib/auth-client";
import { BrutalistButton } from "@/components/brutalist-button";
import { toast } from "sonner";

const DELETE_CONFIRM_TEXT = "DELETE";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const currentUser = useRequireAuth("/profile/settings");
  const exportData = useQuery(api.account.getExportData);
  const deleteAllUserData = useMutation(api.account.deleteAllUserData);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.replace("/login");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });
      if (error) {
        setPasswordError(error.message ?? "Failed to change password.");
        return;
      }
      toast.success("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    const trimmed = newEmail.trim();
    if (!trimmed) {
      setEmailError("Enter a new email address.");
      return;
    }
    setEmailLoading(true);
    try {
      const { error } = await authClient.changeEmail({
        newEmail: trimmed,
        callbackURL: "/profile/settings",
      });
      if (error) {
        setEmailError(error.message ?? "Failed to change email.");
        return;
      }
      toast.success(
        "Verification email sent. Check your new inbox to confirm."
      );
      setNewEmail("");
    } catch (err) {
      setEmailError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setEmailLoading(false);
    }
  };

  const handleDownloadData = async () => {
    if (exportData === undefined || exportData === null) {
      toast.error("No data to export.");
      return;
    }
    setExportLoading(true);
    try {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `outfai-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download started.");
    } catch {
      toast.error("Export failed.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== DELETE_CONFIRM_TEXT) return;
    setDeleteLoading(true);
    try {
      await deleteAllUserData();
      toast.success("Account data deleted. Signing out.");
      await authClient.signOut();
      router.replace("/");
    } catch {
      toast.error("Could not delete account. Try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-10 xl:px-12">
          <Link
            href="/"
            className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium hover:text-signal-orange transition-colors duration-100"
          >
            OutfAI
          </Link>
          <Link
            href="/profile"
            className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors duration-100"
          >
            Profile
          </Link>
        </div>
      </header>

      <div className="pt-24 md:pt-32 px-4 md:px-8 lg:px-12 pb-28 max-w-xl">
        <h1 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-6">
          Settings
        </h1>

        {/* Profile */}
        <section className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Profile
          </p>
          <Link
            href="/profile"
            className="flex items-center justify-between w-full border border-border px-5 py-4 text-[11px] uppercase tracking-[0.2em] text-foreground hover:border-foreground transition-colors duration-100"
          >
            <span>Edit profile & preferences</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </section>

        {/* Account */}
        <section className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Account
          </p>
          <div className="border border-border divide-y divide-border">
            <div className="px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Email
              </p>
              <p className="text-sm text-foreground mt-1 truncate">
                {currentUser?.email ?? "—"}
              </p>
              {currentUser?.emailVerified !== undefined && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  {currentUser.emailVerified ? "Verified" : "Not verified"}
                </p>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-between w-full px-5 py-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive hover:border-destructive transition-colors duration-100"
            >
              <span>Sign out</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </section>

        {/* Security — Change password */}
        <section className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Change password
          </p>
          <form
            onSubmit={handleChangePassword}
            className="border border-border p-5 space-y-4"
          >
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">
                Current password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
                placeholder="••••••••"
              />
            </div>
            {passwordError && (
              <p className="text-xs uppercase tracking-wider text-signal-orange">
                {passwordError}
              </p>
            )}
            <BrutalistButton type="submit" disabled={passwordLoading}>
              {passwordLoading ? "Updating…" : "Update password"}
            </BrutalistButton>
          </form>
        </section>

        {/* Change email */}
        <section className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Change email
          </p>
          <form
            onSubmit={handleChangeEmail}
            className="border border-border p-5 space-y-4"
          >
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">
                New email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
                placeholder="you@example.com"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                We’ll send a verification link to the new address.
              </p>
            </div>
            {emailError && (
              <p className="text-xs uppercase tracking-wider text-signal-orange">
                {emailError}
              </p>
            )}
            <BrutalistButton type="submit" disabled={emailLoading}>
              {emailLoading ? "Sending…" : "Send verification email"}
            </BrutalistButton>
          </form>
        </section>

        {/* Data export */}
        <section className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Data export
          </p>
          <p className="text-sm text-muted-foreground border border-border px-5 py-4 mb-3">
            Download a copy of your wardrobe, outfits, preferences, and logs in
            JSON format.
          </p>
          <BrutalistButton
            type="button"
            variant="outline"
            disabled={exportData === undefined || exportLoading}
            onClick={handleDownloadData}
          >
            {exportLoading ? "Preparing…" : "Download my data"}
          </BrutalistButton>
        </section>

        {/* Danger zone — Delete account */}
        <section className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-destructive mb-3">
            Danger zone
          </p>
          <div className="border border-destructive p-5 space-y-4">
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all data (garments, outfits,
              preferences, logs). This cannot be undone.
            </p>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">
                Type <strong>DELETE</strong> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-destructive"
                placeholder="DELETE"
              />
            </div>
            <BrutalistButton
              type="button"
              variant="outline"
              disabled={
                deleteConfirm !== DELETE_CONFIRM_TEXT || deleteLoading
              }
              onClick={handleDeleteAccount}
              className="border-destructive text-destructive hover:bg-destructive hover:text-background"
            >
              {deleteLoading ? "Deleting…" : "Delete my account"}
            </BrutalistButton>
          </div>
        </section>
      </div>
    </main>
  );
}
