document.addEventListener("DOMContentLoaded", () => {
    // Set current Year
    const currentYear = new Date().getFullYear();
    document.getElementById("currentYear").textContent = currentYear;

  // Enhanced lazy loading for images
  const images = document.querySelectorAll('img[loading="lazy"]');
  if (images.length > 0) {
      const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  imageObserver.unobserve(entry.target);
              }
          });
      }, {
          rootMargin: '50px'
      });

      images.forEach(img => imageObserver.observe(img));
  }

  // Add stagger animation to links
  const linkItems = document.querySelectorAll('.link-item');
  linkItems.forEach((link, index) => {
      link.style.animationDelay = `${0.6 + (index * 0.1)}s`;
      link.style.animation = 'fadeInUp 0.6s ease-out both';
  });

  // Add click analytics (optional)
  const links = document.querySelectorAll('.link-item');
  links.forEach(link => {
      link.addEventListener('click', (e) => {
          const linkText = link.querySelector('.link-text').textContent;
          // Analytics tracking could be added here
          console.log(`Link clicked: ${linkText}`);
      });
  });

  // Add keyboard navigation improvements
  links.forEach(link => {
      link.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              link.click();
          }
      });
  });

  // Performance optimization: Preload critical resources
  const preloadLink = document.createElement('link');
  preloadLink.rel = 'preload';
  preloadLink.as = 'image';
  preloadLink.href = './images/IMG_7439.PNG';
  document.head.appendChild(preloadLink);
});

// Error handling for missing images
document.addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG') {
      e.target.style.display = 'none';
      console.warn('Image failed to load:', e.target.src);
  }
}, true);

// Service Worker registration for better performance (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => console.log("SW registered"))
      .catch((registrationError) => console.log("SW registration failed"));
  });
}
