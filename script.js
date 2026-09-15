// ================================
// CHUYỂN TRANG MƯỢT (PAGE TRANSITION)
// ================================

const supportsViewTransitions = "startViewTransition" in document;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!supportsViewTransitions && !prefersReducedMotion) {

    document.querySelectorAll("a[href]").forEach(link => {

        const href = link.getAttribute("href");

        const isInternalPage =
            href &&
            href.endsWith(".html") &&
            !href.startsWith("http") &&
            link.target !== "_blank";

        if (!isInternalPage) return;

        link.addEventListener("click", (e) => {

            e.preventDefault();

            document.body.classList.add("page-leaving");

            setTimeout(() => {
                window.location.href = href;
            }, 280);

        });

    });

}


// ================================
// CHẾ ĐỘ SÁNG / TỐI
// ================================

const themeToggle = document.getElementById("themeToggle");
const rootEl = document.documentElement;

function applyTheme(theme) {

    rootEl.setAttribute("data-theme", theme);

    if (themeToggle) {
        themeToggle.textContent = theme === "dark" ? "☀" : "☾";
    }

}

const savedTheme =
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

applyTheme(savedTheme);

if (themeToggle) {

    themeToggle.addEventListener("click", () => {

        const newTheme = rootEl.getAttribute("data-theme") === "dark" ? "light" : "dark";

        localStorage.setItem("theme", newTheme);

        applyTheme(newTheme);

    });

}


// ================================
// MENU MOBILE
// ================================

const menuBtn = document.getElementById("menuBtn");
const navbar = document.querySelector(".navbar");

if (menuBtn && navbar) {

    menuBtn.addEventListener("click", () => {

        navbar.classList.toggle("active");

    });


    // Đóng menu sau khi click link

    document.querySelectorAll(".navbar a").forEach(link => {

        link.addEventListener("click", () => {

            navbar.classList.remove("active");

        });

    });

}


// ================================
// NÚT VỀ ĐẦU TRANG
// ================================

const topBtn = document.getElementById("topBtn");

if (topBtn) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 500) {

            topBtn.classList.add("show");

        } else {

            topBtn.classList.remove("show");

        }

    });


    topBtn.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}


// ================================
// MỞ / ĐÓNG NỘI DUNG CHI TIẾT (dùng chung)
// ================================

function initExpandableCards(cardSelector, detailSelector) {

    const cards = document.querySelectorAll(cardSelector);

    function closeCard(card, detail) {

        detail.style.maxHeight = "0px";

        detail.classList.remove("open");

        card.setAttribute("aria-expanded", "false");

    }

    function openCard(card, detail) {

        detail.classList.add("open");
        detail.style.maxHeight = detail.scrollHeight + "px";

        card.setAttribute("aria-expanded", "true");

    }

    cards.forEach(card => {

        const detail = card.querySelector(detailSelector);

        if (!detail) return;

        function toggle() {

            const isOpen = card.getAttribute("aria-expanded") === "true";

            // Đóng tất cả các ô khác trong cùng nhóm

            cards.forEach(otherCard => {

                if (otherCard === card) return;

                const otherDetail = otherCard.querySelector(detailSelector);

                if (otherDetail) closeCard(otherCard, otherDetail);

            });

            if (isOpen) {
                closeCard(card, detail);
            } else {
                openCard(card, detail);
            }

        }

        card.addEventListener("click", toggle);

        card.addEventListener("keydown", (e) => {

            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggle();
            }

        });

    });

}

initExpandableCards(".timeline-content", ".timeline-detail");
initExpandableCards(".fact-card", ".fact-detail");
initExpandableCards(".accordion-item", ".accordion-body");


// ================================
// HIỆU ỨNG XUẤT HIỆN
// ================================

const observer = new IntersectionObserver(

    (entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");

            }

        });

    },

    {
        threshold: 0.15
    }

);


document
    .querySelectorAll(
        ".architecture-card, .value-card, .visit-card, .timeline-item"
    )
    .forEach(element => {

        observer.observe(element);

    });