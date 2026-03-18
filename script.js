/* ═══════════════════════════════════════════
   VALLIRANA SEGURETAT — JavaScript
   Canvas Particles · Cursor · Scroll · Forms
═══════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════════════════════════
   NAVEGACIÓN MÓVIL — Se ejecuta PRIMERO, antes que nada.
   Así aunque falle cualquier otra cosa, el menú funciona.
══════════════════════════════════════════════════════════ */

// ── HAMBURGER MENU ────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
  });

  // Mobile dropdown toggle (touch-friendly)
  const dropdowns = navLinks.querySelectorAll('.dropdown');
  dropdowns.forEach(function(dd) {
    const link = dd.querySelector('.nav-link');
    if (link) {
      link.addEventListener('click', function(e) {
        // Only intercept on mobile (when hamburger is visible)
        if (window.innerWidth <= 900) {
          e.preventDefault();
          e.stopPropagation();
          dd.classList.toggle('dropdown-open');
        }
      });
    }
  });

  // Close menu when clicking a real navigation link (not a dropdown toggle)
  navLinks.querySelectorAll('.dropdown-menu a').forEach(function(a) {
    a.addEventListener('click', function() {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      navLinks.querySelectorAll('.dropdown-open').forEach(function(d) {
        d.classList.remove('dropdown-open');
      });
    });
  });

  // Also close for non-dropdown nav-links (Inicio, Quiénes Somos, Contacto)
  navLinks.querySelectorAll('li:not(.dropdown) > .nav-link').forEach(function(a) {
    a.addEventListener('click', function() {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });
}

// ── NAVBAR SCROLL ─────────────────────────────────────
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', function() {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
  if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 400);
});

// ── BACK TO TOP ───────────────────────────────────────
if (backToTop) {
  backToTop.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ══════════════════════════════════════════════════════════
   TODO LO DEMÁS — Envuelto en try-catch para que si falla
   algo (canvas, animaciones, etc.) NO rompa la navegación.
══════════════════════════════════════════════════════════ */

try {

// ── CURSOR PERSONALIZADO CON TRAIL DE LUZ ────────────
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');
let mouseX = 0, mouseY = 0, trailX = 0, trailY = 0;

document.addEventListener('mousemove', function(e) {
  if (!cursor) return;
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

// Trail suavizado con lerp
function lerpCursor() {
  if (!cursorTrail) return;
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  cursorTrail.style.left = trailX + 'px';
  cursorTrail.style.top = trailY + 'px';
  requestAnimationFrame(lerpCursor);
}
if (cursorTrail) lerpCursor();

// Efecto hover en elementos interactivos
var interactiveEls = document.querySelectorAll('a, button, input, select, textarea, .product-card, .gallery-item');
interactiveEls.forEach(function(el) {
  el.addEventListener('mouseenter', function() {
    if (!cursor) return;
    cursor.style.transform = 'translate(-50%, -50%) scale(2)';
    cursor.style.opacity = '0.6';
    if (cursorTrail) cursorTrail.style.transform = 'translate(-50%, -50%) scale(1.5)';
  });
  el.addEventListener('mouseleave', function() {
    if (!cursor) return;
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    cursor.style.opacity = '1';
    if (cursorTrail) cursorTrail.style.transform = 'translate(-50%, -50%) scale(1)';
  });
});


// ── CANVAS PARTÍCULAS HERO ───────────────────────────
const canvas = document.getElementById('heroCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let W = window.innerWidth;
let H = window.innerHeight;
if (canvas) {
  canvas.width = W;
  canvas.height = H;
}

const PARTICLE_COUNT = 110;
const particles = [];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = randomBetween(0, W);
    this.y = randomBetween(0, H);
    this.r = randomBetween(0.5, 2.5);
    this.vx = randomBetween(-0.4, 0.4);
    this.vy = randomBetween(-0.6, -0.15);
    this.alpha = randomBetween(0.2, 0.8);
    this.color = Math.random() > 0.5 ? '#00d4ff' : '#7b4fff';
    this.life = 0;
    this.maxLife = randomBetween(200, 500);
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
    if (this.life > this.maxLife || this.y < -10 || this.x < -10 || this.x > W + 10) {
      this.reset();
      this.y = H + 10;
    }
  }
  draw() {
    if (!ctx) return;
    const progress = this.life / this.maxLife;
    const alpha = this.alpha * Math.sin(Math.PI * progress);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Lines between nearby particles
function drawConnections() {
  if (!ctx) return;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 110) {
        ctx.save();
        ctx.globalAlpha = (1 - dist / 110) * 0.18;
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

if (canvas && ctx) {
  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
}

function animateCanvas() {
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);
  drawConnections();
  particles.forEach(function(p) { p.update(); p.draw(); });
  requestAnimationFrame(animateCanvas);
}
if (canvas && ctx) animateCanvas();

window.addEventListener('resize', function() {
  if (!canvas) return;
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
});

// Parallax leve del canvas con el mouse
document.addEventListener('mousemove', function(e) {
  if (!canvas) return;
  const nx = (e.clientX / W - 0.5) * 15;
  const ny = (e.clientY / H - 0.5) * 8;
  canvas.style.transform = 'translate(' + nx + 'px, ' + ny + 'px) scale(1.02)';
});


// ── RALENTIZAR VÍDEO DE FONDO ────────────────────────
const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
  heroVideo.playbackRate = 0.4;
}


// ── AOS: Animate on Scroll ───────────────────────────
function initAOS() {
  const elements = document.querySelectorAll('[data-aos]');
  if (!elements.length) return;
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || '0');
        setTimeout(function() { entry.target.classList.add('aos-visible'); }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  elements.forEach(function(el) { observer.observe(el); });
}
initAOS();


// ── SECURITY SCORE ANIMATION ─────────────────────────
function animateScore() {
  const scoreCircle = document.getElementById('scoreCircle');
  const scoreValue = document.getElementById('scoreValue');
  if (!scoreCircle || !scoreValue) return;

  const circumference = 2 * Math.PI * 52;
  const targetScore = 62;
  const targetOffset = circumference * (1 - targetScore / 100);

  const svgEl = scoreCircle.closest('svg');
  if (!svgEl) return;
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  grad.setAttribute('id', 'scoreGrad');
  grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%');
  grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '100%');
  const s1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', '#00d4ff');
  const s2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', '#7b4fff');
  grad.appendChild(s1); grad.appendChild(s2);
  defs.appendChild(grad);
  svgEl.prepend(defs);

  const scoreCard = scoreCircle.closest('.security-score-card');
  if (!scoreCard) return;

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        scoreCircle.style.strokeDasharray = circumference;
        scoreCircle.style.strokeDashoffset = circumference;
        scoreCircle.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.4,0,0.2,1)';
        setTimeout(function() {
          scoreCircle.style.strokeDashoffset = targetOffset;
        }, 200);

        let current = 0;
        const interval = setInterval(function() {
          current++;
          scoreValue.textContent = current + '%';
          if (current >= targetScore) clearInterval(interval);
        }, 1800 / targetScore);

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  observer.observe(scoreCard);
}
animateScore();


// ── PRODUCT CARD 3D TILT ─────────────────────────────
document.querySelectorAll('.product-card').forEach(function(card) {
  card.addEventListener('mousemove', function(e) {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = 'rotateY(' + (x * 12) + 'deg) rotateX(' + (-y * 8) + 'deg) translateY(-6px) scale(1.02)';
  });
  card.addEventListener('mouseleave', function() {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
    setTimeout(function() { card.style.transition = ''; }, 500);
  });
});


// ── FORMULARIO DE CONTACTO ───────────────────────────
// (handleSubmit se llama desde el onsubmit del formulario)


// ── NÚMERO TELÉFONO: ANIMACIÓN "RING" AL HOVER ────────
document.querySelectorAll('a[href^="tel:"]').forEach(function(el) {
  el.addEventListener('mouseenter', function() {
    el.style.animation = 'ring 0.4s ease-in-out';
    setTimeout(function() { el.style.animation = ''; }, 500);
  });
});
var styleEl = document.createElement('style');
styleEl.textContent = '@keyframes ring { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-8deg); } 75% { transform: rotate(8deg); } }';
document.head.appendChild(styleEl);


// ── SMOOTH SCROLL LINKS ───────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
  anchor.addEventListener('click', function(e) {
    var href = this.getAttribute('href');
    if (href === '#') return;

    var target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      var navEl = document.getElementById('navbar');
      var navHeight = navEl ? navEl.offsetHeight : 80;
      var targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

      window.scrollTo({
        top: targetPos,
        behavior: 'smooth'
      });
    }
  });
});

// ── COOKIE BANNER INTERACTION ──────────────────────────
var cookieBanner = document.getElementById('cookieBanner');
var acceptCookies = document.getElementById('acceptCookies');

if (cookieBanner && acceptCookies) {
  if (sessionStorage.getItem('cookiesAccepted')) {
    cookieBanner.style.display = 'none';
  }

  acceptCookies.addEventListener('click', function() {
    sessionStorage.setItem('cookiesAccepted', 'true');
    cookieBanner.style.opacity = '0';
    cookieBanner.style.transform = 'translate(-50%, 20px)';
    setTimeout(function() { cookieBanner.style.display = 'none'; }, 500);
  });
}

} catch (err) {
  // Si algo falla, lo registramos pero NO rompemos la navegación
  console.warn('Script error (non-critical):', err);
}


// ── FORMULARIO DE CONTACTO (fuera del try-catch para que esté accesible globalmente) ──
function handleSubmit(e) {
  e.preventDefault();
  var btn = document.getElementById('submitBtn');
  if (!btn) return;
  var text = btn.querySelector('.btn-text');
  if (!text) return;
  var orig = text.textContent;

  text.textContent = '⏳ Enviando...';
  btn.disabled = true;

  var formData = new FormData(e.target);
  var action = e.target.action;
  
  if (action.includes('TU_ID_AQUI')) {
    alert('Por favor, configura tu ID de Formspree en el archivo index.html antes de enviar.');
    btn.disabled = false;
    text.textContent = orig;
    return;
  }

  fetch(action, {
    method: "POST",
    headers: { "Accept": "application/json" },
    body: formData,
  })
    .then(function(response) {
      if (response.ok) {
        text.textContent = '✅ ¡Enviado! Te contactamos pronto.';
        btn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
        e.target.reset();
      } else {
        return response.json().then(function(data) {
          if (data && data.errors) {
            throw new Error(data.errors.map(function(err) { return err.message; }).join(", "));
          }
          throw new Error('Error desconocido del servidor');
        });
      }
    })
    .catch(function(error) {
      console.error(error);
      text.textContent = '❌ ' + error.message;
      btn.style.background = '#e74c3c';
    })
    .finally(function() {
      setTimeout(function() {
        text.textContent = orig;
        btn.disabled = false;
        btn.style.background = '';
      }, 5000);
    });
}
