/* ============================================
   Confident Strands — Interactive Features
   ============================================ */

const WHATSAPP_NUMBER = '971523002576';

// Since the frontend and backend are served together on the same server, we use relative paths.
const API_BASE_URL = '';


document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSmoothScroll();
  initScrollReveal();
  initCounterAnimation();
  initFAQ();
  initQuiz();
  initContactForm();
  initVideoPlayer();
});

/* ---------- Navbar ---------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');
  const links = navLinks.querySelectorAll('a');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close menu on link click
  links.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = navLinks.querySelector(`a[href="#${id}"]`);
      if (link) {
        if (scrollY >= top && scrollY < top + height) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  });
}

/* ---------- Smooth Scroll ---------- */
function initSmoothScroll() {
  if (typeof Lenis !== 'undefined') {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing function
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false, // Don't hijack mobile native touch scroll, just smooth desktop
      touchMultiplier: 1.5,
      infinite: false,
    });

    // RequestAnimationFrame loop for Lenis
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Dynamic anchors with navbar offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const navbar = document.getElementById('navbar');
          const navbarHeight = navbar ? navbar.offsetHeight : 80;

          lenis.scrollTo(target, {
            offset: -navbarHeight,
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      });
    });
  } else {
    // Fallback native smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const navbar = document.getElementById('navbar');
          const navbarHeight = navbar ? navbar.offsetHeight : 80;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = targetPosition - navbarHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }
}

/* ---------- Scroll Reveal ---------- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Unobserve after revealing to reduce scroll recalculation overhead
        observer.unobserve(entry.target);
      }
    });
  }, {
    // Lower threshold ensures elements reveal early on mobile ratios
    threshold: 0.05,
    rootMargin: '0px 0px -20px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ---------- Counter Animation ---------- */
function initCounterAnimation() {
  const counters = document.querySelectorAll('.hero-stat .number');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counters.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-count'));
          const duration = 2000;
          const start = performance.now();

          function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);

            if (target > 100) {
              counter.textContent = current.toLocaleString() + '+';
            } else {
              counter.textContent = current + (counter.parentElement.querySelector('.label').textContent.includes('%') ? '%' : '+');
            }

            if (progress < 1) {
              requestAnimationFrame(update);
            }
          }

          requestAnimationFrame(update);
        });
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}



/* ---------- FAQ Accordion ---------- */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      items.forEach(other => {
        other.classList.remove('open');
        other.querySelector('.faq-answer').style.maxHeight = '0';
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ---------- Confidence Quiz ---------- */
function initQuiz() {
  const steps = document.querySelectorAll('.quiz-step');
  const progressDots = document.querySelectorAll('.quiz-progress-dot');
  const result = document.getElementById('quizResult');
  const quizAnswers = {};

  // Option selection
  document.querySelectorAll('.quiz-option').forEach(option => {
    option.addEventListener('click', () => {
      const step = option.closest('.quiz-step');
      const stepNum = step.getAttribute('data-quiz-step');

      // Deselect siblings
      step.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');

      // Store answer
      quizAnswers[stepNum] = option.getAttribute('data-value');

      // Enable next button
      const nextBtn = step.querySelector('.quiz-next');
      if (nextBtn) nextBtn.disabled = false;

      // Enable submit button
      const submitBtn = step.querySelector('.quiz-submit');
      if (submitBtn) submitBtn.disabled = false;
    });
  });

  // Next buttons
  document.querySelectorAll('.quiz-next').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextStep = btn.getAttribute('data-next');
      goToStep(parseInt(nextStep));
    });
  });

  // Back buttons
  document.querySelectorAll('.quiz-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      const prevStep = btn.getAttribute('data-prev');
      goToStep(parseInt(prevStep));
    });
  });

  // Submit
  const submitBtn = document.querySelector('.quiz-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      showResult();
    });
  }

  function goToStep(stepNum) {
    steps.forEach(s => s.classList.remove('active'));
    document.querySelector(`[data-quiz-step="${stepNum}"]`).classList.add('active');

    progressDots.forEach(dot => {
      const dotStep = parseInt(dot.getAttribute('data-step'));
      dot.classList.remove('active', 'completed');
      if (dotStep === stepNum) dot.classList.add('active');
      else if (dotStep < stepNum) dot.classList.add('completed');
    });
  }

  function showResult() {
    steps.forEach(s => s.classList.remove('active'));
    document.querySelector('.quiz-progress').style.display = 'none';
    result.classList.add('active');

    // Calculate score (always encouraging — this is a lead gen tool)
    let score = 85;
    if (quizAnswers['1'] === 'moderate' || quizAnswers['1'] === 'advanced') score += 5;
    if (quizAnswers['1'] === 'complete') score += 10;
    if (quizAnswers['3'] === 'low' || quizAnswers['3'] === 'moderate') score += 5;

    score = Math.min(score, 99);

    // Animate score
    const scoreEl = document.getElementById('quizScore');
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      scoreEl.textContent = current;
      if (current >= score) clearInterval(interval);
    }, 20);
  }

  // Final WhatsApp submission for Quiz results
  const quizSubmitBtn = document.getElementById('quizSubmitBtn');
  if (quizSubmitBtn) {
    quizSubmitBtn.addEventListener('click', async () => {
      const name = document.getElementById('quizName').value.trim();
      const phone = document.getElementById('quizPhone').value.trim();

      if (!name || !phone) {
        showQuizMessage('Please enter your name and phone number.', 'error');
        return;
      }

      // Collect answers text content from the selected quiz options
      const step1El = document.querySelector('.quiz-step[data-quiz-step="1"] .quiz-option.selected');
      const step2El = document.querySelector('.quiz-step[data-quiz-step="2"] .quiz-option.selected');
      const step3El = document.querySelector('.quiz-step[data-quiz-step="3"] .quiz-option.selected');

      const step1Answer = step1El ? step1El.textContent.replace(/\s+/g, ' ').trim() : 'Not selected';
      const step2Answer = step2El ? step2El.textContent.replace(/\s+/g, ' ').trim() : 'Not selected';
      const step3Answer = step3El ? step3El.textContent.replace(/\s+/g, ' ').trim() : 'Not selected';
      const score = document.getElementById('quizScore').textContent || '95';

      // Save to local submissions database
      try {
        await fetch(`${API_BASE_URL}/api/submissions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            type: "Quiz",
            name: name,
            phone: phone,
            score: score,
            answers: {
              step1: step1Answer,
              step2: step2Answer,
              step3: step3Answer
            }
          })
        });
      } catch (err) {
        console.error("Failed to store quiz lead in local database:", err);
      }

      let waMessage = `Hi! I took the Candidate Quiz and here are my results:\n\n`;
      waMessage += `Name: ${name}\n`;
      waMessage += `Phone: ${phone}\n`;
      waMessage += `Match Score: ${score}%\n\n`;
      waMessage += `Answers:\n`;
      waMessage += `1. Hair Loss Stage: ${step1Answer}\n`;
      waMessage += `2. Age Range: ${step2Answer}\n`;
      waMessage += `3. Confidence Impact: ${step3Answer}\n`;

      const encoded = encodeURIComponent(waMessage);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');

      showQuizMessage('Redirecting you to WhatsApp...', 'success');
    });
  }

  function showQuizMessage(text, type) {
    const existing = result.querySelector('.form-message');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.className = 'form-message';
    msg.style.cssText = `
      padding: 12px 16px;
      border-radius: 8px;
      margin-top: 12px;
      font-size: 0.9rem;
      font-weight: 500;
      text-align: center;
      animation: fadeIn 0.3s ease;
      ${type === 'success'
        ? 'background: rgba(34,197,94,0.1); color: #22c55e; border: 1px solid rgba(34,197,94,0.2);'
        : 'background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2);'
      }
    `;
    msg.textContent = text;
    result.appendChild(msg);

    setTimeout(() => msg.remove(), 4000);
  }
}

/* ---------- Contact Form ---------- */
function initContactForm() {
  const form = document.getElementById('leadForm');

  // Populate Day dropdown (1–31)
  const dobDay = document.getElementById('dobDay');
  if (dobDay) {
    for (let d = 1; d <= 31; d++) {
      const opt = document.createElement('option');
      opt.value = String(d).padStart(2, '0');
      opt.textContent = d;
      dobDay.appendChild(opt);
    }
  }

  // Populate Year dropdown (current year down to 1940)
  const dobYear = document.getElementById('dobYear');
  if (dobYear) {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 1940; y--) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      dobYear.appendChild(opt);
    }
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const day = document.getElementById("dobDay") ? document.getElementById("dobDay").value : "";
      const month = document.getElementById("dobMonth") ? document.getElementById("dobMonth").value : "";
      const year = document.getElementById("dobYear") ? document.getElementById("dobYear").value : "";
      const dob = (day && month && year) ? `${year}-${month}-${day}` : "";

      const data = {
        type: "Consultation",
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email") ? document.getElementById("email").value : "",
        dob: dob,
        hairloss: document.getElementById("hairloss") ? document.getElementById("hairloss").value : "",
        message: document.getElementById("message") ? document.getElementById("message").value : ""
      };

      try {
        const response = await fetch(`${API_BASE_URL}/api/submissions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          alert("Successfully submitted! We will contact you within 24 hours.");
          form.reset();
        } else {
          const errData = await response.json();
          alert("Submission failed: " + (errData.error || "Unknown error"));
        }
      } catch (err) {
        console.error("Error submitting form:", err);
        alert("Error connecting to server. Please try again.");
      }
    });
  }
}
/* ---------- Video Player ---------- */
function initVideoPlayer() {
  const video = document.getElementById('showcaseVideo');
  const overlay = document.getElementById('videoOverlay');
  const playBtn = document.getElementById('videoPlayBtn');

  if (!video || !overlay) return;

  function playVideo() {
    video.play();
    overlay.classList.add('hidden');
  }

  // Click on overlay or play button
  overlay.addEventListener('click', playVideo);

  // When video is paused by the user, show overlay again
  video.addEventListener('pause', () => {
    if (!video.ended) {
      overlay.classList.remove('hidden');
    }
  });

  // Keep overlay hidden while playing
  video.addEventListener('play', () => {
    overlay.classList.add('hidden');
  });

  // When ended, show overlay
  video.addEventListener('ended', () => {
    overlay.classList.remove('hidden');
  });
}

/* ---------- Scroll Progress & Back to Top ---------- */
function initScrollProgressAndBackToTop() {
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  const backToTopBtn = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    // Scroll Progress Bar
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = (scrollTop / scrollHeight) * 100;

    if (scrollProgressBar) {
      scrollProgressBar.style.width = scrollPercentage + '%';
    }

    // Back to Top Button visibility
    if (backToTopBtn) {
      if (scrollTop > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    }
  });

  // Back to Top Button click logic
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgressAndBackToTop();
});
