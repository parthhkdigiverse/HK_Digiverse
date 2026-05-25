/**
 * HK DigiVerse LLP — Main Script
 * Handles animations, interactions, and dynamic UI elements.
 */

class App {
  constructor() {
    this.init();
  }

  init() {
    this.initCursor();
    this.initStars();
    this.initScrollReveal();
    this.initPortfolioFilter();
    this.initContactForm();
    this.initTicker();
    this.initActiveNav();
    this.initHeroParallax();
    this.initMagneticElements();
    this.initTextReveal();
    this.initTiltEffect();
    this.initProgressBar();
  }

  // ── Custom Cursor ──
  initCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    let mouse = { x: 0, y: 0 };
    let ringPos = { x: 0, y: 0 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      dot.style.transform = `translate(${mouse.x}px, ${mouse.y}px) translate(-50%, -50%)`;
    });

    const animateRing = () => {
      ringPos.x += (mouse.x - ringPos.x) * 0.15;
      ringPos.y += (mouse.y - ringPos.y) * 0.15;
      ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    };
    animateRing();
  }

  // ── Starfield Background ──
  initStars() {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let stars = [];
    const count = 200;
    let mouse = { x: -1000, y: -1000 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createStars();
    };

    const createStars = () => {
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          originalX: 0,
          originalY: 0,
          size: Math.random() * 1.5,
          opacity: Math.random(),
          speed: 0.005 + Math.random() * 0.01,
          offset: Math.random() * 100
        });
        stars[i].originalX = stars[i].x;
        stars[i].originalY = stars[i].y;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        // Star movement
        star.opacity += star.speed;
        const alpha = (Math.sin(star.opacity) + 1) / 2;
        
        // Mouse reaction (repulsion)
        const dx = mouse.x - star.x;
        const dy = mouse.y - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 150;
        
        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          star.x -= dx * force * 0.02;
          star.y -= dy * force * 0.02;
        } else {
          star.x += (star.originalX - star.x) * 0.05;
          star.y += (star.originalY - star.y) * 0.05;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();
  }

  // ── Scroll Reveal ──
  initScrollReveal() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // observer.unobserve(entry.target);
        } else {
          // Optional: remove class to animate again on scroll up
          // entry.target.classList.remove('active');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal, .split-text').forEach(el => observer.observe(el));
  }

  // ── Hero Parallax ──
  initHeroParallax() {
    const visual = document.querySelector('.hero-visual');
    const devices = document.querySelectorAll('.device');
    
    if (!visual) return;

    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
      const y = (e.clientY - window.innerHeight / 2) / window.innerHeight;

      devices.forEach((device, index) => {
        const speed = (index + 1) * 20;
        device.style.transform = `translate(${x * speed}px, ${y * speed}px) rotate(${x * 5}deg)`;
      });
    });
  }

  // ── Magnetic Elements ──
  initMagneticElements() {
    const elements = document.querySelectorAll('.magnetic');
    
    elements.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = `translate(0px, 0px)`;
      });
    });
  }

  // ── Text Splitting ──
  initTextReveal() {
    const elements = document.querySelectorAll('.split-text');
    
    elements.forEach(el => {
      let delayIndex = 0;
      
      const processNode = (node) => {
        // Text node
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent;
          const fragment = document.createDocumentFragment();
          
          // Split by whitespace, preserving the whitespaces
          const segments = text.split(/(\s+)/);
          
          segments.forEach((seg, index) => {
            if (!seg) return;
            
            // Even index = word, Odd index = whitespace
            if (index % 2 === 0) {
              const wordSpan = document.createElement('span');
              wordSpan.className = 'word';
              
              for (let char of seg) {
                const charSpan = document.createElement('span');
                charSpan.textContent = char;
                charSpan.className = 'char';
                charSpan.style.transitionDelay = `${delayIndex * 0.02}s`;
                wordSpan.appendChild(charSpan);
                delayIndex++;
              }
              
              fragment.appendChild(wordSpan);
            } else {
              // Whitespace node
              fragment.appendChild(document.createTextNode(seg));
            }
          });
          
          return fragment;
        }
        
        // Element node (e.g. span, br)
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName === 'BR') {
            return node.cloneNode(true);
          }
          
          // Clone the element node (e.g. <span class="text-gradient">)
          const clonedElement = node.cloneNode(false);
          
          // Recursively process child nodes
          Array.from(node.childNodes).forEach(childNode => {
            clonedElement.appendChild(processNode(childNode));
          });
          
          return clonedElement;
        }
        
        return node.cloneNode(true);
      };
      
      const childNodes = Array.from(el.childNodes);
      const mainFragment = document.createDocumentFragment();
      
      childNodes.forEach(child => {
        mainFragment.appendChild(processNode(child));
      });
      
      el.textContent = '';
      el.appendChild(mainFragment);
    });
  }

  // ── 3D Tilt Effect ──
  initTiltEffect() {
    const cards = document.querySelectorAll('.tilt');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
      });
    });
  }

  // ── Progress Bar ──
  initProgressBar() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height);
      bar.style.transform = `scaleX(${scrolled})`;
    });
  }

  // ── Portfolio Filter ──
  initPortfolioFilter() {
    const buttons = document.querySelectorAll('.filter-btn');
    const projects = document.querySelectorAll('.project-card');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.filter;

        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        projects.forEach(project => {
          if (category === 'all' || project.dataset.category === category) {
            project.classList.remove('hide');
            project.classList.add('show');
          } else {
            project.classList.remove('show');
            project.classList.add('hide');
          }
        });
      });
    });
  }

  // ── Contact Form ──
  initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;

      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        service: document.getElementById('service').value,
        message: document.getElementById('message').value
      };

      btn.disabled = true;
      btn.innerHTML = 'Sending...';

      try {
        const apiUrl = window.API_BASE_URL ? `${window.API_BASE_URL}/api/contact` : '/api/contact';
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Network response was not ok');

        btn.innerHTML = 'Message Sent ✓';
        btn.style.background = 'var(--accent-mint)';
        form.reset();

        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = originalText;
          btn.style.background = '';
        }, 3000);

      } catch (error) {
        console.error('Error:', error);
        btn.innerHTML = 'Error Sending';
        btn.style.background = 'var(--accent-pink)';
        
        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = originalText;
          btn.style.background = '';
        }, 3000);
      }
    });
  }

  // ── Infinite Ticker ──
  initTicker() {
    const track = document.querySelector('.ticker-track');
    if (!track) return;
    
    const items = track.innerHTML;
    track.innerHTML = items + items + items;
  }

  // ── Active Nav on Scroll ──
  initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 150) {
          current = section.id;
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
          link.classList.add('active');
        }
      });
    });
  }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
