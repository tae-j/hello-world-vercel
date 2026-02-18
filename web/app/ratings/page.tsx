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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("captions")
        .select("id, content, image_id, images ( url )")
        .order("created_datetime_utc", { ascending: false })
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
          storagePath: null, // your images table doesn't have storage_path
        };
      });

      setItems(mapped);
      setLoading(false);

      // Optional sanity check:
      // console.log("first mapped item:", mapped[0]);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <div
        style={{
          fontSize: 56,
          lineHeight: 1.05,
          letterSpacing: -1,
          marginBottom: 12,
        }}
      >
        Rate Memes
      </div>

      {loading ? (
        <div style={{ opacity: 0.8 }}>Loading...</div>
      ) : error ? (
        <div style={{ color: "tomato" }}>{error}</div>
      ) : (
        <RatingDeck items={items} />
      )}
    </main>
  );
}


