/* donor-login-bar.js — OAuth donor-login state management for the shared
 * #kbmLoginBar element. Mounted on:
 *   - donations_wpadmin.html         (temple, kbmandir.org/donate)
 *   - donations_wpadmin-goshala.html (goshala, kbgoshala.org/donate)
 *   - crm_athidi/embed-page/embed.html (donate-now embed, kbmandir.org/donate-now)
 *
 * Config: per-page redirect / logout target are read as data-attrs on the
 * #kbmLoginBar element so the HTML stays declarative.
 *
 *   <div id="kbmLoginBar"
 *        data-redirect="https://www.kbmandir.org/donate"
 *        data-logout-target="https://www.kbmandir.org/donate">
 *
 * The OAuth client ID is the same for all pages (single Neon OAuth client).
 *
 * Behavior:
 *   - Reads ?code=... from the URL (OAuth callback) and stores
 *     localStorage.kbmLoggedIn for LOGIN_TTL_MS (24h)
 *   - Toggles .is-authed on the bar to swap signed-in vs signed-out markup
 *   - Logout link clears localStorage before redirecting to Neon logout
 *   - storage event keeps multiple tabs in sync
 *
 * localStorage is per-origin, so kbmandir.org and kbgoshala.org each have
 * independent sessions even though they share the same key name.
 */
(function() {
    var OAUTH_CLIENT_ID = 'wqAItUW7cuiGpj5NaiO8bevHTz_HxIp52qUZ_X6tphzEMmgZQFcmD9A3rpUXe99v';
    var OAUTH_AUTH_URL = 'https://ihf.app.neoncrm.com/np/oauth/auth';
    var OAUTH_LOGOUT_URL = 'https://ihf.app.neoncrm.com/np/logout.do';
    var LOGIN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

    var params = new URLSearchParams(window.location.search);

    // Handle OAuth callback: store flag + scrub ?code=... from the URL.
    if (params.get('code')) {
        localStorage.setItem('kbmLoggedIn', '1');
        localStorage.setItem('kbmLoggedInExpiry', String(Date.now() + LOGIN_TTL_MS));
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    function isLoggedIn() {
        if (!localStorage.getItem('kbmLoggedIn')) return false;
        var expiry = parseInt(localStorage.getItem('kbmLoggedInExpiry') || '0', 10);
        if (expiry && Date.now() > expiry) {
            localStorage.removeItem('kbmLoggedIn');
            localStorage.removeItem('kbmLoggedInExpiry');
            return false;
        }
        return true;
    }

    function buildLoginUrl(redirectUri) {
        return OAUTH_AUTH_URL +
            '?response_type=code' +
            '&client_id=' + encodeURIComponent(OAUTH_CLIENT_ID) +
            '&redirect_uri=' + encodeURIComponent(redirectUri);
    }

    function buildLogoutUrl(targetUrl) {
        return OAUTH_LOGOUT_URL + '?targetUrl=' + encodeURIComponent(targetUrl);
    }

    function wireBar(bar) {
        var redirect = bar.getAttribute('data-redirect') || window.location.origin + window.location.pathname;
        var logoutTarget = bar.getAttribute('data-logout-target') || redirect;

        var loginBtn = bar.querySelector('#kbmLoginBtn');
        if (loginBtn && (!loginBtn.getAttribute('href') || loginBtn.getAttribute('href') === '#')) {
            loginBtn.setAttribute('href', buildLoginUrl(redirect));
        }

        var logoutBtn = bar.querySelector('#kbmLogoutBtn');
        if (logoutBtn) {
            if (!logoutBtn.getAttribute('href') || logoutBtn.getAttribute('href') === '#') {
                logoutBtn.setAttribute('href', buildLogoutUrl(logoutTarget));
            }
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('kbmLoggedIn');
                localStorage.removeItem('kbmLoggedInExpiry');
            });
        }
    }

    function updateUI() {
        var bar = document.getElementById('kbmLoginBar');
        if (!bar) return;
        bar.classList.toggle('is-authed', isLoggedIn());
    }

    function init() {
        var bar = document.getElementById('kbmLoginBar');
        if (!bar) return;
        wireBar(bar);
        updateUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Cross-tab sync: if user logs in/out in another tab, update here too.
    window.addEventListener('storage', function(e) {
        if (e.key === 'kbmLoggedIn' || e.key === 'kbmLoggedInExpiry') updateUI();
    });
})();
