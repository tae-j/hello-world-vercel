"use client";

import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const signIn = async () => {
    const origin = window.location.origin;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    console.log("OAuth data:", data);
    if (error) console.error("OAuth error:", error);
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Login</h1>
      <p>Sign in to view the protected page.</p>
      <button onClick={signIn}>Sign in with Google</button>
    </main>
  );
}





