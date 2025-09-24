// Interactive game engine (non-MCQ edition) — unified for all stages

// ---------- Config Keys ----------
const PREFIX = 'launchdetective:int';
const PLAYERKEY = `${PREFIX}:player`;
const LBKEY = `${PREFIX}:leaderboard`;

// ---------- Small helpers ----------
function nowISO() { return new Date().toISOString(); }
function safeParse(raw, def) { try { return JSON.parse(raw ?? ''); } catch { return def; } }

// ---------- Player session management ----------
function setPlayerName(name) { localStorage.setItem(PLAYERKEY, name); }
function getPlayerName() { return localStorage.getItem(PLAYERKEY) || null; }
function sessionKey(name) { return `${PREFIX}:session:${name}`; }

function loadSession() {
  const name = getPlayerName();
  if (!name) return null;
  return safeParse(localStorage.getItem(sessionKey(name)), { name, solved: {}, tasks: {}, totalScore: 0 });
}
function saveSession(s) {
  if (!s || !s.name) return;
  localStorage.setItem(sessionKey(s.name), JSON.stringify(s));
}

// ---------- Leaderboard ----------
function loadLeaderboard() { return safeParse(localStorage.getItem(LBKEY), []); }
function saveLeaderboard(lb) { localStorage.setItem(LBKEY, JSON.stringify(lb)); }
function upsertLeader(name, score) {
  const lb = loadLeaderboard();
  const idx = lb.findIndex(e => e.name === name);
  if (idx >= 0) { lb[idx].score = score; lb[idx].date = nowISO(); }
  else lb.push({ name, score, date: nowISO() });
  lb.sort((a,b) => b.score - a.score || a.name.localeCompare(b.name));
  saveLeaderboard(lb);
  updateLeaderboardUI();
}
function updateLeaderboardUI() {
  const list = document.getElementById('leaderboardList');
  if (!list) return;
  list.innerHTML = '';
  const lb = loadLeaderboard().slice(0, 10);
  lb.forEach(e => {
    const li = document.createElement('li');
    li.textContent = `${e.name} — ${e.score} pts`;
    if (e.name === getPlayerName()) li.style.fontWeight = '700';
    list.appendChild(li);
  });
  const session = loadSession();
  const your = document.getElementById('yourSession');
  if (your) {
    your.innerHTML = `You <strong>${session ? session.name : '-'}</strong><br> Total <strong>${session ? (session.totalScore || 0) : 0}</strong> pts`;
  }
}

// ---------- Text similarity ----------
function levenshtein(a,b){
  a = (a||'').toLowerCase().trim(); b=(b||'').toLowerCase().trim();
  const n=a.length, m=b.length; if(n===0) return m; if(m===0) return n;
  const v0=new Array(m+1), v1=new Array(m+1);
  for(let j=0;j<=m;j++) v0[j]=j;
  for(let i=0;i<n;i++){
    v1[0]=i+1;
    for(let j=0;j<m;j++){
      const cost = a[i]===b[j]?0:1;
      v1[j+1]=Math.min(v1[j]+1, v0[j+1]+1, v0[j]+cost);
    }
    for(let j=0;j<=m;j++) v0[j]=v1[j];
  }
  return v0[m];
}
function textSimilarity(a,b){
  if (!a && !b) return 1;
  const dist = levenshtein(a,b);
  const maxLen = Math.max((a||'').length, (b||'').length, 1);
  return Math.max(0, 1 - dist/maxLen);
}
window.textSimilarity = textSimilarity;

// ---------- One-time task scoring ----------
function awardPoints(taskKey, pts){
  const s = loadSession(); if (!s) return;
  if (!s.solved) s.solved = {};
  if (s.solved[taskKey]) return; // one-time
  s.solved[taskKey] = { points: pts, time: nowISO() };
  s.totalScore = (s.totalScore || 0) + (pts || 0);
  saveSession(s);
  upsertLeader(s.name, s.totalScore);
  window.dispatchEvent(new Event('pointsAwarded'));
}

// Compatibility for existing stage code
window.loadSession = loadSession;
window.awardStageTaskPoints = function(taskKey, pts){ awardPoints(taskKey, pts); };
window.getStageTaskDone = function(taskKey){ const s = loadSession(); return !!(s && s.solved && s.solved[taskKey]); };
window.goToStage = function(url){ window.location.href = url; };
window.restartGame = function(){ localStorage.removeItem(PLAYERKEY); window.location.href = 'index.html'; };
window.updateLeaderboardUI = updateLeaderboardUI;

// ---------- Game lifecycle ----------
function startGame(){
  let name = prompt('Enter player name:');
  if (!name) return alert('Name required to play.');
  name = name.trim();
  if (!name) return alert('Valid name required.');
  setPlayerName(name);
  const prev = safeParse(localStorage.getItem(sessionKey(name)), null);
  if (prev) {
    if (!confirm(`Resume session for ${name}? Cancel = new game.`)) {
      localStorage.removeItem(sessionKey(name));
      saveSession({ name, solved: {}, tasks: {}, totalScore: 0 });
    }
  } else {
    saveSession({ name, solved: {}, tasks: {}, totalScore: 0 });
  }
  upsertLeader(name, (loadSession()?.totalScore || 0));
  updateLeaderboardUI();
  window.location.href = 'stage1.html';
}
window.startGame = startGame;

// ---------- Finalization ----------
function finalizeGame(){
  const s = loadSession(); if (!s) return;
  upsertLeader(s.name, s.totalScore);
  updateLeaderboardUI();

  const scoreLine = document.getElementById('scoreLine');
  const finalResults = document.getElementById('finalResults');
  if (scoreLine && finalResults) {
    scoreLine.textContent = `You scored ${s.totalScore} points — session saved locally.`;
    const finalLeader = document.getElementById('finalLeaderboard');
    if (finalLeader) {
      const lb = loadLeaderboard();
      finalLeader.innerHTML = '<h4>Leaderboard</h4>';
      const ol = document.createElement('ol');
      lb.forEach(e => {
        const li = document.createElement('li');
        li.textContent = `${e.name} — ${e.score} pts`;
        ol.appendChild(li);
      });
      finalLeader.appendChild(ol);
    }
    finalResults.style.display = 'block';
  }
  window.dispatchEvent(new Event('gameComplete'));
}
window.finalizeGame = finalizeGame;

// ---------- Init ----------
window.addEventListener('load', () => {
  updateLeaderboardUI();
  // best-effort: disable buttons for already-solved tasks by id or data-puzzle
  const session = loadSession();
  if (session && session.solved) {
    Object.keys(session.solved).forEach(k => {
      document.querySelectorAll(`[data-puzzle="${k}"], #${k}`).forEach(b => {
        try { b.disabled = true; } catch {}
      });
    });
  }
});
