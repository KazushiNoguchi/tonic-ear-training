(() => {
  'use strict';

  const NOTE_NAMES = ['ド', 'レ', 'ミ', 'ファ', 'ソ', 'ラ', 'シ'];
  const SHORTCUTS = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];
  const CLEFS = {
    treble: {
      label: 'ト音記号',
      symbol: '𝄞',
      symbolY: 272,
      bottomLineNumber: 30,
      minimumNumber: 24,
      maximumNumber: 45
    },
    bass: {
      label: 'ヘ音記号',
      symbol: '𝄢',
      symbolY: 257,
      bottomLineNumber: 18,
      minimumNumber: 10,
      maximumNumber: 31
    }
  };

  const setupPanel = document.querySelector('#setupPanel');
  const setupForm = document.querySelector('#setupForm');
  const flowSecondsInput = document.querySelector('#flowSeconds');
  const flowSecondsValue = document.querySelector('#flowSecondsValue');
  const gamePanel = document.querySelector('#gamePanel');
  const resultPanel = document.querySelector('#resultPanel');
  const homeButton = document.querySelector('#homeButton');
  const roundValue = document.querySelector('#roundValue');
  const totalValue = document.querySelector('#totalValue');
  const scoreValue = document.querySelector('#scoreValue');
  const accuracyValue = document.querySelector('#accuracyValue');
  const clefSymbol = document.querySelector('#clefSymbol');
  const ledgerLines = document.querySelector('#ledgerLines');
  const noteGroup = document.querySelector('#noteGroup');
  const noteHead = document.querySelector('#noteHead');
  const noteStem = document.querySelector('#noteStem');
  const flowProgress = document.querySelector('#flowProgress');
  const feedback = document.querySelector('#feedback');
  const answerButtons = [...document.querySelectorAll('#answerButtons button')];
  const resultPercent = document.querySelector('#resultPercent');
  const resultTitle = document.querySelector('#resultTitle');
  const resultDetail = document.querySelector('#resultDetail');
  const retryButton = document.querySelector('#retryButton');
  const settingsButton = document.querySelector('#settingsButton');

  let settings = { clefMode: 'treble', total: 20, flowSeconds: 4 };
  let round = 0;
  let score = 0;
  let currentQuestion = null;
  let previousNumber = null;
  let nextAlternateClef = 'treble';
  let animationFrame = null;
  let feedbackTimer = null;
  let locked = true;

  function randomIndex(length) {
    if (window.crypto?.getRandomValues) {
      const values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      return values[0] % length;
    }
    return Math.floor(Math.random() * length);
  }

  function noteY(clef, diatonicNumber) {
    return 280 - (diatonicNumber - clef.bottomLineNumber) * 15;
  }

  function setLedgerLines(y) {
    ledgerLines.replaceChildren();
    const positions = [];
    if (y > 280) {
      for (let ledgerY = 310; ledgerY <= y + 15; ledgerY += 30) positions.push(ledgerY);
    } else if (y < 160) {
      for (let ledgerY = 130; ledgerY >= y; ledgerY -= 30) positions.push(ledgerY);
    }
    positions.forEach(ledgerY => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '-27');
      line.setAttribute('x2', '27');
      line.setAttribute('y1', String(ledgerY));
      line.setAttribute('y2', String(ledgerY));
      ledgerLines.appendChild(line);
    });
  }

  function setNoteDrawing(y) {
    noteHead.setAttribute('cy', String(y));
    noteHead.setAttribute('transform', `rotate(-18 0 ${y})`);
    const stemDown = y < 160;
    noteStem.setAttribute('x1', stemDown ? '-14' : '14');
    noteStem.setAttribute('x2', stemDown ? '-14' : '14');
    noteStem.setAttribute('y1', String(y + (stemDown ? 2 : -2)));
    noteStem.setAttribute('y2', String(y + (stemDown ? 68 : -68)));
    setLedgerLines(y);
  }

  function prepareQuestionDrawing(clefId, diatonicNumber) {
    const clef = CLEFS[clefId];
    const y = noteY(clef, diatonicNumber);
    clefSymbol.textContent = clef.symbol;
    clefSymbol.setAttribute('y', String(clef.symbolY));
    setNoteDrawing(y);
  }

  function setNoteX(x) {
    ledgerLines.setAttribute('transform', `translate(${x} 0)`);
    noteGroup.setAttribute('transform', `translate(${x} 0)`);
  }

  function chooseClef() {
    if (settings.clefMode !== 'alternate') return settings.clefMode;
    const clef = nextAlternateClef;
    nextAlternateClef = clef === 'treble' ? 'bass' : 'treble';
    return clef;
  }

  function makeQuestion() {
    const clefId = chooseClef();
    const clef = CLEFS[clefId];
    const count = clef.maximumNumber - clef.minimumNumber + 1;
    let diatonicNumber;
    do {
      diatonicNumber = clef.minimumNumber + randomIndex(count);
    } while (diatonicNumber === previousNumber && count > 1);
    previousNumber = diatonicNumber;
    return { clefId, diatonicNumber, degree: ((diatonicNumber % 7) + 7) % 7 };
  }

  function setButtonsEnabled(enabled) {
    answerButtons.forEach(button => { button.disabled = !enabled; });
  }

  function resetButtonStyles() {
    answerButtons.forEach(button => button.classList.remove('correct', 'wrong'));
  }

  function updateScoreboard() {
    roundValue.textContent = String(Math.min(round, settings.total));
    totalValue.textContent = String(settings.total);
    scoreValue.textContent = String(score);
    const completed = Math.max(0, round - (locked ? 0 : 1));
    accuracyValue.textContent = completed ? `${Math.round(score / completed * 100)}%` : '—';
  }

  function cancelMotion() {
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null;
    if (feedbackTimer !== null) window.clearTimeout(feedbackTimer);
    feedbackTimer = null;
  }

  function finishQuestion(correct, selectedDegree = null, timedOut = false) {
    if (locked) return;
    locked = true;
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null;
    setButtonsEnabled(false);
    const correctButton = answerButtons[currentQuestion.degree];
    correctButton.classList.add('correct');
    noteGroup.classList.toggle('is-correct', correct);
    noteGroup.classList.toggle('is-wrong', !correct);
    if (correct) {
      score += 1;
      feedback.textContent = '正解';
      feedback.className = 'feedback correct';
    } else {
      if (selectedDegree !== null) answerButtons[selectedDegree].classList.add('wrong');
      feedback.textContent = timedOut
        ? `時間切れ　正解：${NOTE_NAMES[currentQuestion.degree]}`
        : `正解：${NOTE_NAMES[currentQuestion.degree]}`;
      feedback.className = 'feedback wrong';
    }
    updateScoreboard();
    feedbackTimer = window.setTimeout(() => {
      feedbackTimer = null;
      if (round >= settings.total) showResult();
      else startQuestion();
    }, 650);
  }

  function animateQuestion(startTime) {
    const startX = 940;
    const endX = 205;
    const duration = settings.flowSeconds * 1000;
    const tick = now => {
      if (locked) return;
      const progress = Math.min(1, (now - startTime) / duration);
      const easedProgress = progress;
      const x = startX + (endX - startX) * easedProgress;
      setNoteX(x);
      flowProgress.style.width = `${progress * 100}%`;
      if (progress >= 1) finishQuestion(false, null, true);
      else animationFrame = requestAnimationFrame(tick);
    };
    animationFrame = requestAnimationFrame(tick);
  }

  function startQuestion() {
    cancelMotion();
    round += 1;
    currentQuestion = makeQuestion();
    locked = false;
    resetButtonStyles();
    setButtonsEnabled(true);
    feedback.textContent = '';
    feedback.className = 'feedback';
    noteGroup.classList.remove('is-correct', 'is-wrong');
    flowProgress.style.width = '0%';
    prepareQuestionDrawing(currentQuestion.clefId, currentQuestion.diatonicNumber);
    setNoteX(940);
    updateScoreboard();
    animateQuestion(performance.now());
  }

  function answer(degree) {
    if (locked || !currentQuestion) return;
    finishQuestion(degree === currentQuestion.degree, degree);
  }

  function beginSession() {
    round = 0;
    score = 0;
    previousNumber = null;
    nextAlternateClef = randomIndex(2) ? 'treble' : 'bass';
    setupPanel.hidden = true;
    resultPanel.hidden = true;
    gamePanel.hidden = false;
    startQuestion();
  }

  function showSettings() {
    cancelMotion();
    locked = true;
    gamePanel.hidden = true;
    resultPanel.hidden = true;
    setupPanel.hidden = false;
  }

  function showResult() {
    cancelMotion();
    locked = true;
    gamePanel.hidden = true;
    resultPanel.hidden = false;
    const percent = Math.round(score / settings.total * 100);
    resultPercent.textContent = String(percent);
    resultTitle.textContent = percent === 100 ? '全問正解' : percent >= 80 ? 'いい調子' : 'もう一度';
    const clefLabel = settings.clefMode === 'alternate'
      ? 'ト音記号・ヘ音記号 交互'
      : CLEFS[settings.clefMode].label;
    resultDetail.textContent = `${clefLabel} ／ ${settings.total}問中 ${score}問正解`;
  }

  flowSecondsInput.addEventListener('input', () => {
    flowSecondsValue.textContent = `${Number(flowSecondsInput.value).toFixed(1)}秒`;
  });

  setupForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(setupForm);
    settings = {
      clefMode: data.get('clefMode'),
      total: Number(data.get('questionCount')),
      flowSeconds: Number(data.get('flowSeconds'))
    };
    beginSession();
  });

  answerButtons.forEach(button => {
    button.addEventListener('click', () => answer(Number(button.dataset.degree)));
  });

  document.addEventListener('keydown', event => {
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || gamePanel.hidden) return;
    const degree = SHORTCUTS.indexOf(event.key.toLowerCase());
    if (degree === -1) return;
    event.preventDefault();
    answer(degree);
  });

  homeButton.addEventListener('click', showSettings);
  retryButton.addEventListener('click', beginSession);
  settingsButton.addEventListener('click', showSettings);
})();
