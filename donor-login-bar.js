/* donor-login-bar.js — OAuth donor-login state management for the shared
 * #kbmLoginBar element. Mounted on:
 *   - donations_wpadmin.html         (temple, kbmandir.org/donate)
 *   - donations_wpadmin-goshala.html (goshala, kbgoshala.org/donate)
 *   - donations-goshala.html         (local standalone test page)
 *   - crm_athidi/embed-page/embed.html (donate-now embed, kbmandir.org/donate-now)
 *
 * Config (data-attrs on #kbmLoginBar):
 *   data-redirect              — OAuth redirect_uri (must be registered in Neon)
 *   data-logout-target         — Neon logout targetUrl
 *   data-oauth-complete-url    — optional override for token exchange endpoint.
 *                                Default: same host as data-redirect + /api/neon/oauth/complete
 *                                Company sync (on employer save): /api/neon/account/company
 *                                (only when logged in and employer changed vs Neon baseline)
 *
 * Campaign params preserved across OAuth: seva, form, opportunity, auto, c
 * (saved to sessionStorage before login; restored on callback).
 *
 * Neon constituent OAuth: https://developer.neoncrm.com/authenticating-constituents/
 * Accounts API v2: https://developer.neoncrm.com/accounts/
 */
(function() {
    var OAUTH_CLIENT_ID = 'wqAItUW7cuiGpj5NaiO8bevHTz_HxIp52qUZ_X6tphzEMmgZQFcmD9A3rpUXe99v';
    var OAUTH_AUTH_URL = 'https://ihf.app.neoncrm.com/np/oauth/auth';
    var OAUTH_LOGOUT_URL = 'https://ihf.app.neoncrm.com/np/logout.do';
    var LOGIN_TTL_MS = 24 * 60 * 60 * 1000;
    var CAMPAIGN_PARAM_NAMES = ['seva', 'form', 'opportunity', 'auto', 'c'];
    var OAUTH_CALLBACK_PARAMS = ['code', 'error', 'error_description', 'state'];
    var RETURN_PARAMS_KEY = 'kbm_oauth_return_search';
    var HANDLED_CODE_KEY = 'kbm_oauth_handled_code';
    var NEON_ACCOUNT_ID_KEY = 'kbm_neon_account_id';
    var NEON_COMPANY_FROM_CRM_KEY = 'kbm_neon_company_from_crm';
    var NEON_DISPLAY_NAME_KEY = 'kbm_neon_display_name';

    function pickCampaignParams(params) {
        var picked = {};
        CAMPAIGN_PARAM_NAMES.forEach(function(name) {
            var value = params.get(name);
            if (value) picked[name] = value;
        });
        return picked;
    }

    function campaignParamsToQuery(campaign) {
        var parts = [];
        CAMPAIGN_PARAM_NAMES.forEach(function(name) {
            if (campaign[name]) {
                parts.push(encodeURIComponent(name) + '=' + encodeURIComponent(campaign[name]));
            }
        });
        return parts.length ? ('?' + parts.join('&')) : '';
    }

    function readStoredReturnParams() {
        try {
            var raw = sessionStorage.getItem(RETURN_PARAMS_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function storeReturnParams(params) {
        var campaign = pickCampaignParams(params);
        if (!Object.keys(campaign).length) {
            sessionStorage.removeItem(RETURN_PARAMS_KEY);
            return;
        }
        sessionStorage.setItem(RETURN_PARAMS_KEY, JSON.stringify(campaign));
    }

    function mergeCampaignParams(fromUrl, fromStorage) {
        var merged = {};
        if (fromStorage) {
            CAMPAIGN_PARAM_NAMES.forEach(function(name) {
                if (fromStorage[name]) merged[name] = fromStorage[name];
            });
        }
        CAMPAIGN_PARAM_NAMES.forEach(function(name) {
            var value = fromUrl.get(name);
            if (value) merged[name] = value;
        });
        return merged;
    }

    function buildCleanUrl(pathname, campaign) {
        return pathname + campaignParamsToQuery(campaign);
    }

    function formatOAuthError(error, errorDescription) {
        var description = (errorDescription || '').trim();
        if (description) {
            try {
                return decodeURIComponent(description.replace(/\+/g, ' '));
            } catch (e) {
                return description;
            }
        }
        if (error === 'access_denied') return 'Sign-in was cancelled.';
        return error || 'Donor sign-in failed. Please try again.';
    }

    function loginBarBody(bar) {
        return bar.querySelector('.kbm-login-body') || bar.querySelector('.kbm-left') || bar;
    }

    function showOAuthError(bar, message) {
        var el = bar.querySelector('#kbmOAuthError');
        if (!el) {
            el = document.createElement('p');
            el.id = 'kbmOAuthError';
            el.className = 'kbm-oauth-error';
            el.setAttribute('role', 'alert');
            loginBarBody(bar).appendChild(el);
        }
        el.textContent = message;
        el.style.display = 'block';
    }

    function hideOAuthError(bar) {
        var el = bar.querySelector('#kbmOAuthError');
        if (el) el.style.display = 'none';
    }

    function normalizeEmployerKey(employer) {
        return (employer || '').trim().toLowerCase();
    }

    function isEmployerWritableToNeon(employer) {
        var normalized = normalizeEmployerKey(employer);
        return normalized.length > 0 && normalized !== 'none' && normalized !== 'n/a' && normalized !== 'na';
    }

    function clearNeonDonorSession() {
        sessionStorage.removeItem(NEON_ACCOUNT_ID_KEY);
        sessionStorage.removeItem(NEON_COMPANY_FROM_CRM_KEY);
        sessionStorage.removeItem(NEON_DISPLAY_NAME_KEY);
    }

    function storeNeonDonorSession(payload) {
        if (!payload || !payload.accountId) return;
        sessionStorage.setItem(NEON_ACCOUNT_ID_KEY, String(payload.accountId));
        var employer = payload.employer ? String(payload.employer).trim() : '';
        if (employer) {
            sessionStorage.setItem(NEON_COMPANY_FROM_CRM_KEY, employer);
        } else {
            sessionStorage.removeItem(NEON_COMPANY_FROM_CRM_KEY);
        }
        var displayName = payload.displayName ? String(payload.displayName).trim() : '';
        if (displayName) {
            sessionStorage.setItem(NEON_DISPLAY_NAME_KEY, displayName);
        } else {
            sessionStorage.removeItem(NEON_DISPLAY_NAME_KEY);
        }
    }

    function readNeonDisplayName() {
        return (sessionStorage.getItem(NEON_DISPLAY_NAME_KEY) || '').trim() || null;
    }

    function readNeonAccountId() {
        return (sessionStorage.getItem(NEON_ACCOUNT_ID_KEY) || '').trim() || null;
    }

    function readNeonCompanyFromCrm() {
        return (sessionStorage.getItem(NEON_COMPANY_FROM_CRM_KEY) || '').trim() || null;
    }

    function rememberNeonCompanyBaseline(companyName) {
        sessionStorage.setItem(NEON_COMPANY_FROM_CRM_KEY, String(companyName).trim());
    }

    function resolveAccountCompanyUrl(completeUrl) {
        if (!completeUrl) return null;
        try {
            var url = new URL(completeUrl);
            if (url.pathname.indexOf('/wp-json/kbm/v1/neon/oauth/complete') !== -1) {
                return url.origin + '/wp-json/kbm/v1/neon/account/company';
            }
            return new URL('/api/neon/account/company', completeUrl).href;
        } catch (e) {
            return null;
        }
    }

    function shouldSyncEmployerToNeon(savedEmployer) {
        var accountId = readNeonAccountId();
        var baseline = readNeonCompanyFromCrm();
        if (!accountId || !isEmployerWritableToNeon(savedEmployer)) return false;
        return normalizeEmployerKey(savedEmployer) !== normalizeEmployerKey(baseline || '');
    }

    function syncEmployerToNeonIfChanged(savedEmployer, completeUrl) {
        var accountId = readNeonAccountId();
        var companyUrl = resolveAccountCompanyUrl(completeUrl);
        if (!accountId || !companyUrl || !shouldSyncEmployerToNeon(savedEmployer)) return Promise.resolve();

        return fetch(companyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                accountId: accountId,
                companyName: String(savedEmployer).trim()
            })
        }).then(function(res) {
            if (!res.ok) return;
            return res.json();
        }).then(function(payload) {
            if (payload && payload.employer) {
                rememberNeonCompanyBaseline(payload.employer);
            } else if (payload) {
                rememberNeonCompanyBaseline(savedEmployer);
            }
        }).catch(function() { /* silent — localStorage/cookie is source of truth */ });
    }

    var DONOR_PORTAL_SIGNED_IN_HINT =
        'View your giving history and update your account in the donor portal.';

    function updatePortalHint(bar) {
        if (!bar) return;

        var welcomeEl = bar.querySelector('#kbmWelcomeLine');
        var descEl = bar.querySelector('#kbmPortalDesc');
        var legacyHint = bar.querySelector('#kbmPortalHint');

        if (!isLoggedIn()) {
            if (welcomeEl) welcomeEl.textContent = '';
            if (descEl) {
                descEl.textContent = DONOR_PORTAL_SIGNED_IN_HINT;
            }
            if (legacyHint) {
                legacyHint.textContent = '';
                legacyHint.style.display = 'none';
            }
            return;
        }

        var name = readNeonDisplayName();
        if (welcomeEl) {
            welcomeEl.textContent = name ? 'Welcome, ' + name : '';
        }
        if (descEl) {
            descEl.textContent = DONOR_PORTAL_SIGNED_IN_HINT;
        } else if (!welcomeEl) {
            if (!legacyHint) {
                legacyHint = document.createElement('p');
                legacyHint.id = 'kbmPortalHint';
                legacyHint.className = 'kbm-signed-in kbm-portal-hint';
                var left = bar.querySelector('.kbm-left') || loginBarBody(bar);
                if (left) left.insertBefore(legacyHint, left.firstChild);
            }
            legacyHint.textContent = name
                ? 'Welcome, ' + name + '. ' + DONOR_PORTAL_SIGNED_IN_HINT
                : DONOR_PORTAL_SIGNED_IN_HINT;
            legacyHint.style.display = 'block';
        }
    }

    function dispatchEmployerPrefill(employer) {
        if (!employer || !employer.trim()) return;
        try {
            window.dispatchEvent(new CustomEvent('kbmDonorOAuthEmployer', {
                detail: { employer: employer.trim() }
            }));
        } catch (e) {
            if (typeof window.applyKbmEmployerFromOAuth === 'function') {
                window.applyKbmEmployerFromOAuth(employer.trim());
            }
        }
    }

    function dispatchCampaignRestored(campaign) {
        if (!Object.keys(campaign).length) return;
        try {
            window.dispatchEvent(new CustomEvent('kbmDonorOAuthCampaign', {
                detail: { campaign: campaign, search: campaignParamsToQuery(campaign) }
            }));
        } catch (e) { /* ignore */ }
    }

    function completeOAuthOnServer(completeUrl, code, redirectUri) {
        return fetch(completeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, redirectUri: redirectUri })
        }).then(function(res) {
            if (!res.ok) return null;
            return res.json();
        }).catch(function() {
            return null;
        });
    }

    function handleOAuthCallback(bar, redirectUri, completeUrl) {
        var params = new URLSearchParams(window.location.search);
        var oauthError = params.get('error');
        var stored = readStoredReturnParams();
        var campaign = mergeCampaignParams(params, stored);
        var cleanUrl = buildCleanUrl(window.location.pathname, campaign);

        if (oauthError) {
            showOAuthError(bar, formatOAuthError(oauthError, params.get('error_description')));
            if (window.location.pathname + window.location.search !== cleanUrl) {
                window.history.replaceState({}, document.title, cleanUrl);
            }
            dispatchCampaignRestored(campaign);
            return;
        }

        var code = params.get('code');
        if (!code) return;

        hideOAuthError(bar);

        if (sessionStorage.getItem(HANDLED_CODE_KEY) === code) {
            if (window.location.pathname + window.location.search !== cleanUrl) {
                window.history.replaceState({}, document.title, cleanUrl);
            }
            dispatchCampaignRestored(campaign);
            return;
        }

        sessionStorage.setItem(HANDLED_CODE_KEY, code);
        localStorage.setItem('kbmLoggedIn', '1');
        localStorage.setItem('kbmLoggedInExpiry', String(Date.now() + LOGIN_TTL_MS));

        if (window.location.pathname + window.location.search !== cleanUrl) {
            window.history.replaceState({}, document.title, cleanUrl);
        }
        dispatchCampaignRestored(campaign);

        // Always exchange code; Neon account company name overrides browser cookie/localStorage.
        if (completeUrl) {
            var statusEl = bar.querySelector('#kbmOAuthStatus');
            if (!statusEl) {
                statusEl = document.createElement('p');
                statusEl.id = 'kbmOAuthStatus';
                statusEl.className = 'kbm-oauth-status';
                loginBarBody(bar).appendChild(statusEl);
            }
            statusEl.textContent = 'Loading your account details…';
            statusEl.style.display = 'block';

            completeOAuthOnServer(completeUrl, code, redirectUri).then(function(payload) {
                statusEl.style.display = 'none';
                if (payload && payload.accountId) {
                    storeNeonDonorSession(payload);
                    updatePortalHint(bar);
                    if (payload.employer) {
                        dispatchEmployerPrefill(payload.employer);
                    }
                }
            });
        }
    }

    function isLoggedIn() {
        if (!localStorage.getItem('kbmLoggedIn')) return false;
        var expiry = parseInt(localStorage.getItem('kbmLoggedInExpiry') || '0', 10);
        if (expiry && Date.now() > expiry) {
            localStorage.removeItem('kbmLoggedIn');
            localStorage.removeItem('kbmLoggedInExpiry');
            clearNeonDonorSession();
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

    function resolveOAuthCompleteUrl(bar, redirect) {
        var explicit = (bar.getAttribute('data-oauth-complete-url') || '').trim();
        if (explicit) return explicit;
        try {
            return new URL('/api/neon/oauth/complete', redirect).href;
        } catch (e) {
            return null;
        }
    }

    function wireBar(bar, skipOAuthCallback) {
        var redirect = bar.getAttribute('data-redirect') || window.location.origin + window.location.pathname;
        var logoutTarget = bar.getAttribute('data-logout-target') || redirect;
        var completeUrl = resolveOAuthCompleteUrl(bar, redirect);

        if (!skipOAuthCallback) {
            handleOAuthCallback(bar, redirect, completeUrl || null);
        }

        var loginBtn = bar.querySelector('#kbmLoginBtn');
        if (loginBtn && (!loginBtn.getAttribute('href') || loginBtn.getAttribute('href') === '#')) {
            loginBtn.setAttribute('href', buildLoginUrl(redirect));
            loginBtn.addEventListener('click', function() {
                sessionStorage.removeItem(RETURN_PARAMS_KEY);
                storeReturnParams(new URLSearchParams(window.location.search));
            });
        }

        var logoutBtn = bar.querySelector('#kbmLogoutBtn');
        if (logoutBtn) {
            if (!logoutBtn.getAttribute('href') || logoutBtn.getAttribute('href') === '#') {
                logoutBtn.setAttribute('href', buildLogoutUrl(logoutTarget));
            }
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('kbmLoggedIn');
                localStorage.removeItem('kbmLoggedInExpiry');
                clearNeonDonorSession();
            });
        }
    }

    function updateUI() {
        var bar = document.getElementById('kbmLoginBar');
        if (!bar) return;
        bar.classList.toggle('is-authed', isLoggedIn());
        updatePortalHint(bar);
    }

    function init() {
        var bar = document.getElementById('kbmLoginBar');
        if (!bar) return;
        wireBar(bar, true);
        updateUI();
    }

    /* Run OAuth URL handling as soon as #kbmLoginBar exists (before donation-matcher.js). */
    function tryEarlyOAuth() {
        var bar = document.getElementById('kbmLoginBar');
        if (!bar) return;
        var redirect = bar.getAttribute('data-redirect') || window.location.origin + window.location.pathname;
        handleOAuthCallback(bar, redirect, resolveOAuthCompleteUrl(bar, redirect));
    }

    function bootstrapLoginBarFromStorage() {
        var bar = document.getElementById('kbmLoginBar');
        if (!bar) return;
        try {
            if (!localStorage.getItem('kbmLoggedIn')) return;
            var expiry = parseInt(localStorage.getItem('kbmLoggedInExpiry') || '0', 10);
            if (expiry && Date.now() > expiry) return;
            bar.classList.add('is-authed');
        } catch (e) { /* ignore */ }
    }

    bootstrapLoginBarFromStorage();
    tryEarlyOAuth();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('storage', function(e) {
        if (e.key === 'kbmLoggedIn' || e.key === 'kbmLoggedInExpiry') updateUI();
    });

    window.kbmNeonDonor = {
        storeNeonDonorSession: storeNeonDonorSession,
        clearNeonDonorSession: clearNeonDonorSession,
        syncEmployerToNeonIfChanged: syncEmployerToNeonIfChanged,
        resolveAccountCompanyUrl: resolveAccountCompanyUrl,
        readNeonAccountId: readNeonAccountId
    };
})();
