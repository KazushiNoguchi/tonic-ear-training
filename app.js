(() => {
  'use strict';

  const SOLFEGE = ['ド', 'レ', 'ミ', 'ファ', 'ソ', 'ラ', 'シ'];
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11];
  const MODES = {
    pentatonic: {
      label: 'ペンタトニック',
      intervals: [0, 2, 4, 7, 9],
      names: ['ド', 'レ', 'ミ', 'ソ', 'ラ'],
      degrees: ['I', 'II', 'III', 'V', 'VI']
    },
    diatonic: {
      label: 'ダイアトニック',
      intervals: MAJOR_STEPS,
      names: SOLFEGE,
      degrees: ROMAN
    },
    chromatic: {
      label: 'ノンダイアトニック',
      intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      names: ['ド', 'ド♯', 'レ', 'レ♯', 'ミ', 'ファ', 'ファ♯', 'ソ', 'ソ♯', 'ラ', 'ラ♯', 'シ'],
      degrees: ['1', '♯1', '2', '♯2', '3', '4', '♯4', '5', '♯5', '6', '♯6', '7']
    }
  };
  const TIMBRES = {
    square: '矩形波',
    piano: 'ピアノ',
    sine: 'サイン波',
    sawtooth: '鋸状波'
  };
  const PIANO_SAMPLE_RATE = 44100;
  const KEYS = [
    { midi: 48, name: 'Cメジャー' },
    { midi: 49, name: 'D♭メジャー' },
    { midi: 50, name: 'Dメジャー' },
    { midi: 51, name: 'E♭メジャー' },
    { midi: 52, name: 'Eメジャー' },
    { midi: 53, name: 'Fメジャー' },
    { midi: 54, name: 'G♭メジャー' },
    { midi: 55, name: 'Gメジャー' },
    { midi: 56, name: 'A♭メジャー' },
    { midi: 57, name: 'Aメジャー' },
    { midi: 58, name: 'B♭メジャー' },
    { midi: 59, name: 'Bメジャー' }
  ];
  const CHORD_QUALITIES = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    major7: [0, 4, 7, 11],
    minor7: [0, 3, 7, 10],
    dominant7: [0, 4, 7, 10]
  };
  const CHORD_PROGRESSIONS = {
    basic: {
      label: '基本進行',
      roman: 'I | IV | V | I',
      stepSeconds: 0.5,
      chords: [
        { root: 0, quality: 'major' },
        { root: 5, quality: 'major' },
        { root: 7, quality: 'major' },
        { root: 0, quality: 'major' }
      ],
      fixedVoicings: [
        [-12, 0, 4, 7],
        [-7, 0, 5, 9],
        [-5, 2, 7, 11],
        [-12, 0, 4, 7]
      ]
    },
    marusa: {
      label: '丸サ進行',
      roman: 'IVM7 | III7 | VIm7 | Vm7 I7',
      stepSeconds: 0.68,
      chords: [
        { root: 5, quality: 'major7' },
        { root: 4, quality: 'dominant7' },
        { root: 9, quality: 'minor7' },
        { root: 7, quality: 'minor7', length: 0.5 },
        { root: 0, quality: 'dominant7', length: 0.5 }
      ]
    },
    royalRoad: {
      label: '王道進行',
      roman: 'IVM7 | V7 | IIIm7 | VIm7',
      stepSeconds: 0.68,
      chords: [
        { root: 5, quality: 'major7' },
        { root: 7, quality: 'dominant7' },
        { root: 4, quality: 'minor7' },
        { root: 9, quality: 'minor7' }
      ]
    },
    komuro: {
      label: '小室進行',
      roman: 'VIm | IV | V | I',
      stepSeconds: 0.68,
      chords: [
        { root: 9, quality: 'minor' },
        { root: 5, quality: 'major' },
        { root: 7, quality: 'major' },
        { root: 0, quality: 'major' }
      ]
    },
    canon: {
      label: 'カノン進行',
      roman: 'I | V | VIm | IIIm | IV | I | IV | V',
      stepSeconds: 0.46,
      chords: [
        { root: 0, quality: 'major' },
        { root: 7, quality: 'major' },
        { root: 9, quality: 'minor' },
        { root: 4, quality: 'minor' },
        { root: 5, quality: 'major' },
        { root: 0, quality: 'major' },
        { root: 5, quality: 'major' },
        { root: 7, quality: 'major' }
      ]
    },
    pop: {
      label: 'ポップ定番進行',
      roman: 'I | V | VIm | IV',
      stepSeconds: 0.68,
      chords: [
        { root: 0, quality: 'major' },
        { root: 7, quality: 'major' },
        { root: 9, quality: 'minor' },
        { root: 5, quality: 'major' }
      ]
    },
    circle: {
      label: '循環進行',
      roman: 'IM7 | VI7 | IIm7 | V7',
      stepSeconds: 0.68,
      chords: [
        { root: 0, quality: 'major7' },
        { root: 9, quality: 'dominant7' },
        { root: 2, quality: 'minor7' },
        { root: 7, quality: 'dominant7' }
      ]
    }
  };

  const game = document.querySelector('#game');
  const volumeSlider = document.querySelector('#volumeSlider');
  const volumeValue = document.querySelector('#volumeValue');
  const keyboard = document.querySelector('#keyboard');
  const keyboardHint = document.querySelector('.keyboard-hint');
  const settingsForm = document.querySelector('#settingsForm');
  const setupSubmitButton = settingsForm.querySelector('.setup-submit');
  const noteModeInputs = [...settingsForm.querySelectorAll('input[name="noteMode"]')];
  const excludeNoteInputs = [...settingsForm.querySelectorAll('input[name="excludeNote"]')];
  const rangeMinInput = document.querySelector('#rangeMin');
  const rangeMaxInput = document.querySelector('#rangeMax');
  const rangeMinValue = document.querySelector('#rangeMinValue');
  const rangeMaxValue = document.querySelector('#rangeMaxValue');
  const keyRepeatCountInput = document.querySelector('#keyRepeatCount');
  const fixedKeyChoiceRow = document.querySelector('#fixedKeyChoiceRow');
  const fixedKeyChoiceInput = document.querySelector('#fixedKeyChoice');
  const chordProgressionInput = document.querySelector('#chordProgression');
  const resultPanel = document.querySelector('#resultPanel');
  const statsPanel = document.querySelector('#statsPanel');
  const sessionStatsContent = document.querySelector('#sessionStatsContent');
  const lifetimeStatsContent = document.querySelector('#lifetimeStatsContent');
  const statisticsButton = document.querySelector('#statisticsButton');
  const resultStatsButton = document.querySelector('#resultStatsButton');
  const statsBackButton = document.querySelector('#statsBackButton');
  const statsResetButton = document.querySelector('#statsResetButton');
  const homeButton = document.querySelector('#homeButton');
  const setupTitle = document.querySelector('#setupTitle');
  const setupNumber = document.querySelector('.setup-number');
  const setupNote = document.querySelector('.setup-note');
  const resultScore = document.querySelector('#resultScore');
  const resultCaption = document.querySelector('#resultCaption');
  const retryButton = document.querySelector('#retryButton');
  const settingsButton = document.querySelector('#settingsButton');
  const replayButton = document.querySelector('#replayButton');
  const clearAnswerButton = document.querySelector('#clearAnswerButton');
  const referencePatternButton = document.querySelector('#referencePatternButton');
  const referenceSpeedControl = document.querySelector('#referenceSpeedControl');
  const referenceSpeedInput = document.querySelector('#referenceSpeed');
  const referenceSpeedValue = document.querySelector('#referenceSpeedValue');
  const nextButton = document.querySelector('#nextButton');
  const phaseText = document.querySelector('#phaseText');
  const headline = document.querySelector('#headline');
  const statusCopy = document.querySelector('#statusCopy');
  const roundLabel = document.querySelector('#roundLabel');
  const feedback = document.querySelector('#feedback');
  const feedbackMain = document.querySelector('#feedbackMain');
  const feedbackDetail = document.querySelector('#feedbackDetail');
  const scoreNode = document.querySelector('#score');
  const attemptsNode = document.querySelector('#attempts');
  const streakNode = document.querySelector('#streak');
  const accuracyNode = document.querySelector('#accuracy');
  const liveRegion = document.querySelector('#liveRegion');
  const sequenceSteps = [...document.querySelectorAll('.sequence-step')];
  const foundationStepLabel = document.querySelector('#foundationStepLabel');

  function appendSelectOption(select, value, label) {
    const option = document.createElement('option');
    option.value = String(value);
    option.textContent = label;
    select.appendChild(option);
  }

  [
    [1, 'しない'],
    ['all', 'ずっと'],
    [2, '2'],
    [3, '3'],
    [5, '5'],
    [10, '10']
  ].forEach(([value, label]) => appendSelectOption(keyRepeatCountInput, value, label));
  appendSelectOption(fixedKeyChoiceInput, 'random', 'ランダム');
  KEYS.forEach((key, index) => appendSelectOption(fixedKeyChoiceInput, index, key.name));
  Object.entries(CHORD_PROGRESSIONS).forEach(([id, progression]) => {
    appendSelectOption(chordProgressionInput, id, `${progression.label}｜${progression.roman}`);
  });

  let audioContext;
  let masterGain;
  let limiter;
  let currentRound = null;
  let roundNumber = 0;
  let score = 0;
  let attempts = 0;
  let streak = 0;
  let state = 'idle';
  let playbackId = 0;
  let timers = [];
  let previousKeyIndex = null;
  let currentKeyIndex = null;
  let roundsOnCurrentKey = 0;
  let keyBag = [];
  let degreeHistory = [];
  let lastRoundCorrect = null;
  const activeOscillators = new Set();
  let session = {
    total: 10,
    modeId: 'diatonic',
    mode: MODES.diatonic,
    sequenceLength: 1,
    timbre: 'piano',
    excludedIntervals: [],
    rangeMin: 36,
    rangeMax: 95,
    keyRepeatCount: 1,
    fixedKeyIndex: null,
    preQuestionReference: false,
    progressionId: 'basic',
    progression: CHORD_PROGRESSIONS.basic
  };
  let keyButtons = [];
  let userAnswers = [];
  let statsReturnView = 'settings';
  let statsModeLength = 1;
  const pianoBuffers = new Map();
  let pianoLoadPromise = null;

  const VOLUME_STORAGE_KEY = 'tonic-ear-training-volume';
  let masterVolume = 0.3;
  try {
    const savedVolumeValue = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (savedVolumeValue !== null) {
      const savedVolume = Number(savedVolumeValue);
      if (Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= 1) masterVolume = savedVolume;
    }
  } catch (_) {}
  volumeSlider.value = String(Math.round(masterVolume * 100));
  volumeValue.textContent = volumeSlider.value;

  const REFERENCE_SPEED_STORAGE_KEY = 'tonic-ear-training-reference-speed';
  let referenceNoteSeconds = 0.5;
  try {
    const savedReferenceSpeed = Number(localStorage.getItem(REFERENCE_SPEED_STORAGE_KEY));
    if (Number.isFinite(savedReferenceSpeed) && savedReferenceSpeed >= 0.25 && savedReferenceSpeed <= 1) {
      referenceNoteSeconds = savedReferenceSpeed;
    }
  } catch (_) {}
  referenceSpeedInput.value = String(referenceNoteSeconds);
  referenceSpeedValue.textContent = `${referenceNoteSeconds.toFixed(2)}秒`;

  const STATS_STORAGE_KEY = 'tonic-ear-training-stats-v3';

  function emptyModeStats() {
    return {
      total: 0,
      correct: 0,
      notes: Array.from({ length: 12 }, () => ({ total: 0, correct: 0 })),
      confusion: Array.from({ length: 12 }, () => Array(12).fill(0)),
      keys: Array.from({ length: 12 }, () =>
        Array.from({ length: 12 }, () => ({ total: 0, correct: 0 }))
      ),
      questions: {
        total: 0,
        correct: 0,
        totalPlays: 0,
        correctPlays: 0,
        onePlayCorrect: 0
      }
    };
  }

  function emptyStats() {
    return {
      version: 3,
      modes: {
        1: emptyModeStats(),
        2: emptyModeStats(),
        3: emptyModeStats()
      }
    };
  }

  function restoreModeStats(target, saved) {
    if (!saved || !Array.isArray(saved.notes)) return;
    target.total = Number(saved.total) || 0;
    target.correct = Number(saved.correct) || 0;
    target.notes.forEach((note, index) => {
      note.total = Number(saved.notes[index]?.total) || 0;
      note.correct = Number(saved.notes[index]?.correct) || 0;
    });
    target.confusion.forEach((row, targetInterval) => {
      row.forEach((_, answerInterval) => {
        row[answerInterval] = Number(saved.confusion?.[targetInterval]?.[answerInterval]) || 0;
      });
    });
    target.keys.forEach((key, keyIndex) => {
      key.forEach((note, interval) => {
        note.total = Number(saved.keys?.[keyIndex]?.[interval]?.total) || 0;
        note.correct = Number(saved.keys?.[keyIndex]?.[interval]?.correct) || 0;
      });
    });
    Object.keys(target.questions).forEach(name => {
      target.questions[name] = Number(saved.questions?.[name]) || 0;
    });
  }

  function loadStats() {
    const fallback = emptyStats();
    try {
      const saved = JSON.parse(localStorage.getItem(STATS_STORAGE_KEY));
      if (!saved || saved.version !== 3 || !saved.modes) return fallback;
      [1, 2, 3].forEach(length => restoreModeStats(fallback.modes[length], saved.modes[length]));
    } catch (_) {}
    return fallback;
  }

  let lifetimeStats = loadStats();
  let sessionStats = emptyModeStats();
  try {
    localStorage.removeItem('tonic-ear-training-stats-v1');
    localStorage.removeItem('tonic-ear-training-stats-v2');
  } catch (_) {}

  function saveStats() {
    try { localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(lifetimeStats)); } catch (_) {}
  }

  function addAnswerToStats(stats, targetInterval, answerInterval, isCorrect, keyIndex) {
    stats.total += 1;
    stats.notes[targetInterval].total += 1;
    stats.confusion[targetInterval][answerInterval] += 1;
    stats.keys[keyIndex][targetInterval].total += 1;
    if (isCorrect) {
      stats.correct += 1;
      stats.notes[targetInterval].correct += 1;
      stats.keys[keyIndex][targetInterval].correct += 1;
    }
  }

  function recordAnswer(targetInterval, answerInterval, isCorrect, keyIndex) {
    addAnswerToStats(sessionStats, targetInterval, answerInterval, isCorrect, keyIndex);
    addAnswerToStats(lifetimeStats.modes[session.sequenceLength], targetInterval, answerInterval, isCorrect, keyIndex);
  }

  function addQuestionToStats(stats, isCorrect, playCount) {
    stats.questions.total += 1;
    stats.questions.totalPlays += playCount;
    if (isCorrect) {
      stats.questions.correct += 1;
      stats.questions.correctPlays += playCount;
      if (playCount === 1) stats.questions.onePlayCorrect += 1;
    }
  }

  function recordQuestion(isCorrect, playCount) {
    addQuestionToStats(sessionStats, isCorrect, playCount);
    addQuestionToStats(lifetimeStats.modes[session.sequenceLength], isCorrect, playCount);
    saveStats();
  }

  function formatAverage(total, count) {
    return count ? `${(total / count).toFixed(2)}回` : '—';
  }

  function rateText(correct, total) {
    return total ? `${Math.round((correct / total) * 100)}%` : '—';
  }

  function mostCommonMistake(stats) {
    let best = null;
    stats.confusion.forEach((row, target) => {
      row.forEach((count, answer) => {
        if (target !== answer && count > 0 && (!best || count > best.count)) {
          best = { target, answer, count };
        }
      });
    });
    return best;
  }

  function renderAnalytics(stats, container, detailed = false) {
    const names = MODES.chromatic.names;
    const questions = stats.questions;
    const mistake = mostCommonMistake(stats);
    const noteRows = stats.notes.map((note, index) => `
      <tr><th scope="row">${names[index]}</th><td>${rateText(note.correct, note.total)}</td><td>${note.correct}/${note.total}</td></tr>`).join('');
    const confusionHead = names.map(name => `<th scope="col">${name}</th>`).join('');
    const confusionRows = stats.confusion.map((row, target) => `
      <tr><th scope="row">${names[target]}</th>${row.map(count => `<td>${count || '—'}</td>`).join('')}</tr>`).join('');
    const keyRows = stats.keys.map((keyNotes, keyIndex) => `
      <tr><th scope="row">${KEYS[keyIndex].name.replace('メジャー', '')}</th>${keyNotes.map(note =>
        `<td>${rateText(note.correct, note.total)}<small>${note.correct}/${note.total}</small></td>`
      ).join('')}</tr>`).join('');

    container.innerHTML = `
      ${detailed ? `<div class="analysis-overview"><span>${stats.total}音</span><span>正解率 ${rateText(stats.correct, stats.total)}</span></div>` : ''}
      <div class="analysis-metrics">
        <div class="analysis-metric"><span class="analysis-metric-label">全体の平均再生回数</span><span class="analysis-metric-value">${formatAverage(questions.totalPlays, questions.total)}</span></div>
        <div class="analysis-metric"><span class="analysis-metric-label">正解時の平均再生回数</span><span class="analysis-metric-value">${formatAverage(questions.correctPlays, questions.correct)}</span></div>
        <div class="analysis-metric"><span class="analysis-metric-label">一発再生で正解できた回数</span><span class="analysis-metric-value">${questions.onePlayCorrect}回</span></div>
      </div>
      <section class="analysis-section">
        <h3>各音の正答率</h3>
        <div class="data-table-wrap"><table class="data-table note-stats-table">
          <thead><tr><th scope="col">音</th><th scope="col">正答率</th><th scope="col">正解/出題</th></tr></thead>
          <tbody>${noteRows}</tbody>
        </table></div>
      </section>
      <section class="analysis-section">
        <h3>最も多い間違い</h3>
        <p class="confusion-summary">${mistake ? `${names[mistake.target]} → ${names[mistake.answer]}（${mistake.count}回）` : 'なし'}</p>
      </section>
      ${detailed ? `
        <section class="analysis-section">
          <h3>回答傾向（行：正解／列：回答）</h3>
          <div class="data-table-wrap"><table class="data-table confusion-table">
            <thead><tr><th scope="col">正解＼回答</th>${confusionHead}</tr></thead>
            <tbody>${confusionRows}</tbody>
          </table></div>
        </section>
        <section class="analysis-section">
          <h3>調別・各音の正答率</h3>
          <div class="data-table-wrap"><table class="data-table key-stats-table">
            <thead><tr><th scope="col">調</th>${confusionHead}</tr></thead>
            <tbody>${keyRows}</tbody>
          </table></div>
        </section>` : ''}`;
  }

  function renderStats() {
    lifetimeStatsContent.replaceChildren();
    const tabs = document.createElement('div');
    tabs.className = 'stats-mode-tabs';
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', 'モード別統計');
    const body = document.createElement('div');
    body.id = 'statsModePanel';
    body.setAttribute('role', 'tabpanel');
    const buttons = [1, 2, 3].map(length => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'stats-mode-tab';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', body.id);
      button.textContent = length === 1 ? '単音' : `${length}音`;
      button.addEventListener('click', () => {
        statsModeLength = length;
        buttons.forEach((item, index) => item.setAttribute('aria-selected', String(index + 1 === length)));
        renderAnalytics(lifetimeStats.modes[length], body, true);
      });
      tabs.appendChild(button);
      return button;
    });
    lifetimeStatsContent.append(tabs, body);
    buttons[statsModeLength - 1].click();
  }

  function renderKeyboard() {
    keyboard.replaceChildren();
    keyboard.className = `keyboard ${session.modeId}`;
    session.mode.names.forEach((name, index) => {
      const interval = session.mode.intervals[index];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `key${![0, 2, 4, 5, 7, 9, 11].includes(interval) ? ' accidental' : ''}`;
      button.dataset.degree = index;
      button.disabled = true;
      button.setAttribute('aria-label', `${name}、主音から${interval}半音`);
      button.innerHTML = `<span class="key-solfege">${name}</span><span class="key-degree">${session.mode.degrees[index]} · ${index + 1}</span>`;
      button.addEventListener('click', () => answer(index));
      keyboard.appendChild(button);
    });
    keyButtons = [...keyboard.querySelectorAll('.key')];
    keyboardHint.textContent = session.mode.intervals.length <= 9
      ? `KEYS 1—${session.mode.intervals.length}`
      : 'CLICK / TAP';
  }

  function createAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    try {
      return new AudioContextClass({
        latencyHint: 'interactive',
        sampleRate: PIANO_SAMPLE_RATE
      });
    } catch (_) {
      return new AudioContextClass();
    }
  }

  function ensureAudio() {
    if (!audioContext) {
      audioContext = createAudioContext();
      masterGain = audioContext.createGain();
      limiter = audioContext.createDynamicsCompressor();
      masterGain.gain.value = masterVolume;
      limiter.threshold.value = -5;
      limiter.knee.value = 4;
      limiter.ratio.value = 12;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.15;
      masterGain.connect(limiter);
      limiter.connect(audioContext.destination);
    }
    if (audioContext.state === 'suspended') audioContext.resume();
  }

  function midiToHz(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function midiToSampleName(midi) {
    const names = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    return `${names[midi % 12]}${Math.floor(midi / 12) - 1}`;
  }

  function dataUriToArrayBuffer(dataUri) {
    const binary = window.atob(dataUri.slice(dataUri.indexOf(',') + 1));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes.buffer;
  }

  function preparePianoSamples() {
    if (pianoBuffers.size) return Promise.resolve();
    if (pianoLoadPromise) return pianoLoadPromise;
    if (audioContext.sampleRate !== PIANO_SAMPLE_RATE) return Promise.resolve();
    const samples = window.MIDI?.Soundfont?.acoustic_grand_piano;
    if (!samples) return Promise.resolve();

    pianoLoadPromise = Promise.all(
      Array.from({ length: 88 }, (_, index) => index + 21).map(async midi => {
        const dataUri = samples[midiToSampleName(midi)];
        if (!dataUri) return;
        const buffer = await audioContext.decodeAudioData(dataUriToArrayBuffer(dataUri));
        pianoBuffers.set(midi, buffer);
      })
    ).catch(error => {
      console.warn('Piano samples could not be decoded.', error);
    });
    return pianoLoadPromise;
  }

  function registerOscillator(oscillator, start, stop) {
    activeOscillators.add(oscillator);
    oscillator.addEventListener('ended', () => activeOscillators.delete(oscillator), { once: true });
    oscillator.start(start);
    oscillator.stop(stop);
  }

  function scheduleSynthPianoTone(midi, start, duration, volume) {
    const frequency = midiToHz(midi);
    const end = start + duration + 0.32;
    const partials = [
      { multiple: 1, level: 1 },
      { multiple: 2, level: 0.3 },
      { multiple: 3, level: 0.14 },
      { multiple: 4, level: 0.06 }
    ];

    partials.forEach(partial => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency * partial.multiple, start);
      oscillator.detune.setValueAtTime((partial.multiple - 1) * 1.5, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume * partial.level, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * partial.level * 0.28), start + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      oscillator.connect(gain);
      gain.connect(masterGain);
      registerOscillator(oscillator, start, end + 0.02);
    });
  }

  function schedulePianoTone(midi, start, duration, volume) {
    const buffer = pianoBuffers.get(midi);
    if (!buffer) {
      scheduleSynthPianoTone(midi, start, duration, volume);
      return;
    }

    const source = audioContext.createBufferSource();
    const gain = audioContext.createGain();
    const end = start + Math.min(buffer.duration, duration + 0.38);
    source.buffer = buffer;
    gain.gain.setValueAtTime(0.0001, start);
    const pianoVolume = volume * 14.4;
    gain.gain.exponentialRampToValueAtTime(pianoVolume, start + 0.006);
    gain.gain.setValueAtTime(pianoVolume, Math.min(end - 0.12, start + duration));
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    source.connect(gain);
    gain.connect(masterGain);
    registerOscillator(source, start, end + 0.02);
  }

  function scheduleTone(midi, start, duration = 0.5, volume = 0.17) {
    if (session.timbre === 'piano') {
      schedulePianoTone(midi, start, duration, volume);
      return;
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const frequency = midiToHz(midi);
    oscillator.type = session.timbre;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
    gain.gain.setValueAtTime(volume, Math.max(start + 0.02, start + duration - 0.055));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    if (session.timbre === 'square' || session.timbre === 'sawtooth') {
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(4200, Math.max(900, frequency * 5)), start);
      filter.Q.setValueAtTime(0.7, start);
      oscillator.connect(filter);
      filter.connect(gain);
    } else {
      oscillator.connect(gain);
    }
    gain.connect(masterGain);
    registerOscillator(oscillator, start, start + duration + 0.02);
  }

  function scheduleUi(delaySeconds, callback) {
    const id = window.setTimeout(callback, delaySeconds * 1000);
    timers.push(id);
  }

  function clearPlayback() {
    playbackId += 1;
    timers.forEach(window.clearTimeout);
    timers = [];
    activeOscillators.forEach(oscillator => {
      try { oscillator.stop(); } catch (_) {}
    });
    activeOscillators.clear();
  }

  function setSequence(activeIndex, doneThrough = activeIndex - 1) {
    sequenceSteps.forEach((step, index) => {
      step.classList.toggle('active', index === activeIndex);
      step.classList.toggle('done', index <= doneThrough);
    });
  }

  function setKeysEnabled(enabled) {
    keyButtons.forEach(button => { button.disabled = !enabled; });
  }

  function resetKeyStyles() {
    keyButtons.forEach(button => button.classList.remove('correct', 'wrong', 'pressed'));
  }

  function randomIndex(length) {
    if (window.crypto && window.crypto.getRandomValues) {
      const value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return value[0] % length;
    }
    return Math.floor(Math.random() * length);
  }

  function randomUnit() {
    if (window.crypto && window.crypto.getRandomValues) {
      const value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return value[0] / 4294967296;
    }
    return Math.random();
  }

  function shuffled(values) {
    const result = [...values];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = randomIndex(index + 1);
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function drawNewKeyIndex() {
    if (!keyBag.length) {
      keyBag = shuffled(Array.from({ length: KEYS.length }, (_, index) => index));
      if (keyBag[0] === previousKeyIndex && keyBag.length > 1) {
        const swapIndex = 1 + randomIndex(keyBag.length - 1);
        [keyBag[0], keyBag[swapIndex]] = [keyBag[swapIndex], keyBag[0]];
      }
    }
    const keyIndex = keyBag.shift();
    previousKeyIndex = keyIndex;
    return keyIndex;
  }

  function drawKeyIndex() {
    if (currentKeyIndex === null) {
      currentKeyIndex = session.keyRepeatCount === Infinity && Number.isInteger(session.fixedKeyIndex)
        ? session.fixedKeyIndex
        : drawNewKeyIndex();
      previousKeyIndex = currentKeyIndex;
      roundsOnCurrentKey = 1;
      return currentKeyIndex;
    }
    if (roundsOnCurrentKey < session.keyRepeatCount) {
      roundsOnCurrentKey += 1;
      return currentKeyIndex;
    }
    currentKeyIndex = drawNewKeyIndex();
    roundsOnCurrentKey = 1;
    return currentKeyIndex;
  }

  function drawDegree(eligibleDegrees) {
    if (eligibleDegrees.length <= 5) {
      return eligibleDegrees[randomIndex(eligibleDegrees.length)];
    }
    const historyLimit = Math.max(8, eligibleDegrees.length * 2);
    const recentHistory = degreeHistory.slice(-historyLimit);
    const previousDegree = degreeHistory[degreeHistory.length - 1];
    const weightedChoices = eligibleDegrees.map(degree => {
      const recentCount = recentHistory.filter(item => item === degree).length;
      let weight = 1 / (1 + recentCount * 0.7);
      if (degree === previousDegree) weight *= 0.45;
      return { degree, weight };
    });
    const totalWeight = weightedChoices.reduce((sum, choice) => sum + choice.weight, 0);
    let cursor = randomUnit() * totalWeight;
    const selected = weightedChoices.find(choice => {
      cursor -= choice.weight;
      return cursor <= 0;
    })?.degree ?? weightedChoices[weightedChoices.length - 1].degree;
    degreeHistory.push(selected);
    if (degreeHistory.length > historyLimit) degreeHistory = degreeHistory.slice(-historyLimit);
    return selected;
  }

  function buildRound() {
    const keyIndex = drawKeyIndex();
    const key = KEYS[keyIndex];
    const excludedIntervals = new Set(session.excludedIntervals);
    const eligibleDegrees = session.mode.intervals
      .map((interval, index) => ({ interval, index }))
      .filter(choice => !excludedIntervals.has(choice.interval))
      .map(choice => choice.index);
    const degrees = Array.from(
      { length: session.sequenceLength },
      () => drawDegree(eligibleDegrees)
    );
    const intervals = degrees.map(degree => session.mode.intervals[degree]);
    const windowCount = session.rangeMax - session.rangeMin - 10;
    const windowStart = session.rangeMin + randomIndex(windowCount);
    const targetMidis = intervals.map(interval => {
      const pitchClass = (key.midi + interval) % 12;
      return windowStart + ((pitchClass - (windowStart % 12) + 12) % 12);
    });
    return {
      keyIndex,
      key,
      degrees,
      intervals,
      targetMidis,
      windowStart,
      playCount: 0
    };
  }

  function pitchesForClass(pitchClass, minimum, maximum) {
    const pitches = [];
    for (let midi = minimum; midi <= maximum; midi += 1) {
      if ((midi % 12 + 12) % 12 === pitchClass) pitches.push(midi);
    }
    return pitches;
  }

  function chordVoicingCandidates(tonic, chord) {
    const intervals = CHORD_QUALITIES[chord.quality];
    const rootPitchClass = (tonic + chord.root) % 12;
    const bassCandidates = pitchesForClass(rootPitchClass, 36, 52);
    const upperIntervals = intervals.length === 3 ? intervals : intervals.slice(1);
    const upperChoices = upperIntervals.map(interval =>
      pitchesForClass((rootPitchClass + interval) % 12, 48, 79)
    );
    const candidates = new Map();

    upperChoices[0].forEach(first => {
      upperChoices[1].forEach(second => {
        upperChoices[2].forEach(third => {
          const upper = [first, second, third].sort((a, b) => a - b);
          if (new Set(upper).size !== 3 || upper[2] - upper[0] > 17) return;
          bassCandidates.forEach(bass => {
            if (upper[0] - bass < 5) return;
            const voicing = [bass, ...upper];
            candidates.set(voicing.join(','), voicing);
          });
        });
      });
    });
    return [...candidates.values()];
  }

  function voicingTransitionCost(previous, current) {
    return current.reduce((cost, note, voiceIndex) => {
      const movement = Math.abs(note - previous[voiceIndex]);
      const leapPenalty = movement > 7 ? (movement - 7) * 1.8 : 0;
      return cost + movement * (voiceIndex === 0 ? 0.55 : 1) + leapPenalty;
    }, 0);
  }

  function smoothProgressionVoicings(tonic, progression) {
    if (progression.fixedVoicings) {
      return progression.fixedVoicings.map(voicing => voicing.map(offset => tonic + offset));
    }
    const anchor = [tonic - 12, tonic, tonic + 4, tonic + 7];
    let states = chordVoicingCandidates(tonic, progression.chords[0]).map(voicing => ({
      voicing,
      cost: voicingTransitionCost(anchor, voicing),
      path: [voicing]
    }));

    progression.chords.slice(1).forEach(chord => {
      const candidates = chordVoicingCandidates(tonic, chord);
      states = candidates.map(voicing => {
        let bestPrevious = states[0];
        let bestCost = Infinity;
        states.forEach(previous => {
          const cost = previous.cost + voicingTransitionCost(previous.voicing, voicing);
          if (cost < bestCost) {
            bestCost = cost;
            bestPrevious = previous;
          }
        });
        return { voicing, cost: bestCost, path: [...bestPrevious.path, voicing] };
      });
    });

    return states.reduce((best, candidate) => candidate.cost < best.cost ? candidate : best).path;
  }

  function scheduleChordProgression(tonic, progression, start) {
    const voicings = smoothProgressionVoicings(tonic, progression);
    let cursor = start;
    progression.chords.forEach((chord, chordIndex) => {
      const chordSeconds = progression.stepSeconds * (chord.length || 1);
      voicings[chordIndex].forEach(note => {
        scheduleTone(note, cursor, Math.max(0.28, chordSeconds * 0.92), 0.105);
      });
      cursor += chordSeconds;
    });
    return cursor;
  }

  function playRound(reviewMode = false) {
    if (!currentRound || (state === 'feedback' && !reviewMode)) return;
    ensureAudio();
    clearPlayback();
    if (!reviewMode) {
      currentRound.playCount += 1;
      userAnswers = [];
      resetKeyStyles();
    }
    setKeysEnabled(false);
    feedback.classList.remove('visible');
    nextButton.disabled = true;
    nextButton.textContent = '再生中…';
    replayButton.disabled = true;
    clearAnswerButton.disabled = true;
    clearAnswerButton.hidden = session.sequenceLength === 1;
    referencePatternButton.hidden = true;
    referenceSpeedControl.hidden = true;
    referenceSpeedInput.disabled = false;
    game.classList.add('is-playing');
    state = 'playing';
    const includePrelude = session.preQuestionReference && !reviewMode;
    phaseText.textContent = includePrelude ? 'ド基準フレーズ' : '基準コードを再生中';
    headline.textContent = includePrelude ? 'ド基準フレーズ' : session.progression.roman;
    statusCopy.textContent = '';
    setSequence(0);

    const now = audioContext.currentTime + 0.08;
    const tonic = currentRound.key.midi;
    let chordStart = now;
    if (includePrelude) {
      const lowTonic = currentRound.targetMidis[0] - currentRound.intervals[0];
      chordStart = scheduleReferenceSequence(buildReferenceFirstHalf(lowTonic), now) + referenceNoteSeconds * 0.7;
    }
    const targetStart = scheduleChordProgression(tonic, session.progression, chordStart) + 0.5;
    currentRound.targetMidis.forEach((midi, index) => {
      scheduleTone(midi, targetStart + index * 0.5, 0.48, 0.24);
    });

    const idAtStart = playbackId;
    if (includePrelude) {
      scheduleUi(chordStart - audioContext.currentTime, () => {
        if (idAtStart !== playbackId) return;
        phaseText.textContent = '基準コードを再生中';
        headline.textContent = session.progression.roman;
      });
    }
    scheduleUi(targetStart - audioContext.currentTime, () => {
      if (idAtStart !== playbackId) return;
      phaseText.textContent = '問題の音';
      headline.textContent = '問題の音';
      statusCopy.textContent = '';
      setSequence(1, 0);
    });
    const answerReadyDelay = targetStart - audioContext.currentTime + session.sequenceLength * 0.5 + 0.25;
    scheduleUi(answerReadyDelay, () => {
      if (idAtStart !== playbackId) return;
      if (reviewMode) {
        state = 'feedback';
        game.classList.remove('is-playing');
        phaseText.textContent = lastRoundCorrect ? '正解' : '不正解';
        headline.textContent = lastRoundCorrect ? '正解' : '不正解';
        setSequence(-1, 2);
        feedback.classList.add('visible');
        replayButton.disabled = false;
        referencePatternButton.hidden = false;
        referenceSpeedControl.hidden = false;
        nextButton.disabled = false;
        nextButton.textContent = attempts >= session.total ? '結果を見る →' : '次の問題へ →';
        liveRegion.textContent = '再生が終わりました。';
        return;
      }
      state = 'answering';
      game.classList.remove('is-playing');
      phaseText.textContent = '回答';
      headline.textContent = session.sequenceLength === 1 ? '音を選んでください' : `0 / ${session.sequenceLength}`;
      setSequence(2, 1);
      setKeysEnabled(true);
      replayButton.disabled = false;
      clearAnswerButton.disabled = true;
      liveRegion.textContent = `再生が終わりました。${session.sequenceLength}音を順番に回答してください。`;
    });
  }

  function startRound() {
    state = 'idle';
    roundNumber += 1;
    currentRound = buildRound();
    roundLabel.textContent = `Ear training / ${String(roundNumber).padStart(2, '0')} of ${String(session.total).padStart(2, '0')}`;
    playRound();
  }

  function animateKey(index) {
    const button = keyButtons[index];
    button.classList.add('pressed');
    window.setTimeout(() => button.classList.remove('pressed'), 160);
  }

  function scheduleSequence(midis, start) {
    midis.forEach((midi, index) => scheduleTone(midi, start + index * 0.5, 0.46, 0.25));
  }

  function midiInRoundWindow(interval) {
    const pitchClass = (currentRound.key.midi + interval) % 12;
    return currentRound.windowStart + ((pitchClass - (currentRound.windowStart % 12) + 12) % 12);
  }

  function scheduleTonicResolution(interval, targetMidi, start) {
    let scaleSteps;
    const tonicMidi = targetMidi - interval;
    const isDiatonic = MAJOR_STEPS.includes(interval);
    if (interval <= 5) {
      const adjacentDiatonic = isDiatonic
        ? interval
        : Math.max(...MAJOR_STEPS.filter(step => step < interval));
      scaleSteps = MAJOR_STEPS
        .filter(step => step <= adjacentDiatonic)
        .sort((a, b) => b - a);
      if (!isDiatonic) scaleSteps.unshift(interval);
    } else {
      const adjacentDiatonic = isDiatonic
        ? interval
        : Math.min(...MAJOR_STEPS.filter(step => step > interval));
      scaleSteps = MAJOR_STEPS
        .filter(step => step >= adjacentDiatonic)
        .sort((a, b) => a - b);
      if (!isDiatonic) scaleSteps.unshift(interval);
      scaleSteps.push(12);
    }

    if (interval === 0) scaleSteps = [0];
    scaleSteps.forEach((step, index) => {
      const isFinalTonic = index === scaleSteps.length - 1;
      scheduleTone(tonicMidi + step, start + index * 0.25, isFinalTonic ? 0.5 : 0.23, 0.25);
    });
  }

  function buildReferenceFirstHalf(lowTonic) {
    const sequence = [lowTonic];
    MAJOR_STEPS.slice(1).forEach(step => sequence.push(lowTonic + step, lowTonic));
    sequence.push(lowTonic + 12);
    return sequence;
  }

  function buildReferenceSecondHalf(lowTonic) {
    const highTonic = lowTonic + 12;
    const sequence = [highTonic];
    MAJOR_STEPS.forEach(step => sequence.push(lowTonic + step, highTonic));
    return sequence;
  }

  function scheduleReferenceSequence(midis, start) {
    const step = referenceNoteSeconds;
    midis.forEach((midi, index) => {
      const isLast = index === midis.length - 1;
      scheduleTone(midi, start + index * step, isLast ? step * 2 : step * 0.92, 0.25);
    });
    return start + (midis.length - 1) * step + step * 2;
  }

  function restoreReferenceControls(message) {
    state = 'feedback';
    game.classList.remove('is-playing');
    phaseText.textContent = lastRoundCorrect ? '正解' : '不正解';
    nextButton.disabled = false;
    replayButton.disabled = false;
    referencePatternButton.disabled = false;
    referencePatternButton.textContent = 'ド基準フレーズ';
    referencePatternButton.classList.remove('is-stop');
    referenceSpeedInput.disabled = false;
    liveRegion.textContent = message;
  }

  function stopReferencePattern() {
    if (state !== 'reference') return;
    clearPlayback();
    restoreReferenceControls('ド基準フレーズを停止しました。');
  }

  function playReferencePattern() {
    if (state !== 'feedback' || !currentRound) return;
    clearPlayback();
    ensureAudio();
    state = 'reference';
    game.classList.add('is-playing');
    phaseText.textContent = 'ド基準フレーズ';
    nextButton.disabled = true;
    replayButton.disabled = true;
    referencePatternButton.disabled = false;
    referencePatternButton.textContent = '停止';
    referencePatternButton.classList.add('is-stop');
    referenceSpeedInput.disabled = true;

    const lowTonic = currentRound.targetMidis[0] - currentRound.intervals[0];
    const firstSequence = buildReferenceFirstHalf(lowTonic);
    const secondSequence = buildReferenceSecondHalf(lowTonic);

    const now = audioContext.currentTime + 0.03;
    const firstEnd = scheduleReferenceSequence(firstSequence, now);
    const secondEnd = scheduleReferenceSequence(secondSequence, firstEnd + referenceNoteSeconds * 0.7);
    const playbackToken = playbackId;
    scheduleUi(secondEnd - audioContext.currentTime + 0.05, () => {
      if (playbackToken !== playbackId) return;
      restoreReferenceControls('ド基準フレーズの再生が終わりました。');
    });
  }

  function evaluateAnswers() {
    state = 'feedback';
    clearPlayback();
    setKeysEnabled(false);
    replayButton.disabled = true;
    clearAnswerButton.disabled = true;
    attempts += 1;

    const positionResults = userAnswers.map((answerIndex, index) => answerIndex === currentRound.degrees[index]);
    const correct = positionResults.every(Boolean);
    lastRoundCorrect = correct;
    currentRound.intervals.forEach((interval, index) => {
      recordAnswer(
        interval,
        session.mode.intervals[userAnswers[index]],
        positionResults[index],
        currentRound.keyIndex
      );
    });
    recordQuestion(correct, currentRound.playCount);

    const answerNames = userAnswers.map(index => session.mode.names[index]);
    const correctNames = currentRound.degrees.map(index => session.mode.names[index]);
    const selectedMidis = userAnswers.map(index => midiInRoundWindow(session.mode.intervals[index]));
    const correctDegreeSet = new Set(currentRound.degrees);

    userAnswers.forEach((answerIndex, index) => {
      if (!positionResults[index] && !correctDegreeSet.has(answerIndex)) keyButtons[answerIndex].classList.add('wrong');
    });
    currentRound.degrees.forEach(index => keyButtons[index].classList.add('correct'));

    ensureAudio();
    const now = audioContext.currentTime + 0.03;
    const isSingleNote = session.sequenceLength === 1;
    if (correct) {
      score += 1;
      streak += 1;
      if (isSingleNote) {
        scheduleTone(currentRound.targetMidis[0], now, 0.5, 0.25);
        scheduleTonicResolution(currentRound.intervals[0], currentRound.targetMidis[0], now + 0.65);
      } else {
        scheduleSequence(selectedMidis, now);
      }
      feedbackMain.textContent = '正解';
      feedbackDetail.textContent = `${correctNames.join(' → ')} ／ ${currentRound.key.name}`;
      headline.textContent = '正解';
      phaseText.textContent = '正解';
      liveRegion.textContent = `正解。${correctNames.join('、')}です。`;
    } else {
      streak = 0;
      if (isSingleNote) {
        scheduleTone(selectedMidis[0], now, 0.5, 0.25);
        scheduleTone(currentRound.targetMidis[0], now + 0.65, 0.5, 0.25);
        scheduleTonicResolution(currentRound.intervals[0], currentRound.targetMidis[0], now + 1.3);
      } else {
        scheduleSequence(selectedMidis, now);
        scheduleSequence(currentRound.targetMidis, now + selectedMidis.length * 0.5 + 0.35);
      }
      feedbackMain.textContent = '不正解';
      feedbackDetail.textContent = `回答：${answerNames.join(' → ')} ／ 正解：${correctNames.join(' → ')} ／ ${currentRound.key.name}`;
      headline.textContent = '不正解';
      phaseText.textContent = '不正解';
      liveRegion.textContent = `不正解。正解は${correctNames.join('、')}です。`;
    }

    scoreNode.textContent = score;
    attemptsNode.textContent = attempts;
    streakNode.textContent = streak;
    accuracyNode.textContent = `${Math.round((score / attempts) * 100)}%`;
    statusCopy.textContent = '';
    feedback.classList.add('visible');
    setSequence(-1, 2);
    nextButton.textContent = attempts >= session.total ? '結果を見る →' : '次の問題へ →';
    nextButton.disabled = false;
    replayButton.disabled = false;
    clearAnswerButton.hidden = true;
    referencePatternButton.hidden = false;
    referenceSpeedControl.hidden = false;
    nextButton.focus();
  }

  function answer(index) {
    if (state !== 'answering' || !currentRound) return;
    animateKey(index);
    userAnswers.push(index);
    if (userAnswers.length < session.sequenceLength) {
      ensureAudio();
      scheduleTone(midiInRoundWindow(session.mode.intervals[index]), audioContext.currentTime + 0.01, 0.28, 0.22);
      headline.textContent = `${userAnswers.length} / ${session.sequenceLength}`;
      statusCopy.textContent = userAnswers.map(answerIndex => session.mode.names[answerIndex]).join(' → ');
      clearAnswerButton.disabled = false;
      liveRegion.textContent = `${userAnswers.length}音目を入力しました。`;
      return;
    }
    evaluateAnswers();
  }

  function resetSession() {
    clearPlayback();
    currentRound = null;
    lastRoundCorrect = null;
    previousKeyIndex = null;
    currentKeyIndex = null;
    roundsOnCurrentKey = 0;
    keyBag = [];
    degreeHistory = [];
    roundNumber = 0;
    score = 0;
    attempts = 0;
    streak = 0;
    sessionStats = emptyModeStats();
    state = 'idle';
    scoreNode.textContent = '0';
    attemptsNode.textContent = '0';
    streakNode.textContent = '0';
    accuracyNode.textContent = '—';
    feedback.classList.remove('visible');
    game.classList.remove('is-playing');
    referencePatternButton.hidden = true;
    referencePatternButton.textContent = 'ド基準フレーズ';
    referencePatternButton.classList.remove('is-stop');
    referenceSpeedControl.hidden = true;
    referenceSpeedInput.disabled = false;
    renderKeyboard();
  }

  function beginSession() {
    resetSession();
    settingsForm.hidden = false;
    resultPanel.hidden = true;
    statsPanel.hidden = true;
    game.classList.add('game-ready');
    startRound();
  }

  function finishSession() {
    clearPlayback();
    state = 'complete';
    game.classList.remove('game-ready', 'is-playing');
    settingsForm.hidden = true;
    resultPanel.hidden = false;
    statsPanel.hidden = true;
    const percentage = Math.round((score / session.total) * 100);
    resultScore.textContent = percentage;
    const exclusionSetting = session.excludedIntervals.length ? ` · ${session.excludedIntervals.length}音除外` : '';
    resultCaption.textContent = `${session.mode.label}${exclusionSetting} · ${session.sequenceLength}音 · ${session.progression.label} · ${TIMBRES[session.timbre]} · ${session.total}問中 ${score}問正解`;
    renderAnalytics(sessionStats, sessionStatsContent);
    setupNumber.textContent = 'RESULT';
    setupTitle.textContent = '結果';
    setupNote.textContent = '';
  }

  function showSettings() {
    clearPlayback();
    state = 'idle';
    game.classList.remove('game-ready', 'is-playing');
    settingsForm.hidden = false;
    resultPanel.hidden = true;
    statsPanel.hidden = true;
    setupNumber.textContent = 'SESSION SETUP / 01';
    setupTitle.textContent = 'トレーニング設定';
    setupNote.textContent = '';
  }

  function showStats(returnView) {
    statsReturnView = returnView;
    if (returnView === 'result') statsModeLength = session.sequenceLength;
    settingsForm.hidden = true;
    resultPanel.hidden = true;
    statsPanel.hidden = false;
    setupNumber.textContent = 'STATISTICS';
    setupTitle.textContent = '統計';
    setupNote.textContent = '';
    renderStats();
  }

  function closeStats() {
    statsPanel.hidden = true;
    if (statsReturnView === 'result') {
      resultPanel.hidden = false;
      setupNumber.textContent = 'RESULT';
      setupTitle.textContent = '結果';
    } else {
      settingsForm.hidden = false;
      setupNumber.textContent = 'SESSION SETUP / 01';
      setupTitle.textContent = 'トレーニング設定';
    }
  }

  function updateExcludeOptions() {
    const modeId = noteModeInputs.find(input => input.checked)?.value || 'diatonic';
    const availableIntervals = new Set(MODES[modeId].intervals);
    excludeNoteInputs.forEach(input => {
      input.disabled = !availableIntervals.has(Number(input.value));
    });
  }

  function updateRange(source) {
    let minimum = Number(rangeMinInput.value);
    let maximum = Number(rangeMaxInput.value);
    if (maximum - minimum < 12) {
      if (source === 'minimum') {
        maximum = minimum + 12;
        rangeMaxInput.value = String(maximum);
      } else {
        minimum = maximum - 12;
        rangeMinInput.value = String(minimum);
      }
    }
    rangeMinValue.textContent = midiToSampleName(minimum);
    rangeMaxValue.textContent = midiToSampleName(maximum);
  }

  function updateFixedKeyChoice() {
    fixedKeyChoiceRow.hidden = keyRepeatCountInput.value !== 'all';
  }

  noteModeInputs.forEach(input => input.addEventListener('change', updateExcludeOptions));
  rangeMinInput.addEventListener('input', () => updateRange('minimum'));
  rangeMaxInput.addEventListener('input', () => updateRange('maximum'));
  keyRepeatCountInput.addEventListener('change', updateFixedKeyChoice);
  updateExcludeOptions();
  updateRange('minimum');
  updateFixedKeyChoice();

  settingsForm.addEventListener('submit', async event => {
    event.preventDefault();
    const data = new FormData(settingsForm);
    const modeId = data.get('noteMode');
    const keyRepeatValue = data.get('keyRepeatCount');
    const fixedKeyChoice = data.get('fixedKeyChoice');
    const progressionId = data.get('chordProgression');
    const excludedIntervals = data.getAll('excludeNote').map(Number);
    const availableIntervals = MODES[modeId].intervals.filter(interval => !excludedIntervals.includes(interval));
    if (!availableIntervals.length) {
      window.alert('出題する音を1つ以上残してください。');
      return;
    }
    session = {
      total: Number(data.get('questionCount')),
      modeId,
      mode: MODES[modeId],
      sequenceLength: Number(data.get('sequenceLength')),
      timbre: data.get('timbre'),
      excludedIntervals,
      rangeMin: Number(data.get('rangeMin')),
      rangeMax: Number(data.get('rangeMax')),
      keyRepeatCount: keyRepeatValue === 'all' ? Infinity : Number(keyRepeatValue),
      fixedKeyIndex: keyRepeatValue === 'all' && fixedKeyChoice !== 'random'
        ? Number(fixedKeyChoice)
        : null,
      preQuestionReference: data.has('preQuestionReference'),
      progressionId,
      progression: CHORD_PROGRESSIONS[progressionId] || CHORD_PROGRESSIONS.basic
    };
    foundationStepLabel.textContent = session.preQuestionReference
      ? `ド基準 → ${session.progression.label}`
      : session.progression.label;
    ensureAudio();
    if (session.timbre === 'piano') {
      setupSubmitButton.disabled = true;
      setupSubmitButton.textContent = 'ピアノ音源を読込中…';
      await preparePianoSamples();
      setupSubmitButton.disabled = false;
      setupSubmitButton.textContent = 'この設定で始める →';
    }
    beginSession();
  });

  replayButton.addEventListener('click', () => {
    if (state === 'answering') playRound();
    else if (state === 'feedback') playRound(true);
  });

  referencePatternButton.addEventListener('click', () => {
    if (state === 'reference') stopReferencePattern();
    else playReferencePattern();
  });

  clearAnswerButton.addEventListener('click', () => {
    if (state !== 'answering' || userAnswers.length === 0) return;
    userAnswers = [];
    resetKeyStyles();
    headline.textContent = `0 / ${session.sequenceLength}`;
    statusCopy.textContent = '';
    clearAnswerButton.disabled = true;
    liveRegion.textContent = '入力を消去しました。';
  });

  nextButton.addEventListener('click', () => {
    if (state !== 'feedback') return;
    feedback.classList.remove('visible');
    if (attempts >= session.total) finishSession();
    else startRound();
  });

  retryButton.addEventListener('click', () => {
    ensureAudio();
    beginSession();
  });

  settingsButton.addEventListener('click', showSettings);
  homeButton.addEventListener('click', showSettings);
  statisticsButton.addEventListener('click', () => showStats('settings'));
  resultStatsButton.addEventListener('click', () => showStats('result'));
  statsBackButton.addEventListener('click', closeStats);
  statsResetButton.addEventListener('click', () => {
    if (!window.confirm('統計をリセットしますか？')) return;
    lifetimeStats = emptyStats();
    saveStats();
    renderStats();
  });

  volumeSlider.addEventListener('input', () => {
    masterVolume = Number(volumeSlider.value) / 100;
    volumeValue.textContent = volumeSlider.value;
    if (masterGain && audioContext) {
      masterGain.gain.cancelScheduledValues(audioContext.currentTime);
      masterGain.gain.setTargetAtTime(masterVolume, audioContext.currentTime, 0.015);
    }
    try { localStorage.setItem(VOLUME_STORAGE_KEY, String(masterVolume)); } catch (_) {}
  });

  referenceSpeedInput.addEventListener('input', () => {
    referenceNoteSeconds = Number(referenceSpeedInput.value);
    referenceSpeedValue.textContent = `${referenceNoteSeconds.toFixed(2)}秒`;
    try { localStorage.setItem(REFERENCE_SPEED_STORAGE_KEY, String(referenceNoteSeconds)); } catch (_) {}
  });

  document.addEventListener('keydown', event => {
    if (event.repeat || state !== 'answering') return;
    const number = Number(event.key);
    if (number >= 1 && number <= Math.min(9, keyButtons.length)) {
      event.preventDefault();
      answer(number - 1);
    }
  });
})();
