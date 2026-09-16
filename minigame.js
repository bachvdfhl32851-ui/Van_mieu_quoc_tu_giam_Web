// mini game - xep bia tien si
// ================================================


(function () {

    const canvas = document.getElementById("gameCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const W = canvas.width;
    const H = canvas.height;

    const BLOCK_H = 34;
    const MIN_OVERLAP = 10;
    const TOP_MARGIN = 50;

    // vi tri lung rua
    const PLATFORM_Y = Math.round(H * 0.771);

    // khoang trong de xep bia
    const GATE_LEFT = Math.round(W * 0.39);
    const GATE_RIGHT = Math.round(W * 0.603);
    const GATE_CENTER = (GATE_LEFT + GATE_RIGHT) / 2;

    // chieu rong bia
    const BASE_W = 130;
    const BASE_X = GATE_CENTER - BASE_W / 2;

    const BASE_SPEED = 0.09;
    const SPEED_STEP = 0.004;
    const MAX_SPEED = 0.30;
    const CHECKPOINT_EVERY = 1;
    const QUIZ_SECONDS = 10;

    // mau bia
    const STONE_TONES = [
        { light: "#cdc4b3", dark: "#9d947f", edge: "#5c5546" },
        { light: "#c3bcae", dark: "#948c78", edge: "#544d3f" },
        { light: "#d3cabb", dark: "#a59a83", edge: "#5f5747" },
        { light: "#bdb4a2", dark: "#8b8270", edge: "#4f483b" },
    ];

    //======== trang thai game ==========

    let state = "start";
    let baseline = { x: BASE_X, w: BASE_W };
    let blocks = [];
    let current = null;
    let score = 0;
    let best = Number(localStorage.getItem("vanmieu-stack-best") || 0);
    let fallingPieces = [];
    let lastTime = 0;

    let buff = null;
    let pendingShrink = false;

    let usedQuestions = [];
    let quizTimer = null;

    // ======== bo cau hoi ===========

    const QUESTIONS = [
        { q: "Văn Miếu được khởi dựng vào năm nào?", options: ["1010", "1070", "1076"], correct: 1 },
        { q: "Ai cho lập Quốc Tử Giám năm 1076?", options: ["Lý Thánh Tông", "Lý Nhân Tông", "Lê Thánh Tông"], correct: 1 },
        { q: "Hiện còn bao nhiêu tấm bia Tiến sĩ tại Văn Miếu?", options: ["62", "72", "82"], correct: 2 },
        { q: "Bia Tiến sĩ được UNESCO ghi danh vào năm nào?", options: ["2010", "2011", "2012"], correct: 1 },
        { q: "Câu \"Hiền tài là nguyên khí của quốc gia\" được khắc từ năm nào?", options: ["1442", "1484", "1779"], correct: 1 },
        { q: "Khuê Văn Các được xây dựng vào thời nào?", options: ["Thời Lý", "Thời Lê", "Thời Nguyễn"], correct: 2 },
        { q: "Sao Khuê tượng trưng cho điều gì?", options: ["Nông nghiệp", "Văn học, tri thức", "Chiến tranh"], correct: 1 },
        { q: "Các tấm bia Tiến sĩ được đặt trên lưng con vật nào?", options: ["Rồng", "Rùa", "Kỳ lân"], correct: 1 },
        { q: "Quốc Tử Giám từng được dời vào kinh đô nào thời Nguyễn?", options: ["Huế", "Đà Nẵng", "Sài Gòn"], correct: 0 },
        { q: "82 bia Tiến sĩ tương ứng với khoảng thời gian khoa thi nào?", options: ["1442 - 1779", "1075 - 1400", "1802 - 1900"], correct: 0 },
        { q: "Ai là người thầy được thờ tại Khu Thái Học?", options: ["Nguyễn Trãi", "Chu Văn An", "Thân Nhân Trung"], correct: 1 },
        { q: "82 bia Tiến sĩ được công nhận Bảo vật Quốc gia năm nào?", options: ["2013", "2015", "2018"], correct: 1 },
        { q: "Giếng Thiên Quang có hình gì?", options: ["Hình tròn", "Hình vuông", "Hình lục giác"], correct: 1 },
        { q: "Văn Miếu - Quốc Tử Giám tọa lạc ở thành phố nào?", options: ["Hà Nội", "Huế", "TP. Hồ Chí Minh"], correct: 0 },
    ];

    // ======= tho khi thua ========

    const FUNNY_POEMS = [
        "Bia đá nghiêng nghiêng rồi đổ ập,\nSĩ tử giật mình rớt bút lông.\nCông danh chưa toại đà tan giấc,\nThôi để khoa sau thử vận hồng!",
        "Xếp bia chưa vững đà nghiêng ngả,\nRùa đá thở dài: \"Nặng quá em ơi!\"\nBảng vàng còn đó chưa kịp chạm,\nHẹn khoa thi tới, cố lên người ơi!",
        "Một tầng, hai tầng, rồi... rầm một cái,\nBia đá tan đàn như pháo hoa rơi.\nSĩ tử ngẩn ngơ nhìn trời than thở,\nVăn hay chữ tốt cũng thua... tay run!",
        "Tháp bia đổ giữa sân rồng vắng,\nQuan giám khảo lắc đầu cười khẽ ngâm:\n\"Học tài thi phận đôi khi lỡ,\nChơi lại lần này ắt sẽ hơn!\"",
    ];

    // ========= tien ich =========

    function pickQuestion() {
        if (usedQuestions.length >= QUESTIONS.length) usedQuestions = [];
        let idx;
        do {
            idx = Math.floor(Math.random() * QUESTIONS.length);
        } while (usedQuestions.includes(idx));
        usedQuestions.push(idx);
        return QUESTIONS[idx];
    }

    function pickPoem() {
        return FUNNY_POEMS[Math.floor(Math.random() * FUNNY_POEMS.length)];
    }

    function topRef() {
        return blocks.length ? blocks[blocks.length - 1] : baseline;
    }

    // khoang cach giua cac tam bia
    function getSpacing() {
        const available = PLATFORM_Y - TOP_MARGIN;
        const needed = (blocks.length + 1) * BLOCK_H;
        if (needed <= available) return BLOCK_H;
        return available / (blocks.length + 1);
    }

    // vi tri y
    function blockTopY(i, spacing) {
        return PLATFORM_Y - (i + 1) * spacing;
    }

    // ======== khoi tao / reset ===========

    function resetGame() {
        blocks = [];
        score = 0;
        buff = null;
        pendingShrink = false;
        fallingPieces = [];
        spawnNextMoving();
        updateHud();
        updateBuffBadge();
    }

    function spawnNextMoving() {
        const top = topRef();

        let w = top.w;

        if (buff && buff.type === "bigger" && buff.remaining > 0) {
            w = Math.min(w * 1.8, W - 30);
        }

        if (pendingShrink) {
            w = Math.max(w * 0.75, 26);
            pendingShrink = false;
        }

        let speed = Math.min(BASE_SPEED + score * SPEED_STEP, MAX_SPEED);

        if (buff && buff.type === "slow" && buff.remaining > 0) {
            speed *= 0.5;
        }

        current = {
            x: 16,
            w: w,
            speed: speed,
            t: Math.random() * Math.PI,
        };
    }

    // ======== vong lap chinh =========

    function loop(time) {
        if (!lastTime) lastTime = time;
        const dt = Math.min(time - lastTime, 40);
        lastTime = time;

        if (state === "playing") update(dt);
        draw();

        requestAnimationFrame(loop);
    }

    function update(dt) {
        if (current) {
            current.t += dt * current.speed * 0.02;
            const range = W - current.w - 32;
            current.x = 16 + (Math.sin(current.t) * 0.5 + 0.5) * range;
        }

        for (let i = fallingPieces.length - 1; i >= 0; i--) {
            const p = fallingPieces[i];
            p.vy += dt * 0.0025;
            p.y += p.vy * dt;
            p.rot += p.vr * dt;
            p.alpha -= dt * 0.0016;
            if (p.alpha <= 0 || p.y > H + 60) fallingPieces.splice(i, 1);
        }

        for (const b of blocks) {
            if (b.dropOffset > 0) {
                b.dropOffset = Math.max(0, b.dropOffset - dt * 0.09);
            }
        }
    }

    function drop() {
        if (state !== "playing" || !current) return;

        const top = topRef();
        let moving = { x: current.x, w: current.w };

        const autoAlign = buff && buff.type === "autoalign" && buff.remaining > 0;

        if (autoAlign) {
            moving = { x: top.x, w: top.w };
            buff.remaining--;
            if (buff.remaining <= 0) buff = null;
        }

        const left = Math.max(top.x, moving.x);
        const right = Math.min(top.x + top.w, moving.x + moving.w);
        const overlap = right - left;

        if (overlap < MIN_OVERLAP) {
            triggerGameOver();
            return;
        }

        const spacing = getSpacing();
        const landedY = blockTopY(blocks.length, spacing);

        if (moving.x < left - 0.5) {
            spawnFallingPiece(moving.x, landedY, left - moving.x);
        }
        if (moving.x + moving.w > right + 0.5) {
            spawnFallingPiece(right, landedY, moving.x + moving.w - right);
        }

        blocks.push({
            x: left,
            w: overlap,
            tone: blocks.length % STONE_TONES.length,
            dropOffset: 10,
        });

        score++;

        if (buff && buff.type !== "autoalign") {
            buff.remaining--;
            if (buff.remaining <= 0) buff = null;
        }

        current = null;

        updateHud();
        updateBuffBadge();

        if (score % CHECKPOINT_EVERY === 0) {
            openQuiz();
        } else {
            spawnNextMoving();
        }
    }

    function spawnFallingPiece(x, y, w) {
        fallingPieces.push({
            x, y, w,
            h: BLOCK_H,
            vy: 0.15,
            rot: 0,
            vr: (Math.random() - 0.5) * 0.006,
            alpha: 1,
        });
    }

    // ========= ve =========

    function draw() {
        ctx.clearRect(0, 0, W, H);

        const spacing = getSpacing();
        const drawH = Math.min(BLOCK_H, spacing * 0.92);

        for (let i = 0; i < blocks.length; i++) {
            const b = blocks[i];
            const y = blockTopY(i, spacing) + b.dropOffset;
            drawBlock(b.x, y, b.w, drawH, STONE_TONES[b.tone]);
        }

        for (const p of fallingPieces) {
            drawFalling(p);
        }

        if (state === "playing" && current) {
            const nextY = blockTopY(blocks.length, spacing);
            drawBlock(current.x, nextY, current.w, drawH, STONE_TONES[blocks.length % STONE_TONES.length]);
        }
    }

    function drawBlock(x, y, w, h, tone) {
        const grad = ctx.createLinearGradient(0, y, 0, y + h);
        grad.addColorStop(0, tone.light);
        grad.addColorStop(1, tone.dark);

        ctx.fillStyle = grad;
        ctx.strokeStyle = tone.edge;
        ctx.lineWidth = 2;

        roundRect(ctx, x, y, w, h, Math.min(6, h / 4));
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "rgba(0,0,0,0.18)";
        ctx.lineWidth = 1;
        roundRect(ctx, x + 3, y + 3, Math.max(w - 6, 1), Math.max(h - 6, 1), 3);
        ctx.stroke();

        const glyphCount = Math.max(2, Math.floor(w / 20));
        const gap = w / (glyphCount + 1);

        ctx.fillStyle = "rgba(55,45,35,0.5)";
        for (let i = 1; i <= glyphCount; i++) {
            const gx = x + gap * i;
            ctx.fillRect(gx - 1.2, y + h * 0.22, 2.4, h * 0.56);
        }
    }

    function drawFalling(p) {
        ctx.save();
        ctx.globalAlpha = Math.max(p.alpha, 0);
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate(p.rot);

        const tone = STONE_TONES[0];
        const grad = ctx.createLinearGradient(0, -p.h / 2, 0, p.h / 2);
        grad.addColorStop(0, tone.light);
        grad.addColorStop(1, tone.dark);

        ctx.fillStyle = grad;
        ctx.strokeStyle = tone.edge;
        ctx.lineWidth = 2;
        roundRect(ctx, -p.w / 2, -p.h / 2, p.w, p.h, 5);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    function roundRect(c, x, y, w, h, r) {
        r = Math.max(0, Math.min(r, w / 2, h / 2));
        c.beginPath();
        c.moveTo(x + r, y);
        c.arcTo(x + w, y, x + w, y + h, r);
        c.arcTo(x + w, y + h, x, y + h, r);
        c.arcTo(x, y + h, x, y, r);
        c.arcTo(x, y, x + w, y, r);
        c.closePath();
    }

    // ======== hub ========

    const scoreEl = document.getElementById("gameScore");
    const bestEl = document.getElementById("gameBest");
    const buffBadge = document.getElementById("buffBadge");

    function updateHud() {
        if (scoreEl) scoreEl.textContent = score;
        if (score > best) {
            best = score;
            localStorage.setItem("vanmieu-stack-best", String(best));
        }
        if (bestEl) bestEl.textContent = best;
    }

    const BUFF_LABELS = {
        bigger: "Bia to gấp đôi",
        slow: "Đu đưa chậm lại",
        autoalign: "Tự động căn chỉnh",
    };

    function updateBuffBadge() {
        if (!buffBadge) return;
        if (buff && buff.remaining > 0) {
            buffBadge.textContent = BUFF_LABELS[buff.type] + " ×" + buff.remaining;
            buffBadge.classList.add("show");
        } else {
            buffBadge.classList.remove("show");
        }
    }

    // ========= bia da tri tue ==========

    const quizOverlay = document.getElementById("quizOverlay");
    const quizQuestionEl = document.getElementById("quizQuestion");
    const quizOptionsEl = document.getElementById("quizOptions");
    const quizBarEl = document.getElementById("quizBar");
    const quizFeedbackEl = document.getElementById("quizFeedback");

    function openQuiz() {
        state = "quiz";

        const question = pickQuestion();

        if (quizQuestionEl) quizQuestionEl.textContent = question.q;
        if (quizFeedbackEl) {
            quizFeedbackEl.textContent = "";
            quizFeedbackEl.className = "quiz-feedback";
        }

        if (quizOptionsEl) {
            quizOptionsEl.innerHTML = "";

            question.options.forEach((opt, i) => {
                const btn = document.createElement("button");
                btn.className = "quiz-option";
                btn.textContent = opt;
                btn.addEventListener("click", () => answerQuiz(i === question.correct));
                quizOptionsEl.appendChild(btn);
            });
        }

        if (quizOverlay) quizOverlay.classList.add("show");

        if (quizBarEl) {
            quizBarEl.style.transition = "none";
            quizBarEl.style.width = "100%";
            requestAnimationFrame(() => {
                quizBarEl.style.transition = `width ${QUIZ_SECONDS}s linear`;
                quizBarEl.style.width = "0%";
            });
        }

        clearTimeout(quizTimer);
        quizTimer = setTimeout(() => answerQuiz(false, true), QUIZ_SECONDS * 1000);
    }

    function answerQuiz(isCorrect, timedOut) {
        if (state !== "quiz") return;

        clearTimeout(quizTimer);

        if (quizOptionsEl) {
            quizOptionsEl.querySelectorAll(".quiz-option").forEach(b => b.disabled = true);
        }

        if (isCorrect) {
            const types = ["bigger", "slow", "autoalign"];
            const type = types[Math.floor(Math.random() * types.length)];
            const remaining = type === "bigger" ? 1 : 3;
            buff = { type, remaining };

            if (quizFeedbackEl) {
                quizFeedbackEl.textContent = "Chính xác! Nhận buff: " + BUFF_LABELS[type];
                quizFeedbackEl.className = "quiz-feedback correct";
            }
        } else {
            pendingShrink = true;

            if (quizFeedbackEl) {
                quizFeedbackEl.textContent = timedOut
                    ? "Hết giờ! Bia tiếp theo hơi nhỏ lại một chút..."
                    : "Sai rồi! Bia tiếp theo hơi nhỏ lại một chút...";
                quizFeedbackEl.className = "quiz-feedback wrong";
            }
        }

        updateBuffBadge();

        setTimeout(() => {
            if (quizOverlay) quizOverlay.classList.remove("show");
            state = "playing";
            spawnNextMoving();
        }, 1200);
    }

    // ========= bat dau / ket thuc ===========

    const startOverlay = document.getElementById("startOverlay");
    const gameoverOverlay = document.getElementById("gameoverOverlay");
    const finalScoreEl = document.getElementById("finalScore");
    const finalBestEl = document.getElementById("finalBest");
    const poemEl = document.getElementById("gameoverPoem");

    function startGame() {
        if (startOverlay) startOverlay.classList.remove("show");
        if (gameoverOverlay) gameoverOverlay.classList.remove("show");
        resetGame();
        state = "playing";
    }

    function triggerGameOver() {
        state = "gameover";
        current = null;

        if (finalScoreEl) finalScoreEl.textContent = score;
        if (finalBestEl) finalBestEl.textContent = best;
        if (poemEl) poemEl.textContent = pickPoem();
        if (gameoverOverlay) gameoverOverlay.classList.add("show");
    }

    // ======== cac su kien ==========

    canvas.addEventListener("click", () => {
        if (state === "playing") drop();
    });

    document.addEventListener("keydown", (e) => {
        if ((e.code === "Space" || e.code === "Enter") && state === "playing") {
            e.preventDefault();
            drop();
        }
    });

    const startBtn = document.getElementById("startGameBtn");
    if (startBtn) startBtn.addEventListener("click", startGame);

    const retryBtn = document.getElementById("retryGameBtn");
    if (retryBtn) retryBtn.addEventListener("click", startGame);

    if (bestEl) bestEl.textContent = best;

    resetGame();
    state = "start";
    requestAnimationFrame(loop);

})();
