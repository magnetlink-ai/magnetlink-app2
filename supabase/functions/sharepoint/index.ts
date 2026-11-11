// Magnet Link BMS — sharepoint Edge Function
// Lets signed-in BMS users work with the WebApp SharePoint site WITHOUT a Microsoft account:
// the function holds an app-only (client-credentials) token for the "Magnet Link" Entra app,
// which has Sites.Selected + a "write" grant on the WebApp site only.
//
// Deploy: Supabase Dashboard → Edge Functions → Create a new function named "sharepoint" → paste this file.
//   Disable "Enforce JWT verification" for this function (the BMS calls it with the publishable key only).
// Secrets (Dashboard → Edge Functions → Secrets):
//   SP_CLIENT_SECRET  — client secret of the Entra app (expires ~Nov 2028; rotate before then)
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically by the platform.
//
// API
//   POST ?action=login  JSON {email, password}           → {token, exp}   (token valid 12h)
//   POST ?action=graph  headers: x-sp-token, x-sp-method, x-sp-path (encodeURIComponent'd Graph path)
//                       body: forwarded as-is (JSON or file bytes)  → Graph response passed through

import { createClient } from "npm:@supabase/supabase-js@2";

const TENANT_ID = "3e66f2de-d516-4aae-91d9-d48601c5f242";
const CLIENT_ID = "873ef03e-36fb-463c-b62b-fea75f2d9760";
const SITE_ID =
  "magnetlinkinc.sharepoint.com,940da73c-72f4-441e-a290-c01cd11dedf6,6c448608-b00c-491a-9110-6c51265539f1";
const SITE_PATH = "/sites/magnetlinkinc.sharepoint.com:/sites/WebApp";
const SECTION = "design"; // BMS section whose permission gates SharePoint access
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

const CLIENT_SECRET = Deno.env.get("SP_CLIENT_SECRET") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-sp-token, x-sp-method, x-sp-path",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

/* ── Session tokens: HMAC-SHA256 signed, keyed off the app secret ── */
const enc = new TextEncoder();
const b64url = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = (s: string) =>
  Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));

let _hmacKey: CryptoKey | null = null;
const hmacKey = async () =>
  _hmacKey ??= await crypto.subtle.importKey(
    "raw", enc.encode("bms-sp-session:" + CLIENT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"],
  );

const signToken = async (payload: Record<string, unknown>) => {
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(body));
  return `${body}.${b64url(sig)}`;
};
const verifyToken = async (token: string) => {
  const [body, sig] = (token || "").split(".");
  if (!body || !sig) return null;
  const ok = await crypto.subtle.verify("HMAC", await hmacKey(), fromB64url(sig), enc.encode(body));
  if (!ok) return null;
  const payload = JSON.parse(new TextDecoder().decode(fromB64url(body)));
  return payload.exp > Date.now() ? payload : null;
};

/* ── BMS user check (mirrors canSee() in magnet-link-bms.html) ── */
const loadData = async (table: string) => {
  const { data, error } = await supabase.from(table).select("data");
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data ?? []).map((r: { data: any }) => r.data);
};
const canSeeSection = (user: any, customRoles: any[]) => {
  if (user.role === "super_admin" || user.role === "admin") return true;
  if (user.role === "client") return user.permissions?.[SECTION]?.access === true;
  const cr = customRoles.find((r) => r.id === user.role);
  if (cr) return cr.permissions?.[SECTION]?.access === true;
  return user.permissions?.[SECTION]?.access === true;
};

const login = async (email: string, password: string) => {
  email = (email || "").toLowerCase().trim();
  if (!email || !password) return json(400, { error: "missing_credentials" });

  const { data: pw } = await supabase.from("user_passwords").select("data").eq("id", email).maybeSingle();
  if (!pw?.data?.password || pw.data.password !== String(password).trim()) return json(401, { error: "bad_credentials" });

  const [members, clients, roles] = await Promise.all([
    loadData("team_members"), loadData("team_clients"), loadData("custom_roles"),
  ]);
  const user =
    members.find((m) => (m.email || "").toLowerCase() === email) ??
    (() => { const c = clients.find((c) => (c.email || "").toLowerCase() === email); return c && { ...c, role: "client" }; })();
  if (!user || user.status !== "active") return json(403, { error: "inactive_user" });
  if (!canSeeSection(user, roles)) return json(403, { error: "no_permission" });

  const exp = Date.now() + TOKEN_TTL_MS;
  return json(200, { token: await signToken({ uid: user.id, email, exp }), exp });
};

/* ── App-only Graph token (client credentials), cached in memory ── */
let _graph: { token: string; exp: number } | null = null;
const graphToken = async () => {
  if (_graph && _graph.exp > Date.now() + 60_000) return _graph.token;
  const res = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
      scope: "https://graph.microsoft.com/.default", grant_type: "client_credentials",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`token: ${data.error_description || data.error || res.status}`);
  _graph = { token: data.access_token, exp: Date.now() + data.expires_in * 1000 };
  return _graph.token;
};

/* ── Only the WebApp site and its own document libraries are reachable ── */
let _drives: Set<string> | null = null;
const siteDrives = async () => {
  if (_drives) return _drives;
  const res = await fetch(`https://graph.microsoft.com/v1.0/sites/${SITE_ID}/drives?$select=id`, {
    headers: { Authorization: `Bearer ${await graphToken()}` },
  });
  if (!res.ok) throw new Error(`drives: ${res.status}`);
  _drives = new Set((await res.json()).value.map((d: { id: string }) => d.id));
  return _drives;
};
const pathAllowed = async (path: string) => {
  if (!path.startsWith("/") || path.includes("..")) return false;
  if (path === SITE_PATH || path.startsWith(SITE_PATH + "?") || path.startsWith(SITE_PATH + "/")) return true;
  if (path === `/sites/${SITE_ID}` || path.startsWith(`/sites/${SITE_ID}/`) || path.startsWith(`/sites/${SITE_ID}?`)) return true;
  const m = path.match(/^\/drives\/([^/?]+)/);
  return !!m && (await siteDrives()).has(decodeURIComponent(m[1]));
};

const graph = async (req: Request) => {
  const session = await verifyToken(req.headers.get("x-sp-token") ?? "");
  if (!session) return json(401, { error: "session_expired" });

  const method = (req.headers.get("x-sp-method") || "GET").toUpperCase();
  if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)) return json(400, { error: "bad_method" });
  let path: string;
  try { path = decodeURIComponent(req.headers.get("x-sp-path") || ""); } catch { return json(400, { error: "bad_path" }); }
  if (!(await pathAllowed(path))) return json(403, { error: "path_not_allowed" });

  const body = ["GET", "DELETE"].includes(method) ? undefined : await req.arrayBuffer();
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${await graphToken()}`,
      ...(body ? { "Content-Type": req.headers.get("content-type") || "application/json" } : {}),
    },
    body,
  });
  const noBody = res.status === 204 || res.status === 304;
  return new Response(noBody ? null : await res.arrayBuffer(), {
    status: res.status,
    headers: { ...CORS, "Content-Type": res.headers.get("content-type") || "application/octet-stream" },
  });
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  if (!CLIENT_SECRET) return json(500, { error: "SP_CLIENT_SECRET not configured" });
  try {
    const action = new URL(req.url).searchParams.get("action");
    if (action === "login") {
      const { email, password } = await req.json();
      return await login(email, password);
    }
    if (action === "graph") return await graph(req);
    return json(400, { error: "unknown_action" });
  } catch (e) {
    console.error(e);
    return json(500, { error: String((e as Error).message || e) });
  }
});
