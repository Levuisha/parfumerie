"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { ensureProfileRow } from "@/lib/ensureProfileRow";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setWarningMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);
    const { supabase, error } = getSupabaseClient();
    if (!supabase) {
      setLoading(false);
      setErrorMessage(error ?? "Supabase is not configured.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      const friendly =
        signInError.message.toLowerCase().includes("email not confirmed")
          ? "Please confirm your email before logging in."
          : signInError.message;
      setLoading(false);
      setErrorMessage(friendly);
      return;
    }

    const profileResult = await ensureProfileRow();
    if (!profileResult.ok) {
      console.warn("Profile ensure failed after login.", profileResult.message);
      setWarningMessage(
        "Logged in, but profile sync failed. You can continue, but some features may be missing."
      );
    }

    router.push("/");
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto w-full max-w-md rounded-lg border border-[#2a2a2a] bg-[#141414] p-6">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-[#a0a0a0]">
          Log in with your email and password.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#a0a0a0]" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#a0a0a0]" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-red-400">{errorMessage}</p>
          )}
          {warningMessage && (
            <p className="text-sm text-amber-400">{warningMessage}</p>
          )}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-[#a0a0a0]">
          New here?{" "}
          <Link href="/auth/signup" className="text-[#ff6b35] hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

