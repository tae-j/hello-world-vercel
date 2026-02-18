// web/app/protected/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function ProtectedPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) redirect("/login");

  return (
    <main
      style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: "72px 24px 40px",
      }}
    >
      <h1 style={{ fontSize: 64, lineHeight: 1.03, letterSpacing: -1.2, margin: 0 }}>
        Protected
      </h1>

      <div
        style={{
          width: "min(720px, 100%)",
          marginTop: 18,
          padding: "26px 22px",
          borderRadius: 22,
          background: "rgba(15,15,15,0.55)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.65)",
        }}
      >
        <div style={{ opacity: 0.85, marginBottom: 8 }}>Get to voting</div>
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 18 }}>
          Ready to rate some memes?
        </div>

        <Link
          href="/ratings"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 18px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.16)",
            textDecoration: "none",
            color: "white",
            fontWeight: 600,
          }}
        >
          Begin Voting
        </Link>

        <form action="/auth/signout" method="post" style={{ marginTop: 18 }}>
          <button
            type="submit"
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "white",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}



