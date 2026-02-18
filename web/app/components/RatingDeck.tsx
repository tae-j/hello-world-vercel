"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type DeckItem = {
  id: string; // caption id
  caption: string;
  imageUrl: string | null;
  storagePath: string | null;
};

export default function RatingDeck({ items }: { items: DeckItem[] }) {
  const [idx, setIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = items[idx] ?? null;
  const total = items.length;

  async function submitVote(voteValue: 1 | -1) {
    if (!current || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr || !user) {
        throw new Error("Not logged in. Please login first.");
      }

      const res = await fetch("/api/caption-votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption_id: current.id,
          vote_value: voteValue,
          profile_id: user.id,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? "Failed to save vote");
      }

      setIdx((prev) => Math.min(prev + 1, total - 1));
    } catch (e: any) {
      setError(e?.message ?? "Failed to save vote");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!current) return <div style={{ paddingTop: 24 }}>No items to rate.</div>;

  // Keep these two numbers the same so header + card align
  const MAX_WIDTH = 1400;

  const voteBtnStyle = (disabled: boolean): React.CSSProperties => ({
    width: 72,
    height: 72,
    borderRadius: 9999,
    border: "2px solid rgba(255,255,255,0.28)",
    background: "rgba(0,0,0,0.15)",
    color: "white",
    fontSize: 28,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    userSelect: "none",
  });

  return (
    <div style={{ width: "100%" }}>
      {/* Header row: counter left, buttons right (aligned to card width) */}
      <div
        style={{
          maxWidth: MAX_WIDTH,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <div style={{ opacity: 0.7 }}>{idx + 1}/{total}</div>

        <div style={{ display: "flex", gap: 16 }}>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => submitVote(-1)}
            aria-label="Thumbs down"
            style={voteBtnStyle(isSubmitting)}
          >
            👎
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => submitVote(1)}
            aria-label="Thumbs up"
            style={voteBtnStyle(isSubmitting)}
          >
            👍
          </button>
        </div>
      </div>

      {error && <div style={{ color: "tomato", marginBottom: 12 }}>{error}</div>}

      {/* Meme card */}
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 16,
          overflow: "hidden",
          maxWidth: MAX_WIDTH,
          width: "100%",
        }}
      >
        <div style={{ height: 420, background: "rgba(255,255,255,0.04)" }}>
          {current.imageUrl ? (
            <img
              src={current.imageUrl}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                height: "100%",
                display: "grid",
                placeItems: "center",
                opacity: 0.6,
              }}
            >
              Image goes here
            </div>
          )}
        </div>

        <div style={{ padding: 16, fontSize: 24, fontWeight: 700 }}>
          {current.caption}
        </div>
      </div>
    </div>
  );
}




