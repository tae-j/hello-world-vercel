"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const linkBase: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 999,
    textDecoration: "none",
    fontSize: 14,
    letterSpacing: 1,
    transition: "all 160ms ease",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 18,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        width: "min(860px, calc(100vw - 28px))",
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

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link
            href="/"
            style={{
              ...linkBase,
              color: "white",
              opacity: isActive("/") ? 1 : 0.7,
              background: isActive("/") ? "rgba(255,255,255,0.10)" : "transparent",
              border: isActive("/") ? "1px solid rgba(255,255,255,0.16)" : "1px solid transparent",
              boxShadow: isActive("/") ? "0 0 18px rgba(255,255,255,0.10)" : "none",
            }}
          >
            Home
          </Link>

          <Link
            href="/captions"
            style={{
              ...linkBase,
              color: "white",
              opacity: isActive("/captions") ? 1 : 0.7,
              background: isActive("/captions") ? "rgba(255,255,255,0.10)" : "transparent",
              border: isActive("/captions")
                ? "1px solid rgba(255,255,255,0.16)"
                : "1px solid transparent",
              boxShadow: isActive("/captions") ? "0 0 18px rgba(255,255,255,0.10)" : "none",
            }}
          >
            Captions
          </Link>
        </div>
      </div>
    </div>
  );
}

