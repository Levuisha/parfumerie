"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email) {
      setErrorMessage("Please enter your email.");
      return;
    }

    const { supabase, error } = getSupabaseClient();
    if (!supabase) {
      setErrorMessage(error ?? "Supabase is not configured.");
      return;
    }

    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    setLoading(false);

    if (resetError) {
      setErrorMessage(resetError.message);
      return;
    }

    setSuccessMessage("Check your email for a password reset link.");
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto w-full max-w-md rounded-lg border border-[#2a2a2a] bg-[#141414] p-6">
        <h1 className="text-2xl font-bold text-white">Reset your password</h1>
        <p className="mt-2 text-sm text-[#a0a0a0]">
          Enter your email and we’ll send you a reset link.
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

          {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
          {successMessage && <p className="text-sm text-amber-400">{successMessage}</p>}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-[#a0a0a0]">
          Remembered your password?{" "}
          <Link href="/auth/login" className="text-[#ff6b35] hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
