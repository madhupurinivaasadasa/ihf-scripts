const employerList = [
    "Adobe", "AMD", "Applied Materials", "Broadcom", "ByteDance", "Cadence", "Cisco",
    "Cloudera", "Coupa Software", "Dell", "Esurance", "Etsy", "HPI", "IBM", "Intel",
    "Juniper", "Lam Research", "LexisNexis", "LinkedIn", "McAfee", "Microsoft",
    "NetApp", "Oracle", "Palo Alto Networks", "PayPal", "Pfizer", "PlayStation Cares",
    "Qualcomm", "Roblox", "Samsung", "SAP", "Splunk", "Symantec", "UHG", "Unum", "Veritas",
    "VISA", "Wells Fargo", "Yahoo", "Genworth financial", "Morgan stanley", "Cloudera"
];

const donationForms = {
    "kbm-festival": {
        label: "Sri Gaura Purnima - Seva Sponsorships",
        img: "https://secure.kbmandir.org/neon/resource/ihf/images/Gaura_Purnima_2026.jpeg",
        vpf: "https://secure.kbmandir.org/forms/kbm-festival-seva-vpf",
        ihf: "https://secure.kbmandir.org/forms/kbm-festival-seva-ihf",
        bgColor: "#FFE5B4",
        icon: "🕉️"
    },
    // "new-year": {
        // label: "New Year 2026 - Seva Sponsorships",
        // img: "https://secure.kbmandir.org/neon/resource/ihf/images/new_year_2026.jpg",
        // vpf: "https://secure.kbmandir.org/forms/new-year-vpf",
        // ihf: "https://secure.kbmandir.org/forms/new-year-ihf",
        // bgColor: "#FFD700",
        // icon: "🕉️"
    // },
    "goshala-project": {
        label: "Goshala Project - Square-Foot Seva Sponsorships",
        img: "https://www.kbgoshala.org/wp-content/uploads/2017/11/Screenshot-2024-06-17-at-8.04.18%E2%80%AFPM-2048x1324.png",
        vpf: "https://secure.kbmandir.org/forms/goshala-project-vpf",
        ihf: "https://secure.kbmandir.org/forms/goshala-project-ihf",
        bgColor: "#87CEEB", // Sky blue
        icon: "🐄"
    },
    // "new-temple-project": {
    //     label: "New Temple Project - Seva Sponsorships",
    //     img: "https://www.kbmandir.org/wp-content/uploads/2017/11/nvw-scaled.jpg",
    //     vpf: "https://secure.kbmandir.org/forms/new-temple-project-donations-vpf",
    //     ihf: "https://secure.kbmandir.org/forms/new-temple-project-donations-ihf",
    //     bgColor: "#B19CD9", // Lavender
    //     icon: "🛕"
    // },
    "sunday-feast": {
        label: "Sunday Feast Sponsorship",
        img: "https://secure.kbmandir.org/neon/resource/ihf/images/sunday_feast.JPG",
        vpf: "https://secure.kbmandir.org/forms/sunday-feast-sponsorship-vpf",
        ihf: "https://secure.kbmandir.org/forms/sunday-feast-sponsorship-ihf",
        bgColor: "#FFD1A4", // Peach
        icon: "🍛"
    },
    "sri-lakshmi-narasimha-homa": {
        label: "Sri Lakshmi Narasimha Homa Sponsorship",
        img: "https://secure.kbmandir.org/neon/resource/ihf/images/narsimha_homa.jpg",
        vpf: "https://secure.kbmandir.org/forms/sri-lakshmi-narasimha-homa-vpf",
        ihf: "https://secure.kbmandir.org/forms/sri-lakshmi-narasimha-homa-ihf",
        bgColor: "#FF6B6B", // Coral red
        icon: "🔥"
    },
    "garland-seva": {
        label: "Deity Garlands - Seva Sponsorships",
        img: "https://secure.kbmandir.org/neon/resource/ihf/images/garland_seva.JPG",
        vpf: "https://secure.kbmandir.org/forms/garland-sevas-vpf",
        ihf: "https://secure.kbmandir.org/forms/garland-sevas-ihf",
        bgColor: "#FFB6D9", // Pink
        icon: "🌺"
    },
    "nitya-prasada-seva": {
        label: "Nitya Prasada Seva Sponsorships",
        img: "https://secure.kbmandir.org/neon/resource/ihf/images/_J1A2922.JPG",
        vpf: "https://secure.kbmandir.org/forms/nitya-prasada-seva-sponsorships-vpf",
        ihf: "https://secure.kbmandir.org/forms/nitya-prasada-seva-sponsorships-ihf",
        bgColor: "#F7DC6F", // Light yellow
        icon: "🥘"
    },
    "deity-seva": {
        label: "Daily Deity Seva Sponsorships",
        img: "https://www.kbmandir.org/wp-content/uploads/2022/03/2022_14.jpg",
        vpf: "https://secure.kbmandir.org/forms/deity-sevas-vpf",
        ihf: "https://secure.kbmandir.org/forms/deity-sevas-ihf",
        bgColor: "#A8E6CF", // Mint green
        icon: "🙏"
    },
    "cow-feeding-seva": {
        label: "Goshala - Cow Feeding Seva Sponsorships",
        img: "https://secure.kbmandir.org/neon/resource/ihf/images/WhatsApp%20Image%202025-01-25%20at%2018_32_50.jpeg",
        vpf: "https://secure.kbmandir.org/forms/cow-feeding-seva-vpf",
        ihf: "https://secure.kbmandir.org/forms/cow-feeding-seva-ihf",
        bgColor: "#98D8C8", // Sage green
        icon: "🐄"
    },
    "gopuja": {
        label: "Gopuja - Seva Sponsorships",
        img: "https://www.kbgoshala.org/wp-content/uploads/2017/11/km.jpg",
        vpf: "https://secure.kbmandir.org/forms/gopuja-vpf",
        ihf: "https://secure.kbmandir.org/forms/gopuja-ihf",
        bgColor: "#FFD700", // Gold
        icon: "🐄"
    },
    "sastra-seva": {
        label: "Gita Dana - Seva Sponsorships",
        img: "https://secure.kbmandir.org/neon/resource/ihf/images/gita_jayanti_donate.jpg",
        vpf: "https://secure.kbmandir.org/forms/book-distribution-vpf",
        ihf: "https://secure.kbmandir.org/forms/book-distribution-ihf",
        bgColor: "#FFB347", // Pastel orange
        icon: "📖"
    },
    "general-donation": {
        label: "General Donations",
        img: "https://secure.kbmandir.org/neon/resource/ihf/images/general_donations.jpeg",
        vpf: "https://secure.kbmandir.org/forms/general-donation-vpf",
        ihf: "https://secure.kbmandir.org/forms/general-donation-ihf",
        bgColor: "#F4A460", // Sandy brown
        icon: "💝"
    },
};

// Cookie helper functions - Set cookies across all domains
function setEmployerCookie(name) {
    const encodedName = encodeURIComponent(name);
    const maxAge = 'max-age=31536000'; // 1 year
    const path = 'path=/';
    
    // Set cookie for all our domains so employer name persists across sites
    document.cookie = `ihf_employer_name=${encodedName}; ${path}; domain=.kbmandir.org; ${maxAge}`;
    document.cookie = `ihf_employer_name=${encodedName}; ${path}; domain=.kbgoshala.org; ${maxAge}`;
    document.cookie = `ihf_employer_name=${encodedName}; ${path}; ${maxAge}`; // Current domain
}

function getEmployerCookie() {
    const match = document.cookie.match(/(?:^|; )ihf_employer_name=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
}

function toggleInstructions(employerName) {
    const instructionsElement = document.getElementById("instructionsText");
    if (instructionsElement) {
        // Hide instructions if employer name is present
        if (employerName && employerName.trim()) {
            instructionsElement.style.display = "none";
        } else {
            instructionsElement.style.display = "block";
        }
    }
}

function disableFormClicks() {
    const heroContainer = document.getElementById("heroTile");
    const container = document.getElementById("donationTiles");

    if (heroContainer) {
        heroContainer.style.pointerEvents = "none";
        heroContainer.style.opacity = "0.5";
    }
    if (container) {
        container.style.pointerEvents = "none";
        container.style.opacity = "0.5";
    }
}

function enableFormClicks() {
    const heroContainer = document.getElementById("heroTile");
    const container = document.getElementById("donationTiles");

    if (heroContainer) {
        heroContainer.style.pointerEvents = "auto";
        heroContainer.style.opacity = "1";
    }
    if (container) {
        container.style.pointerEvents = "auto";
        container.style.opacity = "1";
    }
}

function updateEmployerDisplay(text, isInfoText = false) {
    const employerInfo = document.querySelector(".employer-info");
    const employerName = document.getElementById("employerName");

    // When showing info text, style the NA part
    const styledText = text.replace(/\bNA\b/, '<span style="color: #007BFF; font-weight: bold;">NA</span>');

    if (isInfoText) {
        // Hide "Your Employer:" prefix when showing info text
        employerInfo.innerHTML = `<strong id="employerName">${styledText}</strong>
            <span id="editLink" class="edit-link" onclick="toggleEditMode()" style="display: none;">Edit</span>`;
    } else {
        // Show "Your Employer:" prefix when showing actual employer name
        employerInfo.innerHTML = `Your Employer: <strong id="employerName">${text}</strong>
            <span id="editLink" class="edit-link" onclick="toggleEditMode()" style="display: none;">Edit</span>`;
    }
}

function updateProgressSteps(currentStep) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        if (index < currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (index === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

function toggleEditMode() {
    const inputGroup = document.getElementById('inputGroup');
    const editLink = document.getElementById('editLink');
    const stepsContainer = document.querySelector('.steps-container');
    const formInstruction = document.getElementById('formInstruction');

    // Show input group and hide edit link and form instruction
    inputGroup.style.display = 'flex';
    editLink.style.display = 'none';
    if (formInstruction) formInstruction.style.display = 'none';

    // Show progress steps again
    if (stepsContainer) {
        stepsContainer.style.display = 'flex';
    }

    // Focus on input
    document.getElementById('employerInput').focus();
}


function updateEmployer() {
    const input = document.getElementById("employerInput");
    const name = input.value.trim();

    if (name) {
        setEmployerCookie(name);
        localStorage.setItem("ihf_employer_name", name);

        updateEmployerDisplay(name, false);

        // Hide progress steps and input group, show edit link and form instruction
        const stepsContainer = document.querySelector('.steps-container');
        const inputGroup = document.getElementById('inputGroup');
        const editLink = document.getElementById('editLink');
        const formInstruction = document.getElementById('formInstruction');

        if (stepsContainer) stepsContainer.style.display = 'none';
        if (inputGroup) inputGroup.style.display = 'none';
        if (editLink) editLink.style.display = 'inline';
        if (formInstruction) formInstruction.style.display = 'block';

        const isMatch = employerList.some(employer =>
            name.toLowerCase().includes(employer.toLowerCase())
        );
        const urlType = isMatch ? "vpf" : "ihf";
        renderTiles(urlType);
        enableFormClicks();
    } else {
        // Clear stored employer data when empty
        setEmployerCookie("");
        localStorage.removeItem("ihf_employer_name");

        updateEmployerDisplay("Please enter your Employer name. Enter NA if not applicable.", true);

        // Show progress steps and input group, hide edit link and form instruction
        const stepsContainer = document.querySelector('.steps-container');
        const inputGroup = document.getElementById('inputGroup');
        const editLink = document.getElementById('editLink');
        const formInstruction = document.getElementById('formInstruction');

        if (stepsContainer) stepsContainer.style.display = 'flex';
        if (inputGroup) inputGroup.style.display = 'flex';
        if (editLink) editLink.style.display = 'none';
        if (formInstruction) formInstruction.style.display = 'none';

        updateProgressSteps(0); // Back to step 1 (Enter Employer)
        disableFormClicks();

        // Clear the donation tiles when no employer is set
        const heroContainer = document.getElementById("heroTile");
        const container = document.getElementById("donationTiles");
        if (heroContainer) heroContainer.innerHTML = "";
        if (container) container.innerHTML = "";
    }

    toggleInstructions(name);
}

function renderTiles(urlType) {
    // Containers for the hero tile and the grid of tiles.  The hero tile
    // container may not exist on pages that don't include the hero layout.
    const heroContainer = document.getElementById("heroTile");
    const container = document.getElementById("donationTiles");
    if (heroContainer) heroContainer.innerHTML = "";
    if (container) container.innerHTML = "";

    // Check if a specific donation opportunity key has been passed via the
    // "form" or "opportunity" query parameter. When provided, this key will
    // determine which tile should be rendered first (as the hero tile).
    const urlParams = new URLSearchParams(window.location.search);
    const priorityKey = urlParams.get("opportunity") || urlParams.get("form");

    // Remove the "form" and "opportunity" parameters from the URL to avoid appending them to every link
    // when rendering the tiles to pass the utm parameters for tracking.
    urlParams.delete('form');
    urlParams.delete('opportunity');
    const queryString = urlParams.toString() ? `?${urlParams.toString()}` : '';

    // Convert the donationForms object into an array of [key, form] pairs
    const entries = Object.entries(donationForms);

    if (priorityKey) {
        // Preserve the original order of entries for all other items
        const originalOrder = entries.slice();
        entries.sort((a, b) => {
            if (a[0] === priorityKey) return -1;
            if (b[0] === priorityKey) return 1;
            const indexA = originalOrder.findIndex(([k]) => k === a[0]);
            const indexB = originalOrder.findIndex(([k]) => k === b[0]);
            return indexA - indexB;
        });
    }

    // Render the first entry as the hero tile if a hero container is present
    if (entries.length > 0 && heroContainer) {
        const [, firstForm] = entries[0];
        const heroLink = document.createElement("a");
        heroLink.href = firstForm[urlType] + queryString;
        heroLink.target = "_blank";
        heroLink.className = "hero";
        
        // Create placeholder div with background color and text for instant render
        const placeholder = document.createElement("div");
        placeholder.className = "image-placeholder hero-placeholder";
        placeholder.style.backgroundColor = firstForm.bgColor || "#e0e0e0";
        const icon = firstForm.icon || "🙏";
        placeholder.innerHTML = `<div class="placeholder-content"><div class="placeholder-icon">${icon}</div><div class="placeholder-text">Click here to donate for<br><strong>${firstForm.label}</strong></div></div>`;
        
        // Create image with lazy loading
        const img = document.createElement("img");
        img.src = firstForm.img;
        img.alt = firstForm.label;
        img.loading = "lazy";
        img.style.opacity = "0";
        img.style.transition = "opacity 0.3s ease-in";
        
        // Show image when loaded, hide placeholder
        img.onload = function() {
            img.style.opacity = "1";
            placeholder.style.opacity = "0";
            setTimeout(() => placeholder.remove(), 300);
        };
        
        const span = document.createElement("span");
        span.textContent = firstForm.label;
        
        heroLink.appendChild(placeholder);
        heroLink.appendChild(img);
        heroLink.appendChild(span);
        heroContainer.appendChild(heroLink);
    }

    // Render the remaining entries as grid tiles with placeholders
    entries.slice(heroContainer ? 1 : 0).forEach(([, form]) => {
        const tileLink = document.createElement("a");
        tileLink.href = form[urlType] + queryString;
        tileLink.target = "_blank";
        tileLink.className = "tile";
        
        // Create placeholder div with background color and text
        const placeholder = document.createElement("div");
        placeholder.className = "image-placeholder";
        placeholder.style.backgroundColor = form.bgColor || "#e0e0e0";
        const icon = form.icon || "🙏";
        placeholder.innerHTML = `<div class="placeholder-content"><div class="placeholder-icon">${icon}</div><div class="placeholder-text">Click to donate for<br><strong>${form.label}</strong></div></div>`;
        
        // Create image with lazy loading
        const img = document.createElement("img");
        img.src = form.img;
        img.alt = form.label;
        img.loading = "lazy";
        img.style.opacity = "0";
        img.style.transition = "opacity 0.3s ease-in";
        
        // Show image when loaded, hide placeholder
        img.onload = function() {
            img.style.opacity = "1";
            placeholder.style.opacity = "0";
            setTimeout(() => placeholder.remove(), 300);
        };
        
        const span = document.createElement("span");
        span.textContent = form.label;
        
        tileLink.appendChild(placeholder);
        tileLink.appendChild(img);
        tileLink.appendChild(span);
        if (container) container.appendChild(tileLink);
    });
}

document.getElementById("employerInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        updateEmployer();
    }
});

// Prefetch all donation images and hero form URLs immediately on page load
let prefetchedImages = new Set();
let prefetchedUrls = new Set();

function prefetchAllDonationImages() {
    const formsArray = Object.entries(donationForms);
    
    // Prefetch ALL donation images immediately (both VPF and IHF use same images)
    Object.values(donationForms).forEach(form => {
        // Prefetch image
        if (!prefetchedImages.has(form.img)) {
            // Method 1: Use Image object (works in all browsers)
            const img = new Image();
            img.src = form.img;
            
            // Method 2: Add link prefetch tag (additional optimization)
            const linkImg = document.createElement('link');
            linkImg.rel = 'prefetch';
            linkImg.as = 'image';
            linkImg.href = form.img;
            document.head.appendChild(linkImg);
            
            prefetchedImages.add(form.img);
        }
    });
    
    // Prefetch ONLY hero donation form URLs (first donation form - most likely to be clicked)
    if (formsArray.length > 0) {
        const [, heroForm] = formsArray[0];
        ['vpf', 'ihf'].forEach(urlType => {
            const formUrl = heroForm[urlType];
            if (formUrl && !prefetchedUrls.has(formUrl)) {
                const linkUrl = document.createElement('link');
                linkUrl.rel = 'prefetch';
                linkUrl.href = formUrl;
                document.head.appendChild(linkUrl);
                
                prefetchedUrls.add(formUrl);
            }
        });
    }
}

// Start prefetching immediately when script loads (parallel to user interaction)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', prefetchAllDonationImages);
} else {
    // DOM already loaded
    prefetchAllDonationImages();
}

// Add real-time input validation (but don't enable forms until Apply is clicked)
document.getElementById("employerInput").addEventListener("input", function (e) {
    const name = e.target.value.trim();
    if (name) {
        updateEmployerDisplay(name, false);
    } else {
        // Immediately disable forms and clear tiles when text field is emptied
        updateEmployerDisplay("Please enter your Employer name. Enter NA if not applicable.", true);

        // Show progress steps and input group, hide edit link and form instruction
        const stepsContainer = document.querySelector('.steps-container');
        const inputGroup = document.getElementById('inputGroup');
        const editLink = document.getElementById('editLink');
        const formInstruction = document.getElementById('formInstruction');

        if (stepsContainer) stepsContainer.style.display = 'flex';
        if (inputGroup) inputGroup.style.display = 'flex';
        if (editLink) editLink.style.display = 'none';
        if (formInstruction) formInstruction.style.display = 'none';

        updateProgressSteps(0); // Back to step 1 (Enter Employer)
        disableFormClicks();

        // Clear stored employer data
        setEmployerCookie("");
        localStorage.removeItem("ihf_employer_name");

        // Clear the donation tiles when no employer is set
        const heroContainer = document.getElementById("heroTile");
        const container = document.getElementById("donationTiles");
        if (heroContainer) heroContainer.innerHTML = "";
        if (container) container.innerHTML = "";
    }
    toggleInstructions(name);
});

// Initial Load – Prefer cookie first, then localStorage
let storedName = getEmployerCookie() || localStorage.getItem("ihf_employer_name") || "";
const employerInput = document.getElementById("employerInput");
const employerNameElement = document.getElementById("employerName");

if (storedName && storedName.trim()) {
    updateEmployerDisplay(storedName, false);
    employerInput.value = storedName;

    // Hide progress steps and input group, show edit link and form instruction for stored employer
    const stepsContainer = document.querySelector('.steps-container');
    const inputGroup = document.getElementById('inputGroup');
    const editLink = document.getElementById('editLink');
    const formInstruction = document.getElementById('formInstruction');

    if (stepsContainer) stepsContainer.style.display = 'none';
    if (inputGroup) inputGroup.style.display = 'none';
    if (editLink) editLink.style.display = 'inline';
    if (formInstruction) formInstruction.style.display = 'block';

    const isMatchInit = employerList.some(employer =>
        storedName.toLowerCase().includes(employer.toLowerCase())
    );
    const urlTypeInit = isMatchInit ? "vpf" : "ihf";
    renderTiles(urlTypeInit);
    enableFormClicks(); // Only enable if there's a stored employer name from previous session
} else {
    updateEmployerDisplay("Please enter your Employer name. Enter NA if not applicable.", true);
    employerInput.value = "";

    // Show progress steps and input group, hide edit link and form instruction for no employer
    const stepsContainer = document.querySelector('.steps-container');
    const inputGroup = document.getElementById('inputGroup');
    const editLink = document.getElementById('editLink');
    const formInstruction = document.getElementById('formInstruction');

    if (stepsContainer) stepsContainer.style.display = 'flex';
    if (inputGroup) inputGroup.style.display = 'flex';
    if (editLink) editLink.style.display = 'none';
    if (formInstruction) formInstruction.style.display = 'none';

    updateProgressSteps(0); // Start at step 1 (Enter Employer)
    disableFormClicks(); // Forms disabled by default
}

toggleInstructions(storedName);

// Set focus to the employer input text box only if it's visible
if (inputGroup && inputGroup.style.display !== 'none') {
    // Use setTimeout to ensure DOM is ready and bypass some mobile browser restrictions
    setTimeout(function() {
        employerInput.focus();
        // For mobile devices, try to trigger the keyboard
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            employerInput.click();
        }
    }, 100);
}
