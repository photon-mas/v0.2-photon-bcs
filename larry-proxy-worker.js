// Larry server for Photon BCS — a Cloudflare Worker (free plan). The AI key lives here as a secret, never in the app.
// Settings → Variables and Secrets (one of the two keys is enough):
//   GEMINI_API_KEY     (secret)  a free Google AI Studio key  → free answers (Gemini)
//   ANTHROPIC_API_KEY  (secret)  an Anthropic key             → paid answers (Claude)
//   ACCESS_TOKEN       (secret)  any long random string; type the same string in the app: সেটিংস → Larry → নিজের সার্ভার
//   ALLOWED_ORIGIN     (text)    https://photon-mas.github.io   (comma-separate several origins)
//   PROVIDER           (text, optional)  "gemini" or "claude"; default: claude when its key exists, else gemini
//   MODEL / QUICK_MODEL (text, optional) model for ভাবুক / ঝটপট; defaults: claude-opus-5-5, or gemini-3.8-flash / gemini-3.6-flash
export default {
  async fetch(req, env) {
    const origin = req.headers.get("origin") || "";
    const allow = (env.ALLOWED_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);
    const okOrigin = allow.includes(origin);
    const provider = env.PROVIDER === "gemini" || env.PROVIDER === "claude" ? env.PROVIDER : env.ANTHROPIC_API_KEY ? "claude" : "gemini";
    const key = provider === "claude" ? env.ANTHROPIC_API_KEY : env.GEMINI_API_KEY;
    const cors = { "access-control-allow-origin": okOrigin ? origin : "null", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type, x-photon-token", "access-control-max-age": "86400", "vary": "origin" };
    const J = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...cors, "content-type": "application/json; charset=utf-8" } });
    if (req.method === "OPTIONS") return new Response(null, { status: okOrigin ? 204 : 403, headers: cors });
    /* open the Worker URL in a browser to check the setup: it shows only whether each setting exists, never its value */
    if (req.method === "GET") return J({ ok: true, service: "photon-larry", PROVIDER: provider, GEMINI_API_KEY: !!env.GEMINI_API_KEY, ANTHROPIC_API_KEY: !!env.ANTHROPIC_API_KEY, ACCESS_TOKEN: !!env.ACCESS_TOKEN, ALLOWED_ORIGIN: allow });
    if (req.method !== "POST") return J({ error: "method" }, 405);
    if (!okOrigin) return J({ error: "origin" }, 403);
    if (!env.ACCESS_TOKEN || req.headers.get("x-photon-token") !== env.ACCESS_TOKEN) return J({ error: "token" }, 401);
    if (!key) return J({ error: "no key", provider }, 500);
    let body; try { body = await req.json(); } catch (e) { return J({ error: "json" }, 400); }
    const input = Array.isArray(body.input) ? body.input.filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim()) : [];
    if (!input.length) return J({ error: "input" }, 400);
    if (JSON.stringify(input).length > 250000) return J({ error: "too large" }, 413);
    const messages = []; /* alternating turns that start with the user */
    for (const m of input) { const last = messages[messages.length - 1]; if (last && last.role === m.role) last.content += "\n\n" + m.content; else messages.push({ role: m.role, content: m.content }); }
    while (messages.length && messages[0].role !== "user") messages.shift();
    if (!messages.length || messages[messages.length - 1].role !== "user") return J({ error: "input" }, 400);
    const fail = async r => { const e = await r.json().catch(() => ({})); return J({ error: "upstream", provider, status: r.status, detail: String((e.error && e.error.message) || "").slice(0, 300) }, r.status === 429 ? 429 : 502); };

    if (provider === "gemini") {
      const model = body.deep ? (env.MODEL || "gemini-3.8-flash") : (env.QUICK_MODEL || "gemini-3.6-flash");
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST", headers: { "x-goog-api-key": key, "content-type": "application/json" },
        body: JSON.stringify({ contents: messages.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })), generationConfig: { maxOutputTokens: body.deep ? 8192 : 2048, ...(body.json ? { responseMimeType: "application/json" } : {}) } })
      });
      if (!r.ok) return fail(r);
      const d = await r.json(), c = d.candidates && d.candidates[0];
      return J({ text: ((c && c.content && c.content.parts) || []).filter(p => p.text && !p.thought).map(p => p.text).join(""), provider, model });
    }
    const model = body.deep ? (env.MODEL || "claude-opus-5-5") : (env.QUICK_MODEL || env.MODEL || "claude-opus-5-5");
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: body.deep ? 4000 : 1200, messages, ...(body.json ? { system: "Reply with only the JSON value that is asked for, with no other text." } : {}) })
    });
    if (!r.ok) return fail(r);
    const d = await r.json();
    return J({ text: (d.content || []).filter(c => c.type === "text").map(c => c.text).join(""), provider, model });
  }
};
