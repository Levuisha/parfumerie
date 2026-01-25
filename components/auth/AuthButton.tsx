"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { ensureProfileRow } from "@/lib/ensureProfileRow";

type AuthState = {
  loading: boolean;
  email: string | null;
  error?: string;
};

interface AuthButtonProps {
  className?: string;
}

export function AuthButton({ className }: AuthButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    loading: true,
    email: null,
  });
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const ensuredRef = useRef(false);

  useEffect(() => {
    const { supabase, error } = getSupabaseClient();
    if (!supabase) {
      setState({ loading: false, email: null, error });
      return;
    }

    let isMounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return;
      const email = data.user?.email ?? null;
      setState({ loading: false, email });
      if (email && !ensuredRef.current) {
        ensuredRef.current = true;
        ensureProfileRow().then((res) => {
          if (!res.ok) {
            console.warn("[AuthButton] ensureProfileRow failed:", res.message);
            setWarningMessage("Profile sync failed (check console).");
          }
        });
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_, session) => {
        if (!isMounted) return;
        setWarningMessage(null);
        ensuredRef.current = false;
        setState({
          loading: false,
          email: session?.user?.email ?? null,
        });
        if (session?.user?.email) {
          ensuredRef.current = true;
          ensureProfileRow().then((res) => {
            if (!res.ok) {
              console.warn("[AuthButton] ensureProfileRow failed:", res.message);
              setWarningMessage("Profile sync failed (check console).");
            }
          });
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { supabase } = getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signOut();

    if (typeof window !== "undefined") {
      localStorage.removeItem("parfumerie_shelves");
      window.dispatchEvent(new Event("parfumerie_logout"));
    }

    router.push("/");
    router.refresh();
  };

  if (state.loading) {
    return <div className={className} />;
  }

  if (state.email) {
    return (
      <div className={className}>
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="text-sm text-[#a0a0a0] hover:text-[#ff6b35]"
          >
            Profile
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
        {warningMessage && (
          <p className="mt-2 text-xs text-amber-400">{warningMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <Link href="/auth/login" className="text-sm text-[#a0a0a0] hover:text-[#ff6b35]">
          Login
        </Link>
        <Link href="/auth/signup">
          <Button size="sm">Sign up</Button>
        </Link>
      </div>
    </div>
  );
}

