/* ===================== Theme toggle ===================== */
(function () {
  const root = document.documentElement;
  const stored = localStorage.getItem("theme");
  if (stored) root.setAttribute("data-theme", stored);

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const current =
        root.getAttribute("data-theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  });
})();

/* ===================== Mobile nav ===================== */
(function () {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector(".nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll(".nav-links a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("open"))
  );
})();

/* ===================== Single hero entrance ===================== */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (window.gsap && !prefersReducedMotion) {
  document.documentElement.classList.add("js-ready");
  gsap.from(".hero .reveal", {
    opacity: 0,
    y: 24,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out",
    delay: 0.1,
  });
}

/* ===================== Footer year ===================== */
document.querySelectorAll(".current-year").forEach((el) => {
  el.textContent = new Date().getFullYear();
});
