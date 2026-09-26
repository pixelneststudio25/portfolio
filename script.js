/* ===================== Mobile nav (full-page overlay) ===================== */
(function () {
  const toggle = document.querySelector("[data-nav-toggle]");
  const closeBtn = document.querySelector("[data-nav-close]");
  const nav = document.querySelector(".nav");
  const overlay = document.querySelector(".nav-overlay");
  if (!toggle || !nav || !overlay) return;

  const links = overlay.querySelectorAll(".nav-overlay-links a");

  function openMenu() {
    nav.classList.add("open");
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    // staggered entrance — mirrors the hero word-stagger technique
    links.forEach((a, i) => {
      a.classList.remove("stagger-in");
      setTimeout(() => a.classList.add("stagger-in"), 120 + i * 60);
    });
  }
  function closeMenu() {
    nav.classList.remove("open");
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  toggle.addEventListener("click", () => {
    nav.classList.contains("open") ? closeMenu() : openMenu();
  });
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  overlay.querySelectorAll(".nav-overlay-links a, .nav-overlay-cta").forEach((a) =>
    a.addEventListener("click", closeMenu)
  );
  // close on Escape, close on backdrop click outside the content
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) closeMenu();
  });

  // active-section tracking — highlights the matching overlay link as
  // sections scroll into view. Defensive: only runs if the target
  // sections actually exist on the page.
  const sectionIds = ["about", "work", "services", "contact"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (sections.length && window.IntersectionObserver) {
    const byId = {};
    links.forEach((a) => {
      const id = a.getAttribute("href").replace("#", "");
      byId[id] = a;
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = byId[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            links.forEach((a) => a.classList.remove("active"));
            link.classList.add("active");
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
  }
})();

/* ===================== Headline word stagger + hero reveal ===================== */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (window.gsap && typeof gsap.from === "function" && !prefersReducedMotion) {
  const heroPhoto = document.querySelector(".hero-photo");
  const eyebrow = document.querySelector(".hero-eyebrow");
  const words = document.querySelectorAll(".hero h1 .word span");
  const lede = document.querySelector(".hero p.lede");
  const actionButtons = document.querySelectorAll(".hero-actions a");
  const statItems = document.querySelectorAll(".hero-stat");

  const hasContent =
    heroPhoto || eyebrow || words.length || lede || actionButtons.length || statItems.length;

  if (hasContent) {
    document.documentElement.classList.add("js-ready");

    try {
      const tl = gsap.timeline({
        onComplete: () => document.documentElement.classList.remove("js-ready"),
      });

      if (heroPhoto) {
        tl.from(heroPhoto, { opacity: 0, scale: 0.85, duration: 0.6, ease: "power2.out" }, 0);
      }
      if (eyebrow) {
        tl.from(eyebrow, { opacity: 0, y: 14, duration: 0.55, ease: "power2.out", clearProps: "opacity,transform" }, heroPhoto ? "-=0.25" : 0);
      }
      if (words.length) {
        tl.from(words, { y: "110%", duration: 0.7, stagger: 0.045, ease: "power3.out", clearProps: "transform" }, eyebrow ? "-=0.25" : (heroPhoto ? "-=0.2" : 0));
      }
      if (lede) {
        tl.from(lede, { opacity: 0, y: 18, duration: 0.6, ease: "power2.out", clearProps: "opacity,transform" }, words.length ? "-=0.35" : "-=0.15");
      }
      if (actionButtons.length) {
        tl.from(actionButtons, { opacity: 0, y: 16, scale: 0.96, duration: 0.5, stagger: 0.08, ease: "back.out(1.6)", clearProps: "opacity,transform" }, "-=0.3");
      }
      if (statItems.length) {
        tl.from(statItems, { opacity: 0, y: 20, duration: 0.6, stagger: 0.09, ease: "power2.out", clearProps: "opacity,transform" }, "-=0.2");
      }
    } catch (err) {
      // fail safe: never leave content permanently invisible
      document.documentElement.classList.remove("js-ready");
      console.error("Hero entrance animation failed:", err);
    }
  }
}
/* ===================== Scroll reveals (sections below hero) ===================== */
if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.utils.toArray(".scroll-reveal").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
      clearProps: "opacity,transform",
    });
  });
}

/* ===================== Count-up hero stats ===================== */
(function () {
  const stats = document.querySelectorAll("[data-count]");
  if (!stats.length) return;

  function animateCount(el) {
    const target = parseFloat(el.getAttribute("data-count"));
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 4200;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  }

  if (prefersReducedMotion || !window.IntersectionObserver) {
    stats.forEach((el) => {
      el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  stats.forEach((el) => observer.observe(el));
})();

/* ===================== Constellation hero visual ===================== */
/* A fixed segment of a sphere, viewed from a downward angle toward one
   pole — not rotating. Nodes sit at real lat/long coordinates, rotated
   with a standard rotation matrix (pitch around X, then yaw around Y),
   and projected with a perspective camera (pitch -0.51, yaw 0.21,
   distance 1.50 sphere-radii — tuned via the interactive sphere tuner).
   cy/scale below are re-derived against the ACTUAL hero canvas, which is
   square (.hero-visual has aspect-ratio:1) — the previous cy=0.756 was
   computed against a mistaken 700x450 test box and pushed the whole
   composition into the bottom third on the real square canvas. Verified
   numerically: scale=0.65, cy=0.42 is the largest expansion that still
   fits with margin (no clipping) at this camera setting. A static
   lat/long grid (3 meridians + 2 parallels) is projected through the
   same camera, so grid and nodes are mathematically the same object.
   Entrance: dots scale/fade in, lines draw on, then it settles into an
   idle glow/pulse loop. Hover adds an additive glow boost on top. */
(function () {
  const canvas = document.getElementById("sphere-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width, height;
  let nodes = [];
  let edges = [];
  let gridPaths = [];
  let entranceOrder = [];
  let startTime = null;
  let mouseX = null;
  let mouseY = null;

  // ---- Camera setup (tuned via interactive sphere tuner) ----
  const CAMERA_PITCH = -0.71;
  const CAMERA_YAW = 0.21;
  const CAMERA_DIST = 1.50;

  // 12 nodes at deliberate lat/long coordinates. 4 primary (orange) / 8
  // secondary, one dominant top focal node (id 0).
  const NODE_SEED = [
    { lat: 36, lon: -8, primary: true },   // id 0 — dominant top focal node
    { lat: 12, lon: -30, primary: false }, // id 1
    { lat: 17, lon: 20, primary: true },   // id 2
    { lat: -3, lon: -14, primary: false }, // id 3
    { lat: 2, lon: 8, primary: false },    // id 4
    { lat: -13, lon: -34, primary: false },// id 5
    { lat: 1, lon: 30, primary: false },  // id 6
    { lat: -18, lon: -5, primary: true },  // id 7
    { lat: -27, lon: -18, primary: false }, // id 8
    { lat: -24, lon: 13, primary: false }, // id 9
    { lat: -33, lon: -6, primary: true },  // id 10
    { lat: 10, lon: -40, primary: false }, // id 11
  ];

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout();
  }

  function project(latDeg, lonDeg, cx, cy, scale) {
    const lat = (latDeg * Math.PI) / 180;
    const lon = (lonDeg * Math.PI) / 180;

    const px = Math.cos(lat) * Math.sin(lon);
    const py = Math.sin(lat);
    const pz = Math.cos(lat) * Math.cos(lon);

    const cp = Math.cos(CAMERA_PITCH), sp = Math.sin(CAMERA_PITCH);
    const py1 = py * cp - pz * sp;
    const pz1 = py * sp + pz * cp;
    const px1 = px;

    const cyaw = Math.cos(CAMERA_YAW), syaw = Math.sin(CAMERA_YAW);
    const px2 = px1 * cyaw + pz1 * syaw;
    const pz2 = -px1 * syaw + pz1 * cyaw;
    const py2 = py1;

    const viewZ = pz2 + CAMERA_DIST;
    const persp = CAMERA_DIST / viewZ;

    const sx = cx + px2 * scale * persp;
    const sy = cy - py2 * scale * persp;
    const depth = Math.max(0, Math.min(1, (1 - pz2) / 2));

    return { x: sx, y: sy, depth };
  }

  function layout() {
    const cx = width * 0.5;
    // Re-derived against the actual square hero canvas (verified: fits
    // with margin, no clipping, at this camera setting).
    const cy = height * 0.5;
    const scale = Math.max(width, height) * 0.8;

    nodes = NODE_SEED.map((n, i) => {
      const p = project(n.lat, n.lon, cx, cy, scale);
      const margin = 14;
      const x = Math.min(Math.max(p.x, margin), width - margin);
      const y = Math.min(Math.max(p.y, margin), height - margin);
      return {
        id: i,
        x,
        y,
        depth: p.depth,
        primary: n.primary,
        size: (n.primary ? 8 : 5.5) * (0.8 + p.depth * 0.35),
      };
    });

    function segmentsIntersect(p1, p2, p3, p4) {
      const ccw = (A, B, C) => (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
      return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
    }
    function wouldCross(a, b, existing) {
      for (const e of existing) {
        if (e.a.id === a.id || e.a.id === b.id || e.b.id === a.id || e.b.id === b.id) continue;
        if (segmentsIntersect(a, b, e.a, e.b)) return true;
      }
      return false;
    }

    const maxLinkDist = Math.max(width, height) * 0.5;
    const targetDegree = {};
    nodes.forEach((n) => (targetDegree[n.id] = n.primary ? 3 : 2));
    const degree = {};
    nodes.forEach((n) => (degree[n.id] = 0));

    const candidates = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < maxLinkDist) candidates.push({ a, b, d });
      }
    }
    candidates.sort((p, q) => p.d - q.d);

    edges = [];
    candidates.forEach(({ a, b, d }) => {
      if (degree[a.id] >= targetDegree[a.id] && degree[b.id] >= targetDegree[b.id]) return;
      if (wouldCross(a, b, edges)) return;
      edges.push({ a, b, len: d });
      degree[a.id]++;
      degree[b.id]++;
    });

    nodes.forEach((n) => {
      if (degree[n.id] > 0) return;
      const nearest = nodes
        .filter((m) => m.id !== n.id)
        .map((m) => ({ m, d: Math.hypot(n.x - m.x, n.y - m.y) }))
        .sort((p, q) => p.d - q.d)[0];
      if (nearest) {
        edges.push({ a: n, b: nearest.m, len: nearest.d });
        degree[n.id]++;
        degree[nearest.m.id]++;
      }
    });

    // Manual overrides. Node ids match NODE_SEED array order (0-11, top
    // comment on each line above). id2--id6 is already connected by the
    // auto algorithm on this layout. If a specific right-side gap still
    // looks wrong once you see this rendered, add the pair here, e.g.
    // FORCE_EDGES: [[6, 9]] to force-connect id6 and id9.
    const REMOVE_EDGES = [];
    const FORCE_EDGES = [[6, 9], [4, 7], [5, 11], [1, 3]];

    edges = edges.filter((e) =>
      !REMOVE_EDGES.some(([x, y]) =>
        (e.a.id === x && e.b.id === y) || (e.a.id === y && e.b.id === x)
      )
    );
    FORCE_EDGES.forEach(([idA, idB]) => {
      const a = nodes.find((n) => n.id === idA);
      const b = nodes.find((n) => n.id === idB);
      if (!a || !b) return;
      const already = edges.some((e) =>
        (e.a.id === idA && e.b.id === idB) || (e.a.id === idB && e.b.id === idA)
      );
      if (!already) edges.push({ a, b, len: Math.hypot(a.x - b.x, a.y - b.y) });
    });

    entranceOrder = [...nodes].sort((a, b) => a.y - b.y);
    entranceOrder.forEach((n, i) => (n.entranceIndex = i));

    buildGrid(cx, cy, scale);
  }

  function buildGrid(cx, cy, scale) {
    gridPaths = [];
    const steps = 48;

    [-32, -5, 22].forEach((lon) => {
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const lat = -45 + (i / steps) * 80;
        pts.push(project(lat, lon, cx, cy, scale));
      }
      gridPaths.push(pts);
    });

    [14, -20].forEach((lat) => {
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const lon = -42 + (i / steps) * 74;
        pts.push(project(lat, lon, cx, cy, scale));
      }
      gridPaths.push(pts);
    });
  }

  function drawGrid(cx, cy) {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.55);
    grad.addColorStop(0, "rgba(242, 239, 233, 0.05)");
    grad.addColorStop(1, "rgba(242, 239, 233, 0)");
    ctx.save();
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(242, 239, 233, 0.16)";
    ctx.lineWidth = 1;
    gridPaths.forEach((pts) => {
      ctx.beginPath();
      pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();
    });
    ctx.restore();
  }

  function draw(now) {
    if (startTime === null) startTime = now;
    const elapsed = now - startTime;
    ctx.clearRect(0, 0, width, height);

    drawGrid(width * 0.5, height * 0.5);

    const lineDrawStart = 500;
    const lineDrawDur = 500;
    const dotStagger = 55;
    const lastEdgeFinish = lineDrawStart + (nodes.length - 1) * dotStagger + lineDrawDur;
    const entranceDone = reduceMotion || elapsed >= lastEdgeFinish;

    const HOVER_RADIUS_EDGE = 100;
    const HOVER_RADIUS_NODE = 90;

    edges.forEach((e) => {
      const laterIndex = Math.max(e.a.entranceIndex, e.b.entranceIndex);
      const edgeStart = lineDrawStart + laterIndex * dotStagger;
      const lineT = reduceMotion
        ? 1
        : Math.max(0, Math.min(1, (elapsed - edgeStart) / lineDrawDur));
      if (lineT <= 0) return;

      const ex = e.a.x + (e.b.x - e.a.x) * lineT;
      const ey = e.a.y + (e.b.y - e.a.y) * lineT;
      const baseOpacity = 0.34 + ((e.a.depth + e.b.depth) / 2) * 0.24;

      let breathe = 1;
      if (lineT >= 1 && !reduceMotion) {
        const loopElapsed = elapsed - (lastEdgeFinish + 300);
        if (loopElapsed > 0) {
          breathe = 0.4 + 0.75 * (0.5 + 0.5 * Math.sin(loopElapsed / 950));
        }
      }

      let edgeHoverBoost = 0;
      if (entranceDone && mouseX !== null) {
        const midX = (e.a.x + e.b.x) / 2;
        const midY = (e.a.y + e.b.y) / 2;
        const dist = Math.hypot(midX - mouseX, midY - mouseY);
        if (dist < HOVER_RADIUS_EDGE) {
          edgeHoverBoost = (1 - dist / HOVER_RADIUS_EDGE) * 0.6;
        }
      }

      ctx.save();
      ctx.shadowColor = "rgba(242, 239, 233, 0.6)";
      ctx.shadowBlur = 8 + breathe * 6 + edgeHoverBoost * 16;
      ctx.strokeStyle = `rgba(242, 239, 233, ${Math.min(1, baseOpacity * breathe + edgeHoverBoost)})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(e.a.x, e.a.y);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.restore();
    });

    nodes.forEach((n) => {
      const nodeStart = n.entranceIndex * dotStagger;
      const t = reduceMotion
        ? 1
        : Math.max(0, Math.min(1, (elapsed - nodeStart) / 300));
      if (t <= 0) return;
      const eased = 1 - Math.pow(1 - t, 3);
      const scale = 0.4 + eased * 0.6;
      const opacity = eased * (0.5 + n.depth * 0.5);

      let nodeHoverBoost = 0;
      if (entranceDone && mouseX !== null) {
        const dist = Math.hypot(n.x - mouseX, n.y - mouseY);
        if (dist < HOVER_RADIUS_NODE) {
          nodeHoverBoost = (1 - dist / HOVER_RADIUS_NODE) * 0.9;
        }
      }

      ctx.save();
      ctx.shadowColor = n.primary ? "rgba(255, 91, 61, 0.85)" : "rgba(242, 239, 233, 0.55)";
      ctx.shadowBlur = (n.primary ? 11 : 6) + nodeHoverBoost * 18;
      ctx.fillStyle = n.primary
        ? `rgba(255, 91, 61, ${Math.min(1, opacity + nodeHoverBoost)})`
        : `rgba(242, 239, 233, ${Math.min(1, opacity + nodeHoverBoost)})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.size * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    // Debug labels — visit the page with ?debug=1 in the URL to see each
    // node's id printed next to it. Use these ids in FORCE_EDGES/REMOVE_EDGES.
    if (new URLSearchParams(window.location.search).has("debug")) {
      ctx.save();
      ctx.font = "11px monospace";
      ctx.fillStyle = "#00FF00";
      nodes.forEach((n) => {
        ctx.fillText(n.id, n.x + 10, n.y - 10);
      });
      ctx.restore();
    }

    if (!reduceMotion || elapsed < lastEdgeFinish + 400 || mouseX !== null) {
      requestAnimationFrame(draw);
    }
  }

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    requestAnimationFrame(draw);
  });
  canvas.addEventListener("mouseleave", () => {
    mouseX = null;
    mouseY = null;
    requestAnimationFrame(draw);
  });

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(draw);
})();


/* ===================== Footer year ===================== */
document.querySelectorAll(".current-year").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

/* ===================== Site-wide starfield background ===================== */
/* Runs on every page that includes <canvas id="dust-canvas"> plus the
   matching #dust-canvas CSS (position:fixed, inset:0, z-index:-1,
   pointer-events:none). Reuses the same prefersReducedMotion flag
   declared above. Fixed two syntax errors present in the pasted version:
   the fillStyle ternary needs backticks around its template strings, and
   the reduced-motion fallback fillStyle needs to be a single unbroken
   string instead of one split across a line break. */
(function () {
  const c = document.getElementById("dust-canvas");
  if (!c) return;
  const ctx = c.getContext("2d");
  let w, h, dpr, cx, cy;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    c.width = w * dpr;
    c.height = h * dpr;
    c.style.width = w + "px";
    c.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = w / 2;
    cy = h / 2;
  }
  size();
  window.addEventListener("resize", size);

  const COUNT = prefersReducedMotion ? 0 : 260;
  const FOCAL = 260;
  const BASE_SPEED = 0.09;
  const BURST_MS = 2200;
  const BURST_MULT = 7;

  function spawnStar() {
    return {
      x: (Math.random() - 0.5) * w * 1.6,
      y: (Math.random() - 0.5) * h * 1.6,
      z: 0.15 + Math.random() * 1,
      gold: Math.random() < 0.3,
      tw: Math.random() * Math.PI * 2,
    };
  }
  const stars = Array.from({ length: COUNT }, spawnStar);

  const start = performance.now();
  function speedNow(now) {
    const elapsed = now - start;
    if (elapsed >= BURST_MS) return BASE_SPEED;
    const p = elapsed / BURST_MS;
    const ease = 1 - Math.pow(1 - p, 2);
    return BASE_SPEED * (1 + (1 - ease) * (BURST_MULT - 1));
  }

  function draw(now) {
    const speed = speedNow(now);
    ctx.fillStyle = "rgba(10,10,10,0.35)";
    ctx.fillRect(0, 0, w, h);

    for (const s of stars) {
      s.z -= speed * 0.016;
      if (s.z <= 0.02) {
        Object.assign(s, spawnStar(), { z: 1 });
      }
      const sx = cx + (s.x / s.z) * (FOCAL / 300);
      const sy = cy + (s.y / s.z) * (FOCAL / 300);
      if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) continue;

      const depth = 1 - s.z;
      const r = Math.max(0.3, depth * 1.8);
      const tw = 0.5 + 0.4 * Math.sin(now * 0.002 + s.tw);
      const alpha = Math.min(0.85, depth * 0.9) * tw;

      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = s.gold
        ? `rgba(201,168,76,${alpha})`
        : `rgba(201,206,214,${alpha * 0.85})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  if (!prefersReducedMotion) {
    requestAnimationFrame(draw);
  } else {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, w, h);
  }
})();

/* ===================== Pipeline diagram (case study) ===================== */
(function () {
  const diagram = document.querySelector("[data-pipeline]");
  if (!diagram || !window.IntersectionObserver) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return; // CSS fallback already lights everything, no JS needed

  const stages = diagram.querySelectorAll(".pipeline-stage");
  let played = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !played) {
          played = true;
          diagram.classList.add("in-view");
          // light each stage as the traveling glow passes it — timed
          // against the glow's 2.6s top-to-bottom travel
          const travelDuration = 2600;
          const segmentDuration = travelDuration / (stages.length - 1);
          stages.forEach((stage, i) => {
            setTimeout(() => stage.classList.add("lit"), i * segmentDuration);
          });
          observer.unobserve(diagram);
        }
      });
    },
    { threshold: 0.4 }
  );
  observer.observe(diagram);
})();
