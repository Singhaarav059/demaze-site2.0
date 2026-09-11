// ---- Header: solid background once the page scrolls, mobile menu toggle, active link ----
const header = document.getElementById("site-header");
const navToggle = document.getElementById("nav-toggle");

const onScrollHeader = () => header.classList.toggle("scrolled", window.scrollY > 10);
onScrollHeader();
window.addEventListener("scroll", onScrollHeader, { passive: true });

navToggle.addEventListener("click", () => header.classList.toggle("nav-open"));
const currentPage = location.pathname.split("/").pop() || "index.html";
header.querySelectorAll("nav a").forEach((link) => {
  link.addEventListener("click", () => header.classList.remove("nav-open"));
  if (link.getAttribute("href") === currentPage) link.classList.add("active");
});

// ---- Reveal-on-scroll: fade + rise once each element enters the viewport ----
const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduced) {
  revealEls.forEach((el) => el.classList.add("in"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8%" }
  );
  revealEls.forEach((el) => io.observe(el));
}

// ---- Services: tab switcher (present on home + services page) ----
const SERVICES = [
  {
    label: "AI & ML",
    heading: "AI & ML",
    body: "We build the AI layer that actually ships: models that predict, personalize, and automate inside your product, not inside a slide deck.",
    features: [
      "Predictive Analytics & Forecasting",
      "NLP & Conversational AI",
      "Computer Vision & Image Processing",
      "Generative Models & Content Synthesis",
      "Recommendation Systems & Personalization",
      "AI Dashboards & Insights",
    ],
  },
  {
    label: "Web / Mobile / SaaS",
    heading: "Web, Mobile & SaaS",
    body: "We build the software your business runs on, from a first working prototype to multi-tenant SaaS that still holds up months after launch.",
    features: [
      "Web App Development",
      "Mobile App Development",
      "Custom SaaS Development",
      "Workflow Automation",
      "API & System Integration",
      "Progressive Web Apps",
    ],
  },
  {
    label: "E-commerce",
    heading: "E-commerce",
    body: "We engineer commerce systems around the parts that actually move revenue: conversion, fraud protection, and fulfillment that doesn't buckle under a traffic spike.",
    features: [
      "D2C & Multi-Vendor Marketplaces",
      "AI Personalization & Recommendations",
      "Subscription & Recurring Billing",
      "Checkout & Fraud Protection",
      "Inventory & Fulfillment",
      "Storefront UI/UX",
    ],
  },
  {
    label: "Cloud",
    heading: "Cloud",
    body: "We build infrastructure that doesn't need a hero engineer at 2am: migration, security, and observability handled before they become incidents.",
    features: [
      "Cloud Migration & Modernization",
      "Cloud-Native Development",
      "Multi-Cloud Architecture",
      "Security & Compliance",
      "Observability & Monitoring",
      "Disaster Recovery",
    ],
  },
];

const tabsEl = document.querySelector(".usecase-tabs");
const panelEl = document.querySelector(".usecase-panel");
if (tabsEl && panelEl) {
  let active = 0;

  const renderPanel = () => {
    const s = SERVICES[active];
    panelEl.innerHTML = `
      <div class="usecase-copy">
        <h3>${s.heading}</h3>
        <p>${s.body}</p>
        <ul class="usecase-features">${s.features.map((f) => `<li>${f}</li>`).join("")}</ul>
        <a href="contact.html" class="btn btn-ghost">Discuss this service</a>
      </div>
    `;
  };

  const renderTabs = () => {
    tabsEl.innerHTML = SERVICES.map(
      (s, i) => `<button class="usecase-tab${i === active ? " active" : ""}" data-i="${i}">${s.label}</button>`
    ).join("");
  };

  tabsEl.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-i]");
    if (!btn) return;
    active = Number(btn.dataset.i);
    renderTabs();
    renderPanel();
  });

  renderTabs();
  renderPanel();
}

// ---- Stats: count up once in view (present wherever [data-stat-target] exists) ----
const statEls = Array.from(document.querySelectorAll("[data-stat-target]"));
if (statEls.length) {
  const runStat = (el) => {
    const target = parseFloat(el.dataset.statTarget);
    const prefix = el.dataset.statPrefix || "";
    const suffix = el.dataset.statSuffix || "";
    const start = performance.now();
    const dur = reduced ? 1 : 1100;
    const step = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const sio = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runStat(entry.target);
          sio.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  statEls.forEach((el) => sio.observe(el));
}

// ---- Contact form: no backend yet, so hand off to the visitor's mail client ----
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const data = new FormData(contactForm);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const subject = String(data.get("subject") || "").trim();
    const message = String(data.get("message") || "").trim();
    const status = document.getElementById("contact-status");
    const body = [`Name: ${name}`, `Email: ${email}`, subject ? `Subject: ${subject}` : null, "", message]
      .filter(Boolean)
      .join("\n");
    const mailto = `mailto:contact@demazetech.com?subject=${encodeURIComponent(
      subject || "Project enquiry from " + (name || "website")
    )}&body=${encodeURIComponent(body)}`;
    if (status) status.textContent = "Opening your email client...";
    window.location.href = mailto;
  });
}

// ---- Footer year ----
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});
