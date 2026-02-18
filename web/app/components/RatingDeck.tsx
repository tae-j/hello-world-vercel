// app/components/RatingDeck.tsx
"use client";

import { useState, type CSSProperties } from "react";
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

  // hover/press states (purely visual)
  const [hovered, setHovered] = useState<"up" | "down" | null>(null);
  const [pressed, setPressed] = useState<"up" | "down" | null>(null);

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
      setPressed(null);
    }
  }

  if (!current) return <div style={{ paddingTop: 24 }}>No items to rate.</div>;

  // Keep these the same so header + card align
  const MAX_WIDTH = 1400;

  // ✅ Make the meme area smaller so caption + buttons fit without scrolling
  // - clamp keeps it responsive across laptop vs big monitor
  const IMAGE_HEIGHT = "clamp(300px, 52vh, 420px)";

  const voteBtnStyle = (disabled: boolean, kind: "up" | "down"): CSSProperties => {
    const isHover = hovered === kind;
    const isPress = pressed === kind;

    return {
      width: 72,
      height: 72,
      borderRadius: 9999,
      border: isHover ? "2px solid rgba(255,255,255,0.55)" : "2px solid rgba(255,255,255,0.28)",
      background: isHover ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.15)",
      color: "white",
      fontSize: 28,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1,
      userSelect: "none",
      backdropFilter: "blur(6px)",

      transform: disabled
        ? "none"
        : isPress
        ? "scale(0.96)"
        : isHover
        ? "scale(1.04)"
        : "scale(1)",
      transition: "transform 120ms ease, border-color 120ms ease, background 120ms ease",
    };
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Header row: counter left, buttons right */}
      <div
        style={{
          maxWidth: MAX_WIDTH,
          width: "100%",
          margin: "0 auto 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ opacity: 0.7 }}>
          {idx + 1}/{total}
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => submitVote(-1)}
            aria-label="Thumbs down"
            onMouseEnter={() => setHovered("down")}
            onMouseLeave={() => {
              setHovered(null);
              setPressed(null);
            }}
            onMouseDown={() => setPressed("down")}
            onMouseUp={() => setPressed(null)}
            style={voteBtnStyle(isSubmitting, "down")}
          >
            👎
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => submitVote(1)}
            aria-label="Thumbs up"
            onMouseEnter={() => setHovered("up")}
            onMouseLeave={() => {
              setHovered(null);
              setPressed(null);
            }}
            onMouseDown={() => setPressed("up")}
            onMouseUp={() => setPressed(null)}
            style={voteBtnStyle(isSubmitting, "up")}
          >
            👍
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: "tomato", marginBottom: 12, maxWidth: MAX_WIDTH, marginInline: "auto" }}>
          {error}
        </div>
      )}

      {/* Meme card */}
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 16,
          overflow: "hidden",
          maxWidth: MAX_WIDTH,
          width: "100%",
          margin: "0 auto",
          background: "rgba(0,0,0,0.12)",
        }}
      >
        <div
          style={{
            height: IMAGE_HEIGHT, // ✅ smaller + responsive
            background: "rgba(255,255,255,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {current.imageUrl ? (
            <img
              src={current.imageUrl}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
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

        <div
          style={{
            padding: 14,
            fontSize: 22, // slightly smaller so it fits nicer
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.25,
          }}
        >
          {current.caption}
        </div>
      </div>
    </div>
  );
}




