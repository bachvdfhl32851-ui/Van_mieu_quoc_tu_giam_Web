/* =====================================================================
   EFFECTS.JS — hiệu ứng cuộn, con trỏ, tilt, glow, marquee, kinetic type
   Nạp SAU script.js. Toàn bộ code bọc trong 1 IIFE, không đụng biến
   toàn cục của script.js.
   ===================================================================== */

(function () {
    "use strict";

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    const onReady = (fn) => {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    };


    /* =================================================================
       1. CUSTOM CURSOR
    ================================================================= */

    function initCustomCursor() {

        if (!isFinePointer || isTouch || prefersReducedMotion) return;

        const dot = document.createElement("div");
        dot.className = "fx-cursor-dot";

        const ring = document.createElement("div");
        ring.className = "fx-cursor-ring";

        document.documentElement.appendChild(dot);
        document.documentElement.appendChild(ring);
        document.documentElement.classList.add("fx-has-cursor");

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;

        window.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
        });

        document.addEventListener("mouseleave", () => {
            document.documentElement.classList.add("fx-cursor-hidden");
        });

        document.addEventListener("mouseenter", () => {
            document.documentElement.classList.remove("fx-cursor-hidden");
        });

        function tickRing() {

            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;

            ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

            requestAnimationFrame(tickRing);
        }

        tickRing();

        const hoverSelector = 'a, button, .fact-card, .value-card, .timeline-content, [role="button"]';

        document.addEventListener("mouseover", (e) => {
            if (e.target.closest(hoverSelector)) {
                document.documentElement.classList.add("fx-cursor-hover");
            }
        });

        document.addEventListener("mouseout", (e) => {
            if (e.target.closest(hoverSelector)) {
                document.documentElement.classList.remove("fx-cursor-hover");
            }
        });

    }


    /* =================================================================
       2. TILT + GLOW SPOTLIGHT theo con trỏ (card 3D)
    ================================================================= */

    function initTiltAndGlow() {

        const glowSelector =
            ".architecture-card, .value-card, .library-card, .visit-card, .stat, .fact-card, .timeline-content";

        document.querySelectorAll(glowSelector).forEach((el) => {
            el.classList.add("fx-glow");
        });

        if (!isFinePointer || isTouch || prefersReducedMotion) return;

        const tiltSelector = ".architecture-card, .value-card, .library-card, .visit-card, .stat";

        document.querySelectorAll(tiltSelector).forEach((card) => {

            card.classList.add("fx-tilt");

            const lift = card.classList.contains("architecture-card") || card.classList.contains("library-card")
                ? -10 : -8;

            card.addEventListener("mousemove", (e) => {

                const rect = card.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width;
                const py = (e.clientY - rect.top) / rect.height;

                const rotateY = (px - 0.5) * 10;
                const rotateX = (0.5 - py) * 10;

                card.style.transform =
                    `perspective(900px) translateY(${lift}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.015)`;

                card.style.setProperty("--fx-mx", (px * 100).toFixed(1) + "%");
                card.style.setProperty("--fx-my", (py * 100).toFixed(1) + "%");
            });

            card.addEventListener("mouseleave", () => {
                card.style.transform = "";
            });

        });

        // glow-only cards (khong tilt, van theo doi con tro)
        document.querySelectorAll(".fact-card, .timeline-content").forEach((card) => {

            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                const px = ((e.clientX - rect.left) / rect.width) * 100;
                const py = ((e.clientY - rect.top) / rect.height) * 100;

                card.style.setProperty("--fx-mx", px.toFixed(1) + "%");
                card.style.setProperty("--fx-my", py.toFixed(1) + "%");
            });

        });

    }


    /* =================================================================
       3. MAGNETIC BUTTONS
    ================================================================= */

    function initMagnetic() {

        if (!isFinePointer || isTouch || prefersReducedMotion) return;

        const selector = ".btn, .btn-solid, .theme-toggle";

        document.querySelectorAll(selector).forEach((btn) => {

            btn.classList.add("fx-magnetic");

            btn.addEventListener("mousemove", (e) => {
                const rect = btn.getBoundingClientRect();
                const relX = e.clientX - rect.left - rect.width / 2;
                const relY = e.clientY - rect.top - rect.height / 2;

                btn.style.transform = `translate(${relX * 0.25}px, ${relY * 0.35}px)`;
            });

            btn.addEventListener("mouseleave", () => {
                btn.style.transform = "";
            });

        });

    }


    /* =================================================================
       4. RIPPLE (micro-interaction khi bam)
    ================================================================= */

    function initRipple() {

        const selector = ".btn, .btn-solid, .quiz-option, .theme-toggle, .top-btn, .menu-btn";

        document.addEventListener("click", (e) => {

            const target = e.target.closest(selector);
            if (!target) return;

            target.classList.add("fx-ripple-host");

            const rect = target.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);

            const ripple = document.createElement("span");
            ripple.className = "fx-ripple";
            ripple.style.width = ripple.style.height = size + "px";
            ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
            ripple.style.top = (e.clientY - rect.top - size / 2) + "px";

            target.appendChild(ripple);

            window.setTimeout(() => ripple.remove(), 650);

        });

    }


    /* =================================================================
       5. MARQUEE STRIP
    ================================================================= */

    function initMarquee() {

        const anchor = document.querySelector(".page-banner") || document.querySelector(".hero");
        if (!anchor) return;

        const phrases = [
            "VĂN MIẾU – QUỐC TỬ GIÁM",
            "DI TÍCH QUỐC GIA ĐẶC BIỆT",
            "HIỀN TÀI LÀ NGUYÊN KHÍ QUỐC GIA",
            "82 BIA TIẾN SĨ",
            "GẦN MỘT NGHÌN NĂM ĐẠO HỌC"
        ];

        const track = document.createElement("div");
        track.className = "fx-marquee-track";

        // nhan doi noi dung de vong lap lien mach
        for (let rep = 0; rep < 2; rep++) {
            phrases.forEach((text) => {
                const span = document.createElement("span");
                span.textContent = text;
                track.appendChild(span);
            });
        }

        const wrap = document.createElement("div");
        wrap.className = "fx-marquee";
        wrap.appendChild(track);

        anchor.insertAdjacentElement("afterend", wrap);

    }


    /* =================================================================
       6. PARALLAX (hero) + KINETIC SCROLL cho tieu de hero
    ================================================================= */

    function initParallax() {

        if (prefersReducedMotion) return;

        const hero = document.querySelector(".hero");
        const heroTitle = document.querySelector(".hero h1");

        if (!hero && !heroTitle) return;

        let ticking = false;

        function update() {

            const y = window.scrollY;

            if (hero) {
                hero.style.backgroundPosition = `center ${50 + y * 0.04}%`;
            }

            if (heroTitle) {
                const progress = Math.min(y / (window.innerHeight || 800), 1);
                heroTitle.style.transform = `translateY(${progress * 40}px)`;
                heroTitle.style.opacity = String(1 - progress * 0.8);
            }

            ticking = false;
        }

        window.addEventListener("scroll", () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });

        update();

    }


    /* =================================================================
       7. KINETIC TYPOGRAPHY — tach tu, hien dan khi cuon toi
    ================================================================= */

    function splitIntoWords(el) {

        if (el.dataset.fxSplit) return;
        if (el.children.length > 0) return; // co the chua <br>, <span> khac -> bo qua

        const words = el.textContent.trim().split(/\s+/);

        el.textContent = "";

        words.forEach((word, i) => {
            const span = document.createElement("span");
            span.className = "kinetic-word";
            span.style.setProperty("--fx-delay", (i * 55) + "ms");
            span.textContent = word;

            el.appendChild(span);
            el.appendChild(document.createTextNode(" "));
        });

        el.dataset.fxSplit = "true";

    }

    function initKineticHeadings() {

        const targets = document.querySelectorAll(".page-banner h1, .section-title h2");

        targets.forEach((el) => splitIntoWords(el));

        if (prefersReducedMotion) {
            document.querySelectorAll(".kinetic-word").forEach((w) => w.classList.add("fx-in"));
            return;
        }

        const io = new IntersectionObserver((entries) => {

            entries.forEach((entry) => {

                if (!entry.isIntersecting) return;

                const words = entry.target.querySelectorAll(".kinetic-word");

                if (words.length) {
                    words.forEach((w) => w.classList.add("fx-in"));
                } else {
                    entry.target.classList.add("fx-reveal", "fx-in");
                }

                io.unobserve(entry.target);

            });

        }, { threshold: 0.4 });

        targets.forEach((el) => io.observe(el));

    }


    /* =================================================================
       8. SCROLL REVEAL bo sung (khong dung .visible da co)
    ================================================================= */

    function initScrollReveal() {

        const selector = [
            ".intro-text > p",
            ".gallery-item",
            ".media-item",
            ".detail-article > *",
            ".notice",
            ".stelae-number",
            ".footer-content > div"
        ].join(", ");

        const items = document.querySelectorAll(selector);
        if (!items.length) return;

        items.forEach((el, i) => {
            el.classList.add("fx-reveal");
            el.style.setProperty("--fx-delay", Math.min(i % 6, 5) * 70 + "ms");
        });

        if (prefersReducedMotion) {
            items.forEach((el) => el.classList.add("fx-in"));
            return;
        }

        const io = new IntersectionObserver((entries) => {

            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("fx-in");
                    io.unobserve(entry.target);
                }
            });

        }, { threshold: 0.12 });

        items.forEach((el) => io.observe(el));

    }


    /* =================================================================
       9. GLASS PANELS
    ================================================================= */

    function initGlass() {

        document.querySelectorAll(".notice").forEach((el) => el.classList.add("fx-glass"));

    }


    /* =================================================================
       10. STICKY STACK cho luoi kien truc (4 the)
    ================================================================= */

    function initStackScroll() {

        const grid = document.querySelector(".architecture-grid");
        if (!grid) return;

        function apply() {

            const wide = window.innerWidth >= 900;
            grid.classList.toggle("fx-stack", wide);

            if (!wide) return;

            const cards = grid.querySelectorAll(".architecture-card");
            cards.forEach((card, i) => {
                card.style.top = (96 + i * 26) + "px";
            });

        }

        apply();

        let resizeTimer;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(apply, 150);
        });

    }


    /* =================================================================
       INIT
    ================================================================= */

    onReady(() => {
        initCustomCursor();
        initTiltAndGlow();
        initMagnetic();
        initRipple();
        initMarquee();
        initParallax();
        initKineticHeadings();
        initScrollReveal();
        initGlass();
        initStackScroll();
    });

})();
