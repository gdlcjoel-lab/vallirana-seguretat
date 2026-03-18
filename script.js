/* ═══════════════════════════════════════════
   VALLIRANA SEGURETAT — JavaScript
   Canvas Particles · Cursor · Scroll · Forms
═══════════════════════════════════════════ */

'use strict';

// ── CURSOR PERSONALIZADO CON TRAIL DE LUZ ────────────
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');
let mouseX = 0, mouseY = 0, trailX = 0, trailY = 0;

document.addEventListener('mousemove', e => {
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
const interactiveEls = document.querySelectorAll('a, button, input, select, textarea, .product-card, .gallery-item');
interactiveEls.forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (!cursor) return;
    cursor.style.transform = 'translate(-50%, -50%) scale(2)';
    cursor.style.opacity = '0.6';
    cursorTrail.style.transform = 'translate(-50%, -50%) scale(1.5)';
  });
  el.addEventListener('mouseleave', () => {
    if (!cursor) return;
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    cursor.style.opacity = '1';
    cursorTrail.style.transform = 'translate(-50%, -50%) scale(1)';
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

// Gradient background for hero canvas
function drawHeroBg() {
  const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
  grad.addColorStop(0, 'rgba(10,18,50,1)');
  grad.addColorStop(0.5, 'rgba(5,8,22,1)');
  grad.addColorStop(1, 'rgba(3,5,12,1)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

// Centre glow
function drawCentreGlow() {
  const grad = ctx.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.45, W * 0.4);
  grad.addColorStop(0, 'rgba(0, 212, 255, 0.06)');
  grad.addColorStop(0.5, 'rgba(123, 79, 255, 0.04)');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

if (canvas && ctx) {
  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
}

function animateCanvas() {
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);
  // Fondo ahora lo pone el vídeo — el canvas es transparente
  drawConnections();
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateCanvas);
}
if (canvas && ctx) animateCanvas();

window.addEventListener('resize', () => {
  if (!canvas) return;
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
});

// Parallax leve del canvas con el mouse
document.addEventListener('mousemove', e => {
  if (!canvas) return;
  const nx = (e.clientX / W - 0.5) * 15;
  const ny = (e.clientY / H - 0.5) * 8;
  canvas.style.transform = `translate(${nx}px, ${ny}px) scale(1.02)`;
});



// ── RALENTIZAR VÍDEO DE FONDO ────────────────────────
const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
  // Ajustamos la velocidad a 0.4 para que sea lento pero fluido
  heroVideo.playbackRate = 0.4;
}

// ── NAVBAR SCROLL ─────────────────────────────────────

const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
  if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 400);
});


// ── HAMBURGER MENU ────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
  });

  // Mobile dropdown toggle (touch-friendly)
  const dropdowns = navLinks.querySelectorAll('.dropdown');
  dropdowns.forEach(dd => {
    const link = dd.querySelector('.nav-link');
    if (link) {
      link.addEventListener('click', (e) => {
        // Only intercept on mobile (when hamburger is visible)
        if (window.innerWidth <= 900) {
          e.preventDefault();
          e.stopPropagation();
          dd.classList.toggle('dropdown-open');
        }
      });
    }
  });

  // Close menu on link click (only for actual navigation links, not dropdown toggles)
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', (e) => {
      // Don't close if this is a dropdown toggle on mobile
      const parentDropdown = a.closest('.dropdown');
      if (parentDropdown && a.classList.contains('nav-link') && window.innerWidth <= 900) {
        return; // Handled by dropdown toggle above
      }
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      // Close all dropdowns too
      navLinks.querySelectorAll('.dropdown-open').forEach(d => d.classList.remove('dropdown-open'));
    });
  });
}


// ── BACK TO TOP ───────────────────────────────────────
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


// ── AOS: Animate on Scroll ───────────────────────────
function initAOS() {
  const elements = document.querySelectorAll('[data-aos]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || '0');
        setTimeout(() => entry.target.classList.add('aos-visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  elements.forEach(el => observer.observe(el));
}
initAOS();


// ── SECURITY SCORE ANIMATION ─────────────────────────
function animateScore() {
  const scoreCircle = document.getElementById('scoreCircle');
  const scoreValue = document.getElementById('scoreValue');
  if (!scoreCircle) return;

  const circumference = 2 * Math.PI * 52; // r=52
  const targetScore = 62; // 62% de seguridad
  const targetOffset = circumference * (1 - targetScore / 100);

  // SVG gradient
  const svgEl = scoreCircle.closest('svg');
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

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Animate circle
        scoreCircle.style.strokeDasharray = circumference;
        scoreCircle.style.strokeDashoffset = circumference;
        scoreCircle.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.4,0,0.2,1)';
        setTimeout(() => {
          scoreCircle.style.strokeDashoffset = targetOffset;
        }, 200);

        // Animate number
        let current = 0;
        const interval = setInterval(() => {
          current++;
          scoreValue.textContent = current + '%';
          if (current >= targetScore) clearInterval(interval);
        }, 1800 / targetScore);

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  observer.observe(scoreCircle.closest('.security-score-card'));
}
animateScore();


// ── PRODUCT CARD 3D TILT ─────────────────────────────
document.querySelectorAll('.product-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 8}deg) translateY(-6px) scale(1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
    setTimeout(() => card.style.transition = '', 500);
  });
});


// ── FORMULARIO DE CONTACTO ───────────────────────────
function handleSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const text = btn.querySelector('.btn-text');
  const orig = text.textContent;

  // Estado de carga
  text.textContent = '⏳ Enviando...';
  btn.disabled = true;

  // Envío real a Formspree
  const formData = new FormData(e.target);
  const action = e.target.action;
  
  // No enviamos si el ID es el placeholder
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
    .then(response => {
      if (response.ok) {
        text.textContent = '✅ ¡Enviado! Te contactamos pronto.';
        btn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
        e.target.reset();
      } else {
        return response.json().then(data => {
          if (data && data.errors) {
            throw new Error(data.errors.map(err => err.message).join(", "));
          }
          throw new Error('Error desconocido del servidor');
        });
      }
    })
    .catch((error) => {
      console.error(error);
      // Muestra el error exacto (ej. "Please verify your email" o "Captcha required")
      text.textContent = '❌ ' + error.message;
      btn.style.background = '#e74c3c'; // Rojo para error
    })
    .finally(() => {
      setTimeout(() => {
        text.textContent = orig;
        btn.disabled = false;
        btn.style.background = '';
      }, 5000);
    });
}


// ── NÚMERO TELÉFONO: ANIMACIÓN "RING" AL HOVER ────────
document.querySelectorAll('a[href^="tel:"]').forEach(el => {
  el.addEventListener('mouseenter', () => {
    el.style.animation = 'ring 0.4s ease-in-out';
    setTimeout(() => el.style.animation = '', 500);
  });
});
// Añadir keyframe dinámico
const style = document.createElement('style');
style.textContent = `
@keyframes ring {
  0%, 100% { transform: rotate(0deg); }
  25%  { transform: rotate(-8deg); }
  75%  { transform: rotate(8deg); }
}
`;
document.head.appendChild(style);


// ── SMOOTH SCROLL LINKS ───────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const navHeight = document.getElementById('navbar').offsetHeight;
      const targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

      window.scrollTo({
        top: targetPos,
        behavior: 'smooth'
      });
    }
  });
});

// ── COOKIE BANNER INTERACTION ──────────────────────────
const cookieBanner = document.getElementById('cookieBanner');
const acceptCookies = document.getElementById('acceptCookies');

if (cookieBanner && acceptCookies) {
  if (sessionStorage.getItem('cookiesAccepted')) {
    cookieBanner.style.display = 'none';
  }

  acceptCookies.addEventListener('click', () => {
    sessionStorage.setItem('cookiesAccepted', 'true');
    cookieBanner.style.opacity = '0';
    cookieBanner.style.transform = 'translate(-50%, 20px)';
    setTimeout(() => cookieBanner.style.display = 'none', 500);
  });
}
