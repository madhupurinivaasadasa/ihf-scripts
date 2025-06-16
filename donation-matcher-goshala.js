const employerList = [
  "Adobe", "AMD", "Apple", "Applied Materials", "Broadcom",
  "Cadence", "Ciena", "Cisco", "Dell", "Ebay", "Esurance",
  "Intel", "Juniper", "Lam Research", "McAfee", "Microsoft",
  "NetApp", "Oracle", "Paypal", "Qualcomm", "Samsung",
  "ServiceNow", "Splunk", "Symantec", "Veritas", "Visa",
  "VMware", "Yahoo"
];

const donationForms = {
  "cow-feeding-seva": {
    label: "Cow Feeding Seva",
    img: "https://d2r0txsugik6oi.cloudfront.net/neon/resource/ihf/images/WhatsApp%20Image%202025-01-25%20at%2018_32_50.jpeg",
    vpf: "https://secure.kbmandir.org/forms/cow-feeding-seva-vpf",
    ihf: "https://secure.kbmandir.org/forms/cow-feeding-seva-ihf"
  },
  "recurring-sqft-seva": {
    label: "Square Feet Seva",
    img: "https://d2r0txsugik6oi.cloudfront.net/neon/resource/ihf/images/Sqft.jpg",
    vpf: "https://secure.kbmandir.org/forms/recurring-sqft-seva-vpf",
    ihf: "https://secure.kbmandir.org/forms/recurring-sqft-seva-ihf"
  },
  "upcoming goshala-project": {
    label: "Upcoming Goshala Project",
    img: "https://www.kbgoshala.org/wp-content/uploads/2017/11/Screenshot-2024-06-17-at-8.04.18%E2%80%AFPM-2048x1324.png",
    vpf: "https://secure.kbmandir.org/forms/upcoming-goshala-project-vpf",
    ihf: "https://secure.kbmandir.org/forms/upcoming-goshala-project-ihf"
  }
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

