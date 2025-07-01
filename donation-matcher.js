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
     label: "Janmashtami 2025",
     img: "https://secure.kbmandir.org/neon/resource/ihf/images/Janmashtami_2025.jpeg",
     vpf: "https://secure.kbmandir.org/forms/janmashtami-2025-vpf",
     ihf: "https://secure.kbmandir.org/forms/janmashtami-2025-ihf"
   },
  // "kbm festival": {
  //   label: "Ratha Yatra - Sunday, June 29, 2025",
  //   img: "https://www.kbmandir.org/wp-content/uploads/2025/06/RY_25-2.jpg",
  //   vpf: "https://secure.kbmandir.org/forms/kbm-festival-seva-vpf",
  //   ihf: "https://secure.kbmandir.org/forms/kbm-festival-seva-ihf"
  // },
  "new-temple-project-donations": {
    label: "New Temple Project Donations",
    img: "https://www.kbmandir.org/wp-content/uploads/2017/11/nvw-scaled.jpg",
    vpf: "https://secure.kbmandir.org/forms/new-temple-project-donations-vpf",
    ihf: "https://secure.kbmandir.org/forms/new-temple-project-donations-ihf"
  },
  "sunday-feast-sponsorship": {
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
  "garland-sevas": {
    label: "Deity Garlands Seva",
    img: "https://secure.kbmandir.org/neon/resource/ihf/images/garland_seva.JPG",
    vpf: "https://secure.kbmandir.org/forms/garland-sevas-vpf",
    ihf: "https://secure.kbmandir.org/forms/garland-sevas-ihf"
  },
  "nitya-prasada-seva-sponsorships": {
    label: "Nitya Prasada Seva",
    img: "https://secure.kbmandir.org/neon/resource/ihf/images/_J1A2922.JPG",
    vpf: "https://secure.kbmandir.org/forms/nitya-prasada-seva-sponsorships-vpf",
    ihf: "https://secure.kbmandir.org/forms/nitya-prasada-seva-sponsorships-ihf"
  },
  "deity-sevas": {
    label: "Daily Deity Sevas",
    img: "https://www.kbmandir.org/wp-content/uploads/2022/03/2022_14.jpg",
    vpf: "https://secure.kbmandir.org/forms/deity-sevas-vpf",
    ihf: "https://secure.kbmandir.org/forms/deity-sevas-ihf"
  },
  "cow-feeding-seva": {
    label: "Goshala - Cow Feeding Seva",
    img: "https://secure.kbmandir.org/neon/resource/ihf/images/WhatsApp%20Image%202025-01-25%20at%2018_32_50.jpeg",
    vpf: "https://secure.kbmandir.org/forms/cow-feeding-seva-vpf",
    ihf: "https://secure.kbmandir.org/forms/cow-feeding-seva-ihf"
  },
  "recurring-sqft-seva": {
    label: "Goshala - Square Feet Seva",
    img: "https://secure.kbmandir.org/neon/resource/ihf/images/IMG_4143.jpg",
    vpf: "https://secure.kbmandir.org/forms/recurring-sqft-seva-vpf",
    ihf: "https://secure.kbmandir.org/forms/recurring-sqft-seva-ihf"
  },
  "upcoming goshala-project": {
    label: "Goshala - Upcoming Project",
    img: "https://www.kbgoshala.org/wp-content/uploads/2017/11/Screenshot-2024-06-17-at-8.04.18%E2%80%AFPM-2048x1324.png",
    vpf: "https://secure.kbmandir.org/forms/upcoming-goshala-project-vpf",
    ihf: "https://secure.kbmandir.org/forms/upcoming-goshala-project-ihf"
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
  const container = document.getElementById("donationTiles");
  container.innerHTML = "";
  Object.values(donationForms).forEach(form => {
    const a = document.createElement("a");
    a.href = form[urlType];
    a.target = "_blank";
    a.className = "tile";
    a.innerHTML = `
      <img src="${form.img}" alt="${form.label}" />
      <span>${form.label}</span>
    `;
    container.appendChild(a);
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

