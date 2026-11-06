const encoder = new TextEncoder();
async function digest(value: string) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", encoder.encode(value)),
  );
}
export async function matches(a: string, b: string) {
  const [x, y] = await Promise.all([digest(a), digest(b)]);
  return x.reduce((d, v, i) => d | (v ^ y[i]), 0) === 0;
}
async function signature(key: string, value: string) {
  const k = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return [
    ...new Uint8Array(
      await crypto.subtle.sign("HMAC", k, encoder.encode(value)),
    ),
  ]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
}
export async function issue(key: string) {
  const payload = Date.now() + 3600000 + "." + crypto.randomUUID();
  return payload + "." + (await signature(key, payload));
}
export async function authorized(request: Request, key?: string) {
  if (!key || key.length < 32) return false;
  const token =
    (request.headers.get("cookie") || "").match(
      /(?:^|;\s*)tl_editor=([^;]+)/,
    )?.[1] || "";
  const [expiry, nonce, mac] = token.split(".");
  return (
    !!mac &&
    Number(expiry) > Date.now() &&
    (await matches(mac, await signature(key, expiry + "." + nonce)))
  );
}
export function cookie(request: Request, value: string, age: number) {
  return (
    "tl_editor=" +
    value +
    "; Path=/; HttpOnly; SameSite=Strict; Max-Age=" +
    age +
    (new URL(request.url).protocol === "https:" ? "; Secure" : "")
  );
}
