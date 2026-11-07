# AGENT_GUIDE.md — ihf-scripts (extended)

Donation tile pages for temple/Goshala WordPress embeds and GitHub Pages CDN.
**Cheat sheet:** `../CLAUDE.md` at repo root.

## Donation landing pages

- **Purpose**: Donation tile grid for temple and goshala campaign pages, served via GitHub Pages CDN
- **Technology**: Vanilla JS, CSS — no build framework, minified with terser/cleancss
- **Deployment**: Pushed to `madhupurinivaasadasa.github.io/ihf-scripts/` — production pages load `.min.js`/`.min.css` from there

**Key Files:**
```
ihf-scripts/
  donation-matcher.js          # Core: tile rendering, employer matching, navigation
  donation-matcher.min.js      # Minified (terser)
  donation-tiles-temple.js     # Tile data: temple campaigns (window.donationForms)
  donation-tiles-goshala.js    # Tile data: goshala campaigns
  donations_wpadmin.css        # All tile/banner/inline-employer styles (CSS variables, fonts)
  donations_wpadmin.min.css    # Minified (cleancss)
  donation-iframe-resize.js    # Parent page: resizes iframe to fit content
  donations.html               # Standalone temple page (CDN assets)
  donations-goshala.html       # Standalone goshala page (LOCAL assets — use for testing)
  donations_wpadmin.html       # WordPress embed fragment, temple (CDN assets)
  donations_wpadmin-goshala.html  # WordPress embed fragment, goshala (CDN assets)
  test-iframe.html             # Iframe test harness (loads donations-goshala.html)
  minify.sh                    # Build: terser + cleancss → .min files
  test_donations.js            # Playwright tests (21 tests, gitignored)
```

**Local Development:**
```bash
cd ihf-scripts

# Test standalone (uses local JS/CSS, no server needed)
open file:///$(pwd)/donations-goshala.html

# Test in iframe
open file:///$(pwd)/test-iframe.html

# Run Playwright tests (requires HTTP server)
python3 -m http.server 9090 &
node test_donations.js

# Run Lighthouse (in Chrome DevTools > Lighthouse tab)
# Use http://localhost:9090/donations-goshala.html

# Minify after changes
bash minify.sh
```

**Architecture:**
- `donation-tiles-*.js` sets `window.donationForms` (tile data: labels, images, URLs)
- `donation-matcher.js` reads that, renders hero + grid of `<a class="tile">` cards
- First-time visitors: employer input auto-opens on hero tile (saves a click)
- Employer stored in cookie + localStorage, persists across sessions
- VPF employers route to `-vpf` form URLs, others to `-ihf` URLs
- `data-theme="vpf"/"ihf"` set on `<body>` for per-employer hover styling
- In iframe mode, posts `donationPageHeight` messages to parent for auto-resize

**Tile Click Flow:**
1. No employer stored → employer input auto-opens on hero tile at page load
2. User can also click any other tile to move the input there
3. Close with X button or Escape key; Skip with "Not applicable"
4. Employer stored → show "Loading..." state, navigate to donation form
5. `navigating` flag prevents double-clicks; resets via `visibilitychange`/`pageshow`/3s timeout

**Design System:**
- Typography: DM Serif Display (headings) + Lora (body) via Google Fonts
- Fonts loaded via `<link media="print" onload="this.media='all'">` (non-blocking)
- CSS variables in `:root` for colors, fonts — enables theming
- VPF hover: green-tinted shadow/border; IHF hover: warm brown-tinted
- Warm off-white background (`#fdfbf7`) with subtle dot texture
- Hero image: `position: static` + `object-fit: contain` (no cropping, works for all aspect ratios)
- Grid images: `object-fit: cover` with `width`/`height` attributes for CLS prevention

**Lighthouse Scores (local, mobile throttled):**
- FCP: 1.2s, LCP: 3.8s (limited by external image server), TBT: 0ms, Speed Index: 1.2s
- CLS: 0.215 (trade-off for auto-open employer input UX)
- Remaining flags are server-side: image delivery, cache lifetimes

**Known Issues:**
- `donations_oauth.html` and `donations_wpadmin_test.html` are legacy/incomplete — missing `employerBanner` DOM elements and tiles data script
- LCP depends on external image server response time (secure.kbmandir.org)
- CLS from auto-opening employer input is an intentional UX trade-off

## Session Summary (03/27-03/29/2026) — ihf-scripts Donation Pages

**Bug Fixes (donation-matcher.js):**
1. Right-click/Cmd+click "Open in New Tab" froze all tiles — added `resetNavigating()`, `visibilitychange` listener, 3s safety timeout
2. Cross-origin iframe navigation crash — `navigateTo()` with try/catch fallback
3. Iframe height not updated after employer input open/close — `notifyIframeHeight()` called on expand/dismiss
4. `window !== window.top` check wrapped in try/catch for cross-origin iframes

**UX Improvements:**
5. Close button (X) and Escape key to dismiss inline employer input
6. `:has(.tile-inline-employer)` CSS highlight on active tile
7. Hero image: `position: static` + `object-fit: contain` — full image visible, no cropping for any aspect ratio
8. First-time visitors: employer input auto-opens on hero tile (saves a click)
9. `?form=` / `?seva=` param: targeted tile becomes hero with employer input ready
10. `prefetchFormUrls` → `preconnectFormUrls` — avoids 403 errors from server rejecting prefetch

**Design Polish (frontend-design skill):**
11. Typography: DM Serif Display + Lora via Google Fonts (non-blocking load)
12. CSS variables: 17 design tokens in `:root` replacing hardcoded colors
13. Warm background: `#fdfbf7` with subtle saddlebrown dot texture
14. VPF vs IHF hover: `data-theme` attribute, green vs brown shadow/border tints
15. `@import` removed from CSS — all HTML pages use `<link>` tags instead
16. Preconnects reduced to max 4 per page (Lighthouse recommendation)

**Performance (Lighthouse):**
17. Hero image: no `opacity: 0` start, `decoding: sync`, `fetchPriority: high`
18. `width`/`height` attributes on all images (CLS prevention)
19. Google Fonts loaded non-blocking (`media="print" onload="this.media='all'"`)
20. Goshala Project image converted from 2MB PNG to JPG

**Testing:**
21. 21 Playwright tests covering: tile rendering, employer input UX, iframe, matching tiers
22. All 4 HTML pages updated with font preconnects

**Files Modified:**
- `donation-matcher.js` + `.min.js` — bug fixes, UX, employer auto-open, preconnect
- `donations_wpadmin.css` + `.min.css` — design system, CSS variables, hero image, hover theming
- `donations-goshala.html` — local testing page, fonts, preconnects
- `donations.html` — standalone temple page, fonts, preconnects
- `donations_wpadmin.html` — WordPress embed temple, fonts, preconnects
- `donations_wpadmin-goshala.html` — WordPress embed goshala, fonts, preconnects
- `donation-tiles-goshala.js` + `.min.js` — Goshala Project image URL (PNG → JPG)
- `donation-tiles-temple.js` + `.min.js` — same image URL update
- `test_donations.js` — 21 Playwright tests (gitignored)
