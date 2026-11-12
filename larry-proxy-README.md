# Larry server (Cloudflare Worker) — optional

You do not need this for free AI: the simplest free option is to paste a free Gemini key in the app
(সেটিংস → Larry → ফ্রি AI: Gemini). Use this server only if you want the key to live on a server instead of in your browser,
or to use Claude (paid). The Cloudflare free plan is enough.

## 1. Get a key (one is enough)
- **Free:** aistudio.google.com/apikey → Create API key. Do not turn on billing; the free tier is enough for one learner.
- **Paid (Claude):** console.anthropic.com → Billing (add credit) → API Keys → Create Key. Set a monthly limit under Limits.

## 2. Create the Worker
1. dash.cloudflare.com → sign up or log in → Workers & Pages → Create → Create Worker ("Hello World") → name it `photon-larry` → Deploy.
2. Edit code → delete everything → paste all of `larry-proxy-worker.js` → Deploy.
3. Settings → Variables and Secrets → Add, then Deploy:
   - `GEMINI_API_KEY` (**Secret**, free) and/or `ANTHROPIC_API_KEY` (**Secret**, paid)
   - `ACCESS_TOKEN` (**Secret**): any long random string you make up (30+ letters and numbers)
   - `ALLOWED_ORIGIN` (**Text**): `https://photon-mas.github.io` (no slash at the end, no repo name)
   - optional `PROVIDER` (`gemini` or `claude`), `MODEL`, `QUICK_MODEL`
4. Open the Worker URL in a browser: you should see `"ok":true`, the provider, and `true` for the key and token you set (values are never shown).

## 3. Connect the app
সেটিংস → Larry → নিজের সার্ভার → paste the Worker URL and the same ACCESS_TOKEN → **সংযোগ পরীক্ষা করুন**.
If you also saved a Gemini key in the app, choose which one Larry uses first.
