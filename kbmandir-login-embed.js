/* kbmandir-login-embed.js — load BEFORE Neon CLP portal share script on kbmandir.org/login/
 * Neon sets iframe sandbox without allow-storage-access-by-user-activation; reCAPTCHA
 * on the login form needs it for Storage Access API in Safari / strict cookie modes. */
(function() {
    if (window.__kbmPortalIframeSandboxPatched) return;
    window.__kbmPortalIframeSandboxPatched = true;

    var STORAGE_SANDBOX = 'allow-storage-access-by-user-activation';
    var STORAGE_ALLOW = 'storage-access *';

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

    function patchNeonPortalIframes() {
        var list = document.getElementsByClassName('neon-clp-embed-iframe');
        for (var i = 0; i < list.length; i++) {
            patchIframe(list[i]);
        }
        var all = document.getElementsByTagName('iframe');
        for (var j = 0; j < all.length; j++) {
            var id = all[j].id || '';
            if (id.indexOf('neon-clp-embed') === 0) {
                patchIframe(all[j]);
            }
        }
    }

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

    if (window.MutationObserver) {
        var observer = new MutationObserver(patchNeonPortalIframes);
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true
        });
    }
})();
