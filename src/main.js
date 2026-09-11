const EASE = "cubic-bezier(.22,1,.36,1)";

// Design-tool defaults from the original preview's editable props.
const MOTION_INTENSITY = "subtle"; // 'subtle' | 'moderate' | 'bold'
const SERVICE_IMAGE_FIT = "contain"; // 'contain' | 'cover'
const PINNED_WORK_GALLERY = true;
const AUTOPLAY_HERO_VIDEO = true;

const PATH_TO_PAGE = {
  "/": "home",
  "/projects": "projects",
  "/services": "services",
  "/about": "about",
  "/contact": "contact",
};

const root = document.getElementById("app-root");
const pageEls = Array.from(root.querySelectorAll("[data-page]"));
const navLinks = Array.from(root.querySelectorAll("[data-nav]"));
const curtain = root.querySelector("[data-curtain]");

let currentPage = PATH_TO_PAGE[location.pathname] ?? "home";
let cleanup = null;

function applyPage(page) {
  pageEls.forEach((el) => { el.hidden = el.dataset.page !== page; });
  navLinks.forEach((el) => { el.classList.toggle("active", el.dataset.nav === page); });
}

function setPage(page, { push = true } = {}) {
  if (page === currentPage) return;
  const swap = () => {
    if (cleanup) cleanup();
    currentPage = page;
    applyPage(page);
    window.scrollTo(0, 0);
    initMotion();
  };
  if (push) {
    history.pushState({ page }, "", page === "home" ? "/" : `/${page}`);
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!curtain || reduced) { swap(); return; }

  const dur = 760;
  const park = () => {
    curtain.style.visibility = "hidden";
    curtain.style.opacity = "0";
  };
  curtain.style.visibility = "visible";
  curtain.style.opacity = "1";
  const anim = curtain.animate(
    [
      { transform: "translate3d(0,100%,0)" },
      { transform: "translate3d(0,0,0)", offset: 0.38 },
      { transform: "translate3d(0,0,0)", offset: 0.52 },
      { transform: "translate3d(0,-100%,0)" },
    ],
    { duration: dur, easing: EASE }
  );
  anim.finished.then(park).catch(() => {});
  window.setTimeout(park, dur + 200);
  window.setTimeout(swap, Math.round(dur * 0.45));
}

navLinks.forEach((link) => {
  link.addEventListener("click", (ev) => {
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    ev.preventDefault();
    setPage(link.dataset.nav);
  });
});

window.addEventListener("popstate", () => {
  setPage(PATH_TO_PAGE[location.pathname] ?? "home", { push: false });
});

// ---- Contact form: no backend yet, so hand off to the visitor's mail client honestly ----
const enquiryForm = document.getElementById("enquiry");
if (enquiryForm) {
  enquiryForm.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const data = new FormData(enquiryForm);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const company = String(data.get("company") || "").trim();
    const message = String(data.get("message") || "").trim();
    const status = enquiryForm.querySelector("[data-form-status]");
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      company ? `Company: ${company}` : null,
      "",
      message,
    ].filter(Boolean).join("\n");
    const mailto = `mailto:contact@demazetech.com?subject=${encodeURIComponent("Project enquiry from " + (name || "website"))}&body=${encodeURIComponent(body)}`;
    if (status) status.textContent = "Opening your email client…";
    window.location.href = mailto;
  });
}

// ---- Motion: ported from the Claude Design preview's own vanilla scroll driver ----
function initMotion() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const k = MOTION_INTENSITY === "bold" ? 1.7 : MOTION_INTENSITY === "moderate" ? 1.15 : 1;
  const pinFalloff = MOTION_INTENSITY === "bold" ? 0.34 : MOTION_INTENSITY === "moderate" ? 0.45 : 0.56;
  const fit = SERVICE_IMAGE_FIT;
  const cleanups = [];

  const header = root.querySelector("#site-header");
  const progress = root.querySelector("#scroll-progress");
  const heroFrame = root.querySelector("#hero-video-frame");
  const heroVideo = root.querySelector("#hero-video-frame video");
  const revealEls = Array.from(root.querySelectorAll("[data-reveal]"));
  const maskLines = Array.from(root.querySelectorAll("[data-mask-line] > span"));
  const chips = Array.from(root.querySelectorAll("[data-chip]"));
  const metricEls = Array.from(root.querySelectorAll("[data-metric]"));
  const floats = Array.from(root.querySelectorAll("[data-float]"));
  const lifts = Array.from(root.querySelectorAll("[data-lift]"));
  const cards = Array.from(root.querySelectorAll("[data-card]"));
  const marquees = Array.from(root.querySelectorAll("[data-marquee]"));
  const servicesStage = root.querySelector("#services-stage");
  const serviceRows = Array.from(root.querySelectorAll("[data-service-row]"));
  const serviceImgs = Array.from(root.querySelectorAll("[data-service-img]"));
  const serviceGlow = root.querySelector("[data-service-glow]");
  const stickyImgCol = serviceGlow ? serviceGlow.parentElement : null;
  const serviceIndex = root.querySelector("[data-service-index]");
  const galleries = Array.from(root.querySelectorAll("[data-hgallery]"));
  const kinetics = Array.from(root.querySelectorAll("[data-kinetic-row]"));
  const kineticWords = kinetics.map((el) => Array.from(el.querySelectorAll("[data-kinetic-word]")));
  const outros = Array.from(root.querySelectorAll("[data-outro]"));
  const sideTab = root.querySelector("[data-sidetab]");
  const wipes = Array.from(root.querySelectorAll("[data-wipe]"));
  const wordEls = Array.from(root.querySelectorAll("[data-words]"));
  const pinGallery = PINNED_WORK_GALLERY;

  // Headlines scrub word by word, so the split happens once per mount.
  wordEls.forEach((el) => {
    if (el.dataset.split === "1") return;
    const words = (el.textContent || "").trim().split(/\s+/);
    el.textContent = "";
    words.forEach((w, i) => {
      const s = document.createElement("span");
      s.textContent = w;
      s.style.display = "inline-block";
      s.style.willChange = "opacity,transform";
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    el.dataset.split = "1";
  });
  const wordSpans = wordEls.map((el) => Array.from(el.querySelectorAll("span")));
  if (reduced) wordSpans.forEach((spans) => spans.forEach((s) => { s.style.opacity = "1"; s.style.transform = "none"; }));

  let heroGap = 0;

  // Horizontal work gallery: pin height = viewport + track overflow. Falls back
  // to a wrapping grid when pinning is off, motion is reduced, or space is tight.
  let galleryLayout = [];
  // Below 760px the services split collapses to one column (see CSS), which removes
  // the tall shared grid row the sticky image relies on for its pin range — so its
  // "stuck" state would otherwise float over every row instead of just its own.
  let flatServices = false;
  const layoutGalleries = () => {
    if (sideTab) sideTab.style.display = window.innerWidth < 980 ? "none" : "flex";
    if (heroFrame) {
      heroFrame.style.width = "100%";
      heroGap = Math.max(0, window.innerWidth - heroFrame.getBoundingClientRect().right - 2);
    }
    flatServices = window.innerWidth < 760;
    if (stickyImgCol) stickyImgCol.style.position = flatServices ? "static" : "sticky";
    const flat = reduced || !pinGallery || window.innerWidth < 620;
    galleryLayout = [];
    galleries.forEach((g) => {
      const stage = g.querySelector("[data-hgallery-stage]");
      const track = g.querySelector("[data-hgallery-track]");
      const rail = g.querySelector("[data-hgallery-rail]");
      if (!stage || !track) return;
      if (flat) {
        g.style.height = "auto";
        stage.style.position = "static";
        stage.style.height = "auto";
        stage.style.paddingBlock = "40px";
        track.style.flexWrap = "wrap";
        track.style.width = "auto";
        track.style.justifyContent = "center";
        track.style.paddingInline = "0";
        track.style.transform = "none";
        if (rail) rail.style.width = "100%";
        return;
      }
      stage.style.position = "sticky";
      stage.style.height = "100vh";
      stage.style.paddingBlock = "0";
      track.style.flexWrap = "nowrap";
      track.style.width = "max-content";
      const travel = Math.max(0, track.scrollWidth - stage.clientWidth);
      g.style.height = `${stage.clientHeight + travel}px`;
      galleryLayout.push({ g, track, rail, travel, p: 0, sm: 0 });
    });
  };
  layoutGalleries();
  cleanups.push(() => {
    galleries.forEach((g) => { g.style.height = ""; });
  });

  if (heroVideo) {
    heroVideo.muted = true;
    if (!AUTOPLAY_HERO_VIDEO) heroVideo.pause();
    else if (heroVideo.paused) heroVideo.play().catch(() => {});
  }
  serviceImgs.forEach((img) => {
    const cover = fit === "cover";
    img.style.inset = cover ? "0" : "9%";
    img.style.width = cover ? "100%" : "82%";
    img.style.height = cover ? "100%" : "82%";
    img.style.objectFit = cover ? "cover" : "contain";
  });

  // ---- Entrance layer: one shared easing + stagger for every element type ----
  const show = (el) => {
    el.style.opacity = "1";
    el.style.transform = "none";
  };
  const prep = (els, transform, delayStep) => {
    els.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = transform;
      el.style.transition = `opacity .75s ${EASE} ${i % 4 * delayStep}ms, transform .9s ${EASE} ${i % 4 * delayStep}ms`;
    });
  };
  if (reduced) {
    [...revealEls, ...maskLines, ...chips].forEach((el) => { el.style.opacity = "1"; el.style.transform = "none"; });
  } else {
    prep(revealEls, `translate3d(0,${(22 * k).toFixed(0)}px,0)`, 60);
    prep(maskLines, "translate3d(0,102%,0)", 90);
    prep(chips, "translate3d(0,10px,0) scale(.94)", 45);
    const all = [...revealEls, ...maskLines, ...chips];
    const vh = window.innerHeight;
    const pending = [];
    all.forEach((el) => {
      const rb = el.getBoundingClientRect();
      if (rb.top < vh * 1.02) show(el); else pending.push(el);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -7%" });
    pending.forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());
    const safety = window.setTimeout(() => all.forEach(show), 1600);
    cleanups.push(() => window.clearTimeout(safety));
  }

  // ---- Metrics: count-up + rule fill, same trigger ----
  const runMetric = (el) => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    const strong = el.querySelector("strong");
    const rule = el.querySelector("[data-metric-rule]");
    if (rule) { rule.style.transition = `width 1.2s ${EASE}`; rule.style.width = "100%"; }
    if (!strong) return;
    const start = performance.now();
    const dur = reduced ? 1 : 1100;
    const step = (t) => {
      const p = Math.min(1, (t - start) / dur);
      strong.textContent = prefix + Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (metricEls.length) {
    const mio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { runMetric(e.target); mio.unobserve(e.target); } });
    }, { threshold: 0.4 });
    metricEls.forEach((el) => mio.observe(el));
    cleanups.push(() => mio.disconnect());
  }

  // ---- Hover language: one lift curve for every interactive surface ----
  if (!reduced) {
    const bind = (el, y, shadow) => {
      el.style.transition = `transform .35s ${EASE}, box-shadow .35s ${EASE}`;
      const on = () => { el.style.transform = `translate3d(0,${y}px,0)`; if (shadow) el.style.boxShadow = shadow; };
      const off = () => { el.style.transform = "translate3d(0,0,0)"; if (shadow) el.style.boxShadow = ""; };
      el.addEventListener("pointerenter", on);
      el.addEventListener("pointerleave", off);
      cleanups.push(() => { el.removeEventListener("pointerenter", on); el.removeEventListener("pointerleave", off); });
    };
    lifts.forEach((el) => {
      bind(el, -3, "0 14px 32px oklch(0.25 0.02 285/0.12)");
      // Magnetic: the surface leans a few px toward the cursor, then releases.
      const move = (ev) => {
        const r = el.getBoundingClientRect();
        const dx = ((ev.clientX - (r.left + r.width / 2)) / Math.max(1, r.width)) * 7 * k;
        const dy = ((ev.clientY - (r.top + r.height / 2)) / Math.max(1, r.height)) * 5 * k;
        el.style.transform = `translate3d(${dx.toFixed(1)}px,${(dy - 3).toFixed(1)}px,0)`;
      };
      el.addEventListener("pointermove", move);
      cleanups.push(() => el.removeEventListener("pointermove", move));
    });
    cards.forEach((el) => {
      const media = el.querySelector("[data-float] img");
      if (media) media.style.transition = `transform .5s ${EASE}`;
      const on = () => { if (media) media.style.transform = "scale(1.045)"; };
      const off = () => { if (media) media.style.transform = "scale(1)"; };
      el.addEventListener("pointerenter", on);
      el.addEventListener("pointerleave", off);
      cleanups.push(() => { el.removeEventListener("pointerenter", on); el.removeEventListener("pointerleave", off); });
    });
    marquees.forEach((m) => {
      const track = m.querySelector("[data-marquee-track]");
      if (!track) return;
      const on = () => { track.style.animationPlayState = "paused"; };
      const off = () => { track.style.animationPlayState = "running"; };
      m.addEventListener("pointerenter", on);
      m.addEventListener("pointerleave", off);
      cleanups.push(() => { m.removeEventListener("pointerenter", on); m.removeEventListener("pointerleave", off); });
    });
  }

  if (reduced) { cleanup = () => cleanups.forEach((fn) => fn()); return; }

  // ---- Hero tilt: restrained pointer-driven parallax, à la anubi.io's
  // scattered-photo hero (each card leans toward the cursor via a damped
  // perspective/rotateX/rotateY tilt). Feeds the same paint() driver below.
  const heroPointer = { x: 0, y: 0 };
  const heroSmooth = { x: 0, y: 0 };
  if (heroFrame && window.matchMedia("(pointer: fine)").matches) {
    const onHeroMove = (ev) => {
      if (ev.pointerType === "touch") return;
      const r = heroFrame.getBoundingClientRect();
      heroPointer.x = Math.max(-1, Math.min(1, (ev.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      heroPointer.y = Math.max(-1, Math.min(1, (ev.clientY - (r.top + r.height / 2)) / (r.height / 2)));
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    const onHeroLeave = () => {
      heroPointer.x = 0;
      heroPointer.y = 0;
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    heroFrame.addEventListener("pointermove", onHeroMove, { passive: true });
    heroFrame.addEventListener("pointerleave", onHeroLeave);
    cleanups.push(() => {
      heroFrame.removeEventListener("pointermove", onHeroMove);
      heroFrame.removeEventListener("pointerleave", onHeroLeave);
    });
  }

  // ---- ONE scroll driver: measure once per frame, paint everything from it ----
  let target = { y: window.scrollY, velocity: 0 };
  let sm = { y: window.scrollY, velocity: 0, headerOn: 0 };
  let rowsCurrent = serviceRows.map(() => 0);
  let rowsTarget = serviceRows.map(() => 0);
  let floatTarget = floats.map(() => 0);
  let floatCurrent = floats.map(() => 0);
  let marqueeShift = 0;
  let kineticTarget = kinetics.map(() => 0);
  let wipeTarget = wipes.map(() => 1);
  let wordTarget = wordEls.map(() => 1);
  let outroTarget = outros.map(() => 0);
  let frame = 0;
  let lastY = window.scrollY;

  const measure = () => {
    const vh = window.innerHeight;
    const y = window.scrollY;
    target.velocity = y - lastY;
    lastY = y;
    target.y = y;
    rowsTarget = serviceRows.map((row) => {
      const rb = row.getBoundingClientRect();
      const dist = Math.abs(rb.top + rb.height / 2 - vh / 2);
      return Math.max(0, 1 - dist / (vh * pinFalloff));
    });
    floatTarget = floats.map((el) => {
      const rb = el.getBoundingClientRect();
      // -1 (entering from below) .. 0 (centred) .. 1 (leaving above)
      return Math.max(-1, Math.min(1, (vh / 2 - (rb.top + rb.height / 2)) / (vh * 0.75)));
    });
    galleryLayout.forEach((gl) => {
      const rb = gl.g.getBoundingClientRect();
      gl.p = gl.travel > 0 ? Math.max(0, Math.min(1, -rb.top / gl.travel)) : 0;
    });
    kineticTarget = kinetics.map((el) => {
      const rb = el.getBoundingClientRect();
      return Math.max(0, Math.min(1, (vh * 0.85 - rb.top) / (vh * 0.55)));
    });
    wipeTarget = wipes.map((el) => {
      const rb = el.getBoundingClientRect();
      return Math.max(0, Math.min(1, (vh - rb.top) / (vh * 0.55)));
    });
    wordTarget = wordEls.map((el) => {
      const rb = el.getBoundingClientRect();
      return Math.max(0, Math.min(1, (vh * 0.92 - rb.top) / (vh * 0.5)));
    });
    outroTarget = outros.map((el) => {
      const rb = el.getBoundingClientRect();
      return Math.max(0, Math.min(1, (vh - rb.top) / (vh * 0.7)));
    });
  };

  const paint = () => {
    frame = 0;
    let unsettled = false;
    const vh = window.innerHeight;
    const doc = document.documentElement;

    sm.y += (target.y - sm.y) * 0.2;
    sm.velocity += (target.velocity - sm.velocity) * 0.12;
    const max = doc.scrollHeight - vh;
    if (progress) progress.style.width = `${max > 0 ? (target.y / max) * 100 : 0}%`;

    const headerTarget = target.y > 40 ? 1 : 0;
    sm.headerOn += (headerTarget - sm.headerOn) * 0.16;
    if (Math.abs(headerTarget - sm.headerOn) > 0.004) unsettled = true;
    if (header) {
      const h = sm.headerOn;
      header.style.background = `color-mix(in oklch, white ${(h * 84).toFixed(1)}%, transparent)`;
      header.style.backdropFilter = `blur(${(h * 14).toFixed(1)}px)`;
      header.style.boxShadow = `0 8px 30px oklch(0.2 0.02 285/${(h * 0.09).toFixed(3)})`;
      header.style.paddingBlock = `${(14 - h * 4).toFixed(1)}px`;
    }

    if (heroFrame) {
      // The hero video widens toward the viewport edge instead of shrinking away.
      const hp = Math.max(0, Math.min(1, target.y / (vh * 0.75)));
      const he = 1 - Math.pow(1 - hp, 3);
      heroFrame.style.width = `calc(100% + ${(heroGap * he).toFixed(1)}px)`;
      heroFrame.style.borderRadius = `${(24 - he * 15).toFixed(1)}px`;

      // Restrained pointer tilt, damped toward the cursor's normalized position.
      heroSmooth.x += (heroPointer.x - heroSmooth.x) * 0.07;
      heroSmooth.y += (heroPointer.y - heroSmooth.y) * 0.07;
      if (Math.abs(heroPointer.x - heroSmooth.x) > 0.001 || Math.abs(heroPointer.y - heroSmooth.y) > 0.001) unsettled = true;
      const rx = (-heroSmooth.y * 4 * k).toFixed(2);
      const ry = (heroSmooth.x * 5 * k).toFixed(2);
      const ty = Math.min(target.y * 0.045 * k, 40).toFixed(1);
      heroFrame.style.transform = `translate3d(0,${ty}px,0) perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    }

    wipes.forEach((el, i) => {
      const e = 1 - Math.pow(1 - (wipeTarget[i] ?? 1), 3);
      const inset = ((1 - e) * 4).toFixed(2);
      el.style.clipPath = `inset(${inset}% ${inset}% 0% ${inset}% round ${((1 - e) * 26).toFixed(1)}px)`;
    });

    wordSpans.forEach((spans, i) => {
      const p = wordTarget[i] ?? 1;
      const n = spans.length;
      spans.forEach((s, j) => {
        // Ramp must span every word: at p=1 the last word is fully lit.
        const local = Math.max(0, Math.min(1, p * (n + 3) - j));
        const e = 1 - Math.pow(1 - local, 2);
        s.style.opacity = (0.16 + e * 0.84).toFixed(3);
        s.style.transform = `translate3d(0,${((1 - e) * 9 * k).toFixed(1)}px,0)`;
      });
    });

    floatCurrent = floatCurrent.map((v, i) => {
      const t = floatTarget[i] ?? 0;
      const next = v + (t - v) * 0.13;
      if (Math.abs(t - next) > 0.002) unsettled = true;
      return next;
    });
    floats.forEach((el, i) => {
      const f = floatCurrent[i];
      const settle = 1 - Math.min(1, Math.abs(f));
      el.style.transform = `translate3d(0,${(-f * 10 * k).toFixed(1)}px,0) scale(${(0.985 + settle * 0.015).toFixed(4)})`;
    });

    if (servicesStage) {
      rowsCurrent = rowsCurrent.map((v, i) => {
        const t = rowsTarget[i] ?? 0;
        const next = v + (t - v) * 0.14;
        if (Math.abs(t - next) > 0.0015) unsettled = true;
        return Math.abs(t - next) <= 0.0015 ? t : next;
      });
      let leadIndex = 0;
      let lead = -1;
      serviceRows.forEach((row, i) => {
        const focus = rowsCurrent[i];
        if (focus > lead) { lead = focus; leadIndex = i; }
        const rb = row.getBoundingClientRect();
        const dir = rb.top > vh * 0.5 ? 1 : -1;
        if (flatServices) {
          row.style.opacity = "1";
          row.style.transform = "none";
        } else {
          row.style.opacity = (0.3 + focus * 0.7).toFixed(3);
          row.style.transform = `translate3d(${((1 - focus) * 10 * k).toFixed(1)}px, ${(dir * (1 - focus) * 14 * k).toFixed(1)}px, 0) scale(${(0.985 + focus * 0.015).toFixed(3)})`;
        }
        const img = serviceImgs[i];
        if (img) {
          img.style.opacity = focus.toFixed(3);
          img.style.transform = `translate3d(0,${(dir * (1 - focus) * 12 * k).toFixed(1)}px,0) scale(${(1.045 - focus * 0.045).toFixed(3)})`;
          img.style.filter = `blur(${((1 - focus) * 1.6).toFixed(2)}px)`;
        }
      });
      if (serviceGlow) serviceGlow.style.transform = `translate3d(-50%,calc(-50% + ${(sm.velocity * 0.6).toFixed(1)}px),0) scale(${(1 + lead * 0.08).toFixed(3)})`;
      if (serviceIndex) serviceIndex.textContent = `0${leadIndex + 1} / 04`;
    }

    galleryLayout.forEach((gl) => {
      const next = gl.sm + (gl.p - gl.sm) * 0.17;
      gl.sm = Math.abs(gl.p - next) <= 0.0008 ? gl.p : next;
      if (Math.abs(gl.p - gl.sm) > 0.0008) unsettled = true;
      gl.track.style.transform = `translate3d(${(-gl.sm * gl.travel).toFixed(1)}px,0,0)`;
      if (gl.rail) gl.rail.style.width = `${(14 + gl.sm * 86).toFixed(1)}%`;
    });

    // One phrase centered and fully visible at a time — crossfades to the
    // next as the chapter scrolls. A cubic ease (instead of a linear ramp)
    // keeps every non-dominant word near-transparent, so stroke-outline
    // words never sit on top of each other at comparable, illegible opacity.
    kineticWords.forEach((words, ki) => {
      const n = words.length;
      const p = Math.max(0, Math.min(1, kineticTarget[ki] ?? 0)) * (n - 1);
      words.forEach((w, j) => {
        const dist = p - j;
        const focus = Math.max(0, 1 - Math.abs(dist));
        const eased = focus * focus * focus;
        w.style.opacity = eased.toFixed(3);
        w.style.transform = `translate3d(0,${(-dist * 14 * k).toFixed(1)}px,0)`;
      });
    });

    outros.forEach((el, i) => {
      const p = outroTarget[i] ?? 1;
      const e = 1 - Math.pow(1 - p, 3);
      const type = el.querySelector("[data-outro-type]");
      if (type) {
        type.style.opacity = (0.2 + e * 0.8).toFixed(3);
        type.style.transform = `translate3d(0,${((1 - e) * 30 * k).toFixed(1)}px,0) scale(${(0.93 + e * 0.07).toFixed(4)})`;
      }
    });

    // The ambient marquee answers to scroll too, so nothing runs "on its own".
    const shiftTarget = Math.max(-60, Math.min(60, sm.velocity * 2.2));
    marqueeShift += (shiftTarget - marqueeShift) * 0.1;
    if (Math.abs(shiftTarget - marqueeShift) > 0.3) unsettled = true;
    marquees.forEach((m) => {
      const shifter = m.querySelector("[data-marquee-shift]");
      if (shifter) shifter.style.transform = `translate3d(${marqueeShift.toFixed(1)}px,0,0)`;
    });

    if (Math.abs(target.y - sm.y) > 0.4 || Math.abs(sm.velocity) > 0.4) unsettled = true;
    if (unsettled) frame = window.requestAnimationFrame(paint);
  };

  let scheduled = 0;
  const onScroll = () => {
    if (scheduled) return;
    scheduled = window.requestAnimationFrame(() => {
      scheduled = 0;
      measure();
      if (!frame) frame = window.requestAnimationFrame(paint);
    });
  };

  measure();
  paint();
  const onResize = () => { layoutGalleries(); onScroll(); };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  cleanups.push(() => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    if (scheduled) window.cancelAnimationFrame(scheduled);
    if (frame) window.cancelAnimationFrame(frame);
  });

  cleanup = () => cleanups.forEach((fn) => fn());
}

applyPage(currentPage);
initMotion();
