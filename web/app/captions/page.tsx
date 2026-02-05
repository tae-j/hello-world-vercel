"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type CaptionRow = {
  id: string;
  created_datetime_utc: string;
  content: string;
};

export default function CaptionsPage() {
  const [rows, setRows] = useState<CaptionRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("captions")
        .select("id, created_datetime_utc, content")
        .order("created_datetime_utc", { ascending: false })
        .limit(25);

      if (error) setError(error.message);
      else setRows(data ?? []);
    }

    load();
  }, []);

return (
  <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
    <h1 style={{ fontSize: 28, marginBottom: 16 }}>Captions</h1>

    {error && (
      <p style={{ color: "tomato", marginBottom: 16 }}>
        Error: {error}
      </p>
    )}

    <div style={{ display: "grid", gap: 14 }}>
    {rows.map((row) => (
    <div
        key={row.id}
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
        }}
    >
        <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 10 }}>
          {new Date(row.created_datetime_utc).toLocaleString()}
        </div>

        <div style={{ fontSize: 18, lineHeight: 1.35 }}>
          {row.content}
        </div>
    </div>
    ))}
    </div>

  </main>
);
}



