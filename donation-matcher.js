function getDonationForms() { return window.donationForms || {}; }

var vpfEmployerList = [
    "Adobe", "AMD", "Applied Materials", "Atlassian", "Broadcom", "ByteDance",
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

function showEmployerModal() {
    var banner = document.getElementById("employerBanner");
    var editRow = document.getElementById("bannerEditRow");
    if (editRow) { editRow.remove(); }

    editRow = document.createElement("div");
    editRow.id = "bannerEditRow";
    editRow.className = "banner-edit-row";
    editRow.innerHTML =
        '<input type="text" placeholder="Employer name" value="' + (getStoredEmployer() || '') + '" />' +
        '<button type="button">Apply</button>';

    var input = editRow.querySelector("input");
    var btn = editRow.querySelector("button");

    btn.addEventListener("click", function() {
        var name = input.value.trim();
        if (!name) { input.focus(); return; }
        setEmployerCookie(name);
        localStorage.setItem("ihf_employer_name", name);
        currentUrlType = getUrlTypeForEmployer(name);
        showBanner(name);
        editRow.remove();
        renderTiles(currentUrlType);
    });
    input.addEventListener("keydown", function(e) {
        if (e.key === "Enter") { btn.click(); }
    });

    banner.appendChild(editRow);
    attachAutocomplete(input);
    setTimeout(function() { input.focus(); }, 100);
}

var activeInlineInput = null;
var navigating = false;

function showLoading(el) {
    if (navigating) return false;
    navigating = true;
    if (el) {
        el.style.opacity = "0.6";
        el.style.pointerEvents = "none";
    }
    var cta = el && el.querySelector(".tile-cta");
    if (cta) cta.textContent = "Loading...";
    return true;
}

function showInlineEmployerInput(card, form, queryString) {
    if (activeInlineInput) activeInlineInput.remove();

    var wrapper = document.createElement("div");
    wrapper.className = "tile-inline-employer";
    wrapper.innerHTML =
        '<p class="tile-inline-title">Double your donation!</p>' +
        '<p class="tile-inline-subtitle">Enter your employer name to check if your gift can be matched.</p>' +
        '<div class="tile-inline-input-row">' +
        '<input type="text" placeholder="Employer name" />' +
        '<button type="button">Apply</button>' +
        '<button type="button" class="tile-inline-skip-btn">Not applicable</button>' +
        '</div>';

    var input = wrapper.querySelector("input");
    var btn = wrapper.querySelector("button");
    var skip = wrapper.querySelector(".tile-inline-skip-btn");

    function submitEmployer() {
        var name = input.value.trim();
        if (!name) { input.focus(); return; }
        if (!showLoading(card)) return;
        setEmployerCookie(name);
        localStorage.setItem("ihf_employer_name", name);
        currentUrlType = getUrlTypeForEmployer(name);
        (window.top || window).location.href = form[currentUrlType] + queryString;
    }

    function skipEmployer() {
        if (!showLoading(card)) return;
        setEmployerCookie("NA");
        localStorage.setItem("ihf_employer_name", "NA");
        (window.top || window).location.href = form["ihf"] + queryString;
    }

    function stopAll(e) { e.preventDefault(); e.stopPropagation(); }
    btn.addEventListener("click", function(e) { stopAll(e); submitEmployer(); });
    skip.addEventListener("click", function(e) { stopAll(e); skipEmployer(); });
    input.addEventListener("keydown", function(e) { 
        e.stopPropagation();
        if (e.key === "Enter") { e.preventDefault(); submitEmployer(); } 
    });
    input.addEventListener("click", stopAll);
    input.addEventListener("mousedown", stopAll);
    input.addEventListener("touchstart", function(e) { e.stopPropagation(); });
    input.addEventListener("touchend", function(e) { e.stopPropagation(); e.preventDefault(); input.focus(); });
    wrapper.addEventListener("click", stopAll);
    wrapper.addEventListener("mousedown", stopAll);
    wrapper.addEventListener("touchstart", function(e) { e.stopPropagation(); });

    var tileBody = card.querySelector(".tile-body");
    if (tileBody) {
        card.insertBefore(wrapper, tileBody);
    } else {
        card.appendChild(wrapper);
    }
    activeInlineInput = wrapper;
    attachAutocomplete(input);
    setTimeout(function() { 
        wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(function() { input.focus(); }, 300);
    }, 50);
}

function buildCard(form, urlType, queryString, isHero) {
    var card = document.createElement("a");
    card.href = form[urlType] + queryString;
    card.target = "_top";
    card.className = "tile";
    card.addEventListener("click", function(e) {
        if (activeInlineInput && card.contains(activeInlineInput)) {
            e.preventDefault();
            return;
        }
        var employer = getStoredEmployer();
        if (employer && employer.trim()) {
            if (!showLoading(card)) { e.preventDefault(); return; }
            card.href = form[currentUrlType] + queryString;
            return;
        }
        e.preventDefault();
        showInlineEmployerInput(card, form, queryString);
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
    urlParams.delete('seva');
    urlParams.delete('auto');
    urlParams.delete('c');
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


var employerSuggestions = (function() {
    var all = vpfEmployerList.concat(matchingSupportedList);
    var unique = all.filter(function(v, i, a) { return a.indexOf(v) === i; });
    var filtered = unique.filter(function(name) {
        var lower = name.toLowerCase();
        return !unique.some(function(other) {
            var otherLower = other.toLowerCase();
            return otherLower !== lower && otherLower.length < lower.length && lower.indexOf(otherLower) !== -1;
        });
    });
    filtered.sort(function(a, b) { return a.localeCompare(b); });
    return filtered;
})();

var isMobile = window.matchMedia("(max-width: 768px)").matches;

function attachAutocomplete(input) {
    if (isMobile) return;
    var dlId = "dl_" + Math.random().toString(36).substr(2, 6);
    var dl = document.createElement("datalist");
    dl.id = dlId;
    input.setAttribute("list", dlId);
    input.setAttribute("autocomplete", "off");
    input.parentNode.appendChild(dl);
    input.addEventListener("input", function() {
        dl.innerHTML = "";
        var val = input.value.trim();
        if (val.length < 2) return;
        var lower = val.toLowerCase();
        if (employerSuggestions.some(function(n) { return n.toLowerCase() === lower; })) return;
        employerSuggestions.forEach(function(name) {
            if (name.toLowerCase().indexOf(lower) !== -1) {
                var opt = document.createElement("option");
                opt.value = name;
                dl.appendChild(opt);
            }
        });
    });
}

(function init() {

    function revealPage() {
        var wrap = document.getElementById("donationPageWrap");
        if (wrap) wrap.style.opacity = "1";
    }

    try {
        prefetchHeroImage();

        var params = new URLSearchParams(window.location.search);

        var companyParam = params.get("c");
        if (companyParam && companyParam.trim()) {
            var existing = getStoredEmployer();
            if (!existing || !existing.trim()) {
                setEmployerCookie(companyParam.trim());
                localStorage.setItem("ihf_employer_name", companyParam.trim());
            }
        }

        var storedName = getStoredEmployer();
        if (storedName && storedName.trim()) {
            currentUrlType = getUrlTypeForEmployer(storedName);

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
                params.delete("c");
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
            navigating = false;
            revealPage();
            var name = getStoredEmployer();
            if (name && name.trim()) {
                currentUrlType = getUrlTypeForEmployer(name);
                showBanner(name);
                renderTiles(currentUrlType);
            }
        }
    });

    if (window !== window.top) {
        function sendHeight() {
            try { window.parent.postMessage({ type: "donationPageHeight", height: document.body.scrollHeight }, "*"); } catch(e) {}
        }
        sendHeight();
        setTimeout(sendHeight, 500);
        setTimeout(sendHeight, 2000);
    }
})();
