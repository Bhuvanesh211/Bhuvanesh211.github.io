/* ═══════════════════════════════════════════════
   VMB Portfolio — main.js
   Compiled from main.ts
   Inspired by raxx21/rajesh-portfolio
═══════════════════════════════════════════════ */

"use strict";

// ── UTILS ──────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// ── CANVAS PARTICLES ────────────────────────────
(function initParticles() {
    const canvas = $('#bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H;
    const PARTICLE_COUNT = 70;
    const MAX_DIST = 130;
    const particles = [];

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function randParticle() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.8 + 0.4,
            vx: (Math.random() - 0.5) * 0.28,
            vy: (Math.random() - 0.5) * 0.28,
            alpha: Math.random() * 0.55 + 0.08,
            hue: Math.random() * 50 + 230,
        };
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(randParticle());

    function draw() {
        ctx.clearRect(0, 0, W, H);

        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue},80%,70%,${p.alpha})`;
            ctx.fill();
        }

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST) {
                    const opacity = 0.09 * (1 - dist / MAX_DIST);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `hsla(262,70%,65%,${opacity})`;
                    ctx.lineWidth = 0.7;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
})();

// ── CUSTOM CURSOR ───────────────────────────────
(function initCursor() {
    const dot = $('#cursor-dot');
    const ring = $('#cursor-ring');
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;

    // Only activate on non-touch devices
    if (window.matchMedia('(pointer: fine)').matches) {
        window.addEventListener('mousemove', (e) => {
            mx = e.clientX; my = e.clientY;
            dot.style.left = `${mx}px`;
            dot.style.top = `${my}px`;
        }, { passive: true });

        function lerpRing() {
            rx += (mx - rx) * 0.12;
            ry += (my - ry) * 0.12;
            ring.style.left = `${rx}px`;
            ring.style.top = `${ry}px`;
            requestAnimationFrame(lerpRing);
        }
        lerpRing();

        const interactables = 'a, button, .tech-chip, .pill, .project-card, .glass-card, .contact-card';
        $$(`${interactables}`).forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }
})();

// ── TYPEWRITER ──────────────────────────────────
(function initTypewriter() {
    const el = $('#typedText');
    if (!el) return;

    const phrases = [
        'close to hardware.',
        'with microcontrollers.',
        'on bare metal.',
        'in C & C++.',
        'for the future.',
    ];

    let phraseIdx = 0, charIdx = 0, deleting = false;
    const typeSpeed = 65, deleteSpeed = 35, pauseAfter = 1800;

    function tick() {
        const current = phrases[phraseIdx];
        if (!deleting) {
            el.textContent = current.slice(0, charIdx + 1);
            charIdx++;
            if (charIdx === current.length) {
                deleting = true;
                setTimeout(tick, pauseAfter);
                return;
            }
        } else {
            el.textContent = current.slice(0, charIdx - 1);
            charIdx--;
            if (charIdx === 0) {
                deleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
            }
        }
        setTimeout(tick, deleting ? deleteSpeed : typeSpeed);
    }
    setTimeout(tick, 900);
})();

// ── HEADER SCROLL ────────────────────────────────
(function initScrollHeader() {
    const header = $('#header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

// ── HAMBURGER ────────────────────────────────────
(function initHamburger() {
    const burger = $('#hamburger');
    const links = $('#navLinks');
    if (!burger || !links) return;

    burger.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            links.classList.remove('open');
            burger.setAttribute('aria-expanded', 'false');
        });
    });
})();

// ── ACTIVE NAV ON SCROLL ─────────────────────────
(function initActiveNav() {
    const sections = $$('section[id]');
    const navLinks = $$('.nav-links a[data-nav]');

    const onScroll = () => {
        let current = '';
        for (const sec of sections) {
            if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
        }
        for (const a of navLinks) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + current);
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

// ── INTERSECTION OBSERVER — FADE + SKILL BARS ────
(function initFadeAndSkills() {
    const io = new IntersectionObserver(entries => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const el = entry.target;
            el.classList.add('visible');
            el.querySelectorAll('.skill-fill').forEach(bar => {
                bar.style.width = `${bar.dataset.w ?? 0}%`;
            });
            io.unobserve(el);
        }
    }, { threshold: 0.12 });

    $$('.fade-up').forEach(el => io.observe(el));

    const skillIo = new IntersectionObserver(entries => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const bar = entry.target;
            bar.style.width = `${bar.dataset.w ?? 0}%`;
            skillIo.unobserve(bar);
        }
    }, { threshold: 0.1 });

    $$('.skill-fill').forEach(el => skillIo.observe(el));
})();

// ── COUNT-UP ─────────────────────────────────────
(function initCountUp() {
    const nums = $$('.stat-num[data-count]');
    if (!nums.length) return;

    const io = new IntersectionObserver(entries => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            const suffix = el.dataset.suffix ?? '+';
            let start = 0;
            const duration = 1400;

            const step = (timestamp) => {
                if (!start) start = timestamp;
                const progress = Math.min((timestamp - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.floor(eased * target) + suffix;
                if (progress < 1) requestAnimationFrame(step);
                else el.textContent = target + suffix;
            };
            requestAnimationFrame(step);
            io.unobserve(el);
        }
    }, { threshold: 0.5 });

    nums.forEach(el => {
        if (!el.dataset.suffix) el.dataset.suffix = '+';
        io.observe(el);
    });
})();



// ── CONTACT FORM ─────────────────────────────────
(function initContactForm() {
    const form = $('#contactForm');
    const success = $('#successMsg');
    const btn = $('#submitBtn');
    if (!form || !success || !btn) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = $('#fname')?.value.trim() ?? '';
        const email = $('#femail')?.value.trim() ?? '';
        const subject = $('#fsubject')?.value.trim() ?? '';
        const message = $('#fmessage')?.value.trim() ?? '';

        if (!name || !email || !subject || !message) return;

        const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
        window.location.href = `mailto:vmbhuvanesh16@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        success.style.display = 'block';
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Sent!';
        form.reset();

        setTimeout(() => {
            success.style.display = 'none';
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
        }, 5000);
    });
})();

// ── PILL RIPPLE ───────────────────────────────────
(function initPillRipple() {
    $$('.pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            const rect = pill.getBoundingClientRect();
            const ripple = document.createElement('span');
            Object.assign(ripple.style, {
                position: 'absolute',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'rgba(167,139,250,.6)',
                pointerEvents: 'none',
                left: `${e.clientX - rect.left - 3}px`,
                top: `${e.clientY - rect.top - 3}px`,
                transform: 'scale(0)',
                transition: 'transform .5s ease, opacity .5s ease',
                opacity: '1',
            });
            pill.style.position = 'relative';
            pill.style.overflow = 'hidden';
            pill.appendChild(ripple);
            requestAnimationFrame(() => {
                ripple.style.transform = 'scale(20)';
                ripple.style.opacity = '0';
            });
            setTimeout(() => ripple.remove(), 600);
        });
    });
})();

// ── SMOOTH SCROLL WITH NAV OFFSET ─────────────────
(function initSmoothScroll() {
    const NAV_H = 72;
    $$('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href')?.slice(1);
            if (!id) return;
            const target = document.getElementById(id);
            if (!target) return;
            e.preventDefault();
            window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - NAV_H, behavior: 'smooth' });
        });
    });
})();

// ── PROJECT CARD TILT ─────────────────────────────
(function initCardTilt() {
    $$('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) / (rect.width / 2);
            const dy = (e.clientY - cy) / (rect.height / 2);
            card.style.transform = `translateY(-8px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg)`;
            card.style.transition = 'transform 0.05s linear, box-shadow .35s, border-color .35s';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'transform .55s cubic-bezier(.16,1,.3,1), box-shadow .35s, border-color .35s';
        });
        card.style.perspective = '600px';
    });
})();
