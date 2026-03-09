"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { authClient } from "@/lib/auth-client";
import { BrutalistAvatar } from "@/components/brutalist-avatar";
import { BrutalistButton } from "@/components/brutalist-button";
import {
  parseUsername,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
} from "@shared/validation/username";
import { BIO_MAX_LENGTH } from "@shared/validation/profile";

const DISPLAY_NAME_MAX_LENGTH = 100;
const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2MB
const AVATAR_ACCEPT = "image/jpeg,image/png,image/webp";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ProfilePage() {
  const router = useRouter();
  const currentUser = useRequireAuth("/profile");
  const profileData = useQuery(api.profile.getWithAvatarUrl);
  const garments = useQuery(api.garments.list) ?? [];
  const userPreferences = useQuery(api.userPreferences.get);
  const savePreferences = useMutation(api.userPreferences.save);
  const getOrCreateProfile = useMutation(api.profile.getOrCreate);
  const updateProfile = useMutation(api.profile.update);
  const generateAvatarUploadUrl = useMutation(
    api.profile.generateAvatarUploadUrl
  );
  const setAvatar = useMutation(api.profile.setAvatar);
  const removeAvatar = useMutation(api.profile.removeAvatar);

  const [preferredStyles, setPreferredStyles] = useState<string[]>([]);
  const [preferredColors, setPreferredColors] = useState<string[]>([]);
  const [avoidedColors, setAvoidedColors] = useState<string[]>([]);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (userPreferences?.explicit) {
      setPreferredStyles(userPreferences.explicit.preferredStyles ?? []);
      setPreferredColors(userPreferences.explicit.preferredColors ?? []);
      setAvoidedColors(userPreferences.explicit.avoidedColors ?? []);
    }
  }, [userPreferences]);

  // Ensure default profile exists for current user (idempotent).
  React.useEffect(() => {
    if (!currentUser || profileData !== null) return;
    getOrCreateProfile().catch(() => {});
  }, [currentUser, profileData, getOrCreateProfile]);

  React.useEffect(() => {
    if (currentUser && !editing) {
      setEditName(currentUser.name ?? "");
      setEditUsername(currentUser.username ?? "");
      setEditBio(profileData?.bio ?? "");
    }
  }, [currentUser, profileData?.bio, editing]);

  const toggleInList = (
    value: string,
    list: string[],
    setter: (next: string[]) => void
  ) => {
    if (list.includes(value)) {
      setter(list.filter((v) => v !== value));
    } else {
      setter([...list, value]);
    }
  };

  const handleSavePreferences = async () => {
    await savePreferences({
      preferredStyles,
      preferredColors,
      avoidedColors,
    });
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.replace("/login");
  };

  const avatarDisplayUrl = currentUser?.image ?? profileData?.avatarUrl ?? null;
  const display = currentUser?.name ?? currentUser?.email ?? "";
  const abbr = initials(display);

  const handleStartEdit = () => {
    setProfileError("");
    setProfileSuccess("");
    setEditing(true);
    setEditName(currentUser?.name ?? "");
    setEditUsername(currentUser?.username ?? "");
    setEditBio(profileData?.bio ?? "");
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setProfileError("");
    setProfileSuccess("");
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }
    if (
      !AVATAR_ACCEPT.split(",")
        .map((t) => t.trim())
        .includes(file.type)
    ) {
      setProfileError("Please choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setProfileError("Image must be 2MB or smaller.");
      return;
    }
    setProfileError("");
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    if (!currentUser) return;
    setAvatarLoading(true);
    setProfileError("");
    try {
      await removeAvatar();
      await authClient.updateUser({ image: "" });
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Failed to remove avatar."
      );
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);

    try {
      const name = editName.trim();
      const usernameRaw = editUsername.trim();
      if (name.length > DISPLAY_NAME_MAX_LENGTH) {
        setProfileError(
          `Display name must be at most ${DISPLAY_NAME_MAX_LENGTH} characters.`
        );
        setProfileLoading(false);
        return;
      }
      if (usernameRaw.length > 0) {
        const parsed = parseUsername(usernameRaw);
        if (!parsed.success) {
          setProfileError(parsed.error);
          setProfileLoading(false);
          return;
        }
        const { data: availability } = await authClient.isUsernameAvailable({
          username: parsed.value,
        });
        if (
          availability &&
          !availability.available &&
          parsed.value !== (currentUser.username ?? "").toLowerCase()
        ) {
          setProfileError("This username is already taken.");
          setProfileLoading(false);
          return;
        }
      }
      if (editBio.length > BIO_MAX_LENGTH) {
        setProfileError(`Bio must be at most ${BIO_MAX_LENGTH} characters.`);
        setProfileLoading(false);
        return;
      }

      const updates: { name?: string; username?: string } = {};
      if (name) updates.name = name;
      if (usernameRaw) {
        const parsed = parseUsername(usernameRaw);
        if (parsed.success) updates.username = parsed.value;
      }
      if (Object.keys(updates).length > 0) {
        const { error } = await authClient.updateUser(updates);
        if (error) {
          setProfileError(error.message ?? "Failed to update profile.");
          setProfileLoading(false);
          return;
        }
      }

      await updateProfile({ bio: editBio.trim() || undefined });

      if (avatarFile) {
        const uploadUrl = await generateAvatarUploadUrl();
        const response = await fetch(uploadUrl, {
          method: "POST",
          body: avatarFile,
          headers: { "Content-Type": avatarFile.type },
        });
        if (!response.ok) {
          setProfileError("Upload failed. Please try again.");
          setProfileLoading(false);
          return;
        }
        const { storageId: id } = await response.json();
        const url = await setAvatar({ storageId: id as Id<"_storage"> });
        await authClient.updateUser({ image: url });
      }

      setProfileSuccess("Profile updated.");
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-12">
          <Link
            href="/"
            className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium hover:text-signal-orange transition-colors duration-100"
          >
            OutfAI
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/profile/settings"
              className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors duration-100"
            >
              Settings
            </Link>
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Profile
            </span>
          </div>
        </div>
      </header>

      <div className="pt-24 md:pt-32 px-4 md:px-8 lg:px-12 pb-28 max-w-xl">
        {/* Avatar + identity */}
        <section className="mb-12">
          <div className="flex items-center gap-5 mb-8">
            <div className="relative shrink-0">
              <BrutalistAvatar
                src={avatarPreview ?? avatarDisplayUrl ?? undefined}
                alt="Profile"
                initials={abbr}
                size="lg"
              />
              {editing && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={AVATAR_ACCEPT}
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <BrutalistButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload
                  </BrutalistButton>
                  {(avatarDisplayUrl || avatarPreview) && (
                    <BrutalistButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={avatarLoading}
                      onClick={handleRemoveAvatar}
                    >
                      {avatarLoading ? "Removing…" : "Remove"}
                    </BrutalistButton>
                  )}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              {currentUser ? (
                !editing ? (
                  <>
                    <p className="text-lg font-medium truncate">
                      {currentUser.name || "No name"}
                    </p>
                    {currentUser.username && (
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
                        @{currentUser.username}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {currentUser.email}
                    </p>
                    {profileData?.bio && (
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                        {profileData.bio}
                      </p>
                    )}
                    <BrutalistButton
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={handleStartEdit}
                    >
                      Edit profile
                    </BrutalistButton>
                  </>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">
                        Display name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        maxLength={DISPLAY_NAME_MAX_LENGTH}
                        className="w-full bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
                        placeholder="Your name"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {editName.length}/{DISPLAY_NAME_MAX_LENGTH}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        maxLength={USERNAME_MAX_LENGTH}
                        className="w-full bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
                        placeholder="username"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {USERNAME_MIN_LENGTH}–{USERNAME_MAX_LENGTH} characters,
                        letters, numbers, underscores, periods.
                      </p>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">
                        Bio
                      </label>
                      <textarea
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        maxLength={BIO_MAX_LENGTH}
                        rows={3}
                        className="w-full bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground resize-none"
                        placeholder="A short bio..."
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {editBio.length}/{BIO_MAX_LENGTH}
                      </p>
                    </div>
                    {profileError && (
                      <p className="text-xs uppercase tracking-wider text-signal-orange">
                        {profileError}
                      </p>
                    )}
                    {profileSuccess && (
                      <p className="text-xs uppercase tracking-wider text-foreground">
                        {profileSuccess}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <BrutalistButton type="submit" disabled={profileLoading}>
                        {profileLoading ? "Saving…" : "Save"}
                      </BrutalistButton>
                      <BrutalistButton
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={profileLoading}
                      >
                        Cancel
                      </BrutalistButton>
                    </div>
                  </form>
                )
              ) : (
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted-foreground/10 animate-pulse rounded" />
                  <div className="h-3 w-48 bg-muted-foreground/10 animate-pulse rounded" />
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-border" />
        </section>

        {/* Stats */}
        <section className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
            Wardrobe
          </p>
          <div className="grid grid-cols-2 gap-px border border-border bg-border">
            <div className="bg-background px-5 py-4">
              <p className="text-3xl font-light tabular-nums">
                {garments.length}
              </p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                Items
              </p>
            </div>
            <div className="bg-background px-5 py-4">
              <p className="text-3xl font-light tabular-nums">
                {new Set(garments.map((g: Doc<"garments">) => g.category)).size}
              </p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                Categories
              </p>
            </div>
          </div>
        </section>

        {/* Style Preferences */}
        <section className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
            Style Preferences
          </p>

          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Preferred styles
            </p>
            <div className="flex flex-wrap gap-2">
              {["minimalist", "bold", "classic", "trendy", "cozy"].map(
                (style) => {
                  const active = preferredStyles.includes(style);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() =>
                        toggleInList(style, preferredStyles, setPreferredStyles)
                      }
                      className={`px-3 py-1 text-[11px] uppercase tracking-[0.16em] border transition-colors duration-100 ${
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      {style}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Preferred colors
            </p>
            <div className="flex flex-wrap gap-2">
              {["black", "white", "gray", "navy", "beige", "red", "blue"].map(
                (color) => {
                  const active = preferredColors.includes(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        toggleInList(color, preferredColors, setPreferredColors)
                      }
                      className={`px-3 py-1 text-[11px] uppercase tracking-[0.16em] border transition-colors duration-100 ${
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      {color}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Colors to avoid
            </p>
            <div className="flex flex-wrap gap-2">
              {["black", "white", "gray", "navy", "beige", "red", "blue"].map(
                (color) => {
                  const active = avoidedColors.includes(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        toggleInList(color, avoidedColors, setAvoidedColors)
                      }
                      className={`px-3 py-1 text-[11px] uppercase tracking-[0.16em] border transition-colors duration-100 ${
                        active
                          ? "border-destructive bg-destructive text-background"
                          : "border-border text-muted-foreground hover:border-destructive"
                      }`}
                    >
                      {color}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSavePreferences}
            className="mt-2 flex items-center justify-between w-full border border-border px-5 py-4 text-[11px] uppercase tracking-[0.2em] text-foreground hover:border-foreground transition-colors duration-100"
          >
            <span>Save Preferences</span>
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
          </button>
        </section>

        {/* Actions */}
        <section className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
            Account
          </p>

          <Link
            href="/closet"
            className="flex items-center justify-between w-full border border-border px-5 py-4 text-[11px] uppercase tracking-[0.2em] text-foreground hover:border-foreground transition-colors duration-100"
          >
            <span>My Closet</span>
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

          <button
            onClick={handleSignOut}
            className="flex items-center justify-between w-full border border-border px-5 py-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:border-destructive hover:text-destructive transition-colors duration-100"
          >
            <span>Sign Out</span>
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
        </section>
      </div>
    </main>
  );
}
