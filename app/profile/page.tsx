"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabaseClient";

type ProfileState =
  | { state: "loading" }
  | { state: "logged_out" }
  | { state: "logged_in"; email: string | null; id: string };

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileState>({ state: "loading" });

  useEffect(() => {
    const { supabase } = getSupabaseClient();
    if (!supabase) {
      setProfile({ state: "logged_out" });
      return;
    }

    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        setProfile({ state: "logged_out" });
        return;
      }

      setProfile({
        state: "logged_in",
        email: data.user.email ?? null,
        id: data.user.id,
      });
    });
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-lg border border-[#2a2a2a] bg-[#141414] p-6">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="mt-2 text-sm text-[#a0a0a0]">
          Account details (more fields coming later).
        </p>

        {profile.state === "loading" && (
          <p className="mt-6 text-sm text-[#a0a0a0]">Loading…</p>
        )}

        {profile.state === "logged_out" && (
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

        {profile.state === "logged_in" && (
          <div className="mt-6 space-y-4">
            <div className="rounded-md border border-[#2a2a2a] bg-[#0a0a0a] p-4">
              <p className="text-xs uppercase text-[#a0a0a0]">Email</p>
              <p className="mt-1 text-sm text-white">
                {profile.email ?? "Unknown"}
              </p>
            </div>
            <div className="rounded-md border border-[#2a2a2a] bg-[#0a0a0a] p-4">
              <p className="text-xs uppercase text-[#a0a0a0]">User ID</p>
              <p className="mt-1 break-all text-sm text-white">{profile.id}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

