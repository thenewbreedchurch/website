
// DYNAMIC DATE CALCULATION FUNCTIONS

function getLastSundayOfMonth(year, month) {
  const lastDay = new Date(year, month + 1, 0); // Last day of month
  const lastSunday = new Date(lastDay);
  lastSunday.setDate(lastDay.getDate() - lastDay.getDay());
  return lastSunday;
}


function getFirstSundayOfMonth(year, month) {
  const firstDay = new Date(year, month, 1);
  const dayOfWeek = firstDay.getDay();
  const offset = (dayOfWeek === 0) ? 0 : 7 - dayOfWeek;
  return new Date(year, month, 1 + offset);
}

function formatEventDate(date) {
  return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
  });
}

function updateEventDates() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Get last Sunday of this month
  let worshipDate = getLastSundayOfMonth(year, month);
  if (worshipDate < now) {
      // If already past, get penultimate Sunday next month
      worshipDate = getLastSundayOfMonth(year, month + 1);
  }

  // Get first Sunday of next month
  let thanksgivingDate = getFirstSundayOfMonth(year, month + 1);

  // Update DOM
  const worshipElement = document.querySelector('.worshipDate');
  const thanksgivingElement = document.querySelector('.thanksgivingDate');

  if (worshipElement) {
      worshipElement.textContent = formatEventDate(worshipDate);
  }

  if (thanksgivingElement) {
      thanksgivingElement.textContent = formatEventDate(thanksgivingDate);
  }
}

// Call function on DOM load
document.addEventListener("DOMContentLoaded", updateEventDates);




// copyright year auto change
document.addEventListener("DOMContentLoaded", function() {
    const currentYear = new Date().getFullYear();
    document.getElementById("currentYear").textContent = currentYear;
});

// HAMBURGER MENU FUNCTIONALITY
const hamburger = document.querySelector(".hamburger");
const mobileMenu = document.querySelector(".mobile-menu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  mobileMenu.classList.toggle("active");
});

// Close mobile menu when clicking on a link
document.querySelectorAll(".mobile-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    mobileMenu.classList.remove("active");
  });
});


// LAZY LOADING FUNCTIONALITY
const lazyImages = document.querySelectorAll(".lazy-load");

const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.classList.add("loaded");
      observer.unobserve(img);
    }
  });
});

lazyImages.forEach((img) => {
  imageObserver.observe(img);
});


// SCROLL ANIMATIONS
const animateOnScroll = () => {
  const elements = document.querySelectorAll(".event-card");

  elements.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top;
    const elementVisible = 150;

    if (elementTop < window.innerHeight - elementVisible) {
      element.classList.add("animate");
    }
  });
};

window.addEventListener("scroll", animateOnScroll);
window.addEventListener("load", animateOnScroll);


// Video player functonality
function initializeVideoPlayer() {
  document.querySelectorAll('.event-media').forEach((container, index) => {
      const playButton = container.querySelector('.play-button');
      const img = container.querySelector('img');

      playButton.addEventListener('click', () => {
          // Replace image with video
          const video = document.createElement('video');
          video.src = [
              'https://firebasestorage.googleapis.com/v0/b/tnbc-3a241.firebasestorage.app/o/worship.MP4?alt=media&token=19450fc9-3629-45a9-ad73-a8394dcc0d28',  // Worship
              'https://firebasestorage.googleapis.com/v0/b/tnbc-3a241.firebasestorage.app/o/thanksgiving.MP4?alt=media&token=a8d61506-5209-44bd-a201-05ac5ddbfccc',  // Thanksgiving
              // 'https://www.example.com/video3.mp4'   // Outreach
          ][index] || '';
          video.controls = true;
          video.autoplay = true;
          video.style.width = '100%';
          video.style.borderRadius = '15px';

          // Animate out image
          img.style.transition = 'opacity 0.4s ease';
          playButton.style.transition = 'opacity 0.4s ease';
          img.style.opacity = '0';
          playButton.style.opacity = '0';

          setTimeout(() => {
              img.style.display = 'none';
              playButton.style.display = 'none';
              container.appendChild(video);
          }, 400);

          // Remove video on end
          video.addEventListener('ended', () => {
              container.removeChild(video);
              img.style.display = 'block';
              playButton.style.display = 'flex';
              img.style.opacity = '1';
              playButton.style.opacity = '1';
          });
      });
  });
}

document.addEventListener("DOMContentLoaded", initializeVideoPlayer);



// EVENT REGISTRATION FUNCTIONALITY
async function registerForEvent(buttonElement) {
  const eventCard = buttonElement.closest('.event-card');
  const eventName = eventCard.querySelector('.event-title').textContent.trim();

  try {
    const { value: formValues } = await Swal.fire({
      title: `Register for ${eventName}`,
      html: `
        <input id="swal-name" class="swal2-input" placeholder="Full Name" required style="width:90%;">
        <input id="swal-email" class="swal2-input" type="email" placeholder="Email Address" required style="width:90%;">
      `,
      focusConfirm: false,
      confirmButtonText: 'Register',
      cancelButtonText: 'Cancel',
      showCancelButton: true,
      customClass: {
        popup: 'swal2-modern'
      },
      preConfirm: () => {
        const name = document.getElementById('swal-name').value.trim();
        const email = document.getElementById('swal-email').value.trim();

        if (!name || !email) {
          Swal.showValidationMessage('Please fill out both fields.');
          return false;
        }

        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
          Swal.showValidationMessage('Please enter a valid email address.');
          return false;
        }

        return { name, email };
      }
    });

    if (formValues) {
      Swal.fire({
        title: 'Registering...',
        text: 'Please wait while we complete your registration.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      // Send registration data to backend
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch("https://events-registration-gzix.onrender.com/event-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formValues.name,
          email: formValues.email,
          eventName
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Backend response:", result.message);

      Swal.fire({
        title: 'Success!',
        text: `Thank you ${formValues.name}, you’re registered for ${eventName} and a confirmation email has been sent.`,
        icon: 'success',
        confirmButtonText: 'OK'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    Swal.fire({
      title: 'Registration Failed',
      text: 'There was an error processing your registration. Please try again later.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
}




// SMOOTH SCROLLING FOR NAVIGATION
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


// INTERSECTION OBSERVER FOR STAGGERED ANIMATIONS
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animation = "fadeInUp 0.6s ease forwards";
    }
  });
}, observerOptions);

// Observe all event cards
document.querySelectorAll(".event-card").forEach((card) => {
  observer.observe(card);
});


// INITIALIZE ON DOM LOAD
document.addEventListener("DOMContentLoaded", () => {
  // Initialize animations
  animateOnScroll();

  // Add entrance animation to hero
  setTimeout(() => {
    document.querySelector(".hero-content").style.opacity = "1";
    document.querySelector(".hero-content").style.transform = "translateY(0)";
  }, 500);
});
