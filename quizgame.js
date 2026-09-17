// mini game - bang vang khoi tri (trac nghiem 3 ky thi)
// ================================================

(function () {

    const startOverlay = document.getElementById("qgStartOverlay");
    if (!startOverlay) return;

    const startBtn = document.getElementById("qgStartBtn");
    const retryBtn = document.getElementById("qgRetryBtn");

    const stageLabelEl = document.getElementById("qgStageLabel");
    const progressEl = document.getElementById("qgProgress");
    const progressFillEl = document.getElementById("qgProgressFill");

    const questionBox = document.getElementById("qgQuestionBox");
    const questionEl = document.getElementById("qgQuestion");
    const optionsEl = document.getElementById("qgOptions");
    const feedbackEl = document.getElementById("qgFeedback");

    const resultOverlay = document.getElementById("qgResultOverlay");
    const resultBadgeEl = document.getElementById("qgResultBadge");
    const resultTitleEl = document.getElementById("qgResultTitle");
    const resultDescEl = document.getElementById("qgResultDesc");
    const finalScoreEl = document.getElementById("qgFinalScore");
    const rewardBox = document.getElementById("qgRewardBox");
    const rewardCodeEl = document.getElementById("qgRewardCode");

    const examSteps = document.querySelectorAll(".exam-step");
    const examLines = [
        document.getElementById("examLine0"),
        document.getElementById("examLine1"),
    ];

    // ======== 3 ky thi - 10 cau hoi ========

    const STAGES = [
        {
            key: "huong",
            label: "THI HƯƠNG",
            questions: [
                {
                    q: "Vua Lý Thánh Tông cho khởi dựng Văn Miếu vào năm nào?",
                    options: ["1010", "1070", "1802"],
                    correct: 1,
                },
                {
                    q: "Quốc Tử Giám được xây dựng bên cạnh Văn Miếu năm 1076, dưới thời vua nào?",
                    options: ["Lý Thánh Tông", "Lý Nhân Tông", "Lê Thánh Tông"],
                    correct: 1,
                },
                {
                    q: "Văn Miếu được dựng lên ban đầu để thờ ai?",
                    options: ["Khổng Tử", "Ngọc Hoàng", "Thành hoàng làng"],
                    correct: 0,
                },
            ],
        },
        {
            key: "hoi",
            label: "THI HỘI",
            questions: [
                {
                    q: "Ai được thờ tại Nhà Hậu đường, Khu Thái Học với vai trò người thầy mẫu mực của nền giáo dục Việt Nam?",
                    options: ["Nguyễn Trãi", "Chu Văn An", "Ngô Sĩ Liên"],
                    correct: 1,
                },
                {
                    q: "Câu nói \"Hiền tài là nguyên khí của quốc gia\" khắc trên bia Tiến sĩ là của ai?",
                    options: ["Thân Nhân Trung", "Chu Văn An", "Lê Thánh Tông"],
                    correct: 0,
                },
                {
                    q: "Vua nào ra sắc lệnh khởi dựng những tấm bia Tiến sĩ đầu tiên vào năm 1484?",
                    options: ["Lý Nhân Tông", "Lê Thánh Tông", "Gia Long"],
                    correct: 1,
                },
            ],
        },
        {
            key: "dinh",
            label: "THI ĐÌNH",
            questions: [
                {
                    q: "82 bia Tiến sĩ hiện còn tại Văn Miếu ghi danh tổng cộng bao nhiêu vị Tiến sĩ?",
                    options: ["828", "1.070", "1.304"],
                    correct: 2,
                },
                {
                    q: "Tấm bia Tiến sĩ đầu tiên (dựng năm 1484) ghi lại khoa thi nào, có Nguyễn Trãi làm giám khảo?",
                    options: ["Khoa thi Nhâm Tuất 1442", "Khoa thi Giáp Thìn 1484", "Khoa thi Mậu Tuất 1478"],
                    correct: 0,
                },
                {
                    q: "82 bia Tiến sĩ được UNESCO ghi danh Di sản tư liệu thế giới vào năm nào?",
                    options: ["2010", "2011", "2015"],
                    correct: 1,
                },
                {
                    q: "Các tấm bia Tiến sĩ được đặt trên lưng con vật nào - biểu tượng cho sự bền vững?",
                    options: ["Rồng", "Rùa", "Kỳ lân"],
                    correct: 1,
                },
            ],
        },
    ];

    const FLAT = [];
    STAGES.forEach((stage, sIdx) => {
        stage.questions.forEach((q) => FLAT.push({ ...q, stage: sIdx }));
    });

    const TOTAL = FLAT.length;

    // ======== danh hieu theo diem so ========

    const RANKS = [
        {
            min: TOTAL,
            title: "Trạng Nguyên online",
            badge: "",
            desc: "Đỗ đầu cả ba kỳ thi - danh hiệu tối cao của trường thi xưa. Xin chúc mừng vị Trạng Nguyên!",
            reward: true,
        },
        {
            min: Math.ceil(TOTAL * 0.8),
            title: "Hoàng Giáp",
            badge: "",
            desc: "Một trình độ vô cùng xuất sắc, chỉ còn thiếu chút nữa để chạm tới bảng vàng cao nhất.",
            reward: false,
        },
        {
            min: Math.ceil(TOTAL * 0.6),
            title: "Tiến Sĩ",
            badge: "",
            desc: "Đỗ Đại khoa, tên sẽ được lưu trên bia đá - một thành tích rất đáng tự hào.",
            reward: false,
        },
        {
            min: Math.ceil(TOTAL * 0.3),
            title: "Cử Nhân",
            badge: "",
            desc: "Đã vượt qua Thi Hương, nhưng cần dùi mài kinh sử thêm để tiến xa hơn.",
            reward: false,
        },
        {
            min: 0,
            title: "Sĩ Tử",
            badge: "",
            desc: "Con đường khoa cử còn dài, hãy đèn sách và quay lại ứng thí lần nữa!",
            reward: false,
        },
    ];

    function getRank(score) {
        return RANKS.find((r) => score >= r.min);
    }

    // ======== trang thai ========

    let index = 0;
    let score = 0;
    let answered = false;

    function updateExamSteps(stageIdx) {
        examSteps.forEach((el) => {
            const s = Number(el.dataset.stage);
            el.classList.toggle("active", s === stageIdx);
            el.classList.toggle("done", s < stageIdx);
        });
        examLines.forEach((el, i) => {
            if (el) el.classList.toggle("done", i < stageIdx);
        });
    }

    function updateHud() {
        const q = FLAT[index];
        const stage = STAGES[q.stage];
        if (stageLabelEl) stageLabelEl.textContent = stage.label;
        if (progressEl) progressEl.textContent = "Câu " + (index + 1) + "/" + TOTAL;
        if (progressFillEl) progressFillEl.style.width = (index / TOTAL) * 100 + "%";
        updateExamSteps(q.stage);
    }

    function showQuestion() {
        answered = false;

        const q = FLAT[index];
        updateHud();

        if (questionEl) questionEl.textContent = q.q;
        if (feedbackEl) {
            feedbackEl.textContent = "";
            feedbackEl.className = "quiz-feedback";
        }

        if (optionsEl) {
            optionsEl.innerHTML = "";
            q.options.forEach((opt, i) => {
                const btn = document.createElement("button");
                btn.className = "quiz-option";
                btn.textContent = opt;
                btn.addEventListener("click", () => selectAnswer(btn, i, q.correct));
                optionsEl.appendChild(btn);
            });
        }
    }

    function selectAnswer(btn, chosen, correctIdx) {
        if (answered) return;
        answered = true;

        const isCorrect = chosen === correctIdx;
        if (isCorrect) score++;

        if (optionsEl) {
            optionsEl.querySelectorAll(".quiz-option").forEach((b, i) => {
                b.disabled = true;
                if (i === correctIdx) b.classList.add("correct");
                else if (i === chosen) b.classList.add("wrong");
            });
        }

        if (feedbackEl) {
            feedbackEl.textContent = isCorrect ? "Chính xác!" : "Chưa đúng rồi!";
            feedbackEl.className = "quiz-feedback " + (isCorrect ? "correct" : "wrong");
        }

        setTimeout(() => {
            index++;
            if (index >= TOTAL) {
                showResult();
            } else {
                showQuestion();
            }
        }, 1000);
    }

    function showResult() {
        if (progressFillEl) progressFillEl.style.width = "100%";
        if (progressEl) progressEl.textContent = "Câu " + TOTAL + "/" + TOTAL;
        updateExamSteps(STAGES.length);

        if (questionBox) questionBox.classList.remove("show");

        const rank = getRank(score);

        if (resultBadgeEl) resultBadgeEl.textContent = rank.badge;
        if (resultTitleEl) resultTitleEl.textContent = rank.title;
        if (resultDescEl) resultDescEl.textContent = rank.desc;
        if (finalScoreEl) finalScoreEl.textContent = score + "/" + TOTAL;

        if (rewardBox) rewardBox.style.display = rank.reward ? "flex" : "none";
        if (rank.reward && rewardCodeEl) {
            rewardCodeEl.textContent = "VANMIEU-TRANGNGUYEN" + new Date().getFullYear();
        }

        if (resultOverlay) resultOverlay.classList.add("show");
    }

    function startQuiz() {
        index = 0;
        score = 0;

        if (startOverlay) startOverlay.classList.remove("show");
        if (resultOverlay) resultOverlay.classList.remove("show");
        if (questionBox) questionBox.classList.add("show");

        showQuestion();
    }

    if (startBtn) startBtn.addEventListener("click", startQuiz);
    if (retryBtn) retryBtn.addEventListener("click", startQuiz);

})();
