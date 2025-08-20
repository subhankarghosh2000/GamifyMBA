
// Global game state
let gameState = {
  badges: [],
  score: 0,
  selectedPath: null,
  userChoices: {}
};

// Badge functions
function awardBadge(badgeName) {
  if (!gameState.badges.includes(badgeName)) {
    gameState.badges.push(badgeName);
    updateBadgeDisplay();
    showBadgeNotification(badgeName);
    gameState.score += 25;
  }
}

function updateBadgeDisplay() {
  const badgeContainer = document.getElementById('badge-container');
  const badgeCount = document.getElementById('badge-count');

  if (badgeContainer) {
    badgeContainer.innerHTML = '';
    gameState.badges.forEach(badge => {
      const badgeElement = document.createElement('span');
      badgeElement.className = 'badge';
      badgeElement.textContent = `🏅 ${badge}`;
      badgeContainer.appendChild(badgeElement);
    });
  }

  if (badgeCount) {
    badgeCount.textContent = gameState.badges.length;
  }
}

function showBadgeNotification(badgeName) {
  const notification = document.createElement('div');
  notification.className = 'badge-notification';
  notification.innerHTML = `🏅 Badge Earned: ${badgeName}!`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: gold;
    padding: 15px;
    border-radius: 10px;
    font-weight: bold;
    z-index: 1000;
    animation: slideIn 0.5s ease;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Game navigation
function startGame() {
  awardBadge('Detective Rookie');
  localStorage.setItem('gameState', JSON.stringify(gameState));
  window.location.href = 'stage1.html';
}

function nextStage() {
  const currentPage = window.location.pathname;
  const stageNumber = currentPage.match(/stage(\d+)/);

  if (stageNumber) {
    const nextStageNum = parseInt(stageNumber[1]) + 1;
    if (nextStageNum <= 5) {
      window.location.href = `stage${nextStageNum}.html`;
    }
  }
}

// Load/Save state
function saveGameState() {
  localStorage.setItem('gameState', JSON.stringify(gameState));
}

function loadGameState() {
  const saved = localStorage.getItem('gameState');
  if (saved) {
    gameState = JSON.parse(saved);
    updateBadgeDisplay();
  }
}

// Initialize game on page load
window.addEventListener('load', () => {
  loadGameState();
  setupStageSpecifics();
});

// Call this to setup stage specific logic
function setupStageSpecifics() {
  const page = window.location.pathname;

  if (page.includes('stage1.html')) {
    setupStage1();
  } else if (page.includes('stage2.html')) {
    setupStage2();
  } else if (page.includes('stage3.html')) {
    setupStage3();
  } else if (page.includes('stage4.html')) {
    setupStage4();
  } else if (page.includes('stage5.html')) {
    setupStage5();
  }
}

// Stage 1 logic
function setupStage1() {
  window.pathChosen = false;
  document.getElementById('next-btn').disabled = true;
}

function chooseDistribution() {
  gameState.selectedPath = 'distribution';
  gameState.userChoices.mainIssue = 'distribution';
  document.getElementById('next-btn').disabled = false;
  window.pathChosen = true;
  gameState.score += 50;
  alert('🔓 Warehouse Routes Mini-Case Unlocked!');
}

function choosePricing() {
  gameState.selectedPath = 'pricing';
  gameState.userChoices.mainIssue = 'pricing';
  document.getElementById('next-btn').disabled = false;
  window.pathChosen = true;
  gameState.score += 50;
  alert('🔓 Supplier Negotiation Mini-Puzzle Unlocked!');
}

function findHiddenClue() {
  document.getElementById('repeat-clue').style.display = 'block';
}

// Stage 2 logic
function setupStage2() {
  // nothing specific on load
}

function calculateSales() {
  const population = +document.getElementById('population').value;
  const penetration = +document.getElementById('penetration').value;
  const purchaseRate = +document.getElementById('purchase-rate').value;

  const potential = Math.floor(population * penetration / 100 * purchaseRate).toLocaleString();
  document.getElementById('calc-result').innerHTML = `<h4>Potential Monthly Sales: ${potential} bottles</h4>`;
  awardBadge('Data Cruncher');
  gameState.score += 50;
}

function scanQR() {
  document.getElementById('qr-content').style.display = 'block';
}

// Stage 3 logic
const crisisResponseTimeout = 300; // seconds
let crisisTimer = null;

function setupStage3() {
  document.getElementById('crisis-alert').style.display = 'none';
}

function triggerCrisis() {
  document.getElementById('crisis-alert').style.display = 'block';
  startTimer(crisisResponseTimeout);
}

function startTimer(duration) {
  let timeLeft = duration;
  const timerElement = document.getElementById('timer');

  crisisTimer = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    if(timerElement) timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    if (timeLeft <= 0) {
      clearInterval(crisisTimer);
      submitCrisisResponse();
    }
    timeLeft--;
  }, 1000);
}

function submitCrisisResponse() {
  clearInterval(crisisTimer);
  const response = document.getElementById('crisis-response').value || '';

  if (response.trim().length > 50) {
    awardBadge('Crisis Manager');
    gameState.score += 50;
  }

  document.getElementById('crisis-alert').style.display = 'none';
}

// Stage 4 logic
function setupStage4(){
  document.getElementById('trade-status').innerText = '';
}

function tradeClue() {
  const trades = ['Market Data', 'Cost Analysis', 'Customer Survey'];
  const randomTrade = trades[Math.floor(Math.random() * trades.length)];
  document.getElementById('trade-status').innerHTML = `<p>✅ Successfully traded for: ${randomTrade}</p>`;
  awardBadge('Smart Negotiator');
  gameState.score += 30;
}

function blockRival() {
  document.getElementById('trade-status').innerHTML = `<p>🚫 Rival team blocked for 3 minutes!</p>`;
  gameState.score += 20;
}

// Stage 5 logic
function setupStage5() {
  const pitchText = document.getElementById('pitch-text');
  const wordCountElem = document.getElementById('word-count');

  if(pitchText) {
    pitchText.addEventListener('input', () => {
      const wordCount = pitchText.value.split(/\s+/).filter(w => w.length > 0).length;
      wordCountElem.textContent = wordCount;
    });
  }
}

function submitPitch() {
  const pitch = document.getElementById('pitch-text').value || '';
  const selected = Array.from(document.querySelectorAll('input[type=checkbox]:checked'));

  if (pitch.trim().split(/\s+/).filter(w => w.length > 0).length < 50) {
    alert('Please write a more detailed pitch (minimum 50 words)');
    return;
  }

  if (selected.length < 3) {
    alert('Please select at least 3 key actions');
    return;
  }

  showBoardFeedback(pitch, selected);
  document.getElementById('bonus-puzzle').style.display = 'block';
  gameState.score += 100;
  awardBadge('Master Strategist');
}

function showBoardFeedback(pitch, selected) {
  const feedbackElem = document.getElementById('feedback-content');
  let feedback = '';

  if (pitch.toLowerCase().includes('profit') || pitch.toLowerCase().includes('revenue')) {
    feedback += '<p>✅ Good focus on financial impact!</p>';
  } else {
    feedback += '<p>❓ What about the profit implications?</p>';
  }

  if (selected.length >= 4) {
    feedback += '<p>✅ Comprehensive action plan!</p>';
    awardBadge('Innovator');
  }

  feedbackElem.innerHTML = feedback;
  document.getElementById('board-feedback').style.display = 'block';
}

function chooseBonusOption(choice) {
  if (choice === 'yes') {
    gameState.score += 40;
    alert('Great strategic thinking! NGO partnerships can build trust.');
  } else {
    gameState.score += 20;
    alert('Practical approach! Focus is important.');
  }
  showFinalResults();
}

function showFinalResults() {
  document.getElementById('final-results').style.display = 'block';
  document.getElementById('final-score').innerHTML = `<h3>Total Score: ${gameState.score} points</h3>`;
  document.getElementById('earned-badges').innerHTML = `<h4>Badges Earned: ${gameState.badges.join(', ')}</h4>`;
}

function restartGame() {
  localStorage.clear();
  window.location.href = 'index.html';
}
