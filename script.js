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
  // Free Render hosting can cold-start slowly; give up after 6s and use the fallback.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const base = "https://alfa-leetcode-api.onrender.com/bhXAiLt1s5";
    const [profile, solved] = await Promise.all([
      fetch(base, { signal: ctrl.signal }),
      fetch(`${base}/solved`, { signal: ctrl.signal }),
    ]);
    if (!profile.ok || !solved.ok) throw new Error("api");
    const p = await profile.json();
    const s = await solved.json();
    const stats = {
      ranking: p.ranking,
      solvedProblem: s.solvedProblem,
      easySolved: s.easySolved,
      mediumSolved: s.mediumSolved,
      hardSolved: s.hardSolved,
    };
    // Reject partial/malformed responses (would otherwise render NaN or divide by 0)
    if (!Object.values(stats).every(Number.isFinite) || stats.solvedProblem <= 0) {
      throw new Error("bad data");
    }
    render(stats);
  } catch {
    render(FALLBACK);
  } finally {
    clearTimeout(timer);
  }
}

loadLeetCode();
