/* ═══════════════════════════════════════════════
   VMB Portfolio — main.ts
   TypeScript source (compiled to main.js)
   Inspired by raxx21/rajesh-portfolio
═══════════════════════════════════════════════ */

// ── TYPES ──────────────────────────────────────

interface Particle {
    x: number;
    y: number;
    r: number;
    vx: number;
    vy: number;
    alpha: number;
    hue: number;
}

// ── UTILS ──────────────────────────────────────

const $ = <T extends HTMLElement = HTMLElement>(sel: string): T | null =>
    document.querySelector<T>(sel);

const $$ = <T extends HTMLElement = HTMLElement>(sel: string): T[] =>
    Array.from(document.querySelectorAll<T>(sel));

// ── CANVAS PARTICLES ────────────────────────────

(function initParticles(): void {
    const canvas = $<HTMLCanvasElement>('#bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let W: number, H: number;
    const PARTICLE_COUNT = 70;
    const MAX_DIST = 130;

    const particles: Particle[] = [];

    function resize(): void {
        W = canvas!.width = window.innerWidth;
        H = canvas!.height = window.innerHeight;
    }

    function randParticle(): Particle {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.8 + 0.4,
            vx: (Math.random() - 0.5) * 0.28,
            vy: (Math.random() - 0.5) * 0.28,
            alpha: Math.random() * 0.55 + 0.08,
            hue: Math.random() * 50 + 230, // purple-blue range
        };
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(randParticle());

    function draw(): void {
        ctx.clearRect(0, 0, W, H);

        // Update & draw dots
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

        // Lines between close particles
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

(function initCursor(): void {
    const dot = $<HTMLDivElement>('#cursor-dot');
    const ring = $<HTMLDivElement>('#cursor-ring');
    if (!dot || !ring) return;

    // Use raw coords for dot, lerped coords for ring
    let mx = 0, my = 0;
    let rx = 0, ry = 0;

    window.addEventListener('mousemove', (e: MouseEvent) => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.left = `${mx}px`;
        dot.style.top = `${my}px`;
    }, { passive: true });

    function lerpRing(): void {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.left = `${rx}px`;
        ring.style.top = `${ry}px`;
        requestAnimationFrame(lerpRing);
    }
    lerpRing();

    // Hover state on interactive elements
    const interactables = 'a, button, [data-nav], .tech-chip, .pill, .project-card, .glass-card, .contact-card';
    function addHover(el: Element): void {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    }

    $$<HTMLElement>(interactables).forEach(addHover);

    // Watch for dynamically added elements (MutationObserver)
    new MutationObserver(() => {
        $$<HTMLElement>(interactables).forEach(addHover);
    }).observe(document.body, { childList: true, subtree: true });
})();

// ── TYPEWRITER ──────────────────────────────────

(function initTypewriter(): void {
    const el = $<HTMLSpanElement>('#typedText');
    if (!el) return;

    const phrases: string[] = [
        'close to hardware.',
        'with microcontrollers.',
        'on bare metal.',
        'in C & C++.',
        'for the future.',
    ];

    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    const typeSpeed = 65;
    const deleteSpeed = 35;
    const pauseAfter = 1800;

    function tick(): void {
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

(function initScrollHeader(): void {
    const header = $<HTMLElement>('#header');
    if (!header) return;
    const onScroll = (): void => {
        header.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

// ── HAMBURGER ────────────────────────────────────

(function initHamburger(): void {
    const burger = $<HTMLButtonElement>('#hamburger');
    const links = $<HTMLUListElement>('#navLinks');
    if (!burger || !links) return;

    burger.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(open));
    });

    links.querySelectorAll('a').forEach((a: Element) => {
        a.addEventListener('click', () => {
            links.classList.remove('open');
            burger.setAttribute('aria-expanded', 'false');
        });
    });
})();

// ── ACTIVE NAV ON SCROLL ─────────────────────────

(function initActiveNav(): void {
    const sections = $$<HTMLElement>('section[id]');
    const navLinks = $$<HTMLAnchorElement>('.nav-links a[data-nav]');

    const onScroll = (): void => {
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

// ── INTERSECTION OBSERVER — FADE-UP + SKILL BARS ─

(function initFadeAndSkills(): void {
    const io = new IntersectionObserver(
        (entries: IntersectionObserverEntry[]) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                const el = entry.target as HTMLElement;
                el.classList.add('visible');

                // Animate skill bars inside this element
                el.querySelectorAll<HTMLElement>('.skill-fill').forEach((bar: HTMLElement) => {
                    const w = bar.dataset.w ?? '0';
                    bar.style.width = `${w}%`;
                });

                io.unobserve(el);
            }
        },
        { threshold: 0.12 }
    );

    $$<HTMLElement>('.fade-up').forEach((el: HTMLElement) => io.observe(el));

    // Also observe skill fills independently for instant trigger
    const skillIo = new IntersectionObserver(
        (entries: IntersectionObserverEntry[]) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                const bar = entry.target as HTMLElement;
                bar.style.width = `${bar.dataset.w ?? 0}%`;
                skillIo.unobserve(bar);
            }
        },
        { threshold: 0.1 }
    );
    $$<HTMLElement>('.skill-fill').forEach((el: HTMLElement) => skillIo.observe(el));
})();

// ── COUNT-UP ANIMATION ───────────────────────────

(function initCountUp(): void {
    const nums = $$<HTMLElement>('.stat-num[data-count]');
    if (!nums.length) return;

    const io = new IntersectionObserver(
        (entries: IntersectionObserverEntry[]) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                const el = entry.target as HTMLElement;
                const target = parseInt(el.dataset.count ?? '0', 10);
                const suffix = el.dataset.suffix ?? '+';
                let start = 0;
                const duration = 1400;
                const step = (timestamp: number): void => {
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
        },
        { threshold: 0.5 }
    );

    // Set default suffix if not defined
    nums.forEach((el: HTMLElement) => {
        if (!el.dataset.suffix) el.dataset.suffix = '+';
        io.observe(el);
    });
})();



// ── CONTACT FORM ─────────────────────────────────

(function initContactForm(): void {
    const form = $<HTMLFormElement>('#contactForm');
    const success = $<HTMLDivElement>('#successMsg');
    const btn = $<HTMLButtonElement>('#submitBtn');
    if (!form || !success || !btn) return;

    form.addEventListener('submit', (e: Event) => {
        e.preventDefault();

        const name = ($<HTMLInputElement>('#fname'))?.value.trim() ?? '';
        const email = ($<HTMLInputElement>('#femail'))?.value.trim() ?? '';
        const subject = ($<HTMLInputElement>('#fsubject'))?.value.trim() ?? '';
        const message = ($<HTMLTextAreaElement>('#fmessage'))?.value.trim() ?? '';

        if (!name || !email || !subject || !message) return;

        const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
        window.location.href = `mailto:vmbhuvanesh16@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        success.style.display = 'block';
        btn.disabled = true;
        btn.textContent = '✓ Sent!';
        form.reset();

        setTimeout(() => {
            success.style.display = 'none';
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
        }, 5000);
    });
})();

// ── PILL HOVER RIPPLE ─────────────────────────────

(function initPillRipple(): void {
    $$<HTMLElement>('.pill').forEach((pill: HTMLElement) => {
        pill.addEventListener('click', (e: MouseEvent) => {
            const rect = pill.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.style.cssText = `
        position:absolute;width:6px;height:6px;border-radius:50%;
        background:rgba(167,139,250,.6);pointer-events:none;
        left:${e.clientX - rect.left - 3}px;top:${e.clientY - rect.top - 3}px;
        transform:scale(0);transition:transform .5s ease,opacity .5s ease;
        opacity:1;
      `;
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

// ── SMOOTH SECTION SCROLL OFFSET ─────────────────

(function initSmoothOffset(): void {
    const NAV_H = 72;
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a: HTMLAnchorElement) => {
        a.addEventListener('click', (e: Event) => {
            const id = a.getAttribute('href')?.slice(1);
            if (!id) return;
            const target = document.getElementById(id);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - NAV_H;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
})();
