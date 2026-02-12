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

  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

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
          padding: "22px 22px",
          borderRadius: 22,
          background: "rgba(15,15,15,0.45)",
          border: "1px solid rgba(255,255,255,0.14)",
          backdropFilter: "blur(14px)",
          boxShadow:
            "0 18px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05) inset",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "white",
              opacity: 0.9,
              boxShadow: "0 0 18px rgba(255,255,255,0.35)",
            }}
          />
          <span style={{ opacity: 0.85 }}>Signed in as</span>
          <span style={{ fontWeight: 600 }}>{data.user.email}</span>
        </div>

        <form action="/auth/signout" method="post" style={{ marginTop: 16 }}>
          <button type="submit" className="btn-ghost">
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
  
