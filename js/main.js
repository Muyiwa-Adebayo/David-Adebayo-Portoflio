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
window.addEventListener('scroll', updateNav, { passive: true });
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
    }
});

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