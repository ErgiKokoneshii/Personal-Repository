const FALLBACK = {
  ranking: 1769478,
  solvedProblem: 100,
  easySolved: 73,
  mediumSolved: 23,
  hardSolved: 4,
};

const ring = document.querySelector("[data-ring]");
const solvedEl = document.querySelector("[data-solved]");
const rankEl = document.querySelector("[data-rank]");
const easyEl = document.querySelector("[data-easy]");
const mediumEl = document.querySelector("[data-medium]");
const hardEl = document.querySelector("[data-hard]");
const fills = document.querySelectorAll("[data-fill]");

function animateCount(el, value) {
  const start = performance.now();
  const duration = 900;
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    el.textContent = Math.round(value * t).toLocaleString();
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function render(stats) {
  const total = stats.solvedProblem;
  animateCount(solvedEl, total);
  rankEl.textContent = `#${stats.ranking.toLocaleString()}`;
  easyEl.textContent = stats.easySolved;
  mediumEl.textContent = stats.mediumSolved;
  hardEl.textContent = stats.hardSolved;

  const circumference = 2 * Math.PI * 92;
  const progress = Math.min(1, total / 150);
  ring.style.strokeDasharray = `${circumference}`;
  ring.style.strokeDashoffset = `${circumference * (1 - progress)}`;

  const parts = [stats.easySolved, stats.mediumSolved, stats.hardSolved];
  fills.forEach((fill, i) => {
    fill.style.width = `${Math.round((parts[i] / total) * 100)}%`;
  });
}

async function loadLeetCode() {
  try {
    const [profile, solved] = await Promise.all([
      fetch("https://alfa-leetcode-api.onrender.com/bhXAiLt1s5"),
      fetch("https://alfa-leetcode-api.onrender.com/bhXAiLt1s5/solved"),
    ]);
    if (!profile.ok || !solved.ok) throw new Error("api");
    const profileJson = await profile.json();
    const solvedJson = await solved.json();
    render({
      ranking: profileJson.ranking,
      solvedProblem: solvedJson.solvedProblem,
      easySolved: solvedJson.easySolved,
      mediumSolved: solvedJson.mediumSolved,
      hardSolved: solvedJson.hardSolved,
    });
  } catch {
    render(FALLBACK);
  }
}

loadLeetCode();
