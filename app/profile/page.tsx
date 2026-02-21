"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { ensureProfileRow } from "@/lib/ensureProfileRow";
import { fetchOwnedFragranceOptions, fetchProfile, updateProfile, uploadAvatar } from "@/lib/profile";

type ProfileState =
  | { state: "loading" }
  | { state: "logged_out" }
  | { state: "logged_in"; userId: string; email: string | null };

type FormState = {
  username: string;
  bio: string;
  signatureFragranceId: string;
  avatarUrl: string | null;
};

export default function ProfilePage() {
  const [profileState, setProfileState] = useState<ProfileState>({ state: "loading" });
  const [form, setForm] = useState<FormState>({
    username: "",
    bio: "",
    signatureFragranceId: "none",
    avatarUrl: null,
  });
  const [ownedOptions, setOwnedOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);

  useEffect(() => {
    const { supabase } = getSupabaseClient();
    if (!supabase) {
      setProfileState({ state: "logged_out" });
      return;
    }

    let isMounted = true;

    async function loadProfile() {
      setLoadingMessage("Loading profile...");
      const { data: userData, error } = await supabase.auth.getUser();
      if (error || !userData.user) {
        if (!isMounted) return;
        setProfileState({ state: "logged_out" });
        setLoadingMessage(null);
        return;
      }

      const userId = userData.user.id;
      const email = userData.user.email ?? null;
      setProfileState({ state: "logged_in", userId, email });

      const ensureResult = await ensureProfileRow();
      if (!ensureResult.ok) {
        if (!isMounted) return;
        setErrorMessage(`Profile sync failed: ${ensureResult.message}`);
      }

      const profileResult = await fetchProfile(userId);
      if (!isMounted) return;
      if (profileResult.error) {
        setErrorMessage(`Profile load failed: ${profileResult.error}`);
      } else if (profileResult.data) {
        setForm({
          username: profileResult.data.username ?? "",
          bio: profileResult.data.bio ?? "",
          signatureFragranceId:
            profileResult.data.signature_fragrance_id?.toString() ?? "none",
          avatarUrl: profileResult.data.avatar_url ?? null,
        });
      }

      const ownedResult = await fetchOwnedFragranceOptions(userId);
      if (ownedResult.error) {
        setErrorMessage((prev) => prev ?? `Owned fragrances load failed: ${ownedResult.error}`);
      } else {
        setOwnedOptions(ownedResult.data);
      }

      setLoadingMessage(null);
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const initials = useMemo(() => {
    const source = form.username || (profileState.state === "logged_in" ? profileState.email ?? "" : "");
    const letters = source
      .split(" ")
      .map((part) => part.trim()[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
    return letters || "P";
  }, [form.username, profileState]);

  const handleSave = async () => {
    if (profileState.state !== "logged_in") return;
    setSaveMessage(null);
    setErrorMessage(null);

    const signature =
      form.signatureFragranceId === "none"
        ? null
        : Number(form.signatureFragranceId);

    const result = await updateProfile(profileState.userId, {
      username: form.username.trim() || null,
      bio: form.bio.trim() || null,
      signature_fragrance_id: Number.isFinite(signature) ? signature : null,
    });

    if (!result.ok) {
      setErrorMessage(`Profile update failed: ${result.error ?? "Unknown error"}`);
      return;
    }

    setSaveMessage("Profile updated.");
  };

  const handleAvatarUpload = async (file: File) => {
    if (profileState.state !== "logged_in") return;
    setAvatarMessage(null);
    setErrorMessage(null);

    const uploadResult = await uploadAvatar(profileState.userId, file);
    if (uploadResult.error) {
      const friendly = uploadResult.error.toLowerCase().includes("bucket")
        ? "Avatar upload failed. Create an avatars bucket in Supabase Storage."
        : `Avatar upload failed: ${uploadResult.error}`;
      setAvatarMessage(friendly);
      return;
    }

    if (uploadResult.publicUrl) {
      const updateResult = await updateProfile(profileState.userId, {
        avatar_url: uploadResult.publicUrl,
      });
      if (!updateResult.ok) {
        setErrorMessage(`Avatar save failed: ${updateResult.error ?? "Unknown error"}`);
        return;
      }
      setForm((prev) => ({ ...prev, avatarUrl: uploadResult.publicUrl ?? null }));
      setAvatarMessage("Avatar updated.");
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-lg border border-[#2a2a2a] bg-[#141414] p-6">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="mt-2 text-sm text-[#a0a0a0]">
          Update your profile details and signature scent.
        </p>

        {profileState.state === "loading" && (
          <p className="mt-6 text-sm text-[#a0a0a0]">Loading…</p>
        )}

        {profileState.state === "logged_out" && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-[#a0a0a0]">Please log in.</p>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Sign up</Button>
              </Link>
            </div>
          </div>
        )}

        {profileState.state === "logged_in" && (
          <div className="mt-6 space-y-6">
            {loadingMessage && <p className="text-sm text-[#a0a0a0]">{loadingMessage}</p>}
            {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
            {saveMessage && <p className="text-sm text-amber-400">{saveMessage}</p>}

            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full border border-[#2a2a2a] bg-[#0a0a0a] flex items-center justify-center text-lg font-semibold text-white">
                {form.avatarUrl ? (
                  <img src={form.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-[#a0a0a0]">Avatar</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                  }}
                />
                {avatarMessage && <p className="text-xs text-amber-400">{avatarMessage}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#a0a0a0]">Email</label>
              <Input value={profileState.email ?? ""} disabled />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#a0a0a0]">Username</label>
              <Input
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                placeholder="Your username"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#a0a0a0]">Bio</label>
              <Textarea
                value={form.bio}
                onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                placeholder="Tell us about your fragrance preferences..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#a0a0a0]">Signature scent</label>
              <Select
                value={form.signatureFragranceId}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, signatureFragranceId: value }))
                }
              >
                <SelectTrigger className="w-full border-[#2a2a2a] bg-[#141414] text-white focus:border-[#ff6b35]">
                  <SelectValue placeholder="Select a fragrance" />
                </SelectTrigger>
                <SelectContent className="border-[#2a2a2a] bg-[#141414] text-white">
                  <SelectItem value="none">None</SelectItem>
                  {ownedOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id.toString()}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {ownedOptions.length === 0 && (
                <p className="text-xs text-[#a0a0a0]">
                  Add fragrances to your Owned shelf to set a signature scent.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleSave}>Save changes</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

