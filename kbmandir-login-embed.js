/* kbmandir-login-embed.js — single external loader for kbmandir.org/login/
 * 1. Patch Neon CLP iframe sandbox for reCAPTCHA storage access
 * 2. Reparent .neon-clp-embed-wrapper into #kbmDonorPortalWrap (Jetpack Boost moves scripts to footer)
 * 3. Load Neon CLP share script once */
(function() {
    if (window.__kbmPortalEmbedInit) return;
    window.__kbmPortalEmbedInit = true;

    var TARGET_ID = 'kbmDonorPortalWrap';
    var SHARE_URL = 'https://secure.kbmandir.org/nx/portal/clp/share/UE9SVEFMLUNMUC1JSEYtQ1JNLWloZg==';
    var STORAGE_SANDBOX = 'allow-storage-access-by-user-activation';
    var STORAGE_ALLOW = 'storage-access *';
    var syncing = false;
    var resizeTimer;

    function deframeWrapper(el) {
        if (!el) return;
        el.style.width = '100%';
        el.style.maxWidth = 'none';
        el.style.minWidth = '0';
        el.style.margin = '0';
        el.style.padding = '0';
        el.style.background = 'transparent';
        el.style.border = '0';
        el.style.borderRadius = '0';
        el.style.boxShadow = 'none';
    }

    function patchIframe(iframe) {
        if (!iframe || iframe.tagName !== 'IFRAME') return;
        var sandbox = iframe.getAttribute('sandbox') || '';
        if (sandbox.indexOf(STORAGE_SANDBOX) === -1) {
            iframe.setAttribute('sandbox', (sandbox + ' ' + STORAGE_SANDBOX).trim());
        }
        var allow = iframe.getAttribute('allow') || '';
        if (allow.indexOf('storage-access') === -1) {
            iframe.setAttribute('allow', (allow ? allow + '; ' : '') + STORAGE_ALLOW);
        }
    }

    function applyDesktopWidth() {
        var target = document.getElementById(TARGET_ID);
        var embed = document.getElementById('kbmDonorPortalEmbed');
        if (!target) return;

        target.style.width = '100%';
        if (embed) {
            embed.style.width = '100vw';
            embed.style.maxWidth = '100vw';
        }

        var wrappers = document.getElementsByClassName('neon-clp-embed-wrapper');
        for (var i = 0; i < wrappers.length; i++) {
            deframeWrapper(wrappers[i]);
        }

        var iframes = document.getElementsByClassName('neon-clp-embed-iframe');
        for (var j = 0; j < iframes.length; j++) {
            iframes[j].style.width = '100%';
            iframes[j].style.maxWidth = 'none';
            iframes[j].style.minWidth = '0';
            iframes[j].style.border = '0';
            patchIframe(iframes[j]);
        }
    }

    function reparentWrapper() {
        var target = document.getElementById(TARGET_ID);
        if (!target) return false;

        var wrappers = document.getElementsByClassName('neon-clp-embed-wrapper');
        if (!wrappers.length) return false;

        var primary = wrappers[0];
        if (primary.parentNode !== target) {
            target.appendChild(primary);
        }

        for (var i = 1; i < wrappers.length; i++) {
            if (wrappers[i].parentNode) {
                wrappers[i].parentNode.removeChild(wrappers[i]);
            }
        }

        return true;
    }

    function syncEmbed() {
        if (syncing) return;
        syncing = true;
        try {
            reparentWrapper();
            applyDesktopWidth();
        } finally {
            syncing = false;
        }
    }

    if (!window.__kbmPortalIframeSandboxPatched) {
        window.__kbmPortalIframeSandboxPatched = true;
        var nativeSetAttribute = Element.prototype.setAttribute;
        Element.prototype.setAttribute = function(name, value) {
            if (this.tagName === 'IFRAME' && typeof value === 'string') {
                if (name === 'sandbox' && value.indexOf(STORAGE_SANDBOX) === -1) {
                    value = value + ' ' + STORAGE_SANDBOX;
                }
                if (name === 'allow' && value.indexOf('storage-access') === -1) {
                    value = value + (value ? '; ' : '') + STORAGE_ALLOW;
                }
            }
            return nativeSetAttribute.call(this, name, value);
        };
    }

    if (window.MutationObserver) {
        var observer = new MutationObserver(function(mutations) {
            for (var i = 0; i < mutations.length; i++) {
                if (mutations[i].type === 'childList') {
                    syncEmbed();
                    return;
                }
            }
        });
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    function loadNeonShareScript() {
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].getAttribute('src') || '';
            if (src.indexOf('UE9SVEFMLUNMUC1JSEYtQ1JNLWloZg') !== -1 || scripts[i].getAttribute('data-neon-clp-embed')) {
                return;
            }
        }
        var script = document.createElement('script');
        script.src = SHARE_URL;
        (document.body || document.documentElement).appendChild(script);
    }

    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(syncEmbed, 150);
    });

    if (document.body) {
        loadNeonShareScript();
    } else {
        document.addEventListener('DOMContentLoaded', loadNeonShareScript);
    }

    syncEmbed();
    setTimeout(syncEmbed, 0);
    setTimeout(syncEmbed, 500);
    setTimeout(syncEmbed, 2000);
})();
