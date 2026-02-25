function getDonationForms() { return window.donationForms || {}; }

var vpfEmployerList = [
    "Adobe", "AMD", "Applied Materials", "Broadcom", "ByteDance",
    "Cadence", "Cadence Design Systems",
    "Cisco", "Cisco Systems",
    "Cloudera", "Coupa Software", "Dell", "DIRECTV", "DocuSign",
    "Electronic Arts", "Esurance", "Etsy",
    "Genworth", "Genworth Financial",
    "Hewlett Packard Enterprise Foundation", "HPI",
    "IBM", "Intel", "Intuitive Foundation",
    "Juniper", "Lam Research", "LexisNexis", "LinkedIn",
    "McAfee", "Microsoft", "Morgan Stanley",
    "NetApp", "Oracle", "Palo Alto Networks", "PayPal", "Pfizer",
    "PlayStation Cares", "Pure Storage",
    "Qualcomm", "Roblox", "Samsung", "SAP", "Solidigm", "Splunk", "Symantec",
    "UHG", "Unum", "Veeva", "Veritas", "VISA", "Wells Fargo", "Yahoo"
];

var matchingSupportedList = [
    "Apple", "Autodesk", "BlackRock", "Ciena", "Delta Dental",
    "Dropbox", "eBay", "Equinix", "F5", "FalconX",
    "Gilead", "Google", "Indeed", "Intuit", "Kaiser",
    "Keysight", "KLA", "McKesson", "Medtronic", "Netflix",
    "NVIDIA", "Okta", "Salesforce", "ServiceNow",
    "Synopsys", "T-Mobile", "TE Connectivity",
    "The Illumina Foundation", "Illumina", "Workday"
];

var currentUrlType = "ihf";
var pendingForm = null;
var pendingQueryString = "";

function setEmployerCookie(name) {
    var encodedName = encodeURIComponent(name);
    var maxAge = 'max-age=31536000';
    var path = 'path=/';
    document.cookie = "ihf_employer_name=" + encodedName + "; " + path + "; domain=.kbmandir.org; " + maxAge;
    document.cookie = "ihf_employer_name=" + encodedName + "; " + path + "; domain=.kbgoshala.org; " + maxAge;
    document.cookie = "ihf_employer_name=" + encodedName + "; " + path + "; " + maxAge;
}

function getEmployerCookie() {
    var match = document.cookie.match(/(?:^|; )ihf_employer_name=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
}

function getStoredEmployer() {
    return getEmployerCookie() || localStorage.getItem("ihf_employer_name") || "";
}

function isVpfMatch(name) {
    if (!name) return false;
    var lower = name.toLowerCase();
    return vpfEmployerList.some(function(e) { return lower.includes(e.toLowerCase()); });
}

function isMatchingSupported(name) {
    if (!name) return false;
    var lower = name.toLowerCase();
    return matchingSupportedList.some(function(e) { return lower.includes(e.toLowerCase()); });
}

function getMatchTier(name) {
    if (!name || !name.trim()) return "none";
    if (isVpfMatch(name)) return "vpf";
    if (isMatchingSupported(name)) return "matching";
    return "none";
}

function getUrlTypeForEmployer(name) {
    return getMatchTier(name) === "vpf" ? "vpf" : "ihf";
}

function showBanner(name) {
    var banner = document.getElementById("employerBanner");
    var nameEl = document.getElementById("bannerEmployerName");
    var badge = document.getElementById("matchingBadge");
    nameEl.textContent = name;
    var tier = getMatchTier(name);
    if (tier === "vpf") {
        badge.textContent = "Matching eligible";
        badge.className = "matching-badge vpf";
    } else if (tier === "matching") {
        badge.textContent = "Employer supports matching";
        badge.className = "matching-badge matching-supported";
    } else {
        badge.textContent = "";
        badge.className = "matching-badge no-match";
    }
    banner.classList.add("visible");
}

function hideBanner() {
    document.getElementById("employerBanner").classList.remove("visible");
}

var focusTrapHandler = null;

function showEmployerModal(form, queryString) {
    pendingForm = form || null;
    pendingQueryString = queryString || "";

    var sevaCtx = document.getElementById("modalSevaContext");
    if (form && form.label) {
        document.getElementById("modalSevaIcon").textContent = form.icon || "🙏";
        document.getElementById("modalSevaLabel").textContent = "Donating to: " + form.label;
        sevaCtx.classList.add("visible");
    } else {
        sevaCtx.classList.remove("visible");
    }

    document.getElementById("modalBackdrop").classList.add("visible");
    document.getElementById("employerModal").classList.add("visible");
    var input = document.getElementById("modalEmployerInput");
    input.value = getStoredEmployer();
    setTimeout(function() { input.focus(); }, 100);

    enableFocusTrap();
}

function hideEmployerModal() {
    document.getElementById("modalBackdrop").classList.remove("visible");
    document.getElementById("employerModal").classList.remove("visible");
    document.getElementById("modalSevaContext").classList.remove("visible");
    pendingForm = null;
    pendingQueryString = "";
    disableFocusTrap();
}

function enableFocusTrap() {
    var modal = document.getElementById("employerModal");
    var focusable = modal.querySelectorAll('input, button, a[onclick], [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    focusTrapHandler = function(e) {
        if (e.key !== "Tab") return;
        if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
            if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    };
    modal.addEventListener("keydown", focusTrapHandler);
}

function disableFocusTrap() {
    if (focusTrapHandler) {
        document.getElementById("employerModal").removeEventListener("keydown", focusTrapHandler);
        focusTrapHandler = null;
    }
}

function handleEmployerSubmit() {
    var input = document.getElementById("modalEmployerInput");
    var name = input.value.trim();
    if (!name) { input.focus(); return; }
    setEmployerCookie(name);
    localStorage.setItem("ihf_employer_name", name);
    currentUrlType = getUrlTypeForEmployer(name);

    if (pendingForm) {
        (window.top || window).location.href = pendingForm[currentUrlType] + pendingQueryString;
    } else {
        showBanner(name);
        hideEmployerModal();
        renderTiles(currentUrlType);
    }
}

function handleEmployerSkip() {
    setEmployerCookie("NA");
    localStorage.setItem("ihf_employer_name", "NA");
    currentUrlType = "ihf";

    if (pendingForm) {
        (window.top || window).location.href = pendingForm["ihf"] + pendingQueryString;
    } else {
        showBanner("NA");
        hideEmployerModal();
        renderTiles("ihf");
    }
}

document.getElementById("modalBackdrop").addEventListener("click", function() {
    if (pendingForm) {
        handleEmployerSkip();
    } else {
        hideEmployerModal();
    }
});

function buildCard(form, urlType, queryString, isHero) {
    var card = document.createElement("a");
    card.href = form[urlType] + queryString;
    card.target = "_top";
    card.className = "tile";
    card.addEventListener("click", function(e) {
        var employer = getStoredEmployer();
        if (employer && employer.trim()) {
            card.href = form[currentUrlType] + queryString;
            return;
        }
        e.preventDefault();
        showEmployerModal(form, queryString);
    });

    var imageWrap = document.createElement("div");
    imageWrap.className = "tile-image-wrap";

    var placeholder = document.createElement("div");
    placeholder.className = "image-placeholder";
    placeholder.style.backgroundColor = form.bgColor || "#e0e0e0";
    placeholder.innerHTML = '<div class="placeholder-content"><div class="placeholder-icon">' +
        (form.icon || "🙏") + '</div><div class="placeholder-text">' + form.label + '</div></div>';

    var img = document.createElement("img");
    img.src = form.img;
    img.alt = form.label;
    img.loading = isHero ? "eager" : "lazy";
    img.decoding = "async";
    img.sizes = isHero ? "(max-width: 720px) 100vw, 720px" : "(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw";
    if (isHero) img.fetchPriority = "high";
    img.style.opacity = "0";
    (function(theImg, thePlaceholder) {
        theImg.onload = function() {
            theImg.style.opacity = "1";
            thePlaceholder.style.opacity = "0";
            setTimeout(function() { thePlaceholder.remove(); }, 300);
        };
        theImg.onerror = function() {
            thePlaceholder.classList.add("error");
        };
    })(img, placeholder);

    var gradient = document.createElement("div");
    gradient.className = "gradient-overlay";

    var titleOverlay = document.createElement("div");
    titleOverlay.className = "tile-title-overlay";
    titleOverlay.innerHTML = '<span class="tile-title-text">' + form.label + '</span>';

    if (form.price) {
        var priceBadge = document.createElement("span");
        priceBadge.className = "tile-price-badge";
        priceBadge.textContent = form.price;
        imageWrap.appendChild(priceBadge);
    }

    imageWrap.appendChild(placeholder);
    imageWrap.appendChild(img);
    imageWrap.appendChild(gradient);
    imageWrap.appendChild(titleOverlay);

    var body = document.createElement("div");
    body.className = "tile-body";

    var tagline = document.createElement("p");
    tagline.className = "tile-tagline";
    tagline.textContent = form.tagline || "";

    var desc = document.createElement("p");
    desc.className = "tile-description";
    desc.textContent = form.description || "";

    var cta = document.createElement("span");
    cta.className = "tile-cta";
    cta.textContent = "Donate now";

    body.appendChild(tagline);
    body.appendChild(desc);
    body.appendChild(cta);

    card.appendChild(imageWrap);
    card.appendChild(body);

    return card;
}

function renderTiles(urlType) {
    var heroContainer = document.getElementById("heroTile");
    var container = document.getElementById("donationTiles");
    if (heroContainer) heroContainer.innerHTML = "";
    if (container) container.innerHTML = "";

    var urlParams = new URLSearchParams(window.location.search);
    var priorityKey = urlParams.get("opportunity") || urlParams.get("form");
    urlParams.delete('form');
    urlParams.delete('opportunity');
    var queryString = urlParams.toString() ? ("?" + urlParams.toString()) : "";

    var entries = Object.entries(getDonationForms());
    if (priorityKey) {
        var originalOrder = entries.slice();
        entries.sort(function(a, b) {
            if (a[0] === priorityKey) return -1;
            if (b[0] === priorityKey) return 1;
            return originalOrder.findIndex(function(x) { return x[0] === a[0]; })
                 - originalOrder.findIndex(function(x) { return x[0] === b[0]; });
        });
    }

    if (entries.length > 0 && heroContainer) {
        heroContainer.appendChild(buildCard(entries[0][1], urlType, queryString, true));
    }

    var startIdx = heroContainer ? 1 : 0;
    for (var i = startIdx; i < entries.length; i++) {
        container.appendChild(buildCard(entries[i][1], urlType, queryString, false));
    }
}

var prefetchedImages = {};

function prefetchHeroImage() {
    var entries = Object.entries(getDonationForms());
    if (entries.length === 0) return;
    var heroForm = entries[0][1];
    if (!prefetchedImages[heroForm.img]) {
        var img = new Image();
        img.src = heroForm.img;
        img.fetchPriority = "high";
        prefetchedImages[heroForm.img] = true;
    }
}

function prefetchRemainingImages() {
    var entries = Object.entries(getDonationForms());
    for (var i = 1; i < entries.length; i++) {
        var form = entries[i][1];
        if (!prefetchedImages[form.img]) {
            var img = new Image();
            img.src = form.img;
            prefetchedImages[form.img] = true;
        }
    }
}

function prefetchFormUrls() {
    var entries = Object.entries(getDonationForms());
    for (var i = 0; i < entries.length; i++) {
        var form = entries[i][1];
        ["vpf", "ihf"].forEach(function(type) {
            var link = document.createElement("link");
            link.rel = "prefetch";
            link.href = form[type];
            document.head.appendChild(link);
        });
    }
}

document.getElementById("modalEmployerInput").addEventListener("keydown", function(e) {
    if (e.key === "Enter") handleEmployerSubmit();
    if (e.key === "Escape") hideEmployerModal();
});
document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && document.getElementById("employerModal").classList.contains("visible")) {
        hideEmployerModal();
    }
});

(function init() {
    var allEmployers = vpfEmployerList.concat(matchingSupportedList);
    var unique = allEmployers.filter(function(v, i, a) { return a.indexOf(v) === i; });
    var employerSuggestions = unique.filter(function(name) {
        var lower = name.toLowerCase();
        return !unique.some(function(other) {
            var otherLower = other.toLowerCase();
            return otherLower !== lower && otherLower.length < lower.length && lower.indexOf(otherLower) !== -1;
        });
    });
    employerSuggestions.sort(function(a, b) { return a.localeCompare(b); });

    var isMobile = window.matchMedia("(max-width: 768px)").matches;
    var input = document.getElementById("modalEmployerInput");
    if (isMobile) {
        input.removeAttribute("list");
    } else {
        input.addEventListener("input", function() {
            var datalist = document.getElementById("employerSuggestions");
            datalist.innerHTML = "";
            var val = this.value.trim();
            if (val.length < 2) return;
            var lower = val.toLowerCase();
            var exactMatch = employerSuggestions.some(function(n) { return n.toLowerCase() === lower; });
            if (exactMatch) return;
            employerSuggestions.forEach(function(name) {
                if (name.toLowerCase().indexOf(lower) !== -1) {
                    var opt = document.createElement("option");
                    opt.value = name;
                    datalist.appendChild(opt);
                }
            });
        });
    }

    function revealPage() {
        var wrap = document.getElementById("donationPageWrap");
        if (wrap) wrap.style.opacity = "1";
    }

    try {
        prefetchHeroImage();

        var storedName = getStoredEmployer();
        if (storedName && storedName.trim()) {
            currentUrlType = getUrlTypeForEmployer(storedName);

            var params = new URLSearchParams(window.location.search);
            var targetKey = params.get("seva") || params.get("opportunity") || params.get("form");
            var forms = getDonationForms();
            var targetForm = targetKey ? forms[targetKey] || null : null;
            var autoRedirect = params.get("auto") === "true" || !!targetForm;
            if (autoRedirect) {
                if (!targetForm) {
                    var entries = Object.entries(forms);
                    if (entries.length > 0) targetForm = entries[0][1];
                }
                if (!targetForm) { autoRedirect = false; }
            }
            if (autoRedirect && targetForm) {
                params.delete("auto");
                params.delete("seva");
                params.delete("form");
                params.delete("opportunity");
                var qs = params.toString() ? ("?" + params.toString()) : "";
                try {
                    (window.top || window).location.href = targetForm[currentUrlType] + qs;
                } catch (navErr) {
                    window.location.href = targetForm[currentUrlType] + qs;
                }
                return;
            }

            showBanner(storedName);
            renderTiles(currentUrlType);
        } else {
            currentUrlType = "ihf";
            renderTiles("ihf");
        }
    } catch (e) { /* ensure page is visible even if something fails */ }

    revealPage();

    if (window.requestIdleCallback) {
        requestIdleCallback(prefetchRemainingImages);
        requestIdleCallback(prefetchFormUrls);
    } else {
        setTimeout(prefetchRemainingImages, 200);
        setTimeout(prefetchFormUrls, 400);
    }

    window.addEventListener("pageshow", function(e) {
        if (e.persisted) {
            hideEmployerModal();
            revealPage();
            var name = getStoredEmployer();
            if (name && name.trim()) {
                currentUrlType = getUrlTypeForEmployer(name);
                showBanner(name);
                renderTiles(currentUrlType);
            }
        }
    });
})();
