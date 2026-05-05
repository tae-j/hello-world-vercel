// app/components/RatingDeck.tsx
"use client";

import { useState, useEffect, useRef, type CSSProperties } from "react";
import { supabase } from "@/lib/supabaseClient";

type DeckItem = {
  id: string; // caption id
  caption: string;
  imageUrl: string | null;
  storagePath: string | null;
};

function storageKey(userId: string) {
  return `ratings_pos_${userId}`;
}

function newCaptionsKey(userId: string) {
  return `latest_uploaded_caption_ids_${userId}`;
}

export default function RatingDeck({ items }: { items: DeckItem[] }) {
  const [idx, setIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // hover/press states (purely visual)
  const [hovered, setHovered] = useState<"up" | "down" | null>(null);
  const [pressed, setPressed] = useState<"up" | "down" | null>(null);
  // Tracks the deck index of the last "newly uploaded" caption so we know when
  // to clear the prioritization signal after the user votes past it.
  const [lastNewIdx, setLastNewIdx] = useState<number | null>(null);
  // Guards the restore effect so it only applies its logic once per mount,
  // preventing a second effect firing (from a parent re-render or auth event)
  // from overwriting the already-resolved position with stale saved progress.
  const restoredRef = useRef(false);

  // Track auth state and keep userId in sync.
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
      setUserId(user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Restore deck position once both userId and items are ready.
  useEffect(() => {
    if (!userId || items.length === 0) return;
    // Only restore once per mount. A second firing (e.g. from a parent re-render
    // passing a new items reference, or an auth event updating userId to the same
    // value) must not overwrite the position we already resolved.
    if (restoredRef.current) return;
    restoredRef.current = true;

    // Newly uploaded captions take priority over the saved position. If the user
    // just generated captions, start them there so they can rate their own upload.
    const newIdsRaw = localStorage.getItem(newCaptionsKey(userId));
    if (newIdsRaw) {
      try {
        const newIds: string[] = JSON.parse(newIdsRaw);
        const newIndices = newIds
          .map((id) => items.findIndex((item) => item.id === id))
          .filter((i) => i >= 0)
          .sort((a, b) => a - b);

        if (newIndices.length > 0) {
          setIdx(newIndices[0]);
          setLastNewIdx(newIndices[newIndices.length - 1]);
          return; // skip normal position restoration
        }
      } catch {}
      // Signal is stale or malformed — discard and fall through to normal restore.
      localStorage.removeItem(newCaptionsKey(userId));
    }

    // Normal saved-position restoration, keyed on caption ID so it survives
    // deck size changes between sessions.
    const saved = localStorage.getItem(storageKey(userId));
    if (!saved) return;
    const savedIdx = items.findIndex((item) => item.id === saved);
    if (savedIdx >= 0) {
      setIdx(savedIdx);
    } else {
      // Caption was removed from the deck; drop the stale entry and start fresh.
      localStorage.removeItem(storageKey(userId));
    }
  }, [userId, items]);

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

      // Advance and persist only after the server confirms the vote saved.
      const nextIdx = Math.min(idx + 1, total - 1);
      setIdx(nextIdx);
      const nextItem = items[nextIdx];
      if (nextItem) {
        localStorage.setItem(storageKey(user.id), nextItem.id);
      }

      // Once the user has voted on the last newly uploaded caption, clear the
      // prioritization signal so normal progress persistence resumes.
      if (lastNewIdx !== null && idx >= lastNewIdx) {
        localStorage.removeItem(newCaptionsKey(user.id));
        setLastNewIdx(null);
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to save vote");
    } finally {
      setIsSubmitting(false);
      setPressed(null);
    }
  }

  if (!current) return <div style={{ paddingTop: 24 }}>No items to rate.</div>;

  const votingDisabled = isSubmitting || isLoggedIn === false;

  // Keep these the same so header + card align
  const MAX_WIDTH = 1400;

  // clamp keeps it responsive across laptop vs big monitor
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
            disabled={votingDisabled}
            onClick={() => submitVote(-1)}
            aria-label="Thumbs down"
            onMouseEnter={() => setHovered("down")}
            onMouseLeave={() => {
              setHovered(null);
              setPressed(null);
            }}
            onMouseDown={() => setPressed("down")}
            onMouseUp={() => setPressed(null)}
            style={voteBtnStyle(votingDisabled, "down")}
          >
            👎
          </button>

          <button
            type="button"
            disabled={votingDisabled}
            onClick={() => submitVote(1)}
            aria-label="Thumbs up"
            onMouseEnter={() => setHovered("up")}
            onMouseLeave={() => {
              setHovered(null);
              setPressed(null);
            }}
            onMouseDown={() => setPressed("up")}
            onMouseUp={() => setPressed(null)}
            style={voteBtnStyle(votingDisabled, "up")}
          >
            👍
          </button>
        </div>
      </div>

      {isLoggedIn === false && (
        <div
          style={{
            marginBottom: 14,
            maxWidth: MAX_WIDTH,
            marginInline: "auto",
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid rgba(255,120,80,0.35)",
            background: "rgba(255,80,40,0.10)",
            color: "rgba(255,160,130,1)",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span>You must be logged in to vote.</span>
          <a
            href="/login"
            style={{
              color: "white",
              textDecoration: "underline",
              opacity: 0.85,
              flexShrink: 0,
            }}
          >
            Sign in →
          </a>
        </div>
      )}

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
            height: IMAGE_HEIGHT,
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

        <div style={{ padding: "10px 14px 14px" }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 2,
              opacity: 0.45,
              textTransform: "uppercase",
              marginBottom: 6,
              textAlign: "center",
            }}
          >
            Caption
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              textAlign: "center",
              lineHeight: 1.25,
            }}
          >
            {current.caption}
          </div>
        </div>
      </div>
    </div>
  );
}
