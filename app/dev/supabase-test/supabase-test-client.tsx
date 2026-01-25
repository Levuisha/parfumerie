"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type Status =
  | { state: "idle" | "loading" }
  | { state: "error"; message: string }
  | { state: "success"; hasSession: boolean; email?: string | null };

export default function SupabaseTestClient() {
  const [status, setStatus] = useState<Status>({ state: "idle" });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setStatus({ state: "loading" });

      const { supabase, error } = getSupabaseClient();
      if (!supabase) {
        setStatus({ state: "error", message: error ?? "Supabase not initialized." });
        return;
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (cancelled) return;

      if (sessionError) {
        setStatus({ state: "error", message: sessionError.message });
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (cancelled) return;

      if (userError) {
        setStatus({ state: "error", message: userError.message });
        return;
      }

      setStatus({
        state: "success",
        hasSession: Boolean(data.session),
        email: userData.user?.email ?? null,
      });
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status.state === "loading" || status.state === "idle") {
    return <p className="text-sm text-[#a0a0a0]">Testing Supabase…</p>;
  }

  if (status.state === "error") {
    return (
      <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-4">
        <p className="text-sm font-medium text-white">Supabase test: failed</p>
        <p className="mt-2 text-sm text-[#a0a0a0]">{status.message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-4">
      <p className="text-sm font-medium text-white">Supabase test: success</p>
      <p className="mt-2 text-sm text-[#a0a0a0]">
        Session: {status.hasSession ? "present" : "none"}
      </p>
      <p className="mt-1 text-sm text-[#a0a0a0]">
        User email: {status.email ?? "none"}
      </p>
    </div>
  );
}

