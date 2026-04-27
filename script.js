// ===============================
// HABIT HERO PRO - WORKING VERSION
// ===============================

// ---------- Elements ----------
const loginScreen = document.getElementById("loginScreen");
const app = document.getElementById("app");
const usernameInput = document.getElementById("usernameInput");
const startBtn = document.getElementById("startBtn");
const heroName = document.getElementById("heroName");

const themeBtn = document.getElementById("themeBtn");
const quote = document.getElementById("quote");
const avatar = document.getElementById("avatar");
const changeAvatarBtn = document.getElementById("changeAvatarBtn");
const notifyBtn = document.getElementById("notifyBtn");
const exportBtn = document.getElementById("exportBtn");

const habitInput = document.getElementById("habitInput");
const category = document.getElementById("category");
const difficulty = document.getElementById("difficulty");
const addHabitBtn = document.getElementById("addHabitBtn");
const habitList = document.getElementById("habitList");

const levelEl = document.getElementById("level");
const xpEl = document.getElementById("xp");
const coinsEl = document.getElementById("coins");
const streakEl = document.getElementById("streak");
const completedEl = document.getElementById("completed");
const badgesEl = document.getElementById("badges");
const totalHabitsEl = document.getElementById("totalHabits");
const progressFill = document.getElementById("progressFill");
const badgeContainer = document.getElementById("badgeContainer");

const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll(".sidebar li");
const shopCards = document.querySelectorAll(".shop-card");

// ---------- State ----------
let data = JSON.parse(localStorage.getItem("habitHeroPro")) || {
  user: "",
  theme: "light",
  avatarSeed: "hero",
  habits: [],
  xp: 0,
  level: 1,
  coins: 0,
  streak: 0,
  completed: 0,
  badges: [],
  lastCompletedDate: "",
  history: [] // dates: YYYY-MM-DD
};

const quotes = [
  "Consistency is your superpower.",
  "Small wins every day become greatness.",
  "Discipline beats motivation.",
  "Build habits, build your future.",
  "Progress over perfection."
];

// ---------- Save ----------
function save() {
  localStorage.setItem("habitHeroPro", JSON.stringify(data));
}

// ---------- Login ----------
function showApp() {
  loginScreen.style.display = "none";
  app.classList.remove("hidden");
  app.style.display = "flex";
  heroName.textContent = data.user || "Hero";
}

startBtn.addEventListener("click", function () {
  const name = usernameInput.value.trim();

  if (name === "") {
    alert("Please enter your name");
    return;
  }

  data.user = name;
  save();
  showApp();
});

function loadUser() {
  if (data.user && data.user.trim() !== "") {
    showApp();
  }
}

// ---------- Theme ----------
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  data.theme = document.body.classList.contains("dark") ? "dark" : "light";
  save();
});

function loadTheme() {
  if (data.theme === "dark") {
    document.body.classList.add("dark");
  }
}

// ---------- Avatar ----------
function loadAvatar() {
  avatar.src =
    "https://api.dicebear.com/7.x/adventurer/svg?seed=" + data.avatarSeed;
}

changeAvatarBtn.addEventListener("click", () => {
  data.avatarSeed = Math.random().toString(36).slice(2);
  save();
  loadAvatar();
});

// ---------- Navigation ----------
navItems.forEach(item => {
  item.addEventListener("click", () => {
    navItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    pages.forEach(p => p.classList.remove("active-page"));
    document.getElementById(item.dataset.page).classList.add("active-page");
  });
});

// ---------- Add Habit ----------
addHabitBtn.addEventListener("click", addHabit);

function addHabit() {
  const name = habitInput.value.trim();
  if (!name) return alert("Enter habit name");

  data.habits.push({
    id: Date.now(),
    name,
    category: category.value,
    difficulty: difficulty.value,
    doneToday: false
  });

  habitInput.value = "";
  save();
  renderHabits();
  updateUI();
}

// ---------- Edit ----------
function editHabit(id) {
  const habit = data.habits.find(h => h.id === id);
  if (!habit) return;

  const newName = prompt("Edit habit:", habit.name);
  if (!newName) return;

  habit.name = newName.trim();
  save();
  renderHabits();
}

// ---------- Delete ----------
function deleteHabit(id) {
  data.habits = data.habits.filter(h => h.id !== id);
  save();
  renderHabits();
  updateUI();
}

// ---------- Complete ----------
function completeHabit(id) {
  const today = new Date().toISOString().split("T")[0];
  const habit = data.habits.find(h => h.id === id);

  if (!habit || habit.doneToday) return;

  habit.doneToday = true;

  let gain = 10;
  if (habit.difficulty.includes("Medium")) gain = 20;
  if (habit.difficulty.includes("Hard")) gain = 30;

  data.xp += gain;
  data.coins += Math.floor(gain / 2);
  data.completed++;

  // streak logic
  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0];

  if (data.lastCompletedDate === today) {
    // same day
  } else if (
    data.lastCompletedDate === yesterday ||
    data.lastCompletedDate === ""
  ) {
    data.streak++;
  } else {
    data.streak = 1;
  }

  data.lastCompletedDate = today;

  // history
  if (!data.history.includes(today)) {
    data.history.push(today);
  }

  // level up
  while (data.xp >= data.level * 100) {
    data.xp -= data.level * 100;
    data.level++;
    unlockBadge(`🏆 Level ${data.level}`);
  }

  checkMilestones();
  save();
  renderHabits();
  updateUI();
  updateChart();
  renderHeatmap();
}

// ---------- Daily reset ----------
function resetDailyStatus() {
  const today = new Date().toISOString().split("T")[0];
  if (data._lastVisit !== today) {
    data.habits.forEach(h => (h.doneToday = false));
    data._lastVisit = today;
    save();
  }
}

// ---------- Badges ----------
function unlockBadge(text) {
  if (!data.badges.includes(text)) {
    data.badges.push(text);
  }
}

function checkMilestones() {
  if (data.completed >= 5) unlockBadge("🥉 Beginner");
  if (data.completed >= 20) unlockBadge("🥈 Consistent");
  if (data.completed >= 50) unlockBadge("🥇 Master");
}

// ---------- Render Habits ----------
function renderHabits() {
  habitList.innerHTML = "";

  if (!data.habits.length) {
    habitList.innerHTML = "<li>No habits added yet.</li>";
    return;
  }

  data.habits.forEach(h => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div>
        <strong>${h.name}</strong><br>
        <small>${h.category} • ${h.difficulty}</small>
        ${h.doneToday ? "<span> ✅ Done</span>" : ""}
      </div>

      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        ${
          !h.doneToday
            ? `<button onclick="completeHabit(${h.id})">Done</button>`
            : ""
        }
        <button onclick="editHabit(${h.id})">Edit</button>
        <button onclick="deleteHabit(${h.id})">Delete</button>
      </div>
    `;

    habitList.appendChild(li);
  });
}

// ---------- Heatmap ----------
function renderHeatmap() {
  const heatmap = document.getElementById("heatmap");
  heatmap.innerHTML = "";

  const days = 50;
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const dateStr = d.toISOString().split("T")[0];

    const box = document.createElement("div");
    if (data.history.includes(dateStr)) {
      box.classList.add("active");
    }

    heatmap.appendChild(box);
  }
}

// ---------- Shop ----------
shopCards.forEach(card => {
  card.addEventListener("click", () => {
    const cost = Number(card.dataset.cost);

    if (data.coins >= cost) {
      data.coins -= cost;
      alert("Reward unlocked 🎉");
      save();
      updateUI();
    } else {
      alert("Not enough coins");
    }
  });
});

// ---------- Notifications ----------
notifyBtn.addEventListener("click", async () => {
  if (!("Notification" in window)) {
    alert("Notifications not supported");
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    new Notification("🔥 Habit Reminder", {
      body: "Complete today's habits!"
    });
  }
});

// ---------- Export ----------
exportBtn.addEventListener("click", () => {
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "habit-hero-data.json";
  a.click();
});

// ---------- Chart ----------
let chart;

function updateChart() {
  const done = data.habits.filter(h => h.doneToday).length;
  const pending = data.habits.filter(h => !h.doneToday).length;

  const ctx = document.getElementById("habitChart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Done", "Pending"],
      datasets: [{
        data: [done, pending]
      }]
    },
    options: {
      responsive: true
    }
  });
}

// ---------- UI ----------
function updateUI() {
  levelEl.textContent = data.level;
  xpEl.textContent = data.xp;
  coinsEl.textContent = data.coins;
  streakEl.textContent = data.streak;
  completedEl.textContent = data.completed;
  badgesEl.textContent = data.badges.length;
  totalHabitsEl.textContent = data.habits.length;

  const percent = (data.xp / (data.level * 100)) * 100;
  progressFill.style.width = `${Math.min(percent, 100)}%`;

  badgeContainer.innerHTML = "";
  data.badges.forEach(b => {
    const span = document.createElement("span");
    span.textContent = b;
    badgeContainer.appendChild(span);
  });

  quote.textContent =
    quotes[Math.floor(Math.random() * quotes.length)];
}

// ---------- Init ----------
function init() {
  loadUser();
  loadTheme();
  loadAvatar();
  resetDailyStatus();
  renderHabits();
  renderHeatmap();
  updateUI();
  updateChart();
}

init();