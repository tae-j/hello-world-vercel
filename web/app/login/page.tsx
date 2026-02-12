"use client";

import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const signIn = async () => {
    const origin = window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) console.error("OAuth error:", error);
  };

  return (
    <main
      style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: "72px 24px 40px",
      }}
    >
      <h1 style={{ fontSize: 56, lineHeight: 1.05, letterSpacing: -1, margin: 0 }}>
        Login
      </h1>

      <p style={{ marginTop: 10, opacity: 0.82, fontSize: 16, lineHeight: 1.5 }}>
        Sign in to view the protected page.
      </p>

      <div
        style={{
          width: "min(520px, 100%)",
          marginTop: 18,
          padding: "22px 22px",
          borderRadius: 18,
          background: "rgba(15,15,15,0.45)",
          border: "1px solid rgba(255,255,255,0.14)",
          backdropFilter: "blur(14px)",
          boxShadow:
            "0 18px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05) inset",
        }}
      >
        <button
          onClick={signIn}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            cursor: "pointer",
            fontSize: 14,
            letterSpacing: 0.2,
            transition: "all 160ms ease",
            boxShadow: "0 0 18px rgba(255,255,255,0.08)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.12)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.transform = "translateY(0px)";
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: "rgba(255,255,255,0.10)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.12)",
              fontSize: 12,
              opacity: 0.9,
            }}
          >
            G
          </span>
          Sign in with Google
        </button>

        <div style={{ marginTop: 14, opacity: 0.65, fontSize: 13 }}>
          You’ll be redirected back automatically after signing in.
        </div>
      </div>
    </main>
  );
}




