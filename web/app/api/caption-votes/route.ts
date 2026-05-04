import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const caption_id = body?.caption_id as string | undefined;
    const vote_value = Number(body?.vote_value);
    const profile_id = body?.profile_id as string | undefined;

    if (!caption_id) {
      return NextResponse.json({ error: "caption_id is required" }, { status: 400 });
    }

    if (vote_value !== 1 && vote_value !== -1) {
      return NextResponse.json({ error: "vote_value must be 1 or -1" }, { status: 400 });
    }

    if (!profile_id) {
      return NextResponse.json({ error: "profile_id is required" }, { status: 400 });
    }

    // Server client reads the auth session from the request cookies so RLS
    // policies that check auth.uid() work correctly.
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

    // Guard: reject unauthenticated callers before touching the DB.
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 1) Try update first (handles changing your vote without duplicates)
    const { data: updatedRow, error: updateError } = await supabase
      .from("caption_votes")
      .update({
        vote_value,
        modified_by_user_id: profile_id,
      })
      .eq("caption_id", caption_id)
      .eq("profile_id", profile_id)
      .select("caption_id")
      .maybeSingle();

    if (updateError) {
      console.error("[caption-votes] update error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    if (updatedRow) {
      return NextResponse.json({ ok: true, action: "updated" }, { status: 200 });
    }

    // 2) No existing row — insert a new vote
    const { error: insertError } = await supabase.from("caption_votes").insert({
      caption_id,
      vote_value,
      profile_id,
      created_by_user_id: profile_id,
      modified_by_user_id: profile_id,
    });

    if (insertError) {
      console.error("[caption-votes] insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, action: "inserted" }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
