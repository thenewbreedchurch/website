// copyright year auto change
document.addEventListener("DOMContentLoaded", function() {
  const currentYear = new Date().getFullYear();
  document.getElementById("currentYear").textContent = currentYear;
});

// Hamburger menu functionality - FIXED VERSION
const hamburger = document.getElementById("hamburger-icon");
const navLinks = document.querySelector(".nav-links");

if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("show");
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      hamburger.classList.remove("active");
      navLinks.classList.remove("show");
    }
  });

  // Handle window resize - FIXED VERSION
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      navLinks.classList.remove("show");
      hamburger.classList.remove("active");
      // Remove any forced display styles
      navLinks.style.display = "";
    }
  });
}

// Lazy Loading Implementation
class LazyLoader {
  constructor() {
    this.observer = null;
    this.init();
  }

  init() {
    // Create intersection observer for lazy loading
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadElement(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px 0px",
      }
    );

    // Observe all lazy-load elements
    this.observeElements();
  }

  observeElements() {
    const lazyElements = document.querySelectorAll(".lazy-load");
    lazyElements.forEach((element) => {
      this.observer.observe(element);
    });
  }

  loadElement(element) {
    // Add loading animation
    element.classList.add("loading");

    // Simulate content loading delay
    setTimeout(() => {
      element.classList.remove("loading");
      element.classList.add("visible");

      // Trigger any specific animations for this element
      this.triggerElementAnimations(element);
    }, Math.random() * 300 + 100);
  }

  triggerElementAnimations(element) {
    // Add staggered animation for account cards
    if (element.classList.contains("donation-section")) {
      const cards = element.querySelectorAll(".account-card");
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.style.animation = `slideInUp 0.6s ease forwards`;
        }, index * 150);
      });
    }
  }
}

// Initialize lazy loader when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new LazyLoader();

  // Initialize other features
  initSmoothScrolling();
  initAccountCardInteractions();
});

// Smooth scrolling for anchor links
function initSmoothScrolling() {
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
}

// Account card interactions
function initAccountCardInteractions() {
  const accountValues = document.querySelectorAll(".account-value");

  accountValues.forEach((value) => {
    value.addEventListener("click", function () {
      // Copy to clipboard functionality
      navigator.clipboard.writeText(this.textContent).then(() => {
        // Show copied feedback
        const originalText = this.textContent;
        this.textContent = "Copied!";
        this.style.background = "#28a745";
        this.style.color = "white";

        setTimeout(() => {
          this.textContent = originalText;
          this.style.background = "#e9ecef";
          this.style.color = "";
        }, 1500);
      });
    });

    // Add hover tooltip
    value.setAttribute("title", "Click to copy");
    value.style.cursor = "pointer";
  });
}

// Add slide-in animation keyframes
const style = document.createElement("style");
style.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Performance optimization: Throttle scroll events
let ticking = false;
function updateAnimations() {
  // Update any scroll-based animations here
  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateAnimations);
    ticking = true;
  }
});

// Preload critical resources
function preloadCriticalResources() {
  // Preload fonts or other critical resources
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "font";
  link.type = "font/woff2";
  link.crossOrigin = "anonymous";
  // Add actual font URLs when available
}

preloadCriticalResources();