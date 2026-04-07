'use strict';

/* ── Loading Screen ──────────────────────────────────── */
window.addEventListener('load', () => {
    // CUSTOMIZE: Adjust delay (ms) — longer = loading screen stays visible longer
    setTimeout(() => document.getElementById('loader').classList.add('hidden'), 1400);
});

/* ── Navbar: scroll shadow + active link ────────────── */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('[data-nav]');
const sections = document.querySelectorAll('section[id]');

function updateNav() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    let current = '';
    sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 160) current = sec.id;
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
}
let isScrolling = false;
window.addEventListener('scroll', () => {
    if (!isScrolling) {
        window.requestAnimationFrame(() => {
            updateNav();
            isScrolling = false;
        });
        isScrolling = true;
    }
}, { passive: true });
updateNav();

/* ── Hamburger / Mobile nav ─────────────────────────── */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileNav = document.getElementById('mobileNav');

function toggleMenu(open) {
    hamburgerBtn.classList.toggle('open', open);
    mobileNav.classList.toggle('open', open);
    hamburgerBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
}

hamburgerBtn.addEventListener('click', () => toggleMenu(!hamburgerBtn.classList.contains('open')));
document.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', () => toggleMenu(false)));

/* ── Intersection Observer: reveal animations ───────── */
new IntersectionObserver(
    entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); }
    }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
).observe
    ? (() => {
        const obs = new IntersectionObserver(
            entries => entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('visible'); }
            }),
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    })()
    : document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible')); // fallback

/* ── Accordions (case study toggles) ───────────────── */
document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const body = btn.nextElementSibling;
        const isOpen = btn.classList.contains('open');
        // Close siblings
        btn.closest('.case-study').querySelectorAll('.accordion-btn.open').forEach(b => {
            b.classList.remove('open');
            b.setAttribute('aria-expanded', 'false');
            b.nextElementSibling.classList.remove('open');
        });
        // Toggle clicked
        if (!isOpen) {
            btn.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
            body.classList.add('open');
        }
    });
});

/* ── Testimonials Carousel ──────────────────────────── */
const track = document.getElementById('testimonialsTrack');
const dots = document.querySelectorAll('.carousel-dot');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let cur = 0;
const total = dots.length;
let timer;

function goTo(i) {
    cur = (i + total) % total;
    track.style.transform = `translateX(-${cur * 100}%)`;
    dots.forEach((d, j) => {
        d.classList.toggle('active', j === cur);
        d.setAttribute('aria-selected', String(j === cur));
    });
}

prevBtn.addEventListener('click', () => { goTo(cur - 1); reset(); });
nextBtn.addEventListener('click', () => { goTo(cur + 1); reset(); });
dots.forEach(d => d.addEventListener('click', () => { goTo(+d.dataset.index); reset(); }));

// Touch swipe
let tx = 0;
track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend', e => {
    const dx = tx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) { goTo(dx > 0 ? cur + 1 : cur - 1); reset(); }
});

function start() { timer = setInterval(() => goTo(cur + 1), 5000); }
function reset() { clearInterval(timer); start(); }

const carousel = track.closest('.testimonials-carousel');
carousel.addEventListener('mouseenter', () => clearInterval(timer));
carousel.addEventListener('mouseleave', start);
start();

/* ── Modals ─────────────────────────────────────────── */
function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
    el.querySelector('.modal-close').focus();
}
function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('open');
    document.body.style.overflow = '';
}

document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o) closeModal(o.id); });
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        toggleMenu(false);
        document.querySelectorAll('.modal-overlay.open').forEach(o => closeModal(o.id));
        const lb = document.querySelector('.lightbox-overlay');
        if (lb && lb.classList.contains('active')) {
            lb.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

/* ── Lightbox Gallery ───────────────────────────────── */
const zoomables = document.querySelectorAll('[data-zoomable="true"]');
if (zoomables.length > 0) {
    const lbOverlay = document.createElement('div');
    lbOverlay.className = 'lightbox-overlay';
    lbOverlay.innerHTML = `
        <button class="lightbox-close" aria-label="Close Gallery">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <img class="lightbox-img" src="" alt="" />
    `;
    document.body.appendChild(lbOverlay);

    const lbImg = lbOverlay.querySelector('.lightbox-img');
    const lbClose = lbOverlay.querySelector('.lightbox-close');

    function closeLightbox() {
        lbOverlay.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => { lbImg.src = ''; }, 400); // clear after animation
    }

    lbClose.addEventListener('click', closeLightbox);
    lbOverlay.addEventListener('click', (e) => {
        if (e.target === lbOverlay) closeLightbox();
    });

    zoomables.forEach(img => {
        img.addEventListener('click', () => {
            lbImg.src = img.src;
            lbImg.alt = img.alt || 'Case study visual';
            lbOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            // GA4 Tracking
            const projectBox = img.closest('.case-study');
            const projectTitle = projectBox ? projectBox.querySelector('.case-study-title').textContent : 'Unknown';
            if (typeof trackEvent === 'function') {
                trackEvent('case_study_image_zoom', { 'image_alt': img.alt, 'project_title': projectTitle.trim() });
            }
        });
    });
}

/* ── Contact Form ───────────────────────────────────── */
document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const btn = this.querySelector('[type="submit"]');
    const success = document.getElementById('formSuccess');
    const name = this.querySelector('#contact-name').value.trim();
    const email = this.querySelector('#contact-email').value.trim();
    const message = this.querySelector('#contact-message').value.trim();

    if (!name || !email || !message) {
        btn.style.animation = 'none';
        void btn.offsetHeight; // force reflow
        btn.style.animation = 'shake 0.4s ease';
        return;
    }

    // ── Form submission with Formspree ──
    const origText = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    fetch('https://formspree.io/f/mdapadrl', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(this)
    })
        .then(r => {
            if (r.ok) {
                this.reset();
                success.classList.add('show');
                trackEvent('contact_form_submission', { 'status': 'success' });
                setTimeout(() => success.classList.remove('show'), 5000);
            } else { alert('Submission failed — please email me directly.'); }
        })
        .catch(() => alert('Network error — please try again.'))
        .finally(() => { btn.textContent = origText; btn.disabled = false; });
});

// Shake animation for invalid form
const s = document.createElement('style');
s.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}`;
document.head.appendChild(s);

/* ── Analytics & Cookies ──────────────────────────────── */
const GA_MEASUREMENT_ID = 'G-Z9T1ZGDK06';

// Helper to track events
// Note: analytics_storage is granted by default, so this always fires.
// GA Consent Mode handles suppression internally if needed.
function trackEvent(eventName, properties = {}) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, properties);
    }
}

// Cookie Consent Logic
const cookieBanner = document.getElementById('cookie-consent');
const acceptBtn = document.getElementById('cookie-accept');
const declineBtn = document.getElementById('cookie-decline');

function showCookieBanner() {
    if (!localStorage.getItem('cookie-consent')) {
        setTimeout(() => cookieBanner.classList.add('show'), 2000);
    }
}

function handleConsent(choice) {
    localStorage.setItem('cookie-consent', choice);
    cookieBanner.classList.remove('show');
    if (choice === 'accepted') {
        // User accepted — upgrade ad signals only (analytics already running)
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted'
            });
        }
    }
}

if (acceptBtn) acceptBtn.addEventListener('click', () => handleConsent('accepted'));
if (declineBtn) declineBtn.addEventListener('click', () => handleConsent('declined'));

// Initial check - only show banner if no choice is saved
// (The actual consent restoration is handled synchronously in index.html head)
if (!localStorage.getItem('cookie-consent')) {
    showCookieBanner();
}

// Event Listeners for Tracking
window.addEventListener('DOMContentLoaded', () => {
    // 1. CV Download
    const cvLink = document.querySelector('a[download]');
    if (cvLink) {
        cvLink.addEventListener('click', () => {
            trackEvent('cv_download', { 'file_name': 'David Adebayo CV' });
        });
    }

    // 2. Project Clicks (using event delegation for modals)
    document.addEventListener('click', (e) => {
        const projectLink = e.target.closest('.project-link') || e.target.closest('.project-card');
        if (projectLink) {
            const title = projectLink.querySelector('.project-title')?.textContent || 
                          projectLink.closest('.project-card')?.querySelector('.project-title')?.textContent ||
                          'Unknown Project';
            trackEvent('project_view', { 'project_title': title });
        }
    });

    // 3. CTA Clicks
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.id === 'cookie-accept' || btn.id === 'cookie-decline') return;
            trackEvent('button_click', { 'button_text': btn.textContent.trim() });
        });
    });
});