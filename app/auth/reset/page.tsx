"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const { supabase } = getSupabaseClient();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
    });
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!hasSession) {
      setErrorMessage("Open the reset link from your email to continue.");
      return;
    }

    if (!password || !confirmPassword) {
      setErrorMessage("Please enter and confirm your new password.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    const { supabase, error } = getSupabaseClient();
    if (!supabase) {
      setErrorMessage(error ?? "Supabase is not configured.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setErrorMessage(updateError.message);
      return;
    }

    setSuccessMessage("Password updated. Redirecting to login...");
    setTimeout(() => {
      router.push("/auth/login");
    }, 1200);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto w-full max-w-md rounded-lg border border-[#2a2a2a] bg-[#141414] p-6">
        <h1 className="text-2xl font-bold text-white">Set a new password</h1>
        <p className="mt-2 text-sm text-[#a0a0a0]">
          Enter a new password for your account.
        </p>

        {!hasSession && (
          <div className="mt-4 rounded-md border border-[#2a2a2a] bg-[#0a0a0a] p-4 text-sm text-[#a0a0a0]">
            Open the reset link from your email to continue.
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#a0a0a0]" htmlFor="password">
              New password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#a0a0a0]" htmlFor="confirmPassword">
              Confirm password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
          {successMessage && <p className="text-sm text-amber-400">{successMessage}</p>}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-[#a0a0a0]">
          Back to{" "}
          <Link href="/auth/login" className="text-[#ff6b35] hover:underline">
            login
          </Link>
        </p>
      </div>
    </div>
  );
}
