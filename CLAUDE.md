# CLAUDE.md — ihf-scripts

Static donation tile grids (temple + Goshala) for WordPress embeds and GitHub Pages CDN.
GitHub: `madhupurinivaasadasa/ihf-scripts` → `madhupurinivaasadasa.github.io/ihf-scripts/`.

## Rules that bite

1. **Ship minified assets** — After editing JS/CSS, run `bash minify.sh`; production loads `.min.js` / `.min.css`.
2. **Test locally** — `donations-goshala.html` uses local assets; CDN HTML uses GitHub Pages URLs.
3. **Playwright** — `node test_donations.js` needs a local server (`python3 -m http.server 9090`).
4. **Employer matching** — VPF employers use `-vpf` form URLs; others `-ihf`. State in cookie + `localStorage`.
5. **Iframe embeds** — `donation-iframe-resize.js` posts height to parent; matcher calls `notifyIframeHeight()` on employer UI changes.

## Extended docs

- [`docs/AGENT_GUIDE.md`](docs/AGENT_GUIDE.md) — file map, UX flow, design tokens, Lighthouse notes, change history.
