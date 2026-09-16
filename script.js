// chuyen trang muot
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
// che do sang / toi
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
// che do dien thoai
// ================================

const menuBtn = document.getElementById("menuBtn");
const navbar = document.querySelector(".navbar");

if (menuBtn && navbar) {

    menuBtn.addEventListener("click", () => {

        navbar.classList.toggle("active");

    });



    document.querySelectorAll(".navbar a").forEach(link => {

        link.addEventListener("click", () => {

            navbar.classList.remove("active");

        });

    });

}


// ================================
// nut ve dau trang
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
// mo / dong noi dung chi tiet
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

            // dong tat ca cac card khac cung nhom

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
// gia tri
// ================================

const valuesGrid = document.querySelector(".values-grid");

if (valuesGrid) {

    const valueCards = valuesGrid.querySelectorAll(".value-card");

    function toggleValueCard(card) {

        const isOpen = card.classList.contains("is-open");

        valueCards.forEach(c => {
            c.classList.remove("is-open");
            c.setAttribute("aria-expanded", "false");
        });

        if (isOpen) {
            valuesGrid.classList.remove("has-expanded");
        } else {
            card.classList.add("is-open");
            card.setAttribute("aria-expanded", "true");
            valuesGrid.classList.add("has-expanded");
        }

    }

    valueCards.forEach(card => {

        card.addEventListener("click", () => toggleValueCard(card));

        card.addEventListener("keydown", (e) => {

            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleValueCard(card);
            }

        });

    });

}


// ================================
// hieu ung xuat hien
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
        ".architecture-card, .value-card, .visit-card, .timeline-item, .library-card"
    )
    .forEach(element => {

        observer.observe(element);

    });


// ================================
// lightbox xem anh thu vien
// ================================

const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));

if (galleryItems.length) {

    let currentIndex = 0;

    // tao lightbox

    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-label", "Xem ảnh phóng to");

    lightbox.innerHTML = `
        <button class="lightbox-btn lightbox-close" aria-label="Đóng">✕</button>
        <button class="lightbox-btn lightbox-prev" aria-label="Ảnh trước">‹</button>
        <button class="lightbox-btn lightbox-next" aria-label="Ảnh sau">›</button>
        <figure class="lightbox-figure">
            <img class="lightbox-img" src="" alt="">
            <figcaption class="lightbox-caption">
                <h3></h3>
                <p></p>
                <div class="lightbox-counter"></div>
            </figcaption>
        </figure>
    `;

    document.documentElement.appendChild(lightbox);

    const lbImg = lightbox.querySelector(".lightbox-img");
    const lbTitle = lightbox.querySelector(".lightbox-caption h3");
    const lbSource = lightbox.querySelector(".lightbox-caption p");
    const lbCounter = lightbox.querySelector(".lightbox-counter");

    function showImage(index) {

        currentIndex = (index + galleryItems.length) % galleryItems.length;

        const item = galleryItems[currentIndex];
        const img = item.querySelector("img");
        const title = item.querySelector(".gallery-caption h3");
        const source = item.querySelector(".gallery-caption p");

        lbImg.src = img.getAttribute("src");
        lbImg.alt = img.getAttribute("alt") || "";

        lbTitle.textContent = title ? title.textContent.trim() : "";
        lbSource.textContent = source ? source.textContent.trim() : "";
        lbCounter.textContent = (currentIndex + 1) + " / " + galleryItems.length;

    }

    function openLightbox(index) {
        showImage(index);
        lightbox.classList.add("show");
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        lightbox.classList.remove("show");
        document.body.style.overflow = "";
    }

    galleryItems.forEach((item, index) => {

        item.setAttribute("tabindex", "0");
        item.setAttribute("role", "button");

        item.addEventListener("click", () => openLightbox(index));

        item.addEventListener("keydown", (e) => {

            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openLightbox(index);
            }

        });

    });

    lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);

    lightbox.querySelector(".lightbox-prev").addEventListener("click", (e) => {
        e.stopPropagation();
        showImage(currentIndex - 1);
    });

    lightbox.querySelector(".lightbox-next").addEventListener("click", (e) => {
        e.stopPropagation();
        showImage(currentIndex + 1);
    });

    // bam ra nen ngoai de dong

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox || e.target.classList.contains("lightbox-figure")) {
            closeLightbox();
        }
    });

    // dieu khien bang ban phim

    document.addEventListener("keydown", (e) => {

        if (!lightbox.classList.contains("show")) return;

        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") showImage(currentIndex - 1);
        if (e.key === "ArrowRight") showImage(currentIndex + 1);

    });

}
