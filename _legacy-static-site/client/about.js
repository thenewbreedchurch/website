// copyright year auto change
document.addEventListener("DOMContentLoaded", function () {
  const currentYear = new Date().getFullYear();
  document.getElementById("currentYear").textContent = currentYear;
});

// Mobile Navigation Toggle
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navLinks.classList.toggle("active");
});

// Close mobile menu when clicking on a link
navLinks.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    hamburger.classList.remove("active");
    navLinks.classList.remove("active");
  }
});

// Close mobile menu when clicking outside
document.addEventListener("click", (e) => {
  if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
    hamburger.classList.remove("active");
    navLinks.classList.remove("active");
  }
});

// Lazy Loading with Intersection Observer
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("loaded");
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe all lazy-loaded elements
document.addEventListener("DOMContentLoaded", () => {
  const lazyElements = document.querySelectorAll(
    ".lazy-content, .lazy-slide-left, .lazy-slide-right"
  );
  lazyElements.forEach((element) => {
    observer.observe(element);
  });

  // Handle image loading states
  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach((img) => {
    img.addEventListener("load", () => {
      img.classList.add("loaded");
    });

    // If image is already loaded (cached)
    if (img.complete) {
      img.classList.add("loaded");
    }
  });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Add scroll effect to navigation
let lastScrollY = window.scrollY;
window.addEventListener("scroll", () => {
  const nav = document.querySelector(".nav");
  if (window.scrollY > lastScrollY && window.scrollY > 100) {
    nav.style.transform = "translateY(-100%)";
  } else {
    nav.style.transform = "translateY(0)";
  }
  lastScrollY = window.scrollY;
});

// Stagger animation delays for better visual flow
document.addEventListener("DOMContentLoaded", () => {
  const timeCards = document.querySelectorAll(".time-card");
  timeCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
  });
});

