"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { getSupabaseClient } from "@/lib/supabaseClient";

type PersonRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
};

const initialsFrom = (value: string) => {
  return value
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export default function PeoplePage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [results, setResults] = useState<PersonRow[]>([]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        setErrorMessage(null);
        return;
      }

      const { supabase, error } = getSupabaseClient();
      if (!supabase) {
        setErrorMessage(error ?? "Supabase is not configured.");
        return;
      }

      setLoading(true);
      setErrorMessage(null);

      const { data, error: queryError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, bio")
        .ilike("username", `%${query}%`)
        .order("username", { ascending: true })
        .limit(20);

      if (queryError) {
        setErrorMessage(queryError.message);
        setResults([]);
      } else {
        setResults((data ?? []).filter((row) => row.username));
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  const displayResults = useMemo(() => {
    return results.map((row) => {
      const username = row.username ?? "Unknown";
      const initials = initialsFrom(username);
      return { ...row, username, initials };
    });
  }, [results]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">People</h1>
        <p className="mt-1 text-sm text-[#a0a0a0]">
          Search for other fragrance collectors.
        </p>
      </div>

      <div className="mb-6 max-w-md">
        <Input
          placeholder="Search by username..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {loading && <p className="text-sm text-[#a0a0a0]">Searching…</p>}
      {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}

      {!loading && query.trim() && displayResults.length === 0 && !errorMessage && (
        <p className="text-sm text-[#a0a0a0]">No users found.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {displayResults.map((person) => (
          <Link
            key={person.id}
            href={`/people/${person.username}`}
            className="flex items-center gap-3 rounded-lg border border-[#2a2a2a] bg-[#141414] p-4 hover:border-[#ff6b35] transition-colors"
          >
            <div className="h-12 w-12 overflow-hidden rounded-full border border-[#2a2a2a] bg-[#0a0a0a] flex items-center justify-center text-sm font-semibold text-white">
              {person.avatar_url ? (
                <img
                  src={person.avatar_url}
                  alt={person.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{person.initials}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{person.username}</p>
              {person.bio && (
                <p className="text-xs text-[#a0a0a0] line-clamp-1">{person.bio}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
