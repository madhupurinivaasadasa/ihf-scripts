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

    function applyDesktopWidth() {
        var target = document.getElementById(TARGET_ID);
        if (!target) return;

        var useDesktop = window.innerWidth >= 992;
        target.style.width = '100%';

        var wrappers = target.getElementsByClassName('neon-clp-embed-wrapper');
        for (var i = 0; i < wrappers.length; i++) {
            wrappers[i].style.width = '100%';
            wrappers[i].style.maxWidth = 'none';
            wrappers[i].style.minWidth = useDesktop ? '992px' : '';
        }

        var iframes = target.getElementsByClassName('neon-clp-embed-iframe');
        for (var j = 0; j < iframes.length; j++) {
            iframes[j].style.width = '100%';
            iframes[j].style.maxWidth = 'none';
            iframes[j].style.minWidth = useDesktop ? '992px' : '';
        }
    }

    function notifyEmbedResize() {
        try {
            window.dispatchEvent(new Event('resize'));
        } catch (e) {}
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

        var iframes = target.getElementsByClassName('neon-clp-embed-iframe');
        for (var j = 0; j < iframes.length; j++) {
            patchIframe(iframes[j]);
        }

        applyDesktopWidth();
        notifyEmbedResize();

        return true;
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

    function onDomChange() {
        reparentWrapper();
        applyDesktopWidth();
        var list = document.getElementsByClassName('neon-clp-embed-iframe');
        for (var i = 0; i < list.length; i++) {
            patchIframe(list[i]);
        }
    }

    if (window.MutationObserver) {
        var observer = new MutationObserver(onDomChange);
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true
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

    if (document.body) {
        loadNeonShareScript();
    } else {
        document.addEventListener('DOMContentLoaded', loadNeonShareScript);
    }

    onDomChange();
    setTimeout(onDomChange, 0);
    setTimeout(onDomChange, 500);
    setTimeout(onDomChange, 2000);
    window.addEventListener('resize', applyDesktopWidth);
})();
