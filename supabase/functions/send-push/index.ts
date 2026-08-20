// Magnet Link BMS — send-push Edge Function
// Deploy via Supabase Dashboard → Edge Functions → Create a new function → paste this file.
// Secrets required (Dashboard → Edge Functions → send-push → Secrets):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (e.g. "mailto:you@example.com")
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically by the platform.
// Disable "Enforce JWT verification" for this function — the client calls it with the anon key only.

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") ?? "mailto:support@example.com",
  Deno.env.get("VAPID_PUBLIC_KEY") ?? "",
  Deno.env.get("VAPID_PRIVATE_KEY") ?? "",
);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  try {
    const { userIds, title, body, section } = await req.json();
    if (!Array.isArray(userIds) || !userIds.length || !title) {
      return new Response(JSON.stringify({ error: "userIds[] and title are required" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const ids = userIds.map(String);
    // One device can be shared by several accounts (e.g. tested on the same phone), so a
    // subscription row holds a list of userIds. Table is small (one row per device), so a
    // full scan + in-memory filter is simpler and more robust than a jsonb path query.
    const { data: allRows, error } = await supabase
      .from("push_subscriptions")
      .select("id, data");

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const rows = (allRows || []).filter((row) => {
      const rowIds = row.data?.userIds || (row.data?.userId ? [row.data.userId] : []);
      return rowIds.some((id: string) => ids.includes(String(id)));
    });

    const payload = JSON.stringify({ title, body: body || "", section: section || null });
    const staleIds: string[] = [];

    await Promise.all((rows || []).map(async (row) => {
      const sub = row.data?.subscription;
      if (!sub) return;
      try {
        await webpush.sendNotification(sub, payload);
      } catch (err) {
        if (err?.statusCode === 404 || err?.statusCode === 410) staleIds.push(row.id);
      }
    }));

    if (staleIds.length) {
      await supabase.from("push_subscriptions").delete().in("id", staleIds);
    }

    return new Response(JSON.stringify({ sent: (rows || []).length - staleIds.length, pruned: staleIds.length }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
