# Photon BCS

Private project. All rights reserved (see LICENSE). This repository holds only the built site, version 1.1.3XL.

## Deploy (account: photon-mas)
1. Create the repository `photon-mas/v1-xl-photon-bcs` (Pages on a free account needs it public).
2. Add file → Upload files → select every file in this folder (all of them sit at the top level; there are no folders) → Commit to `main`.
3. Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch `main`, folder `/ (root)` → Save.
4. The site appears at `https://photon-mas.github.io/v1-xl-photon-bcs/` a minute or two later.

All Photon sites on `photon-mas.github.io` share one browser origin, so progress saved in this browser is shared between them;
each site keeps its own offline cache.

## Larry (AI tutor) outside claude.ai (optional)
Inside claude.ai, Larry uses your own Claude account and needs nothing here. On this GitHub site Larry works only through
your own small server, so the API key never reaches the browser. `larry-proxy-worker.js` and `larry-proxy-README.md` hold a Cloudflare Worker and its setup steps.
Without it, Larry says it is offline and shows matching questions from the bank instead.

To update: replace the files with a newer bundle and push. Search engines are asked not to index the site (robots.txt and a noindex tag).
