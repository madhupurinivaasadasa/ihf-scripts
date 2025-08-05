const employerList = [
  "Adobe", "AMD", "Apple", "Applied Materials", "Broadcom",
  "Cadence", "Ciena", "Cisco", "Dell", "Ebay", "Esurance",
  "Intel", "Juniper", "Lam Research", "McAfee", "Microsoft",
  "NetApp", "Oracle", "Paypal", "Qualcomm", "Samsung",
  "ServiceNow", "Splunk", "Symantec", "Veritas", "Visa",
  "VMware", "Yahoo"
];

const donationForms = {
   "jnm-2025": {
     label: "Janmashtami 2025 - Saturday, August 16th",
     img: "https://secure.kbmandir.org/neon/resource/ihf/images/jnm_2025_flyer_updated.jpeg",
     vpf: "https://secure.kbmandir.org/forms/janmashtami-2025-vpf",
     ihf: "https://secure.kbmandir.org/forms/janmashtami-2025-ihf"
   },
  "balaram-jayanti": {
    label: "Balarama Jayanti - Friday, August 08, 2025",
    img: "https://secure.kbmandir.org/neon/resource/ihf/images/Balaram_Jayanti_2025.png",
    vpf: "https://secure.kbmandir.org/forms/kbm-festival-seva-vpf",
    ihf: "https://secure.kbmandir.org/forms/kbm-festival-seva-ihf"
  },
  "new-temple-project": {
    label: "New Temple Project Donations",
    img: "https://www.kbmandir.org/wp-content/uploads/2017/11/nvw-scaled.jpg",
    vpf: "https://secure.kbmandir.org/forms/new-temple-project-donations-vpf",
    ihf: "https://secure.kbmandir.org/forms/new-temple-project-donations-ihf"
  },
  "sunday-feast": {
    label: "Sponsor Sunday Feast",
    img: "https://secure.kbmandir.org/neon/resource/ihf/images/sunday_feast.JPG",
    vpf: "https://secure.kbmandir.org/forms/sunday-feast-sponsorship-vpf",
    ihf: "https://secure.kbmandir.org/forms/sunday-feast-sponsorship-ihf"
  },
  "sri-lakshmi-narasimha-homa": {
    label: "Sri Lakshmi Narasimha Homa",
    img: "https://secure.kbmandir.org/neon/resource/ihf/images/narsimha_homa.jpg",
    vpf: "https://secure.kbmandir.org/forms/sri-lakshmi-narasimha-homa-vpf",
    ihf: "https://secure.kbmandir.org/forms/sri-lakshmi-narasimha-homa-ihf"
  },
  "garland-seva": {
    label: "Deity Garlands Seva",
    img: "https://secure.kbmandir.org/neon/resource/ihf/images/garland_seva.JPG",
    vpf: "https://secure.kbmandir.org/forms/garland-sevas-vpf",
    ihf: "https://secure.kbmandir.org/forms/garland-sevas-ihf"
  },
  "nitya-prasada-seva": {
    label: "Nitya Prasada Seva",
    img: "https://secure.kbmandir.org/neon/resource/ihf/images/_J1A2922.JPG",
    vpf: "https://secure.kbmandir.org/forms/nitya-prasada-seva-sponsorships-vpf",
    ihf: "https://secure.kbmandir.org/forms/nitya-prasada-seva-sponsorships-ihf"
  },
  "deity-seva": {
    label: "Daily Deity Sevas",
    img: "https://www.kbmandir.org/wp-content/uploads/2022/03/2022_14.jpg",
    vpf: "https://secure.kbmandir.org/forms/deity-sevas-vpf",
    ihf: "https://secure.kbmandir.org/forms/deity-sevas-ihf"
  },
  "sastra-seva": {
    label: "Sastra Dana Seva",
    img: "https://secure.kbmandir.org/neon/resource/ihf/images/book_distribution.jpeg",
    vpf: "https://secure.kbmandir.org/forms/book-distribution-vpf",
    ihf: "https://secure.kbmandir.org/forms/book-distribution-ihf"
  },
  "cow-feeding-seva": {
    label: "Goshala - Cow Feeding Seva",
    img: "https://secure.kbmandir.org/neon/resource/ihf/images/WhatsApp%20Image%202025-01-25%20at%2018_32_50.jpeg",
    vpf: "https://secure.kbmandir.org/forms/cow-feeding-seva-vpf",
    ihf: "https://secure.kbmandir.org/forms/cow-feeding-seva-ihf"
  },
  "goshala-project": {
    label: "Goshala Project Donations",
    img: "https://www.kbgoshala.org/wp-content/uploads/2017/11/Screenshot-2024-06-17-at-8.04.18%E2%80%AFPM-2048x1324.png",
    vpf: "https://secure.kbmandir.org/forms/goshala-project-vpf",
    ihf: "https://secure.kbmandir.org/forms/goshala-project-ihf"
  },
  "general-donation": {
    label: "General Donations",
    img: "https://secure.kbmandir.org/neon/resource/ihf/images/general_donations.jpeg",
    vpf: "https://secure.kbmandir.org/forms/general-donation-vpf",
    ihf: "https://secure.kbmandir.org/forms/general-donation-ihf"
  },
};

// Cookie helper functions
function setEmployerCookie(name) {
  document.cookie = `ihf_employer_name=${encodeURIComponent(name)}; path=/; domain=.kbmandir.org; max-age=31536000`; // 1 year
}

function getEmployerCookie() {
  const match = document.cookie.match(/(?:^|; )ihf_employer_name=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function updateEmployer() {
  const input = document.getElementById("employerInput");
  const name = input.value.trim() || "N/A";

  setEmployerCookie(name);
  localStorage.setItem("ihf_employer_name", name);

  document.getElementById("employerName").innerText = name;

  const isMatch = employerList.some(employer =>
      name.toLowerCase().includes(employer.toLowerCase())
  );
  const urlType = isMatch ? "vpf" : "ihf";
  renderTiles(urlType);
}

function renderTiles(urlType) {
  // Containers for the hero tile and the grid of tiles.  The hero tile
  // container may not exist on pages that don't include the hero layout.
  const heroContainer = document.getElementById("heroTile");
  const container = document.getElementById("donationTiles");
  if (heroContainer) heroContainer.innerHTML = "";
  if (container) container.innerHTML = "";

  // Check if a specific donation form key has been passed via the
  // "form" query parameter.  When provided, this key will
  // determine which tile should be rendered first (as the hero tile).
  const urlParams = new URLSearchParams(window.location.search);
  const priorityKey = urlParams.get("form");

  // Remove the "form" parameter from the URL to avoid appending it to every link
  // when rendering the tiles to pass the utm parameters for tracking.
  urlParams.delete('form');
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
    heroLink.innerHTML = `
      <img src="${firstForm.img}" alt="${firstForm.label}" />
      <span>${firstForm.label}</span>
    `;
    heroContainer.appendChild(heroLink);
  }

  // Render the remaining entries as grid tiles
  entries.slice(heroContainer ? 1 : 0).forEach(([, form]) => {
    const tileLink = document.createElement("a");
    // tileLink.href = form[urlType] + queryString;
    tileLink.target = "_blank";
    tileLink.className = "tile";
    tileLink.innerHTML = `
      <img src="${form.img}" alt="${form.label}" />
      <span>${form.label}</span>
    `;
    if (container) container.appendChild(tileLink);
  });
}

document.getElementById("employerInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    updateEmployer();
  }
});

// Initial Load – Prefer cookie first, then localStorage, then "N/A"
let storedName = getEmployerCookie() || localStorage.getItem("ihf_employer_name") || "N/A";
document.getElementById("employerName").innerText = storedName;
document.getElementById("employerInput").value = storedName;

const isMatchInit = employerList.some(employer =>
    storedName.toLowerCase().includes(employer.toLowerCase())
);
const urlTypeInit = isMatchInit ? "vpf" : "ihf";
renderTiles(urlTypeInit);

