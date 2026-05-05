// app/ratings/page.tsx
"use client";

import { useEffect, useState } from "react";
import RatingDeck from "@/app/components/RatingDeck";
import { supabase } from "@/lib/supabaseClient";

type RatingRow = {
  id: string;
  content: string;
  image_id: string | null;
  // Supabase relationship can come back as object OR array depending on schema
  images: { url: string | null } | { url: string | null }[] | null;
};

type DeckItem = {
  id: string;
  caption: string;
  imageUrl: string | null;
  storagePath: string | null;
};

export default function RatePage() {
  const [items, setItems] = useState<DeckItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Fetch fresh captions on every mount. Using getUser() directly ensures the
  // fetch always runs regardless of whether onAuthStateChange fires immediately
  // (avoids stale router-cache state from Next.js client-side navigation).
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;

      setIsLoggedIn(!!user);

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("captions")
        .select("id, content, image_id, images ( url )")
        .order("created_datetime_utc", { ascending: false })
        .order("id", { ascending: false })
        .limit(100);

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setItems([]);
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as RatingRow[];

      const mapped: DeckItem[] = rows.map((row) => {
        const img =
          Array.isArray(row.images) ? row.images[0] ?? null : row.images ?? null;

        return {
          id: row.id,
          caption: row.content,
          imageUrl: img?.url ?? null,
          storagePath: null,
        };
      });

      setItems(mapped);
      setLoading(false);
    }

    load();

    // Update isLoggedIn UI state for sign-in/sign-out while on the page
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) setIsLoggedIn(!!session?.user);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []); // empty deps — always fetches fresh data on every mount

  return (
    <main style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <div
        style={{
          fontSize: 56,
          lineHeight: 1.05,
          letterSpacing: -1,
          marginBottom: 8,
        }}
      >
        Rate Captions
      </div>

      <p style={{ margin: "0 0 24px", opacity: 0.7, fontSize: 16, lineHeight: 1.5 }}>
        Each card shows an image with an AI-generated caption below it.
        Vote on how funny or fitting the <strong style={{ color: "white", opacity: 1 }}>caption</strong> is — not the image itself.
      </p>

      {isLoggedIn === false ? (
        <div
          style={{
            width: "min(620px, 100%)",
            margin: "32px auto 0",
            padding: "52px 40px",
            borderRadius: 24,
            background: "rgba(10,10,20,0.78)",
            border: "1px solid rgba(255,255,255,0.14)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 28px 70px rgba(0,0,0,0.72), inset 0 0 0 1px rgba(255,255,255,0.04)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3, marginBottom: 12 }}>
            You are not signed in.
          </div>
          <div style={{ opacity: 0.65, fontSize: 15, lineHeight: 1.6, marginBottom: 6 }}>
            Please sign in to continue.
          </div>
          <div style={{ opacity: 0.4, fontSize: 13, lineHeight: 1.5, marginBottom: 32 }}>
            Click sign in to go to the login page.
          </div>
          <a
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "13px 34px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.28)",
              color: "white",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: 0.3,
            }}
          >
            Sign in
          </a>
        </div>
      ) : isLoggedIn === null || loading ? (
        <div style={{ opacity: 0.8 }}>Loading...</div>
      ) : error ? (
        <div style={{ color: "tomato" }}>{error}</div>
      ) : (
        <RatingDeck items={items} />
      )}
    </main>
  );
}


