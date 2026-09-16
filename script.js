document.getElementById("year").textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// Sticky nav background on scroll
const nav = document.getElementById("nav");

// Top-of-page scroll progress bar
const scrollProgress = document.getElementById("scrollProgress");

// Timeline fill (The Arc)
const timeline = document.getElementById("arcTimeline");
const timelineFill = document.getElementById("timelineFill");

// Cache layout measurements instead of reading them on every scroll frame
// (getBoundingClientRect()/offsetTop force a synchronous layout — expensive
// to call on every scroll event, and it compounds as the page grows).
let docHeight = 0;
let timelineDocTop = 0;
let timelineHeight = 0;
const measure = () => {
  docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (timeline) {
    const rect = timeline.getBoundingClientRect();
    timelineDocTop = rect.top + window.scrollY;
    timelineHeight = rect.height;
  }
};
measure();
window.addEventListener("resize", measure, { passive: true });
window.addEventListener("load", measure);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(measure);
}

let ticking = false;
const onScroll = () => {
  const scrollY = window.scrollY;
  nav.classList.toggle("scrolled", scrollY > 12);

  if (scrollProgress) {
    const pct = docHeight > 0 ? scrollY / docHeight : 0;
    scrollProgress.style.transform = `scaleX(${Math.min(1, Math.max(0, pct))})`;
  }

  if (timeline && timelineFill && timelineHeight > 0) {
    const vh = window.innerHeight;
    const rectTop = timelineDocTop - scrollY;
    const raw = (vh * 0.75 - rectTop) / timelineHeight;
    const pct = Math.min(1, Math.max(0, raw));
    timelineFill.style.transform = `scaleY(${pct})`;
  }

  ticking = false;
};
const requestTick = () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(onScroll);
  }
};
onScroll();
window.addEventListener("scroll", prefersReducedMotion ? onScroll : requestTick, {
  passive: true,
});

// Mobile menu toggle
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", open ? "true" : "false");
});
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// Scroll-reveal animation
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
    observer.observe(el);
  });
} else {
  revealEls.forEach((el) => el.classList.add("in-view"));
}
