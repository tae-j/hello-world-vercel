import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

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

    const now = new Date().toISOString();

    // 1) Try update first (handles "changing your vote" without duplicates)
    const { data: updatedRow, error: updateError } = await supabase
      .from("caption_votes")
      .update({
        vote_value,
        modified_datetime_utc: now,
      })
      .eq("caption_id", caption_id)
      .eq("profile_id", profile_id)
      .select("caption_id")
      .maybeSingle();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // If we updated an existing vote, we're done
    if (updatedRow) {
      return NextResponse.json({ ok: true, action: "updated" }, { status: 200 });
    }

    // 2) Otherwise insert a new vote
    const { error: insertError } = await supabase.from("caption_votes").insert({
      caption_id,
      vote_value,
      profile_id,
      created_datetime_utc: now,
      modified_datetime_utc: now,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, action: "inserted" }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}





