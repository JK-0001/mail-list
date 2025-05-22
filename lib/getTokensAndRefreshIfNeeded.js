// lib/gmail/getTokensAndRefreshIfNeeded.js
import { decrypt, encrypt } from "@/lib/crypto";

export async function getTokensAndRefreshIfNeeded(user_id, access_token, supabase) {

  let new_access_token = access_token

  const { data: tokenData } = await supabase
    .from("users_token")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (!tokenData) throw new Error("Missing token info");

  const refreshToken = decrypt(tokenData.refresh_token);
  console.log(refreshToken)
  let expiresAt;
  if (tokenData.access_token_expires_at) {
    expiresAt = new Date(tokenData.access_token_expires_at);
  }

  if (!tokenData.access_token_expires_at || Date.now() > expiresAt - 5 * 60 * 1000) {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      console.log(res)
      console.log(data)
      throw new Error("force_reauth");
    }

    const now = Date.now();
    const currentISOs = new Date().toISOString();

    const access_token_expires_at = (now + data.expires_in * 1000);
    const refresh_token_expires_at = (now + data.refresh_token_expires_in * 1000);

    const { error: tokenError } = await supabase.from("users_token").update({
      access_token: encrypt(data.access_token),
      access_token_expires_at,
      refresh_token_expires_at,
      id_token: encrypt(data.id_token),
      scope: encrypt(data.scope),
      token_type: encrypt(data.token_type),
      updated_at: currentISOs
    }).eq("user_id", user_id);

    if (tokenError) throw new Error(`Failed to update token in DB`)

    new_access_token = data.access_token;
  }

  return new_access_token;
}
