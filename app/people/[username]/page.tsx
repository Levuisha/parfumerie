"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSupabaseClient } from "@/lib/supabaseClient";

type ProfileRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  signature_fragrance_id: number | null;
};

type ShelfRow = {
  fragrance_id: number;
  status: string;
  fragrances?: {
    id: number;
    name: string;
    image_url: string | null;
    year: number | null;
    concentration: string | null;
    brands?: { name: string | null } | null;
  } | null;
};

type FragranceCard = {
  id: number;
  name: string;
  brand: string;
  image: string | null;
  year: number | null;
  concentration: string | null;
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

export default function PublicProfilePage() {
  const params = useParams();
  const usernameParam = Array.isArray(params.username)
    ? params.username[0]
    : params.username;
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [signatureName, setSignatureName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [owned, setOwned] = useState<FragranceCard[]>([]);
  const [want, setWant] = useState<FragranceCard[]>([]);
  const [tested, setTested] = useState<FragranceCard[]>([]);
  const [friendStatus, setFriendStatus] = useState<"idle" | "friends" | "none">("idle");
  const [friendLoading, setFriendLoading] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setErrorMessage(null);

      const { supabase, error } = getSupabaseClient();
      if (!supabase) {
        setErrorMessage(error ?? "Supabase is not configured.");
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!cancelled) {
        setMyId(userData.user?.id ?? null);
      }

      const { data: profileRow, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, bio, signature_fragrance_id")
        .eq("username", usernameParam)
        .maybeSingle();

      if (cancelled) return;

      if (profileError || !profileRow) {
        setErrorMessage("User not found.");
        setLoading(false);
        return;
      }

      setProfile(profileRow as ProfileRow);

      if (profileRow.signature_fragrance_id) {
        const { data: signature } = await supabase
          .from("fragrances")
          .select("id, name")
          .eq("id", profileRow.signature_fragrance_id)
          .maybeSingle();
        if (!cancelled) {
          setSignatureName(signature?.name ?? null);
        }
      }

      const { data: shelfRows, error: shelfError } = await supabase
        .from("user_fragrance_status")
        .select("fragrance_id, status")
        .eq("user_id", profileRow.id);

      if (cancelled) return;

      if (shelfError) {
        console.warn("[people] shelf rows failed:", shelfError);
        setErrorMessage(shelfError.message);
      } else {
        if (!shelfRows || shelfRows.length === 0) {
          console.warn("[people] shelf rows empty for user:", profileRow.id);
        }

        const fragranceIds = (shelfRows ?? [])
          .map((row) => Number(row.fragrance_id))
          .filter((value) => Number.isFinite(value));

        if (fragranceIds.length === 0) {
          setOwned([]);
          setWant([]);
          setTested([]);
        } else {
          const { data: fragrances, error: fragranceError } = await supabase
            .from("fragrances")
            .select("id, name, image_url, year, concentration, brands(name)")
            .in("id", fragranceIds);

          if (fragranceError) {
            console.warn("[people] fragrances fetch failed:", fragranceError);
            setErrorMessage(fragranceError.message);
          } else {
            const fragranceMap = new Map<number, FragranceCard>();
            (fragrances ?? []).forEach((row) => {
              const id = Number(row.id);
              if (!Number.isFinite(id)) return;
              fragranceMap.set(id, {
                id,
                name: row.name as string,
                brand: row.brands?.name ?? "Unknown",
                image: row.image_url ?? null,
                year: row.year ?? null,
                concentration: row.concentration ?? null,
              });
            });

            const ownedList: FragranceCard[] = [];
            const wantList: FragranceCard[] = [];
            const testedList: FragranceCard[] = [];

            (shelfRows ?? []).forEach((row) => {
              const id = Number(row.fragrance_id);
              const card = fragranceMap.get(id);
              if (!card) return;

              if (row.status === "OWNED") ownedList.push(card);
              if (row.status === "WANT") wantList.push(card);
              if (row.status === "TESTED") testedList.push(card);
            });

            setOwned(ownedList);
            setWant(wantList);
            setTested(testedList);
          }
        }
      }

      setLoading(false);
    }

    if (usernameParam) {
      loadProfile();
    }

    return () => {
      cancelled = true;
    };
  }, [usernameParam]);

  useEffect(() => {
    let cancelled = false;

    async function checkFriend() {
      if (!profile || !myId || profile.id === myId) {
        setFriendStatus("idle");
        return;
      }

      const { supabase } = getSupabaseClient();
      if (!supabase) return;

      const { data } = await supabase
        .from("friends")
        .select("id")
        .eq("user_id", myId)
        .eq("friend_id", profile.id)
        .maybeSingle();

      if (cancelled) return;
      setFriendStatus(data ? "friends" : "none");
    }

    checkFriend();
    return () => {
      cancelled = true;
    };
  }, [profile, myId]);

  const handleAddFriend = async () => {
    if (!profile || !myId) return;
    setFriendLoading(true);

    const { supabase } = getSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase
      .from("friends")
      .insert({ user_id: myId, friend_id: profile.id });

    setFriendLoading(false);
    if (error) {
      console.warn("[friends] add failed:", error);
      return;
    }

    setFriendStatus("friends");
  };

  const handleRemoveFriend = async () => {
    if (!profile || !myId) return;
    setFriendLoading(true);
    const { supabase } = getSupabaseClient();
    if (!supabase) return;

    await supabase.from("friends").delete().eq("user_id", myId).eq("friend_id", profile.id);
    setFriendLoading(false);
    setFriendStatus("none");
  };

  const headerInitials = useMemo(() => {
    if (!profile?.username) return "U";
    return initialsFrom(profile.username);
  }, [profile]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-[#a0a0a0]">Loading profile…</p>
      </div>
    );
  }

  if (errorMessage || !profile) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-white">User not found</h1>
        <p className="mt-2 text-sm text-[#a0a0a0]">{errorMessage}</p>
      </div>
    );
  }

  const showFriendButton = myId && myId !== profile.id;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-[#2a2a2a] bg-[#0a0a0a] flex items-center justify-center text-lg font-semibold text-white">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username ?? "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{headerInitials}</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {profile.username ?? "User"}
              </h1>
              {profile.bio && <p className="text-sm text-[#a0a0a0]">{profile.bio}</p>}
              {signatureName && (
                <p className="text-sm text-[#ff6b35]">Signature scent: {signatureName}</p>
              )}
            </div>
          </div>

          {showFriendButton && (
            <div>
              {friendStatus === "none" && (
                <Button onClick={handleAddFriend} disabled={friendLoading}>
                  {friendLoading ? "Adding..." : "Add friend"}
                </Button>
              )}
              {friendStatus === "friends" && (
                <Button variant="outline" onClick={handleRemoveFriend} disabled={friendLoading}>
                  {friendLoading ? "Removing..." : "Friends"}
                </Button>
              )}
              {!myId && (
                <p className="text-xs text-[#a0a0a0]">Log in to add friend.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Shelves</h2>
        <Tabs defaultValue="owned">
          <TabsList>
            <TabsTrigger value="owned">Owned ({owned.length})</TabsTrigger>
            <TabsTrigger value="want">Want ({want.length})</TabsTrigger>
            <TabsTrigger value="tested">Tested ({tested.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="owned">
            <ShelfGrid items={owned} />
          </TabsContent>
          <TabsContent value="want">
            <ShelfGrid items={want} />
          </TabsContent>
          <TabsContent value="tested">
            <ShelfGrid items={tested} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ShelfGrid({ items }: { items: FragranceCard[] }) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-sm text-[#a0a0a0]">No fragrances in this shelf.</div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/fragrance/${item.id}`}
          className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-3 hover:border-[#ff6b35] transition-colors"
        >
          <div className="aspect-square w-full overflow-hidden rounded-md bg-[#1a1a1a]">
            {item.image ? (
              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-[#a0a0a0]">
                No image
              </div>
            )}
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-sm font-semibold text-white line-clamp-1">{item.name}</p>
            <p className="text-xs text-[#ff6b35]">{item.brand}</p>
            {(item.year || item.concentration) && (
              <p className="text-[11px] text-[#a0a0a0]">
                {item.year ? item.year : "Year N/A"}
                {item.concentration ? ` • ${item.concentration}` : ""}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
