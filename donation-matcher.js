
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
    label: "Donate to Cow Feeding Seva",
    img: "https://d2r0txsugik6oi.cloudfront.net/neon/resource/ihf/images/WhatsApp%20Image%202025-01-25%20at%2018_32_50.jpeg",
    vpf: "https://ihf.app.neoncrm.com/forms/cow-feeding-seva-vpf",
    ihf: "https://ihf.app.neoncrm.com/forms/cow-feeding-seva-ihf"
  },
  "recurring-sqft-seva": {
    label: "Donate to Sqft seva",
    img: "https://d2r0txsugik6oi.cloudfront.net/neon/resource/ihf/images/Sqft.jpg",
    vpf: "https://ihf.app.neoncrm.com/forms/recurring-sqft-seva-vpf",
    ihf: "https://ihf.app.neoncrm.com/forms/recurring-sqft-seva-ihf"
  },
  "garland-sevas": {
    label: "Donate to Garland seva",
    img: "https://d2r0txsugik6oi.cloudfront.net/neon/resource/ihf/images/garland_sevas.jpeg",
    vpf: "https://ihf.app.neoncrm.com/forms/garland-sevas-vpf",
    ihf: "https://ihf.app.neoncrm.com/forms/garland-sevas-ihf"
  }
};

function getCompanyName() {
  let name = localStorage.getItem("ihf_company_name");
  if (!name) {
    name = prompt("Enter your company name for donation matching. If you don't have one, enter N/A.", "N/A");
    if (name) {
      localStorage.setItem("ihf_company_name", name);
    }
  }
  return name || "N/A";
}

function changeCompany() {
  localStorage.removeItem("ihf_company_name");
  location.reload();
}

function renderCompanyInfo(name) {
  const div = document.getElementById("companyDisplay");
  const btn = document.createElement("button");
  btn.className = "change-btn";
  btn.innerText = "Change";
  btn.onclick = changeCompany;
  div.innerHTML = "Your company: <strong>" + name + "</strong> ";
  div.appendChild(btn);
}

function renderTiles(urlType) {
  const container = document.getElementById("donationTiles");
  container.innerHTML = "";
  Object.entries(donationForms).forEach(([key, form]) => {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.onclick = () => window.open(form[urlType], '_blank');
    tile.innerHTML = `
      <img src="${form.img}" alt="${form.label}" />
      <span>${form.label}</span>
    `;
    container.appendChild(tile);
  });
}

const employer = getCompanyName();
renderCompanyInfo(employer);
const isMatch = employerList.some(name => employer.toLowerCase().includes(name.toLowerCase()));
const urlType = isMatch ? "vpf" : "ihf";
renderTiles(urlType);
