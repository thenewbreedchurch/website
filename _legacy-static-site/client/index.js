// copyright year auto change
document.addEventListener("DOMContentLoaded", function() {
  const currentYear = new Date().getFullYear();
  document.getElementById("currentYear").textContent = currentYear;
});

// document.addEventListener("click", (e) => {
//   if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
//     hamburger.classList.remove("active");
//     navLinks.classList.remove("active");
//   }
// });

document.addEventListener("DOMContentLoaded", function() {
  // Hamburger menu functionality
  const hamburger = document.getElementById("hamburger-icon");
  const nav = document.getElementById("main-nav");

  if (hamburger) {
    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("active");
      nav.classList.toggle("show");
    });
  }

  const navLinks = document.querySelectorAll("#main-nav ul li a");
  
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');

prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateCarousel();
    resetAutoSlide();
});

nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateCarousel();
    resetAutoSlide();
});


  // Set active class based on current URL hash or section visibility
  function setActiveLink() {
    // Get current hash from URL
    const currentHash = window.location.hash;

    //check which section is currently in viewport
    if (!currentHash) {
      // Get all sections that could be targets of navigation
      const sections = document.querySelectorAll("section[id]");

      // section that's most visible in the viewport
      let mostVisibleSection = null;
      let maxVisibility = 0;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const visibleHeight =
          Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        const visibilityRatio = visibleHeight / section.offsetHeight;

        if (visibilityRatio > maxVisibility) {
          maxVisibility = visibilityRatio;
          mostVisibleSection = section;
        }
      });

      // If we found a visible section, set its corresponding nav link as active
      if (mostVisibleSection) {
        const sectionId = mostVisibleSection.id;
        updateActiveLink(`#${sectionId}`);
      }
    } else {
      // If hash is present, set the corresponding nav link as active
      updateActiveLink(currentHash);
    }
  }

  // Update the active class on navigation links
  function updateActiveLink(targetHash) {
    // Remove active class from all links
    navLinks.forEach((link) => {
      link.classList.remove("active");
    });

    // Add active class to the link that matches the hash
    navLinks.forEach((link) => {
      if (link.getAttribute("href") === targetHash) {
        link.classList.add("active");
      }
    });
  }

  // Add click event listeners to all navigation links
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      // Don't add active class to the donate button
      if (!link.classList.contains("btn-donate")) {
        // Remove active class from all links
        navLinks.forEach((l) => l.classList.remove("active"));

        // Add active class to the clicked link
        link.classList.add("active");
      }
    });
  });

  // Set active link on page load
  setActiveLink();

  // Update active link on scroll (throttled)
  let scrollTimeout;
  window.addEventListener("scroll", function () {
    if (!scrollTimeout) {
      scrollTimeout = setTimeout(function () {
        setActiveLink();
        scrollTimeout = null;
      }, 100); // Check every 100ms during scroll
    }
  });

  // Lazy loading
  if ("IntersectionObserver" in window) {
    const lazyImages = document.querySelectorAll(".lazy-image");

    const imageObserver = new IntersectionObserver(function (
      entries,
      observer
    ) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute("data-src");

          if (src) {
            img.src = src;
            img.addEventListener("load", function () {
              img.classList.add("loaded");
              const placeholder = img.closest(".image-placeholder");
              if (placeholder) {
                placeholder.classList.add("loaded");
              }
            });
          }

          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach(function (image) {
      imageObserver.observe(image);
    });

    // Lazy load background images
    const lazyBackgrounds = document.querySelectorAll(".lazy-background");

    const backgroundObserver = new IntersectionObserver(function (
      entries,
      observer
    ) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const element = entry.target;
          const background = element.getAttribute("data-background");

          if (background) {
            // Check if we should use a smaller image based on screen size
            if (window.innerWidth <= 576) {
              // For phones, use smaller background images
              element.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${background.replace(
                "1920/1080",
                "640/480"
              )}')`;
            } else if (window.innerWidth <= 768) {
              // For tablets, use medium-sized background images
              element.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${background.replace(
                "1920/1080",
                "1024/768"
              )}')`;
            } else {
              // For desktops, use full-sized background images
              element.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${background}')`;
            }

            element.classList.add("loaded-background");
          }

          backgroundObserver.unobserve(element);
        }
      });
    });

    lazyBackgrounds.forEach(function (background) {
      backgroundObserver.observe(background);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    const lazyImages = document.querySelectorAll(".lazy-image");
    lazyImages.forEach(function (img) {
      const src = img.getAttribute("data-src");
      if (src) {
        img.src = src;
      }
    });

    const lazyBackgrounds = document.querySelectorAll(".lazy-background");
    lazyBackgrounds.forEach(function (element) {
      const background = element.getAttribute("data-background");
      if (background) {
        element.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${background}')`;
      }
    });
  }

  // Function to validate email format
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Newsletter form functionality
  const newsletterForm = document.getElementById("newsletter-form");

  if (newsletterForm) {
        newsletterForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const emailInput = document.getElementById("email");
        const email = emailInput.value.trim();
        const messageContainer = document.getElementById("newsletter-message");

        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
    

    // Simple validation
    if (email && email.includes("@") && email.includes(".")) {
      const subscribeBtn = document.getElementById('subscribe-btn');
      try {
          subscribeBtn.textContent = "submitting...";

        // Send the subscription request to the server
        const response = await fetch("https://tnbc-newsletters.onrender.com/subscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    to: email, 
                 }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Subscription failed");
            }
            
            // Success handling
            Swal.fire({
              title: "Thank you for subscribing!",
              text: "Welcome to the family",
              icon: "success",
              confirmButtonColor: "#4C304E",
            });
        
            subscribeBtn.textContent = "Subscribe";
            newsletterForm.reset();
            } catch (error) {
              subscribeBtn.textContent = "Subscribe";
            console.error("Newsletter subscription error:", error);
              Swal.fire({
                title: "Error!",
                text:  error?.message ?? "An error occurred. Please try again later.",
                icon: "error",
                confirmButtonColor: "#4C304E",
              });
            }
          } else {
            // Invalid email format
            subscribeBtn.textContent = "Subscribe";
            Swal.fire({
              title: "Error!",
              text:  error?.message ?? "An error occurred. Please try again later.",
              icon: "error",
              confirmButtonColor: "#4C304E",
            });
        }});
    }
});

// Enhanced Lazy Loading System
class LazyLoadingManager {
    constructor() {
        this.observers = new Map();
        this.init();
    }

    init() {
        // Check if Intersection Observer is supported
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            this.fallbackLoad();
            return;
        }

        this.setupObservers();
        this.observeElements();
    }

    setupObservers() {
        // Observer for content animations (fade, slide, scale)
        const contentObserver = new IntersectionObserver(
            (entries) => this.handleContentIntersection(entries),
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        // Observer for images with more generous threshold
        const imageObserver = new IntersectionObserver(
            (entries) => this.handleImageIntersection(entries),
            {
                threshold: 0.01,
                rootMargin: '50px 0px 50px 0px'
            }
        );

        // Observer for background images
        const backgroundObserver = new IntersectionObserver(
            (entries) => this.handleBackgroundIntersection(entries),
            {
                threshold: 0.1,
                rootMargin: '100px 0px 100px 0px'
            }
        );

        this.observers.set('content', contentObserver);
        this.observers.set('image', imageObserver);
        this.observers.set('background', backgroundObserver);
    }

    observeElements() {
        // Observe content elements
        const contentElements = document.querySelectorAll(
            '.lazy-content, .lazy-slide-left, .lazy-slide-right, .lazy-fade, .lazy-scale'
        );
        
        contentElements.forEach(element => {
            this.observers.get('content').observe(element);
        });

        // Observe lazy images
        const lazyImages = document.querySelectorAll('.lazy-image');
        lazyImages.forEach(image => {
            this.observers.get('image').observe(image);
        });

        // Observe lazy backgrounds
        const lazyBackgrounds = document.querySelectorAll('.lazy-background');
        lazyBackgrounds.forEach(element => {
            this.observers.get('background').observe(element);
        });
    }

    handleContentIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Add stagger delay if element has stagger animation
                if (element.classList.contains('stagger-animation')) {
                    const delay = getComputedStyle(element).getPropertyValue('--stagger-delay') || '0s';
                    const delayMs = parseFloat(delay) * 1000;
                    
                    setTimeout(() => {
                        this.activateElement(element);
                    }, delayMs);
                } else {
                    this.activateElement(element);
                }
                
                // Stop observing this element
                this.observers.get('content').unobserve(element);
            }
        });
    }

    handleImageIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                this.loadImage(img);
                this.observers.get('image').unobserve(img);
            }
        });
    }

    handleBackgroundIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                this.loadBackgroundImage(element);
                this.observers.get('background').unobserve(element);
            }
        });
    }

    activateElement(element) {
        // Add loaded class to trigger CSS transitions
        element.classList.add('loaded');
        
        // Dispatch custom event for additional functionality
        element.dispatchEvent(new CustomEvent('lazyLoaded', {
            bubbles: true,
            detail: { element }
        }));
    }

    loadImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;

        // Create a new image to preload
        const imageLoader = new Image();
        
        imageLoader.onload = () => {
            // Update src and add loaded class
            img.src = src;
            img.classList.add('loaded');
            
            // Remove data-src attribute
            img.removeAttribute('data-src');
            
            // Dispatch loaded event
            img.dispatchEvent(new CustomEvent('imageLoaded', {
                bubbles: true,
                detail: { img }
            }));
        };
        
        imageLoader.onerror = () => {
            // Handle image load error
            img.classList.add('error');
            console.warn('Failed to load image:', src);
        };
        
        // Start loading
        imageLoader.src = src;
    }

    loadBackgroundImage(element) {
        const backgroundUrl = element.getAttribute('data-background');
        if (!backgroundUrl) return;

        // Create image to preload background
        const imageLoader = new Image();
        
        imageLoader.onload = () => {
            // Set background image
            element.style.backgroundImage = `url(${backgroundUrl})`;
            element.classList.add('loaded');
            
            // Remove data attribute
            element.removeAttribute('data-background');
            
            // Dispatch loaded event
            element.dispatchEvent(new CustomEvent('backgroundLoaded', {
                bubbles: true,
                detail: { element }
            }));
        };
        
        imageLoader.onerror = () => {
            element.classList.add('error');
            console.warn('Failed to load background image:', backgroundUrl);
        };
        
        imageLoader.src = backgroundUrl;
    }

    // Fallback for browsers without Intersection Observer
    fallbackLoad() {
        // Immediately load all elements
        const allLazyElements = document.querySelectorAll(
            '.lazy-content, .lazy-slide-left, .lazy-slide-right, .lazy-fade, .lazy-scale'
        );
        
        allLazyElements.forEach(element => {
            element.classList.add('loaded');
        });

        // Load all images
        const lazyImages = document.querySelectorAll('.lazy-image[data-src]');
        lazyImages.forEach(img => {
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
            img.classList.add('loaded');
        });

        // Load all backgrounds
        const lazyBackgrounds = document.querySelectorAll('.lazy-background[data-background]');
        lazyBackgrounds.forEach(element => {
            const bg = element.getAttribute('data-background');
            element.style.backgroundImage = `url(${bg})`;
            element.removeAttribute('data-background');
            element.classList.add('loaded');
        });
    }

    // Method to manually trigger loading of specific elements
    loadElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            if (element.classList.contains('lazy-image')) {
                this.loadImage(element);
            } else if (element.classList.contains('lazy-background')) {
                this.loadBackgroundImage(element);
            } else {
                this.activateElement(element);
            }
        }
    }

    // Method to refresh observers (useful for dynamically added content)
    refresh() {
        // Disconnect existing observers
        this.observers.forEach(observer => observer.disconnect());
        
        // Reinitialize
        this.setupObservers();
        this.observeElements();
    }

    // Cleanup method
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }
}

// Performance optimization: Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Initialize lazy loading when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the lazy loading manager
    window.lazyLoadManager = new LazyLoadingManager();
    
    // Optional: Add performance monitoring
    let loadedElements = 0;
    document.addEventListener('lazyLoaded', () => {
        loadedElements++;
        console.log(`Lazy loaded elements: ${loadedElements}`);
    });
    
    // Optional: Handle dynamic content
    const mutationObserver = new MutationObserver(throttle(() => {
        if (window.lazyLoadManager) {
            window.lazyLoadManager.refresh();
        }
    }, 500));
    
    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
});


// Function to adjust navigation when live button appears/disappears
function handleLiveButtonToggle() {
  const liveButton = document.getElementById('liveToggle');
  const navigation = document.getElementById('main-nav');
  
  if (liveButton && navigation) {
      // Add class to navigation when live button is visible
      if (liveButton.style.display !== 'none' && liveButton.offsetWidth > 0) {
          navigation.classList.add('live-active');
      } else {
          navigation.classList.remove('live-active');
      }
  }
}

// Monitor for changes to the live button visibility
const liveButton = document.getElementById('liveToggle');
if (liveButton) {
  // Use MutationObserver to watch for style changes
  const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
              handleLiveButtonToggle();
          }
      });
  });
  
  observer.observe(liveButton, {
      attributes: true,
      attributeFilter: ['style']
  });
  
  // Initial check
  handleLiveButtonToggle();
}

// Additional CSS for when live button is active
const additionalCSS = `
  /* Adjust navigation when live button is visible */
  @media (max-width: 900px) {
      #main-nav.live-active ul li {
          margin-left: 0.7rem;
      }
      
      #main-nav.live-active ul li a {
          font-size: 0.85rem;
      }
      
      #main-nav.live-active .btn-donate {
          padding: 0.35rem 1rem !important;
          font-size: 0.8rem;
      }
  }
  
  @media (max-width: 850px) {
      #main-nav.live-active ul li {
          margin-left: 0.5rem;
      }
      
      #main-nav.live-active ul li a {
          font-size: 0.8rem;
      }
      
      #main-nav.live-active .btn-donate {
          padding: 0.3rem 0.8rem !important;
          font-size: 0.75rem;
      }
  }
`;

// Inject the additional CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoadingManager;
}

// document.addEventListener("DOMContentLoaded", initializePage);