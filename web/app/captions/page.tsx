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
    <main style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <div
        style={{
          fontSize: 56,
          lineHeight: 1.05,
          letterSpacing: -1,
          marginBottom: 8,
        }}
      >
        Captions
      </div>
      <p style={{ margin: "0 0 24px", opacity: 0.65, fontSize: 16, lineHeight: 1.55 }}>
        Browse all AI-generated captions. Click any card to view it in detail.
      </p>

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
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0px)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                }}
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 16,
                  padding: 20,
                  backdropFilter: "blur(6px)",
                  transition: "transform 120ms ease, background 120ms ease, border-color 120ms ease",
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
                <div style={{ minWidth: 0, flex: 1 }}>
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

                {/* persistent chevron signals the card is clickable */}
                <div
                  style={{
                    flex: "0 0 auto",
                    fontSize: 20,
                    opacity: 0.35,
                    paddingLeft: 4,
                  }}
                >
                  ›
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
              width: "min(640px, 94vw)",
              borderRadius: 22,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(12,12,20,0.96)",
              boxShadow: "0 28px 80px rgba(0,0,0,0.72)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* X button — opaque dark base so it reads on any image */}
            <button
              onClick={closeModal}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 46,
                height: 46,
                borderRadius: 999,
                border: "1.5px solid rgba(150,130,255,0.65)",
                background: "rgba(8,6,22,0.90)",
                color: "white",
                fontSize: 22,
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 0 14px rgba(120,100,255,0.30)",
                zIndex: 1,
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
            <div style={{ padding: "20px 22px 26px" }}>
              <div style={{ opacity: 0.55, fontSize: 12, letterSpacing: 0.3, marginBottom: 12 }}>
                {new Date(active.created_datetime_utc).toLocaleString()}
              </div>

              <div style={{ fontSize: 21, lineHeight: 1.45, fontWeight: 500 }}>
                {active.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}





