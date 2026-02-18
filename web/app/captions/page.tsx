"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type CaptionRow = {
  id: string;
  created_datetime_utc: string;
  content: string;
  image_id: string | null;
  images: { url: string | null } | null; // joined table result
};

export default function CaptionsPage() {
  const [rows, setRows] = useState<CaptionRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ✅ modal state
  const [active, setActive] = useState<CaptionRow | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("captions")
        .select("id, created_datetime_utc, content, image_id, images ( url )")
        .order("created_datetime_utc", { ascending: false })
        .limit(25)
        .returns<CaptionRow[]>();

      if (error) setError(error.message);
      else setRows(data ?? []);
    }

    load();
  }, []);

  // ✅ close modal helper
  function closeModal() {
    setActive(null);
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>Captions</h1>

      {error && (
        <p style={{ color: "tomato", marginBottom: 16 }}>Error: {error}</p>
      )}

      <div style={{ display: "grid", gap: 14 }}>
        {rows.map((row) => {
          const imageUrl = row.images?.url ?? null;

          return (
            <button
              key={row.id}
              onClick={() => setActive(row)}
              style={{
                all: "unset",
                cursor: "pointer",
                display: "block",
              }}
            >
              <div
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0px)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 14,
                  padding: 16,
                  backdropFilter: "blur(6px)",
                  transition: "transform 120ms ease, background 120ms ease",
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                }}
              >
                {/* thumbnail */}
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt=""
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 12,
                      objectFit: "cover",
                      flex: "0 0 auto",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 12,
                      flex: "0 0 auto",
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  />
                )}

                {/* caption text */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 8 }}>
                    {new Date(row.created_datetime_utc).toLocaleString()}
                  </div>

                  <div
                    style={{
                      fontSize: 18,
                      lineHeight: 1.35,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 760,
                    }}
                  >
                    {row.content}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ✅ MODAL */}
      {active && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.70)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(560px, 92vw)",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(18,18,18,0.92)",
              boxShadow: "0 22px 70px rgba(0,0,0,0.65)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* X button */}
            <button
              onClick={closeModal}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 36,
                height: 36,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.10)",
                color: "white",
                fontSize: 18,
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              ×
            </button>

            {/* big image */}
            {active.images?.url ? (
              <img
                src={active.images.url}
                alt=""
                style={{
                  width: "100%",
                  height: 420,
                  objectFit: "cover",
                  display: "block",
                  background: "rgba(255,255,255,0.04)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: 320,
                  background: "rgba(255,255,255,0.06)",
                }}
              />
            )}

            {/* caption content */}
            <div style={{ padding: 16 }}>
              <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 10 }}>
                {new Date(active.created_datetime_utc).toLocaleString()}
              </div>

              <div style={{ fontSize: 20, lineHeight: 1.35 }}>
                {active.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}





