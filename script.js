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

    const drawerThemeIcon = document.getElementById("drawerThemeIcon");
    if (drawerThemeIcon) {
        drawerThemeIcon.innerHTML = theme === "dark" ? drawerIcons.themeSun : drawerIcons.theme;
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
// thanh menu dien thoai (drawer)
// ================================

const menuBtn = document.getElementById("menuBtn");

// nhom nut theme-toggle + menu-btn lai voi nhau ben phai header
const headerEl = document.querySelector(".header");

if (headerEl && menuBtn) {

    const headerActions = document.createElement("div");
    headerActions.className = "header-actions";

    headerEl.insertBefore(headerActions, themeToggle || menuBtn);

    if (themeToggle) headerActions.appendChild(themeToggle);

    headerActions.appendChild(menuBtn);

}

const drawerIcons = {

    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9a1 1 0 0 0 1 1H10v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20h3.5a1 1 0 0 0 1-1v-9"/></svg>',

    space: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M9 21v-6h6v6"/></svg>',

    story: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>',

    values: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="m8.5 13.5-2 8 5.5-3 5.5 3-2-8"/></svg>',

    library: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h6a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H2Z"/><path d="M22 4h-6a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H22Z"/></svg>',

    facts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.6 4.3L6 9l4.4 1.7L12 15l1.6-4.3L18 9l-4.4-1.7Z"/><path d="M19 15.5 18.2 17l-1.5.8.5-1.7.8-1.6Z"/><path d="M5 16.5 4.4 18l-1.4.7.5-1.6.7-1.4Z"/></svg>',

    game: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="12" rx="4"/><path d="M8 11v4M6 13h4"/><circle cx="16" cy="11.5" r="1"/><circle cx="18.5" cy="14" r="1"/></svg>',

    visit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.4"/></svg>',

    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',

    theme: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>',

    themeSun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.3"/><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>',

    team: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19.5c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5"/><circle cx="17" cy="8.5" r="2.4"/><path d="M15.2 14.3c2.4.3 4.3 2.3 4.3 5.2"/></svg>'

};

const drawerLinks = [

    { href: "index.html", label: "Trang chủ", icon: "home" },

    {
        label: "Không gian Văn Miếu",
        icon: "space",
        children: [
            { href: "architecture.html", label: "Kiến trúc tổng quan" },
            { href: "khue-van-cac.html", label: "Khuê Văn Các" },
            { href: "gieng-thien-quang.html", label: "Giếng Thiên Quang" },
            { href: "khu-thai-hoc.html", label: "Khu Thái Học" },
            { href: "vuon-bia-tien-si.html", label: "Vườn bia Tiến sĩ" },
            { href: "stelae.html", label: "82 Bia Tiến sĩ" }
        ]
    },

    { href: "history.html", label: "Lịch sử", icon: "story" },

    { href: "values.html", label: "Giá trị", icon: "values" },

    { href: "dich-vu.html", label: "Dịch vụ", icon: "facts" },

    { href: "thu-vien.html", label: "Thư viện", icon: "library" },

    { href: "facts.html", label: "Sự thật thú vị", icon: "facts" },

    { href: "game.html", label: "Mini Game", icon: "game" },

    { href: "visit.html", label: "Tham quan", icon: "visit" },

    { href: "team.html", label: "Thành viên", icon: "team" }

];

function buildDrawer() {

    const currentPage = (location.pathname.split("/").pop() || "index.html");

    const overlay = document.createElement("div");
    overlay.className = "drawer-overlay";
    overlay.id = "drawerOverlay";

    const drawer = document.createElement("aside");
    drawer.className = "mobile-drawer";
    drawer.id = "mobileDrawer";
    drawer.setAttribute("aria-hidden", "true");

    let navHtml = "";

    drawerLinks.forEach((item, i) => {

        if (item.children) {

            const isChildActive = item.children.some(c => c.href === currentPage);

            navHtml += `
                <button class="drawer-expand${isChildActive ? " open" : ""}" data-submenu="sub-${i}" aria-expanded="${isChildActive}">
                    <span class="drawer-link-main">
                        <i class="drawer-icon">${drawerIcons[item.icon]}</i>
                        ${item.label}
                    </span>
                    <i class="drawer-chevron">${drawerIcons.chevron}</i>
                </button>
                <div class="drawer-submenu" id="sub-${i}" ${isChildActive ? "" : "hidden"}>
                    ${item.children.map(c => `
                        <a href="${c.href}" class="${c.href === currentPage ? "current" : ""}">${c.label}</a>
                    `).join("")}
                </div>
            `;

        } else {

            navHtml += `
                <a href="${item.href}" class="drawer-link${item.href === currentPage ? " current" : ""}">
                    <i class="drawer-icon">${drawerIcons[item.icon]}</i>
                    ${item.label}
                </a>
            `;

        }

    });

    drawer.innerHTML = `
        <div class="drawer-header">
            <div class="drawer-logo">
                <div class="drawer-logo-symbol">文</div>
                <div>
                    <span>VĂN MIẾU</span>
                    <small>QUỐC TỬ GIÁM</small>
                </div>
            </div>
            <button class="drawer-close" id="drawerClose" aria-label="Đóng menu">×</button>
        </div>
        <nav class="drawer-nav">
            ${navHtml}
        </nav>
        <div class="drawer-footer">
            <button class="drawer-theme" id="drawerTheme">
                <i class="drawer-icon" id="drawerThemeIcon">${rootEl.getAttribute("data-theme") === "dark" ? drawerIcons.themeSun : drawerIcons.theme}</i>
                Chuyển giao diện sáng / tối
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    return { overlay, drawer };

}

if (menuBtn) {

    const { overlay, drawer } = buildDrawer();

    function openDrawer() {
        drawer.classList.add("active");
        overlay.classList.add("active");
        drawer.setAttribute("aria-hidden", "false");
        document.body.classList.add("drawer-open");
    }

    function closeDrawer() {
        drawer.classList.remove("active");
        overlay.classList.remove("active");
        drawer.setAttribute("aria-hidden", "true");
        document.body.classList.remove("drawer-open");
    }

    menuBtn.addEventListener("click", openDrawer);

    overlay.addEventListener("click", closeDrawer);

    drawer.querySelector("#drawerClose").addEventListener("click", closeDrawer);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeDrawer();
    });

    drawer.querySelectorAll(".drawer-nav a").forEach(link => {
        link.addEventListener("click", closeDrawer);
    });

    drawer.querySelectorAll(".drawer-expand").forEach(btn => {

        btn.addEventListener("click", () => {

            const sub = document.getElementById(btn.dataset.submenu);
            const isOpen = btn.classList.contains("open");

            btn.classList.toggle("open", !isOpen);
            btn.setAttribute("aria-expanded", String(!isOpen));

            if (sub) sub.hidden = isOpen;

        });

    });

    const drawerThemeBtn = drawer.querySelector("#drawerTheme");

    if (drawerThemeBtn) {

        drawerThemeBtn.addEventListener("click", () => {

            const newTheme = rootEl.getAttribute("data-theme") === "dark" ? "light" : "dark";

            localStorage.setItem("theme", newTheme);

            applyTheme(newTheme);

        });

    }

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
// thanh vien (sang lap / phoi hop)
// ================================

document.querySelectorAll(".team-column-header").forEach(header => {

    header.addEventListener("click", () => {

        const isOpen = header.getAttribute("aria-expanded") === "true";

        header.setAttribute("aria-expanded", isOpen ? "false" : "true");

    });

});


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
