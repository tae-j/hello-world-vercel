"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // onAuthStateChange fires immediately with current session — no extra getSession() needed
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const isActive = (href: string) => pathname === href;

  const linkBase: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 999,
    textDecoration: "none",
    fontSize: 14,
    letterSpacing: 1,
    transition: "all 160ms ease",
  };

  const activeStyle = (href: string): React.CSSProperties => ({
    ...linkBase,
    color: "white",
    opacity: isActive(href) ? 1 : 0.7,
    background: isActive(href) ? "rgba(255,255,255,0.10)" : "transparent",
    border: isActive(href) ? "1px solid rgba(255,255,255,0.16)" : "1px solid transparent",
    boxShadow: isActive(href) ? "0 0 18px rgba(255,255,255,0.10)" : "none",
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 18,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        width: "min(960px, calc(100vw - 28px))",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "10px 12px",
          borderRadius: 999,
          background: "rgba(15,15,15,0.55)",
          border: "1px solid rgba(255,255,255,0.14)",
          backdropFilter: "blur(14px)",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05) inset",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 6 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "white",
              opacity: 0.9,
              boxShadow: "0 0 18px rgba(255,255,255,0.35)",
            }}
          />
          <span style={{ fontSize: 13, letterSpacing: 3, opacity: 0.85 }}>
            HELLO WORLD
          </span>
        </div>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/" style={activeStyle("/")}>Home</Link>
          <Link href="/captions" style={activeStyle("/captions")}>Captions</Link>
          <Link href="/ratings" style={activeStyle("/ratings")}>Rate</Link>
          <Link href="/upload" style={activeStyle("/upload")}>Upload</Link>

          {/* Only render auth button once we know the state (avoids flicker) */}
          {loggedIn === null ? null : loggedIn ? (
            <button
              onClick={handleSignOut}
              style={{
                ...linkBase,
                color: "white",
                opacity: 0.7,
                background: "transparent",
                border: "1px solid transparent",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.background = "rgba(255,255,255,0.10)";
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.16)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.7";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.border = "1px solid transparent";
              }}
            >
              Sign Out
            </button>
          ) : (
            <Link href="/login" style={activeStyle("/login")}>Login</Link>
          )}
        </div>
      </div>
    </div>
  );
}