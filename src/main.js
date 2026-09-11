// ---- Header: solid background once the page scrolls, mobile menu toggle ----
const header = document.getElementById("site-header");
const navToggle = document.getElementById("nav-toggle");

const onScrollHeader = () => header.classList.toggle("scrolled", window.scrollY > 10);
onScrollHeader();
window.addEventListener("scroll", onScrollHeader, { passive: true });

navToggle.addEventListener("click", () => header.classList.toggle("nav-open"));
header.querySelectorAll("nav a").forEach((link) => {
  link.addEventListener("click", () => header.classList.remove("nav-open"));
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

// ---- Use cases: tab switcher ----
const USE_CASES = [
  {
    label: "Content Creation",
    heading: "Content Creation",
    body: "Bring stories, posts, and ideas to life with words that flow naturally.",
    img: "/assets/message/usecase1.jpg",
  },
  {
    label: "Coding Help",
    heading: "Coding Help",
    body: "Explain, debug, and refactor code in plain language — from a quick snippet to a whole function.",
    img: "/assets/message/usecase2.jpg",
  },
  {
    label: "Research & Insights",
    heading: "Research & Insights",
    body: "Condense long reading into the few insights that actually move your work forward.",
    img: "/assets/message/usecase3.jpg",
  },
  {
    label: "Focus & productivity",
    heading: "Focus & Productivity",
    body: "Gentle nudges and structure that keep you on task, without ever feeling like pressure.",
    img: "/assets/message/usecase4.jpg",
  },
];

const tabsEl = document.querySelector(".usecase-tabs");
const panelEl = document.querySelector(".usecase-panel");
if (tabsEl && panelEl) {
  let active = 0;

  const renderPanel = () => {
    const c = USE_CASES[active];
    panelEl.innerHTML = `
      <div class="usecase-media"><img src="${c.img}" alt="" loading="lazy"></div>
      <div class="usecase-copy">
        <h3>${c.heading}</h3>
        <p>${c.body}</p>
        <a href="#pricing" class="btn btn-ghost">Get started</a>
      </div>
    `;
  };

  const renderTabs = () => {
    tabsEl.innerHTML = USE_CASES.map(
      (c, i) => `<button class="usecase-tab${i === active ? " active" : ""}" data-i="${i}">${c.label}</button>`
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

// ---- Testimonials: simple looping carousel ----
const TESTIMONIALS = [
  { quote: "I've tested countless AI tools, but this one feels different — less like software, more like a guide that clears the fog in my projects.", name: "Sophia M.", role: "Product Designer" },
  { quote: "Within days, it streamlined my workflow. The balance of precision and inspiration it offers is unlike anything I've seen.", name: "David K.", role: "Indie Hacker" },
  { quote: "At first I was skeptical. But the clarity it brings into complex problems feels almost like working with a second brain.", name: "Aria L.", role: "Researcher" },
  { quote: "It doesn't just answer — it reframes. Every interaction feels like it points me toward a clearer path.", name: "Ethan R.", role: "Entrepreneur" },
];

const slidesEl = document.getElementById("t-slides");
const dotsEl = document.getElementById("t-dots");
const prevBtn = document.getElementById("t-prev");
const nextBtn = document.getElementById("t-next");

if (slidesEl && dotsEl) {
  let index = 0;

  slidesEl.innerHTML = TESTIMONIALS.map(
    (t) => `
      <div class="t-slide">
        <figure class="t-quote">
          <p>&ldquo;${t.quote}&rdquo;</p>
          <footer><strong>${t.name}</strong><span>${t.role}</span></footer>
        </figure>
      </div>
    `
  ).join("");

  dotsEl.innerHTML = TESTIMONIALS.map((_, i) => `<span class="t-dot${i === 0 ? " active" : ""}"></span>`).join("");
  const dots = Array.from(dotsEl.children);

  const go = (i) => {
    index = (i + TESTIMONIALS.length) % TESTIMONIALS.length;
    slidesEl.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle("active", di === index));
  };

  prevBtn.addEventListener("click", () => go(index - 1));
  nextBtn.addEventListener("click", () => go(index + 1));
  dots.forEach((d, i) => d.addEventListener("click", () => go(i)));

  let auto = window.setInterval(() => go(index + 1), 6000);
  const pause = () => window.clearInterval(auto);
  const resume = () => { auto = window.setInterval(() => go(index + 1), 6000); };
  slidesEl.addEventListener("pointerenter", pause);
  slidesEl.addEventListener("pointerleave", resume);
}

// ---- Pricing: monthly/yearly toggle ----
const priceSwitch = document.getElementById("p-switch");
const monthlyLabel = document.getElementById("p-monthly");
const yearlyLabel = document.getElementById("p-yearly");

if (priceSwitch) {
  const priceEls = Array.from(document.querySelectorAll("[data-price-monthly]"));
  let yearly = false;

  priceSwitch.addEventListener("click", () => {
    yearly = !yearly;
    priceSwitch.classList.toggle("yearly", yearly);
    monthlyLabel.classList.toggle("on", !yearly);
    yearlyLabel.classList.toggle("on", yearly);
    priceEls.forEach((el) => {
      el.textContent = "€" + el.dataset[yearly ? "priceYearly" : "priceMonthly"];
    });
  });
}

// ---- Footer year ----
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
