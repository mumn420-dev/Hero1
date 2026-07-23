let familyData = JSON.parse(localStorage.getItem("heroTrackData")) || [];
let currentLang = localStorage.getItem("heroTrackLang") || "en";

// UI Elements
const registerForm = document.getElementById("registerForm");
const childNameInput = document.getElementById("childNameInput");
const childrenContainer = document.getElementById("childrenContainer");
const monthlyReportBtn = document.getElementById("monthlyReportBtn");
const manualResetBtn = document.getElementById("manualResetBtn");
const langToggleBtn = document.getElementById("langToggleBtn");
const monthlyModal = document.getElementById("monthlyModal");
const dayDetailModal = document.getElementById("dayDetailModal");
const modalBody = document.getElementById("modalBody");
const dayDetailBody = document.getElementById("dayDetailBody");
const dayDetailTitle = document.getElementById("dayDetailTitle");

// AuxSystems Confirm Dialog Elements
const confirmModal = document.getElementById("confirmModal");
const confirmTitle = document.getElementById("confirmTitle");
const confirmMessage = document.getElementById("confirmMessage");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");
const confirmOkBtn = document.getElementById("confirmOkBtn");
let pendingConfirmCallback = null;

// Scoring Limits
const MAX_DAILY_PTS = 1000;
const MAX_WEEKLY_PTS = 7000;
const MAX_MONTHLY_PTS = 30000;
const POINTS_PER_TASK = 10;

// Language Translations Object
const translations = {
    en: {
        brand: "HeroTrack :",
        childNameLabel: "Child Name:",
        placeholderName: "Type name here...",
        registerBtn: "🚀 Register Hero",
        leaderboardBtn: "🏆 Leaderboard & Report",
        resetBtn: "🔄 Reset All Data",
        langBtn: "🌐 العربية",
        emptyNotice: "No heroes registered yet. Type a child's name above and click Register!",
        dailyProgress: "Daily Progress:",
        weeklyTarget: "Weekly Target:",
        targetProgress: "Target Progress",
        newChore: "New chore...",
        modalTitle: "🏆 Hall of Champions & Scores",
        weeklyWinner: "👑 Weekly Winner",
        monthlyChampion: "🏆 Monthly Champion",
        noWinner: "No Winner Yet",
        heroCol: "Hero",
        dailyScoreCol: "Daily Score (Max 1k)",
        weeklyScoreCol: "Weekly Score (Max 7k)",
        monthlyScoreCol: "Monthly Score (Max 30k)",
        resetConfirmTitle: "Reset All Data?",
        resetConfirmMsg: "Are you sure you want to reset all daily tasks, progress bars, and scores? This cannot be undone.",
        deleteHeroTitle: "Delete Hero Profile?",
        deleteHeroMsg: "Are you sure you want to delete profile for child: ",
        deleteTaskTitle: "Delete Chore?",
        deleteTaskMsg: "Are you sure you want to delete this chore: ",
        cancel: "Cancel",
        confirmDelete: "Confirm Delete",
        days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
        dayNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        photoText: "📷 Photo",
        remove: "✕ Remove",
        completed: "Completed",
        pending: "Pending"
    },
    ar: {
        brand: "تتبع الأبطال :",
        childNameLabel: "اسم الطفل:",
        placeholderName: "اكتب الاسم هنا...",
        registerBtn: "🚀 تسجيل بطل",
        leaderboardBtn: "🏆 لوحة الصدارة والتقرير",
        resetBtn: "🔄 إعادة ضبط البيانات",
        langBtn: "🌐 English",
        emptyNotice: "لم يتم تسجيل أي بطل بعد. اكتب اسم الطفل أعلاه واضغط على تسجيل!",
        dailyProgress: "التقدم اليومي:",
        weeklyTarget: "الهدف الأسبوعي:",
        targetProgress: "نسبة الإنجاز",
        newChore: "مهمة جديدة...",
        modalTitle: "🏆 لوحة الأبطال والنقاط",
        weeklyWinner: "👑 الفائز الأسبوعي",
        monthlyChampion: "🏆 بطل الشهر",
        noWinner: "لا يوجد فائز بعد",
        heroCol: "البطل",
        dailyScoreCol: "النقاط اليومية (الحد الأقصى 1k)",
        weeklyScoreCol: "النقاط الأسبوعية (الحد الأقصى 7k)",
        monthlyScoreCol: "النقاط الشهرية (الحد الأقصى 30k)",
        resetConfirmTitle: "إعادة ضبط جميع البيانات؟",
        resetConfirmMsg: "هل أنت تأكد من إعادة ضبط جميع المهام والنتائج للجميع؟ لا يمكن التراجع عن هذا الفعل.",
        deleteHeroTitle: "حذف البطل؟",
        deleteHeroMsg: "هل أنت تأكد من حذف ملف البطل: ",
        deleteTaskTitle: "حذف المهمة؟",
        deleteTaskMsg: "هل أنت تأكد من حذف هذه المهمة: ",
        cancel: "إلغاء",
        confirmDelete: "تأكيد الحذف",
        days: ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
        dayNames: ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
        photoText: "📷 صورة",
        remove: "✕ حذف",
        completed: "مكتملة",
        pending: "قيد الانتظار"
    }
};

// AuxSystems Custom Dialog Handler
function showAuxConfirm(title, message, onConfirm) {
    const t = translations[currentLang];
    confirmTitle.innerText = title;
    confirmMessage.innerText = message;
    confirmCancelBtn.innerText = t.cancel;
    confirmOkBtn.innerText = t.confirmDelete;

    pendingConfirmCallback = onConfirm;
    confirmModal.style.display = "flex";
}

confirmCancelBtn.addEventListener("click", () => {
    confirmModal.style.display = "none";
    pendingConfirmCallback = null;
});

confirmOkBtn.addEventListener("click", () => {
    if (pendingConfirmCallback) pendingConfirmCallback();
    confirmModal.style.display = "none";
    pendingConfirmCallback = null;
});

function getCurrentDayIndex() {
    const jsDay = new Date().getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
    return (jsDay + 6) % 7; 
}

function applyLanguage() {
    const t = translations[currentLang];
    document.body.classList.toggle("rtl", currentLang === "ar");

    document.getElementById("txtBrand").innerText = t.brand;
    document.getElementById("lblChildName").innerText = t.childNameLabel;
    childNameInput.placeholder = t.placeholderName;
    document.getElementById("registerBtn").innerText = t.registerBtn;
    monthlyReportBtn.innerText = t.leaderboardBtn;
    manualResetBtn.innerText = t.resetBtn;
    langToggleBtn.innerText = t.langBtn;
    document.getElementById("txtModalTitle").innerText = t.modalTitle;
}

function saveData() {
    try {
        localStorage.setItem("heroTrackData", JSON.stringify(familyData));
        localStorage.setItem("heroTrackLang", currentLang);
    } catch (e) {
        alert("Storage limit reached! Try using smaller photo sizes.");
    }
}

function init() {
    applyLanguage();
    renderCards();
}

function renderCards() {
    childrenContainer.innerHTML = "";
    const t = translations[currentLang];

    if (familyData.length === 0) {
        childrenContainer.innerHTML = `<p class="empty-notice">${t.emptyNotice}</p>`;
        return;
    }

    familyData.forEach(child => {
        if (child.activeDayIdx === undefined) child.activeDayIdx = getCurrentDayIndex();
        if (!child.dayHistory) child.dayHistory = Array(7).fill(null).map(() => []);

        const card = document.createElement("div");
        card.className = "child-card";

        // Col 1: Profile & Editable Name
        const photoContent = child.photoUrl 
            ? `<img src="${child.photoUrl}" class="avatar-img" alt="${child.name}">`
            : `<span class="star-icon">★</span><span>${t.photoText}</span>`;

        const profileHtml = `
            <div class="profile-col">
                <div class="avatar-box" onclick="triggerPhotoUpload(${child.id})" title="Click to upload/change photo">
                    ${photoContent}
                </div>
                <input type="file" id="photo-input-${child.id}" accept="image/*" style="display:none;" onchange="handlePhotoUpload(event, ${child.id})">
                <div class="child-name" ondblclick="editChildName(${child.id}, this)" title="Double-click to edit name">${child.name}</div>
                <div class="points-badge">⭐ ${child.dailyPoints || 0} pts</div>
                <button class="btn-remove" onclick="removeProfile(${child.id})">${t.remove}</button>
            </div>
        `;

        // Col 2: Task List
        let tasksHtml = child.tasks.map(task => `
            <div class="task-row">
                <div class="oval-btn ${task.completed ? 'completed' : 'pending'}">
                    <span onclick="toggleTask(${child.id}, ${task.id})">${task.completed ? '☑' : '☐'}</span>
                    <span class="task-text" ondblclick="editTaskText(${child.id}, ${task.id}, this)" title="Double-click to edit chore">${task.text}</span>
                </div>
                <button class="btn-del-task" onclick="deleteTask(${child.id}, ${task.id})">✕</button>
            </div>
        `).join("");

        const tasksColHtml = `
            <div class="tasks-col">
                <form class="add-task-form" onsubmit="addTask(event, ${child.id})">
                    <input type="text" id="task-input-${child.id}" placeholder="${t.newChore}" autocomplete="off">
                    <button type="submit" class="btn-add-plus">+</button>
                </form>
                <div class="task-list">
                    ${tasksHtml}
                </div>
            </div>
        `;

        // Col 3: Interactive Daily Bars Buttons
        let barsHtml = t.days.map((dayLabel, idx) => `
            <button class="bar-btn-wrapper ${idx === child.activeDayIdx ? 'active-day' : ''}" 
                    onclick="openDayDetail(${child.id}, ${idx})" 
                    title="Click to view details for ${t.dayNames[idx]}">
                <div class="bar-bg">
                    <div class="bar-fill" style="height: ${child.dailyProgress[idx]}%;"></div>
                </div>
                <span class="bar-label">${dayLabel}</span>
            </button>
        `).join("");

        const dailyColHtml = `
            <div class="daily-col">
                <span class="daily-title">${t.dailyProgress}</span>
                <div class="bars-group">
                    ${barsHtml}
                </div>
            </div>
        `;

        // Col 4: Weekly Ring
        const weeklyColHtml = `
            <div class="weekly-col">
                <span class="weekly-title">${t.weeklyTarget}</span>
                <div class="ring-outer" style="background: conic-gradient(#0284c7 ${child.weeklyPct * 3.6}deg, #e2e8f0 0deg)">
                    <div class="ring-inner">
                        <span class="weekly-pct-text">${child.weeklyPct}%</span>
                    </div>
                </div>
                <span class="weekly-pct-text">${t.targetProgress}</span>
            </div>
        `;

        card.innerHTML = profileHtml + tasksColHtml + dailyColHtml + weeklyColHtml;
        childrenContainer.appendChild(card);
    });
}

// Open Day History Detail Modal
window.openDayDetail = function(childId, dayIdx) {
    const child = familyData.find(c => c.id === childId);
    const t = translations[currentLang];
    
    if (child.activeDayIdx !== dayIdx) {
        child.dayHistory[child.activeDayIdx] = JSON.parse(JSON.stringify(child.tasks));
        child.activeDayIdx = dayIdx;
        child.tasks.forEach(t => t.completed = false);
        updateChildStats(child);
        saveData();
        renderCards();
    }

    const dayName = t.dayNames[dayIdx];
    dayDetailTitle.innerText = `📅 ${child.name} - ${dayName}`;

    const savedHistory = child.dayHistory[dayIdx] || [];
    const currentTasks = (dayIdx === child.activeDayIdx) ? child.tasks : savedHistory;

    if (currentTasks.length === 0) {
        dayDetailBody.innerHTML = `<p style="text-align:center; padding:15px; color:#64748b;">No chores registered for ${dayName}.</p>`;
    } else {
        let historyListHtml = currentTasks.map(item => `
            <div class="history-item">
                <span>${item.text}</span>
                <span class="${item.completed ? 'status-done' : 'status-pending'}">
                    ${item.completed ? '✔ ' + t.completed : '` ' + t.pending}
                </span>
            </div>
        `).join("");

        dayDetailBody.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold; color: #059669;">
                ${t.dailyProgress} ${child.dailyProgress[dayIdx]}%
            </div>
            ${historyListHtml}
        `;
    }

    dayDetailModal.style.display = "flex";
};

// Switch Language
langToggleBtn.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "ar" : "en";
    saveData();
    applyLanguage();
    renderCards();
});

// Register Child
registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = childNameInput.value.trim();
    if (name) {
        familyData.push({
            id: Date.now(),
            name: name,
            photoUrl: null,
            activeDayIdx: getCurrentDayIndex(),
            tasks: [],
            dailyProgress: [0, 0, 0, 0, 0, 0, 0],
            dayHistory: Array(7).fill(null).map(() => []),
            dailyPoints: 0,
            weeklyPoints: 0,
            monthlyPoints: 0,
            weeklyPct: 0
        });
        childNameInput.value = "";
        saveData();
        renderCards();
    }
});

// Photo Upload Handling
window.triggerPhotoUpload = function(childId) {
    document.getElementById(`photo-input-${childId}`).click();
};

window.handlePhotoUpload = function(e, childId) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const maxSize = 150;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxSize) {
                    height *= maxSize / width;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width *= maxSize / height;
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const resizedUrl = canvas.toDataURL("image/jpeg", 0.8);
            const child = familyData.find(c => c.id === childId);
            if (child) {
                child.photoUrl = resizedUrl;
                saveData();
                renderCards();
            }
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
};

// Double-click Editors
window.editChildName = function(childId, element) {
    const child = familyData.find(c => c.id === childId);
    const input = document.createElement("input");
    input.type = "text";
    input.className = "editable-input";
    input.value = child.name;

    element.replaceWith(input);
    input.focus();

    const saveName = () => {
        const newName = input.value.trim();
        if (newName) child.name = newName;
        saveData();
        renderCards();
    };

    input.addEventListener("blur", saveName);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveName();
    });
};

window.editTaskText = function(childId, taskId, element) {
    const child = familyData.find(c => c.id === childId);
    const task = child.tasks.find(t => t.id === taskId);
    const input = document.createElement("input");
    input.type = "text";
    input.className = "editable-input";
    input.value = task.text;

    element.replaceWith(input);
    input.focus();

    const saveTask = () => {
        const newText = input.value.trim();
        if (newText) task.text = newText;
        saveData();
        renderCards();
    };

    input.addEventListener("blur", saveTask);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveTask();
    });
};

// Task Operations
window.addTask = function(e, childId) {
    e.preventDefault();
    const input = document.getElementById(`task-input-${childId}`);
    const text = input.value.trim();
    if (text) {
        const child = familyData.find(c => c.id === childId);
        child.tasks.push({ id: Date.now(), text: text, completed: false });
        updateChildStats(child);
        saveData();
        renderCards();
    }
};

window.toggleTask = function(childId, taskId) {
    const child = familyData.find(c => c.id === childId);
    const task = child.tasks.find(t => t.id === taskId);
    task.completed = !task.completed;
    updateChildStats(child);
    saveData();
    renderCards();
};

// Protected Task Deletion with Confirmation
window.deleteTask = function(childId, taskId) {
    const child = familyData.find(c => c.id === childId);
    const task = child.tasks.find(t => t.id === taskId);
    const t = translations[currentLang];

    showAuxConfirm(
        t.deleteTaskTitle,
        `${t.deleteTaskMsg} "${task.text}"?`,
        () => {
            child.tasks = child.tasks.filter(t => t.id !== taskId);
            updateChildStats(child);
            saveData();
            renderCards();
        }
    );
};

// Protected Hero Profile Removal with Confirmation
window.removeProfile = function(childId) {
    const child = familyData.find(c => c.id === childId);
    const t = translations[currentLang];

    showAuxConfirm(
        t.deleteHeroTitle,
        `${t.deleteHeroMsg} "${child.name}"?`,
        () => {
            familyData = familyData.filter(c => c.id !== childId);
            saveData();
            renderCards();
        }
    );
};

// Accumulation Stats Calculation
function updateChildStats(child) {
    const dayIdx = child.activeDayIdx !== undefined ? child.activeDayIdx : getCurrentDayIndex();

    if (child.tasks.length === 0) {
        child.dailyProgress[dayIdx] = 0;
        child.dailyPoints = 0;
    } else {
        const completedCount = child.tasks.filter(t => t.completed).length;
        const pct = Math.round((completedCount / child.tasks.length) * 100);
        child.dailyProgress[dayIdx] = pct;
        child.dailyPoints = Math.min(completedCount * POINTS_PER_TASK, MAX_DAILY_PTS);
    }

    // Weekly Accumulation (1/7th per day)
    const totalWeeklyPct = child.dailyProgress.reduce((sum, val) => sum + (val / 7), 0);
    child.weeklyPct = Math.min(Math.round(totalWeeklyPct), 100);
    child.weeklyPoints = Math.min(Math.round((child.weeklyPct / 100) * MAX_WEEKLY_PTS), MAX_WEEKLY_PTS);

    // Monthly Accumulation (1/30th scale)
    const totalMonthlyPct = (child.weeklyPct * 7) / 30; 
    child.monthlyPoints = Math.min(Math.round((totalMonthlyPct / 100) * MAX_MONTHLY_PTS), MAX_MONTHLY_PTS);
}

// Manual Reset All Data via AuxSystems Confirm Dialog
manualResetBtn.addEventListener("click", () => {
    const t = translations[currentLang];

    showAuxConfirm(
        t.resetConfirmTitle,
        t.resetConfirmMsg,
        () => {
            familyData.forEach(child => {
                child.dailyProgress = [0, 0, 0, 0, 0, 0, 0];
                child.dailyPoints = 0;
                child.weeklyPoints = 0;
                child.monthlyPoints = 0;
                child.weeklyPct = 0;
                child.dayHistory = Array(7).fill(null).map(() => []);
                child.tasks.forEach(t => t.completed = false);
            });
            saveData();
            renderCards();
        }
    );
});

// Leaderboard Modal Logic
monthlyReportBtn.addEventListener("click", () => {
    const t = translations[currentLang];
    if (familyData.length === 0) {
        modalBody.innerHTML = `<p style='text-align:center;'>${t.emptyNotice}</p>`;
    } else {
        const sortedByWeekly = [...familyData].sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0));
        const sortedByMonthly = [...familyData].sort((a, b) => (b.monthlyPoints || 0) - (a.monthlyPoints || 0));

        const weeklyWinner = sortedByWeekly[0]?.weeklyPoints > 0 ? sortedByWeekly[0].name : t.noWinner;
        const monthlyWinner = sortedByMonthly[0]?.monthlyPoints > 0 ? sortedByMonthly[0].name : t.noWinner;

        let rowsHtml = familyData.map(c => `
            <tr>
                <td>${c.name}</td>
                <td>${c.dailyPoints || 0} / ${MAX_DAILY_PTS}</td>
                <td>${c.weeklyPoints || 0} / ${MAX_WEEKLY_PTS}</td>
                <td>${c.monthlyPoints || 0} / ${MAX_MONTHLY_PTS}</td>
            </tr>
        `).join("");

        modalBody.innerHTML = `
            <div class="winners-banner">
                <div class="winner-card">
                    <h4>${t.weeklyWinner}</h4>
                    <p>${weeklyWinner}</p>
                </div>
                <div class="winner-card">
                    <h4>${t.monthlyChampion}</h4>
                    <p>${monthlyWinner}</p>
                </div>
            </div>

            <table class="modal-table">
                <thead>
                    <tr>
                        <th>${t.heroCol}</th>
                        <th>${t.dailyScoreCol}</th>
                        <th>${t.weeklyScoreCol}</th>
                        <th>${t.monthlyScoreCol}</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        `;
    }
    monthlyModal.style.display = "flex";
});

window.closeModal = function(modalId) {
    document.getElementById(modalId).style.display = "none";
};

window.addEventListener("click", (e) => {
    if (e.target === monthlyModal) closeModal("monthlyModal");
    if (e.target === dayDetailModal) closeModal("dayDetailModal");
});

init();
