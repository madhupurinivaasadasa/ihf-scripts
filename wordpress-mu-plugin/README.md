# WordPress mu-plugin: Neon donor OAuth + employer prefill

Server endpoints for [ihf-scripts `donor-login-bar.js`](../donor-login-bar.js) and [`donation-matcher.js`](../donation-matcher.js):

- **OAuth complete** — exchanges the Neon `code` for account ID, returns employer + welcome name from [Neon API v2 Accounts](https://developer.neoncrm.com/accounts/)
- **Company PATCH** — updates `individualAccount.company.name` when the donor saves a changed employer (silent failure; cookie/localStorage still wins)

## Install on kbgoshala.org (WordPress)

### 1. Copy the plugin

```bash
# On the WordPress server (SSH/SFTP):
wp-content/mu-plugins/kbm-neon-oauth.php
```

Copy from this repo:

`ihf-scripts/wordpress-mu-plugin/kbm-neon-oauth.php`

Must-use plugins load automatically — no activation in wp-admin.

### 2. Add secrets to `wp-config.php`

Add **above** `/* That's all, stop editing! */`:

```php
/** Neon constituent OAuth (Settings → Global Settings → OAuth Configuration) */
define('NEON_OAUTH_CLIENT_ID', 'wqAItUW7cuiGpj5NaiO8bevHTz_HxIp52qUZ_X6tphzEMmgZQFcmD9A3rpUXe99v');
define('NEON_OAUTH_CLIENT_SECRET', 'PASTE_CLIENT_SECRET_HERE');

/** Neon API v2 — same Basic auth as donation CRM (crm_python), NOT the OAuth secret */
define('NEON_API_AUTHORIZATION', 'Basic PASTE_BASE64_OR_orgId:apiKey');
define('NEON_API_VERSION', '2.11'); // optional
```

| Constant | Purpose |
|----------|---------|
| `NEON_OAUTH_CLIENT_SECRET` | Required — `POST /np/oauth/token` |
| `NEON_API_AUTHORIZATION` | Required for employer — `GET /v2/accounts/{id}` |
| `NEON_OAUTH_CLIENT_ID` | Optional — defaults to the shared donate client ID |

Never commit real secrets to git.

### 3. Flush permalinks (once)

After uploading the mu-plugin:

1. WordPress admin → **Settings → Permalinks**
2. Click **Save Changes** (no need to change structure)

This registers the rewrite for:

`POST https://www.kbgoshala.org/api/neon/oauth/complete`  
`POST https://www.kbgoshala.org/api/neon/account/company`

### 4. Confirm ihf-scripts embed

`#kbmLoginBar` should already have:

```html
data-redirect="https://www.kbgoshala.org/donate"
data-logout-target="https://www.kbgoshala.org/donate"
```

`donor-login-bar.js` calls `https://www.kbgoshala.org/api/neon/oauth/complete` automatically (same host as `data-redirect`).

## Test

1. Open https://www.kbgoshala.org/donate?seva=cow-feeding-seva
2. **Donor Login** → sign in at Neon
3. Browser DevTools → **Network** → filter `oauth/complete`
   - **200** + JSON `{ "accountId": "...", "employer": "Yahoo", "displayName": "Rama" }` (example) → welcome + employer banner
   - Edit employer → Save → **POST** `/api/neon/account/company` only if value changed from Neon (NA skips PATCH)
   - **503** `oauth_not_configured` → add `NEON_OAUTH_CLIENT_SECRET` to wp-config
   - **404** → permalinks not flushed or mu-plugin missing
4. If account has no company in Neon, `employer` is `null` — manual employer entry still works

### curl (sanity check)

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -X POST 'https://www.kbgoshala.org/api/neon/oauth/complete' \
  -H 'Content-Type: application/json' \
  -d '{"code":"fake","redirectUri":"https://www.kbgoshala.org/donate"}'
```

Expect **502** (bad code) or **503** (secrets missing) — not **404**.

## Fallback URLs

If pretty permalinks fail, set on `#kbmLoginBar`:

```html
data-oauth-complete-url="https://www.kbgoshala.org/wp-json/kbm/v1/neon/oauth/complete"
```

Company sync uses the same host: `/wp-json/kbm/v1/neon/account/company` (registered automatically).

## Security notes

- `client_secret` and API key live only in `wp-config.php` on the server.
- `redirect_uri` must be `https://(www.)kbgoshala.org|kbmandir.org/donate`.
- OAuth `code` is single-use and expires in ~10 minutes (Neon docs).

## Parity

Logic matches `KBMWebsites` (`lib/neon-account-api.ts`, `lib/neon-donor-client.ts`, Worker routes).
