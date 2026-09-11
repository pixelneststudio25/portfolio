/* ===================== GSAP scroll reveals ===================== */
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
      },
    });
  });

  gsap.utils.toArray(".work-item").forEach((el) => {
    const visual = el.querySelector(".work-visual");
    if (visual) {
      gsap.from(visual, {
        opacity: 0,
        scale: 0.92,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 80%" },
      });
    }
  });

  gsap.from(".hero-content > *", {
    opacity: 0,
    y: 30,
    duration: 0.9,
    stagger: 0.12,
    ease: "power3.out",
    delay: 0.2,
  });
}

/* ===================== Footer year ===================== */
document.querySelectorAll(".current-year").forEach((el) => {
  el.textContent = new Date().getFullYear();
});
