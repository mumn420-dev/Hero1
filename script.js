// State management starting completely empty
let heroes = [];

// DOM Elements
const heroNameInput = document.getElementById('heroNameInput');
const registerBtn = document.getElementById('registerBtn');
const heroesListContainer = document.getElementById('heroesListContainer');
const resetAllBtn = document.getElementById('resetAllBtn');
const leaderboardBtn = document.getElementById('leaderboardBtn');

// Initialize
function init() {
    registerBtn.addEventListener('click', registerHero);
    heroNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') registerHero();
    });
    resetAllBtn.addEventListener('click', resetAllData);
    
    // Monthly / Leaderboard button notification handler since it's inactive/reporting
    leaderboardBtn.addEventListener('click', () => {
        alert("Monthly Report & Leaderboard feature view is currently offline or under setup.");
    });

    renderHeroes();
}

function registerHero() {
    const name = heroNameInput.value.trim();
    if (!name) return;

    const newHero = {
        id: Date.now(),
        name: name,
        points: 0,
        chores: [],
        // 7 days: M, T, W, T, F, S, S (false by default -> styled as light red or inactive)
        days: [false, false, false, false, false, false, false], 
        weeklyPercentage: 0
    };

    heroes.push(newHero);
    heroNameInput.value = '';
    renderHeroes();
}

function removeHero(id) {
    // Warning confirmation before deletion
    const hero = heroes.find(h => h.id === id);
    const heroName = hero ? hero.name : "this hero";
    if (confirm(`Warning: Are you sure you want to delete ${heroName} and all associated records?`)) {
        heroes = heroes.filter(h => h.id !== id);
        renderHeroes();
    }
}

function resetAllData() {
    // Warning confirmation before resetting all data
    if (confirm("Warning: This will delete all registered heroes and reset all data. Do you want to proceed?")) {
        heroes = [];
        renderHeroes();
    }
}

function addChore(heroId) {
    const inputEl = document.getElementById(`chore-input-${heroId}`);
    const choreText = inputEl.value.trim();
    if (!choreText) return;

    const hero = heroes.find(h => h.id === heroId);
    if (hero) {
        hero.chores.push({ text: choreText, completed: false });
        inputEl.value = '';
        renderHeroes();
    }
}

function toggleChore(heroId, choreIndex) {
    const hero = heroes.find(h => h.id === heroId);
    if (hero && hero.chores[choreIndex]) {
        hero.chores[choreIndex].completed = !hero.chores[choreIndex].completed;
        hero.points += hero.chores[choreIndex].completed ? 10 : -10;
        if (hero.points < 0) hero.points = 0;
        renderHeroes();
    }
}

function removeChore(heroId, choreIndex) {
    const hero = heroes.find(h => h.id === heroId);
    if (hero) {
        // Warning confirmation before deleting a task/chore
        const choreTitle = hero.chores[choreIndex].text;
        if (confirm(`Warning: Are you sure you want to delete the chore "${choreTitle}"?`)) {
            hero.chores.splice(choreIndex, 1);
            renderHeroes();
        }
    }
}

// Interactive daily progress buttons: toggle day completion status
function toggleDay(heroId, dayIndex) {
    const hero = heroes.find(h => h.id === heroId);
    if (hero) {
        hero.days[dayIndex] = !hero.days[dayIndex];
        
        // Accumulated percentage calculation: each day is 1/7th (~14.28%) of 100%
        const completedDaysCount = hero.days.filter(Boolean).length;
        hero.weeklyPercentage = Math.round((completedDaysCount / 7) * 100);
        
        renderHeroes();
    }
}

function renderHeroes() {
    heroesListContainer.innerHTML = '';

    if (heroes.length === 0) {
        heroesListContainer.innerHTML = `<div class="empty-state">No heroes registered yet. Type a name above and click "Register Hero" to begin!</div>`;
        return;
    }

    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    heroes.forEach(hero => {
        const card = document.createElement('div');
        card.className = 'hero-card';

        // Build Chores HTML
        let choresHTML = '';
        hero.chores.forEach((chore, index) => {
            choresHTML += `
                <div class="chore-item ${chore.completed ? 'completed' : ''}">
                    <button class="chore-text-btn" onclick="toggleChore(${hero.id}, ${index})">
                        <span>${chore.completed ? '☑' : '□'}</span> ${chore.text}
                    </button>
                    <button class="chore-delete-btn" onclick="removeChore(${hero.id}, ${index})" title="Delete chore">✕</button>
                </div>
            `;
        });

        // Build Daily Progress Buttons HTML (Light red for uncompleted/past days, green for completed)
        let daysHTML = '';
        hero.days.forEach((isDone, dIndex) => {
            let statusClass = isDone ? 'completed' : 'missed';
            daysHTML += `
                <div class="day-box ${statusClass}" onclick="toggleDay(${hero.id}, ${dIndex})" title="Click to toggle day completion status">
                    <span>${dayLabels[dIndex]}</span>
                </div>
            `;
        });

        card.innerHTML = `
            <div class="hero-profile">
                <div class="avatar-container">
                    <span style="font-size: 2rem;">⭐</span>
                </div>
                <div class="hero-name">${hero.name}</div>
                <div class="pts-badge">⭐ ${hero.points} pts</div>
                <button class="btn-remove" onclick="removeHero(${hero.id})">✕ Remove</button>
            </div>

            <div class="chores-section">
                <div class="add-chore-row">
                    <input type="text" id="chore-input-${hero.id}" placeholder="New chore..." onkeypress="if(event.key==='Enter') addChore(${hero.id})">
                    <button class="btn-add-chore" onclick="addChore(${hero.id})">+</button>
                </div>
                ${choresHTML}
            </div>

            <div class="daily-progress-section">
                <div class="progress-label">Daily Progress:</div>
                <div class="days-grid">
                    ${daysHTML}
                </div>
            </div>

            <div class="weekly-target-section">
                <div class="weekly-title">Weekly Target:</div>
                <div class="target-circle">${hero.weeklyPercentage}%</div>
                <div class="target-sub">Target Progress</div>
            </div>
        `;

        heroesListContainer.appendChild(card);
    });
}

// Global scope bindings for inline event execution
window.addChore = addChore;
window.toggleChore = toggleChore;
window.removeChore = removeChore;
window.removeHero = removeHero;
window.toggleDay = toggleDay;

// Initial Load
init();
