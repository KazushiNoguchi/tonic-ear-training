(() => {
  'use strict';

  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11];
  const NOTE_NOTATIONS = {
    sharp: ['ド', 'ド♯', 'レ', 'レ♯', 'ミ', 'ファ', 'ファ♯', 'ソ', 'ソ♯', 'ラ', 'ラ♯', 'シ'],
    flat: ['ド', 'レ♭', 'レ', 'ミ♭', 'ミ', 'ファ', 'ソ♭', 'ソ', 'ラ♭', 'ラ', 'シ♭', 'シ'],
    chromaticSharp: ['ド', 'ディ', 'レ', 'リ', 'ミ', 'ファ', 'フィ', 'ソ', 'スィ', 'ラ', 'リ', 'ティ'],
    chromaticFlat: ['ド', 'ラ', 'レ', 'メ', 'ミ', 'ファ', 'セ', 'ソ', 'レ', 'ラ', 'テ', 'ティ'],
    noro: ['ド', 'ディ', 'レ', 'メ', 'ミ', 'ファ', 'フィ', 'ソ', 'スィ', 'ラ', 'リ', 'シ']
  };
  const PIANO_KEY_BINDINGS = [
    { key: 'z', code: 'KeyZ', interval: 0, finger: '小' },
    { key: 's', code: 'KeyS', interval: 1, finger: '薬' },
    { key: 'x', code: 'KeyX', interval: 2, finger: '薬' },
    { key: 'd', code: 'KeyD', interval: 3, finger: '中' },
    { key: 'c', code: 'KeyC', interval: 4, finger: '中' },
    { key: 'v', code: 'KeyV', interval: 5, finger: '人' },
    { key: 'g', code: 'KeyG', interval: 6, finger: '人' },
    { key: 'b', code: 'KeyB', interval: 7, finger: '人' },
    { key: 'h', code: 'KeyH', interval: 8, finger: '人' },
    { key: 'n', code: 'KeyN', interval: 9, finger: '中' },
    { key: 'j', code: 'KeyJ', interval: 10, finger: '中' },
    { key: 'm', code: 'KeyM', interval: 11, finger: '薬' },
    { key: ',', code: 'Comma', interval: 12, high: true, finger: '小' }
  ];
  const MODES = {
    pentatonic: {
      label: 'ペンタトニック',
      intervals: [0, 2, 4, 7, 9],
      degrees: ['I', 'II', 'III', 'V', 'VI']
    },
    diatonic: {
      label: 'ダイアトニック',
      intervals: MAJOR_STEPS,
      degrees: ROMAN
    },
    chromatic: {
      label: 'ノンダイアトニック',
      intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
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
      roman: 'IVM7 | III7 | VIm7 | Vm7 I7 | IVM7',
      stepSeconds: 0.68,
      chords: [
        { root: 5, quality: 'major7' },
        { root: 4, quality: 'dominant7' },
        { root: 9, quality: 'minor7' },
        { root: 7, quality: 'minor7', length: 0.5 },
        { root: 0, quality: 'dominant7', length: 0.5 },
        { root: 5, quality: 'major7' }
      ]
    },
    royalRoad: {
      label: '王道進行',
      roman: 'IVM7 | V7 | IIIm7 | VIm7 | IVM7',
      stepSeconds: 0.68,
      chords: [
        { root: 5, quality: 'major7' },
        { root: 7, quality: 'dominant7' },
        { root: 4, quality: 'minor7' },
        { root: 9, quality: 'minor7' },
        { root: 5, quality: 'major7' }
      ]
    },
    komuro: {
      label: '小室進行',
      roman: 'VIm | IV | V | I | VIm',
      stepSeconds: 0.68,
      chords: [
        { root: 9, quality: 'minor' },
        { root: 5, quality: 'major' },
        { root: 7, quality: 'major' },
        { root: 0, quality: 'major' },
        { root: 9, quality: 'minor' }
      ]
    },
    canon: {
      label: 'カノン進行',
      roman: 'I | V | VIm | IIIm | IV | I | IV | V | I',
      stepSeconds: 0.46,
      chords: [
        { root: 0, quality: 'major' },
        { root: 7, quality: 'major' },
        { root: 9, quality: 'minor' },
        { root: 4, quality: 'minor' },
        { root: 5, quality: 'major' },
        { root: 0, quality: 'major' },
        { root: 5, quality: 'major' },
        { root: 7, quality: 'major' },
        { root: 0, quality: 'major' }
      ]
    },
    pop: {
      label: 'ポップ定番進行',
      roman: 'I | V | VIm | IV | I',
      stepSeconds: 0.68,
      chords: [
        { root: 0, quality: 'major' },
        { root: 7, quality: 'major' },
        { root: 9, quality: 'minor' },
        { root: 5, quality: 'major' },
        { root: 0, quality: 'major' }
      ]
    },
    circle: {
      label: '循環進行',
      roman: 'IM7 | VI7 | IIm7 | V7 | IM7',
      stepSeconds: 0.68,
      chords: [
        { root: 0, quality: 'major7' },
        { root: 9, quality: 'dominant7' },
        { root: 2, quality: 'minor7' },
        { root: 7, quality: 'dominant7' },
        { root: 0, quality: 'major7' }
      ]
    }
  };
  const MELODY_PROGRESSION_ENTRIES = Object.entries(CHORD_PROGRESSIONS)
    .filter(([id]) => id !== 'basic');

  const NOTE_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
  const MELODY_RANGES = {
    cgc2: { minimum: 0, maximum: 12 },
    gcg2: { minimum: -5, maximum: 7 },
    cgcg3: { minimum: 0, maximum: 19 },
    gcgc3: { minimum: -5, maximum: 12 }
  };

  const game = document.querySelector('#game');
  const melodyTrainer = document.querySelector('#melodyTrainer');
  const trainingMenuButtons = [...document.querySelectorAll('[data-training-view]')];
  const notationSelect = document.querySelector('#notationSelect');
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
  const melodyRangeInputs = [...document.querySelectorAll('input[name="melodyRange"]')];
  const melodyLoopInputs = [...document.querySelectorAll('input[name="melodyLoops"]')];
  const melodyKeyNode = document.querySelector('#melodyKey');
  const melodyProgressionName = document.querySelector('#melodyProgressionName');
  const melodyTimeline = document.querySelector('#melodyTimeline');
  const melodyScore = document.querySelector('.melody-score');
  const melodyVisualizer = document.querySelector('#melodyVisualizer');
  const melodyVisualizerCanvas = document.querySelector('#melodyVisualizerCanvas');
  const melodyChordsButton = document.querySelector('#melodyChordsButton');
  const melodyFirstNoteButton = document.querySelector('#melodyFirstNoteButton');
  const melodyReferenceButton = document.querySelector('#melodyReferenceButton');
  const melodyAnswerButton = document.querySelector('#melodyAnswerButton');
  const melodyNextButton = document.querySelector('#melodyNextButton');
  const melodyChordSpeed = document.querySelector('#melodyChordSpeed');
  const melodyChordSpeedValue = document.querySelector('#melodyChordSpeedValue');
  const melodyReferenceSpeed = document.querySelector('#melodyReferenceSpeed');
  const melodyReferenceSpeedValue = document.querySelector('#melodyReferenceSpeedValue');
  const melodyProgressionSelect = document.querySelector('#melodyProgressionSelect');
  const melodyKeySelect = document.querySelector('#melodyKeySelect');
  const melodyKeyboard = document.querySelector('#melodyKeyboard');
  const melodyPlaybackButtons = [melodyChordsButton, melodyFirstNoteButton, melodyReferenceButton, melodyAnswerButton];

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
  appendSelectOption(melodyProgressionSelect, 'random', 'ランダム');
  MELODY_PROGRESSION_ENTRIES.forEach(([id, progression]) => {
    appendSelectOption(melodyProgressionSelect, id, `${progression.label}｜${progression.roman}`);
  });
  appendSelectOption(melodyKeySelect, 'random', 'ランダム');
  KEYS.forEach((key, index) => appendSelectOption(melodyKeySelect, index, key.name));

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
  let melodyQuestion = null;
  let activeMelodyButton = null;
  let melodyRangeId = 'cgc2';
  let melodyLoops = 1;
  let melodyChordSeconds = 1;
  let melodyReferenceSeconds = 0.5;
  let fixedMelodyProgressionId = 'random';
  let fixedMelodyKeyIndex = null;
  let melodyAnimationFrame = null;
  let melodyVisualizerState = null;

  const NOTATION_STORAGE_KEY = 'tonic-ear-training-notation';
  let notationId = 'sharp';
  try {
    const savedNotation = localStorage.getItem(NOTATION_STORAGE_KEY);
    if (NOTE_NOTATIONS[savedNotation]) notationId = savedNotation;
  } catch (_) {}
  notationSelect.value = notationId;

  function noteName(interval, high = false) {
    const name = NOTE_NOTATIONS[notationId][pitchClass(interval)];
    return high ? `高い${name}` : name;
  }

  function modeNoteName(mode, degreeIndex) {
    return noteName(mode.intervals[degreeIndex]);
  }

  function pianoBindingForInterval(interval, high = false) {
    return PIANO_KEY_BINDINGS.find(binding => binding.interval === interval && Boolean(binding.high) === high);
  }

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
  melodyReferenceSeconds = referenceNoteSeconds;
  melodyReferenceSpeed.value = String(melodyReferenceSeconds);
  melodyReferenceSpeedValue.textContent = `${melodyReferenceSeconds.toFixed(2)}秒`;

  const STATS_STORAGE_KEY = 'tonic-ear-training-stats-v3';

  function emptyModeStats() {
    return {
      total: 0,
      correct: 0,
      notes: Array.from({ length: 12 }, () => ({
        total: 0,
        correct: 0,
        totalResponseSeconds: 0,
        timedTotal: 0
      })),
      confusion: Array.from({ length: 12 }, () => Array(12).fill(0)),
      keys: Array.from({ length: 12 }, () =>
        Array.from({ length: 12 }, () => ({ total: 0, correct: 0 }))
      ),
      questions: {
        total: 0,
        correct: 0,
        totalPlays: 0,
        correctPlays: 0,
        onePlayCorrect: 0,
        totalResponseSeconds: 0,
        correctResponseSeconds: 0,
        timedTotal: 0,
        timedCorrect: 0
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
      note.totalResponseSeconds = Number(saved.notes[index]?.totalResponseSeconds) || 0;
      note.timedTotal = Number(saved.notes[index]?.timedTotal) || 0;
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

  function addAnswerToStats(stats, targetInterval, answerInterval, isCorrect, keyIndex, responseSeconds) {
    stats.total += 1;
    stats.notes[targetInterval].total += 1;
    stats.notes[targetInterval].totalResponseSeconds += responseSeconds;
    stats.notes[targetInterval].timedTotal += 1;
    stats.confusion[targetInterval][answerInterval] += 1;
    stats.keys[keyIndex][targetInterval].total += 1;
    if (isCorrect) {
      stats.correct += 1;
      stats.notes[targetInterval].correct += 1;
      stats.keys[keyIndex][targetInterval].correct += 1;
    }
  }

  function recordAnswer(targetInterval, answerInterval, isCorrect, keyIndex, responseSeconds) {
    addAnswerToStats(sessionStats, targetInterval, answerInterval, isCorrect, keyIndex, responseSeconds);
    addAnswerToStats(
      lifetimeStats.modes[session.sequenceLength],
      targetInterval,
      answerInterval,
      isCorrect,
      keyIndex,
      responseSeconds
    );
  }

  function addQuestionToStats(stats, isCorrect, playCount, responseSeconds) {
    stats.questions.total += 1;
    stats.questions.totalPlays += playCount;
    stats.questions.totalResponseSeconds += responseSeconds;
    stats.questions.timedTotal += 1;
    if (isCorrect) {
      stats.questions.correct += 1;
      stats.questions.correctPlays += playCount;
      stats.questions.correctResponseSeconds += responseSeconds;
      stats.questions.timedCorrect += 1;
      if (playCount === 1) stats.questions.onePlayCorrect += 1;
    }
  }

  function recordQuestion(isCorrect, playCount, responseSeconds) {
    addQuestionToStats(sessionStats, isCorrect, playCount, responseSeconds);
    addQuestionToStats(lifetimeStats.modes[session.sequenceLength], isCorrect, playCount, responseSeconds);
    saveStats();
  }

  function formatAverage(total, count) {
    return count ? `${(total / count).toFixed(2)}回` : '—';
  }

  function formatTimeAverage(total, count) {
    return count ? `${(total / count).toFixed(2)}秒` : '—';
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
    const names = NOTE_NOTATIONS[notationId];
    const questions = stats.questions;
    const mistake = mostCommonMistake(stats);
    let slowestNoteIndex = -1;
    let slowestAverageSeconds = -1;
    stats.notes.forEach((note, index) => {
      if (!note.timedTotal) return;
      const average = note.totalResponseSeconds / note.timedTotal;
      if (average > slowestAverageSeconds) {
        slowestAverageSeconds = average;
        slowestNoteIndex = index;
      }
    });
    const noteRows = stats.notes.map((note, index) => `
      <tr${index === slowestNoteIndex ? ' class="slowest-note"' : ''}><th scope="row">${names[index]}</th><td>${rateText(note.correct, note.total)}</td><td>${note.correct}/${note.total}</td><td>${formatTimeAverage(note.totalResponseSeconds, note.timedTotal)}</td></tr>`).join('');
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
        <div class="analysis-metric"><span class="analysis-metric-label">正解時の平均解答時間</span><span class="analysis-metric-value">${formatTimeAverage(questions.correctResponseSeconds, questions.timedCorrect)}</span></div>
        <div class="analysis-metric"><span class="analysis-metric-label">すべての平均解答時間</span><span class="analysis-metric-value">${formatTimeAverage(questions.totalResponseSeconds, questions.timedTotal)}</span></div>
      </div>
      <section class="analysis-section">
        <h3>各音の統計</h3>
        <div class="data-table-wrap"><table class="data-table note-stats-table">
          <thead><tr><th scope="col">音</th><th scope="col">正答率</th><th scope="col">正解/出題</th><th scope="col">平均解答時間</th></tr></thead>
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
    const choices = session.mode.intervals.map((interval, index) => ({
      interval,
      answerIndex: index,
      degree: session.mode.degrees[index],
      shortcut: index + 1,
      high: false
    }));
    choices.push({ interval: 0, answerIndex: 0, degree: 'I', shortcut: choices.length + 1, high: true });
    keyboard.style.setProperty('--key-count', String(choices.length));
    choices.forEach((choice, buttonIndex) => {
      const name = noteName(choice.interval, choice.high);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `key${![0, 2, 4, 5, 7, 9, 11].includes(choice.interval) ? ' accidental' : ''}${choice.high ? ' high-tonic' : ''}`;
      button.dataset.answerIndex = String(choice.answerIndex);
      button.dataset.interval = String(choice.interval);
      button.dataset.high = String(choice.high);
      button.disabled = true;
      button.setAttribute('aria-label', `${name}、主音から${choice.high ? 12 : choice.interval}半音`);
      const pianoBinding = pianoBindingForInterval(choice.high ? 12 : choice.interval, choice.high);
      const pianoShortcut = pianoBinding.key.toUpperCase();
      button.setAttribute('aria-keyshortcuts', pianoShortcut);
      button.innerHTML = `<span class="key-guide">${pianoShortcut} · ${pianoBinding.finger}</span><span class="key-solfege">${name}</span><span class="key-degree">${choice.degree}</span>`;
      button.addEventListener('click', () => answer(buttonIndex));
      keyboard.appendChild(button);
    });
    keyButtons = [...keyboard.querySelectorAll('.key')];
    keyboardHint.textContent = 'Z S X D C V G B H N J M ,';
  }

  function refreshAnswerKeyboardLabels() {
    keyButtons.forEach((button, buttonIndex) => {
      const interval = Number(button.dataset.interval);
      const high = button.dataset.high === 'true';
      const name = noteName(interval, high);
      button.querySelector('.key-solfege').textContent = name;
      button.setAttribute('aria-label', `${name}、主音から${high ? 12 : interval}半音`);
      button.dataset.buttonIndex = String(buttonIndex);
    });
  }

  function renderMelodyKeyboard() {
    melodyKeyboard.replaceChildren();
    melodyKeyboard.style.setProperty('--key-count', '13');
    for (let interval = 0; interval <= 12; interval += 1) {
      const high = interval === 12;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `key${![0, 2, 4, 5, 7, 9, 11, 12].includes(interval) ? ' accidental' : ''}${high ? ' high-tonic' : ''}`;
      button.setAttribute('aria-label', `${noteName(interval, high)}、主音から${interval}半音`);
      const pianoBinding = pianoBindingForInterval(interval, high);
      const pianoShortcut = pianoBinding.key.toUpperCase();
      button.setAttribute('aria-keyshortcuts', pianoShortcut);
      button.innerHTML = `<span class="key-guide">${pianoShortcut} · ${pianoBinding.finger}</span><span class="key-solfege">${noteName(interval, high)}</span>`;
      button.addEventListener('click', () => playMelodyKeyboardKey(interval));
      melodyKeyboard.appendChild(button);
    }
  }

  function playMelodyKeyboardKey(interval) {
    ensureAudio();
    preparePianoSamples();
    const button = melodyKeyboard.children[interval];
    button?.classList.add('pressed');
    window.setTimeout(() => button?.classList.remove('pressed'), 160);
    const tonic = melodyQuestion?.tonic ?? 48;
    scheduleTone(tonic + 12 + interval, audioContext.currentTime + 0.01, 0.55, 0.16, 'piano');
  }

  function updateNotationUI() {
    document.querySelectorAll('[data-note-interval]').forEach(label => {
      label.textContent = noteName(Number(label.dataset.noteInterval));
    });
    refreshAnswerKeyboardLabels();
    renderMelodyKeyboard();
    if (melodyQuestion) renderMelodyQuestion();
    if (state === 'answering' && userAnswers.length) {
      statusCopy.textContent = userAnswers.map(answerButtonName).join(' → ');
    }
    if ((state === 'feedback' || state === 'reference') && currentRound) refreshFeedbackNotation();
    if (!statsPanel.hidden) renderStats();
    if (!resultPanel.hidden) renderAnalytics(sessionStats, sessionStatsContent);
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

  function scheduleTone(midi, start, duration = 0.5, volume = 0.17, timbre = session.timbre) {
    if (timbre === 'piano') {
      schedulePianoTone(midi, start, duration, volume);
      return;
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const frequency = midiToHz(midi);
    oscillator.type = timbre;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
    gain.gain.setValueAtTime(volume, Math.max(start + 0.02, start + duration - 0.055));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    if (timbre === 'square' || timbre === 'sawtooth') {
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

  function pitchClass(value) {
    return (value % 12 + 12) % 12;
  }

  function weightedChoice(choices) {
    if (!choices.length) return null;
    const total = choices.reduce((sum, choice) => sum + choice.weight, 0);
    let cursor = randomUnit() * total;
    for (const choice of choices) {
      cursor -= choice.weight;
      if (cursor <= 0) return choice.value;
    }
    return choices[choices.length - 1].value;
  }

  function chordPitchClasses(tonic, chord) {
    const root = pitchClass(tonic + chord.root);
    return CHORD_QUALITIES[chord.quality].map(interval => pitchClass(root + interval));
  }

  function isMajorScaleTone(tonic, midi) {
    return MAJOR_STEPS.includes(pitchClass(midi - tonic));
  }

  function melodyRange(tonic) {
    const range = MELODY_RANGES[melodyRangeId] || MELODY_RANGES.cgc2;
    return { minimum: tonic + range.minimum, maximum: tonic + range.maximum };
  }

  function pitchesInRange(minimum, maximum, allowedPitchClasses) {
    const allowed = new Set(allowedPitchClasses);
    const result = [];
    for (let midi = minimum; midi <= maximum; midi += 1) {
      if (allowed.has(pitchClass(midi))) result.push(midi);
    }
    return result;
  }

  function isSemitoneAboveAnotherChordTone(midi, chordPitchClassList) {
    const candidate = pitchClass(midi);
    return chordPitchClassList.some(chordTone => chordTone !== candidate && pitchClass(candidate - chordTone) === 1);
  }

  function terminalPitchClass(tonic, chord) {
    if (chord.root === 9) return pitchClass(tonic + 9);
    if (chord.root === 0 || chord.root === 5) return pitchClass(tonic);
    return null;
  }

  function chooseChordHead(tonic, chord, range, previousMidi = null, excluded = new Set(), isTerminal = false) {
    const forcedPitchClass = isTerminal ? terminalPitchClass(tonic, chord) : null;
    if (forcedPitchClass !== null) {
      const forced = pitchesInRange(range.minimum, range.maximum, [forcedPitchClass]);
      if (!forced.length) return null;
      const smallestDistance = previousMidi === null
        ? 0
        : Math.min(...forced.map(midi => Math.abs(midi - previousMidi)));
      const closest = previousMidi === null
        ? forced
        : forced.filter(midi => Math.abs(midi - previousMidi) === smallestDistance);
      return closest[randomIndex(closest.length)];
    }

    const chordTones = chordPitchClasses(tonic, chord);
    const choices = pitchesInRange(range.minimum, range.maximum, chordTones)
      .filter(midi => !excluded.has(midi))
      .filter(midi => !isSemitoneAboveAnotherChordTone(midi, chordTones))
      .filter(midi => previousMidi === null || Math.abs(midi - previousMidi) <= 12)
      .map(midi => ({
        value: midi,
        weight: previousMidi !== null && Math.abs(midi - previousMidi) >= 8 ? 0.5 : 1
      }));
    return weightedChoice(choices);
  }

  function chooseMiddleNote(tonic, chord, range, currentHead, nextHead, approachChromaticNext = false) {
    const chordTones = chordPitchClasses(tonic, chord);
    const scaleTones = MAJOR_STEPS.map(interval => pitchClass(tonic + interval));
    const possiblePitchClasses = [...new Set([...chordTones, ...scaleTones])];
    const lowerHead = Math.min(currentHead, nextHead);
    const upperHead = Math.max(currentHead, nextHead);
    let choices = pitchesInRange(range.minimum, range.maximum, possiblePitchClasses)
      .filter(midi => {
        const isChordTone = chordTones.includes(pitchClass(midi));
        const isAdjacentScaleTone = scaleTones.includes(pitchClass(midi))
          && [currentHead, nextHead].some(head => {
            const distance = Math.abs(midi - head);
            return distance === 1 || distance === 2;
          });
        return isChordTone || isAdjacentScaleTone;
      })
      .filter(midi => isMajorScaleTone(tonic, midi) || Math.abs(midi - currentHead) === 1)
      .filter(midi => !approachChromaticNext || Math.abs(midi - nextHead) === 1)
      .filter(midi => {
        const semitoneAboveChord = isSemitoneAboveAnotherChordTone(midi, chordTones);
        return !semitoneAboveChord || midi - nextHead === 1;
      })
      .filter(midi => Math.abs(midi - currentHead) !== 6 && Math.abs(midi - nextHead) !== 6)
      .filter(midi => Math.abs(midi - currentHead) < 10 && Math.abs(midi - nextHead) < 10)
      .map(midi => ({
        value: midi,
        weight: midi < lowerHead || midi > upperHead ? 0.5 : 1
      }));
    if (Math.abs(nextHead - currentHead) >= 7) {
      choices = choices.filter(choice => choice.value > lowerHead && choice.value < upperHead);
      if (!choices.length) return null;
      const nearestDistance = Math.min(...choices.map(choice => Math.abs(choice.value - nextHead)));
      choices = choices.filter(choice => Math.abs(choice.value - nextHead) === nearestDistance);
    }
    return weightedChoice(choices);
  }

  function tryGenerateMelody(tonic, harmony) {
    const range = melodyRange(tonic);
    const heads = [];
    const middles = Array(harmony.length).fill(null);
    const firstHead = chooseChordHead(tonic, harmony[0], range);
    if (firstHead === null) return null;
    heads.push(firstHead);

    for (let index = 0; index < harmony.length - 1; index += 1) {
      const currentChord = harmony[index];
      const nextChord = harmony[index + 1];
      const nextIsTerminal = index + 1 === harmony.length - 1;
      const excludedNextHeads = new Set();
      let nextHead = null;
      let middle = null;
      let found = false;

      for (let attempt = 0; attempt < 28; attempt += 1) {
        nextHead = chooseChordHead(
          tonic,
          nextChord,
          range,
          heads[index],
          excludedNextHeads,
          nextIsTerminal
        );
        if (nextHead === null) break;
        if ((currentChord.length || 1) === 0.5) {
          if (!isMajorScaleTone(tonic, nextHead) && Math.abs(nextHead - heads[index]) !== 1) {
            excludedNextHeads.add(nextHead);
            continue;
          }
          found = true;
          break;
        }
        middle = chooseMiddleNote(
          tonic,
          currentChord,
          range,
          heads[index],
          nextHead,
          !isMajorScaleTone(tonic, nextHead)
        );
        if (middle !== null) {
          found = true;
          break;
        }
        if (nextIsTerminal) break;
        excludedNextHeads.add(nextHead);
      }

      if (!found) return null;
      heads.push(nextHead);
      middles[index] = middle;
    }

    return harmony.map((chord, index) => ({
      head: heads[index],
      middle: index === harmony.length - 1 ? null : middles[index]
    }));
  }

  function generateRuleBasedMelody(tonic, harmony) {
    for (let attempt = 0; attempt < 180; attempt += 1) {
      const generated = tryGenerateMelody(tonic, harmony);
      if (generated) return generated;
    }
    return null;
  }

  function chordQualitySuffix(quality) {
    return { major: '', minor: 'm', major7: 'M7', minor7: 'm7', dominant7: '7' }[quality] || '';
  }

  function romanChordName(chord) {
    const roots = { 0: 'I', 2: 'II', 4: 'III', 5: 'IV', 7: 'V', 9: 'VI', 11: 'VII' };
    return `${roots[chord.root] || '♭'}${chordQualitySuffix(chord.quality)}`;
  }

  function absoluteChordName(tonic, chord) {
    return `${NOTE_NAMES[pitchClass(tonic + chord.root)]}${chordQualitySuffix(chord.quality)}`;
  }

  function melodySolfegeParts(midi, tonic, previousMidi = null) {
    return {
      name: noteName(midi - tonic),
      marker: previousMidi === null || midi === previousMidi ? '' : midi > previousMidi ? '↑' : '↓'
    };
  }

  function createMelodyNoteNode(midi, tonic, rest = false, previousMidi = null) {
    const note = document.createElement('span');
    note.className = rest ? 'melody-note melody-rest' : 'melody-note';
    if (rest) {
      note.textContent = '休';
      return note;
    }
    const parts = melodySolfegeParts(midi, tonic, previousMidi);
    note.append(document.createTextNode(parts.name));
    if (parts.marker) {
      const marker = document.createElement('small');
      marker.textContent = parts.marker;
      note.appendChild(marker);
    }
    return note;
  }

  function renderMelodyQuestion() {
    if (!melodyQuestion) return;
    melodyKeyNode.textContent = NOTE_NAMES[pitchClass(melodyQuestion.tonic)];
    melodyProgressionName.textContent = melodyQuestion.progression.label;
    melodyTimeline.replaceChildren();
    melodyTimeline.parentElement.scrollLeft = 0;
    let previousMelodyMidi = null;

    melodyQuestion.harmony.forEach((chord, index) => {
      const cell = document.createElement('article');
      const isHalf = (chord.length || 1) === 0.5;
      cell.className = `melody-chord-cell${isHalf ? ' is-half' : ''}${chord.sourceIndex === 0 ? ' is-loop-start' : ''}`;
      cell.dataset.melodyChordIndex = String(index);

      const chordName = document.createElement('div');
      chordName.className = 'melody-chord-name';
      const absoluteName = document.createElement('strong');
      absoluteName.textContent = absoluteChordName(melodyQuestion.tonic, chord);
      const romanName = document.createElement('small');
      romanName.textContent = romanChordName(chord);
      chordName.append(absoluteName, romanName);

      const notes = document.createElement('div');
      notes.className = 'melody-notes';
      notes.style.setProperty('--note-count', isHalf ? '1' : '2');
      const head = melodyQuestion.melody[index].head;
      notes.appendChild(createMelodyNoteNode(head, melodyQuestion.tonic, false, previousMelodyMidi));
      previousMelodyMidi = head;
      if (!isHalf) {
        const middle = melodyQuestion.melody[index].middle;
        notes.appendChild(createMelodyNoteNode(middle, melodyQuestion.tonic, middle === null, previousMelodyMidi));
        if (middle !== null) previousMelodyMidi = middle;
      }
      cell.append(chordName, notes);
      melodyTimeline.appendChild(cell);
    });
  }

  function generateMelodyQuestion() {
    const [progressionId, progression] = fixedMelodyProgressionId === 'random'
      ? MELODY_PROGRESSION_ENTRIES[randomIndex(MELODY_PROGRESSION_ENTRIES.length)]
      : [fixedMelodyProgressionId, CHORD_PROGRESSIONS[fixedMelodyProgressionId]];
    const keyIndex = fixedMelodyKeyIndex === null ? randomIndex(KEYS.length) : fixedMelodyKeyIndex;
    const key = KEYS[keyIndex];
    const firstChord = progression.chords[0];
    const lastChord = progression.chords[progression.chords.length - 1];
    const hasAddedEnding = progression.chords.length > 1
      && firstChord.root === lastChord.root
      && firstChord.quality === lastChord.quality;
    const loopBody = hasAddedEnding ? progression.chords.slice(0, -1) : progression.chords;
    const harmony = [];
    for (let loopIndex = 0; loopIndex < melodyLoops; loopIndex += 1) {
      loopBody.forEach((chord, sourceIndex) => {
        harmony.push({ ...chord, sourceIndex, loopIndex });
      });
    }
    if (hasAddedEnding) {
      harmony.push({
        ...lastChord,
        sourceIndex: progression.chords.length - 1,
        loopIndex: melodyLoops
      });
    }
    let melody = generateRuleBasedMelody(key.midi, harmony);
    if (!melody) {
      window.setTimeout(generateMelodyQuestion, 0);
      return;
    }
    const voicings = progression.fixedVoicings
      ? harmony.map(chord => progression.fixedVoicings[chord.sourceIndex].map(offset => key.midi + offset))
      : smoothProgressionVoicings(key.midi, { chords: harmony });
    const melodyIsCloseToBass = melody.some((notes, index) => {
      const bass = voicings[index][0];
      return [notes.head, notes.middle]
        .filter(midi => midi !== null)
        .some(midi => midi - bass <= 12);
    });
    if (melodyIsCloseToBass) {
      melody = melody.map(notes => ({
        head: notes.head + 12,
        middle: notes.middle === null ? null : notes.middle + 12
      }));
    }
    melodyQuestion = { progressionId, progression, tonic: key.midi, harmony, melody, voicings };
    renderMelodyQuestion();
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
    const tonicCandidates = [];
    for (let tonicMidi = session.rangeMin - 11; tonicMidi <= session.rangeMax; tonicMidi += 1) {
      if (pitchClass(tonicMidi) !== pitchClass(key.midi)) continue;
      const degreesInRange = eligibleDegrees.filter(degree => {
        const midi = tonicMidi + session.mode.intervals[degree];
        return midi >= session.rangeMin && midi <= session.rangeMax;
      });
      if (degreesInRange.length) tonicCandidates.push({ tonicMidi, degreesInRange });
    }
    const maximumChoiceCount = Math.max(...tonicCandidates.map(candidate => candidate.degreesInRange.length));
    const widestCandidates = tonicCandidates.filter(candidate => candidate.degreesInRange.length === maximumChoiceCount);
    const selectedTonic = widestCandidates[randomIndex(widestCandidates.length)];
    const degrees = Array.from(
      { length: session.sequenceLength },
      () => drawDegree(selectedTonic.degreesInRange)
    );
    const intervals = degrees.map(degree => session.mode.intervals[degree]);
    const targetMidis = intervals.map(interval => selectedTonic.tonicMidi + interval);
    return {
      keyIndex,
      key,
      degrees,
      intervals,
      targetMidis,
      answerTonicMidi: selectedTonic.tonicMidi,
      playCount: 0,
      responseStartedAt: null,
      responseSeconds: null
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

  const melodyButtonLabels = new Map([
    [melodyChordsButton, 'コード進行'],
    [melodyFirstNoteButton, '最初の1音'],
    [melodyReferenceButton, 'ド基準フレーズ'],
    [melodyAnswerButton, '答え合わせ']
  ]);

  function clearMelodyHighlights() {
    melodyTimeline.querySelectorAll('.is-playing').forEach(cell => cell.classList.remove('is-playing'));
  }

  function drawRoundedRect(context, x, y, width, height, radius) {
    const safeRadius = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + safeRadius, y);
    context.lineTo(x + width - safeRadius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    context.lineTo(x + width, y + height - safeRadius);
    context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
    context.lineTo(x + safeRadius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    context.lineTo(x, y + safeRadius);
    context.quadraticCurveTo(x, y, x + safeRadius, y);
    context.closePath();
  }

  function pianoRollKeyGeometry(width, keyboardTop, keyboardHeight) {
    const minimumMidi = 24;
    const maximumMidi = 84;
    const blackPitchClasses = new Set([1, 3, 6, 8, 10]);
    const whiteCount = Array.from({ length: maximumMidi - minimumMidi }, (_, index) => minimumMidi + index)
      .filter(midi => !blackPitchClasses.has(pitchClass(midi))).length;
    const whiteWidth = width / whiteCount;
    const blackWidth = Math.max(4, whiteWidth * 0.62);
    const keys = new Map();
    let whiteIndex = 0;

    for (let midi = minimumMidi; midi < maximumMidi; midi += 1) {
      if (blackPitchClasses.has(pitchClass(midi))) {
        keys.set(midi, {
          x: whiteIndex * whiteWidth - blackWidth / 2,
          width: blackWidth,
          y: keyboardTop,
          height: keyboardHeight * 0.62,
          black: true
        });
      } else {
        keys.set(midi, {
          x: whiteIndex * whiteWidth,
          width: whiteWidth,
          y: keyboardTop,
          height: keyboardHeight,
          black: false
        });
        whiteIndex += 1;
      }
    }
    return keys;
  }

  function resizeMelodyVisualizerCanvas() {
    const width = melodyVisualizerCanvas.clientWidth;
    const height = melodyVisualizerCanvas.clientHeight;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(width * scale);
    const pixelHeight = Math.round(height * scale);
    if (melodyVisualizerCanvas.width !== pixelWidth || melodyVisualizerCanvas.height !== pixelHeight) {
      melodyVisualizerCanvas.width = pixelWidth;
      melodyVisualizerCanvas.height = pixelHeight;
    }
    const context = melodyVisualizerCanvas.getContext('2d');
    context.setTransform(scale, 0, 0, scale, 0, 0);
    return { context, width, height };
  }

  function drawPianoRollFrame() {
    if (!melodyVisualizerState || !audioContext) return;
    const { context, width, height } = resizeMelodyVisualizerCanvas();
    if (!width || !height) {
      melodyAnimationFrame = window.requestAnimationFrame(drawPianoRollFrame);
      return;
    }

    const now = audioContext.currentTime;
    const keyboardHeight = Math.max(66, Math.min(82, height * 0.22));
    const strikeY = height - keyboardHeight - 4;
    const topPadding = 18;
    const fallingHeight = strikeY - topPadding;
    const pixelsPerSecond = fallingHeight / melodyVisualizerState.lookAhead;
    const keys = pianoRollKeyGeometry(width, strikeY + 4, keyboardHeight);
    const activeKeys = new Map();

    context.clearRect(0, 0, width, height);
    context.fillStyle = '#11100f';
    context.fillRect(0, 0, width, height);

    keys.forEach(key => {
      if (key.black) return;
      context.strokeStyle = 'rgba(243, 239, 231, 0.07)';
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(key.x, 0);
      context.lineTo(key.x, strikeY);
      context.stroke();
    });

    melodyVisualizerState.chordStarts.forEach(start => {
      const y = strikeY - (start - now) * pixelsPerSecond;
      if (y < 0 || y > strikeY) return;
      context.strokeStyle = 'rgba(243, 239, 231, 0.1)';
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    });

    context.save();
    context.beginPath();
    context.rect(0, 0, width, strikeY);
    context.clip();
    melodyVisualizerState.events.forEach(event => {
      const key = keys.get(event.midi);
      if (!key) return;
      const bottom = strikeY - (event.start - now) * pixelsPerSecond;
      const barHeight = Math.max(12, (event.end - event.start) * pixelsPerSecond);
      const top = bottom - barHeight;
      if (bottom < -4 || top > strikeY + 4) return;
      const inset = Math.max(1, key.width * 0.12);
      const noteWidth = event.type === 'melody' ? Math.max(22, key.width - 2) : Math.max(3, key.width - inset * 2);
      const x = event.type === 'melody' ? key.x + (key.width - noteWidth) / 2 : key.x + inset;
      context.fillStyle = event.type === 'melody' ? '#f15a35' : '#a8d8c5';
      context.shadowColor = event.type === 'melody' ? 'rgba(241, 90, 53, 0.5)' : 'rgba(168, 216, 197, 0.32)';
      context.shadowBlur = event.type === 'melody' ? 10 : 5;
      drawRoundedRect(context, x, top, noteWidth, barHeight, Math.min(5, noteWidth / 3));
      context.fill();
      context.shadowBlur = 0;
      if (event.type === 'melody') {
        const visibleTop = Math.max(0, top);
        const visibleBottom = Math.min(strikeY, bottom);
        if (visibleBottom - visibleTop >= 12) {
          context.fillStyle = '#fff';
          context.font = '700 9px "Noto Sans JP", sans-serif';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText(noteName(event.interval), x + noteWidth / 2, (visibleTop + visibleBottom) / 2);
        }
      }
      if (now >= event.start && now <= event.end) activeKeys.set(event.midi, event.type);
    });
    context.restore();

    context.strokeStyle = 'rgba(241, 90, 53, 0.95)';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(0, strikeY + 1.5);
    context.lineTo(width, strikeY + 1.5);
    context.stroke();

    keys.forEach((key, midi) => {
      if (key.black) return;
      context.fillStyle = activeKeys.has(midi)
        ? (activeKeys.get(midi) === 'melody' ? '#f15a35' : '#a8d8c5')
        : '#f3efe7';
      context.fillRect(key.x, key.y, key.width, key.height);
      context.strokeStyle = '#171614';
      context.lineWidth = 1;
      context.strokeRect(key.x, key.y, key.width, key.height);
      if (pitchClass(midi) === 0) {
        context.fillStyle = 'rgba(23, 22, 20, 0.55)';
        context.font = '9px "DM Mono", monospace';
        context.textAlign = 'center';
        context.fillText(`C${Math.floor(midi / 12) - 1}`, key.x + key.width / 2, height - 8);
      }
    });

    keys.forEach((key, midi) => {
      if (!key.black) return;
      context.fillStyle = activeKeys.has(midi)
        ? (activeKeys.get(midi) === 'melody' ? '#f15a35' : '#77bca0')
        : '#171614';
      context.fillRect(key.x, key.y, key.width, key.height);
      context.strokeStyle = '#11100f';
      context.strokeRect(key.x, key.y, key.width, key.height);
    });

    context.textAlign = 'right';
    context.font = '600 10px "Noto Sans JP", sans-serif';
    const chordLegendRight = melodyVisualizerState.hasMelody ? width - 124 : width - 12;
    context.fillStyle = '#a8d8c5';
    context.fillRect(chordLegendRight - 64, 15, 9, 9);
    context.fillStyle = 'rgba(243, 239, 231, 0.78)';
    context.fillText('コード', chordLegendRight, 24);
    if (melodyVisualizerState.hasMelody) {
      context.fillStyle = '#f15a35';
      context.fillRect(width - 112, 15, 9, 9);
      context.fillStyle = 'rgba(243, 239, 231, 0.78)';
      context.fillText('メロディー', width - 12, 24);
    }

    melodyAnimationFrame = window.requestAnimationFrame(drawPianoRollFrame);
  }

  function startMelodyVisualizer(events, chordStarts, lookAhead, hasMelody) {
    if (melodyAnimationFrame !== null) window.cancelAnimationFrame(melodyAnimationFrame);
    melodyVisualizerState = { events, chordStarts, lookAhead, hasMelody };
    melodyScore.classList.add('is-visualizing');
    melodyVisualizer.hidden = false;
    melodyAnimationFrame = window.requestAnimationFrame(drawPianoRollFrame);
  }

  function stopMelodyVisualizer() {
    if (melodyAnimationFrame !== null) window.cancelAnimationFrame(melodyAnimationFrame);
    melodyAnimationFrame = null;
    melodyVisualizerState = null;
    melodyVisualizer.hidden = true;
    melodyScore.classList.remove('is-visualizing');
  }

  function restoreMelodyControls() {
    melodyPlaybackButtons.forEach(button => {
      button.disabled = false;
      button.classList.remove('is-stop');
      button.textContent = melodyButtonLabels.get(button);
    });
    melodyNextButton.disabled = false;
    melodyRangeInputs.forEach(input => { input.disabled = false; });
    melodyLoopInputs.forEach(input => { input.disabled = false; });
    melodyChordSpeed.disabled = false;
    melodyReferenceSpeed.disabled = false;
    melodyProgressionSelect.disabled = false;
    melodyKeySelect.disabled = false;
    activeMelodyButton = null;
    clearMelodyHighlights();
    stopMelodyVisualizer();
  }

  function stopMelodyPlayback() {
    if (!activeMelodyButton) return;
    clearPlayback();
    restoreMelodyControls();
  }

  function setMelodyPlaybackControls(button, loading = false) {
    activeMelodyButton = button;
    melodyPlaybackButtons.forEach(item => { item.disabled = item !== button; });
    button.disabled = false;
    button.classList.add('is-stop');
    button.textContent = loading ? '読込中…' : '停止';
    melodyNextButton.disabled = true;
    melodyRangeInputs.forEach(input => { input.disabled = true; });
    melodyLoopInputs.forEach(input => { input.disabled = true; });
    melodyChordSpeed.disabled = true;
    melodyReferenceSpeed.disabled = true;
    melodyProgressionSelect.disabled = true;
    melodyKeySelect.disabled = true;
  }

  function highlightMelodyChord(index, atTime) {
    scheduleUi(Math.max(0, atTime - audioContext.currentTime), () => {
      clearMelodyHighlights();
      const cell = melodyTimeline.querySelector(`[data-melody-chord-index="${index}"]`);
      if (!cell) return;
      cell.classList.add('is-playing');
      const scroller = melodyTimeline.parentElement;
      const left = cell.offsetLeft;
      const right = left + cell.offsetWidth;
      if (left < scroller.scrollLeft || right > scroller.scrollLeft + scroller.clientWidth) {
        scroller.scrollTo({
          left: Math.max(0, left - (scroller.clientWidth - cell.offsetWidth) / 2),
          behavior: 'smooth'
        });
      }
    });
  }

  function scheduleMelodyArrangement(start, includeMelody) {
    const lookAhead = Math.min(2.2, Math.max(1.4, melodyChordSeconds * 1.35));
    const events = [];
    const chordStarts = [];
    const visualTranspose = pitchClass(melodyQuestion.tonic);
    let cursor = start + lookAhead;
    melodyQuestion.harmony.forEach((chord, index) => {
      const chordDuration = melodyChordSeconds * (chord.length || 1);
      const chordToneDuration = Math.max(0.26, chordDuration * 0.92);
      chordStarts.push(cursor);
      highlightMelodyChord(index, cursor);
      melodyQuestion.voicings[index].forEach(midi => {
        scheduleTone(midi, cursor, chordToneDuration, 0.065, 'piano');
        events.push({ midi: midi - visualTranspose, start: cursor, end: cursor + chordToneDuration, type: 'chord' });
      });
      const notes = melodyQuestion.melody[index];
      const headDuration = Math.max(0.24, Math.min(0.7, chordDuration * 0.46));
      if (includeMelody) {
        scheduleTone(notes.head, cursor, headDuration, 0.14, 'piano');
      }
      events.push({
        midi: notes.head - visualTranspose,
        start: cursor,
        end: cursor + headDuration,
        type: 'melody',
        interval: pitchClass(notes.head - melodyQuestion.tonic)
      });
      if (notes.middle !== null) {
        const middleStart = cursor + chordDuration / 2;
        const middleDuration = Math.max(0.22, chordDuration * 0.42);
        if (includeMelody) scheduleTone(notes.middle, middleStart, middleDuration, 0.14, 'piano');
        events.push({
          midi: notes.middle - visualTranspose,
          start: middleStart,
          end: middleStart + middleDuration,
          type: 'melody',
          interval: pitchClass(notes.middle - melodyQuestion.tonic)
        });
      }
      cursor += chordDuration;
    });
    startMelodyVisualizer(events, chordStarts, lookAhead + 0.45, true);
    return cursor + 0.3;
  }

  function scheduleMelodyReference(start) {
    const first = buildReferenceFirstHalf(melodyQuestion.tonic);
    const second = buildReferenceSecondHalf(melodyQuestion.tonic);
    const firstEnd = scheduleReferenceSequence(first, start, melodyReferenceSeconds, 'piano');
    return scheduleReferenceSequence(second, firstEnd + melodyReferenceSeconds * 0.7, melodyReferenceSeconds, 'piano');
  }

  async function playMelodyTraining(button, schedule) {
    if (activeMelodyButton === button) {
      stopMelodyPlayback();
      return;
    }
    if (!melodyQuestion || activeMelodyButton) return;
    clearPlayback();
    ensureAudio();
    const token = playbackId;
    setMelodyPlaybackControls(button, true);
    await preparePianoSamples();
    if (token !== playbackId || activeMelodyButton !== button) return;
    setMelodyPlaybackControls(button);
    const start = audioContext.currentTime + 0.05;
    const end = schedule(start);
    scheduleUi(Math.max(0, end - audioContext.currentTime + 0.08), () => {
      if (token !== playbackId) return;
      restoreMelodyControls();
    });
  }

  function showTrainingView(view) {
    const showMelody = view === 'melody';
    clearPlayback();
    restoreMelodyControls();
    if (showMelody) showSettings();
    game.hidden = showMelody;
    melodyTrainer.hidden = !showMelody;
    trainingMenuButtons.forEach(button => {
      const active = button.dataset.trainingView === view;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    if (showMelody && !melodyQuestion) generateMelodyQuestion();
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
    if (!reviewMode && currentRound.responseStartedAt === null) {
      currentRound.responseStartedAt = performance.now()
        + Math.max(0, targetStart - audioContext.currentTime) * 1000;
    }

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
    if (reviewMode) {
      const playbackEndDelay = targetStart - audioContext.currentTime + session.sequenceLength * 0.5 + 0.25;
      scheduleUi(playbackEndDelay, () => {
        if (idAtStart !== playbackId) return;
        state = 'feedback';
        game.classList.remove('is-playing');
        phaseText.textContent = lastRoundCorrect ? '正解' : '不正解';
        headline.textContent = lastRoundCorrect ? '正解' : '不正解';
        setSequence(-1, 2);
        feedback.classList.add('visible');
        replayButton.disabled = false;
        setKeysEnabled(true);
        referencePatternButton.hidden = false;
        referenceSpeedControl.hidden = false;
        nextButton.disabled = false;
        nextButton.textContent = attempts >= session.total ? '結果を見る →' : '次の問題へ →';
        liveRegion.textContent = '再生が終わりました。';
      });
    } else {
      const inputStart = targetStart + (session.sequenceLength - 1) * 0.5;
      scheduleUi(inputStart - audioContext.currentTime, () => {
        if (idAtStart !== playbackId) return;
        state = 'answering';
        game.classList.remove('is-playing');
        phaseText.textContent = '回答';
        headline.textContent = session.sequenceLength === 1 ? '音を選んでください' : `0 / ${session.sequenceLength}`;
        setSequence(2, 1);
        setKeysEnabled(true);
        replayButton.disabled = false;
        clearAnswerButton.disabled = true;
        liveRegion.textContent = `${session.sequenceLength}音を順番に回答してください。`;
      });
    }
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
    return currentRound.answerTonicMidi + interval;
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

  function scheduleReferenceSequence(midis, start, step = referenceNoteSeconds, timbre = session.timbre) {
    midis.forEach((midi, index) => {
      const isLast = index === midis.length - 1;
      scheduleTone(midi, start + index * step, isLast ? step * 2 : step * 0.92, 0.25, timbre);
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
    setKeysEnabled(true);
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
    setKeysEnabled(false);
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

  function answerDegreeIndex(buttonIndex) {
    return Number(keyButtons[buttonIndex]?.dataset.answerIndex);
  }

  function answerButtonName(buttonIndex) {
    const button = keyButtons[buttonIndex];
    return noteName(Number(button.dataset.interval), button.dataset.high === 'true');
  }

  function answerButtonMidi(buttonIndex) {
    const button = keyButtons[buttonIndex];
    const interval = Number(button.dataset.interval);
    return midiInRoundWindow(interval) + (button.dataset.high === 'true' ? 12 : 0);
  }

  function previewAnswerKey(buttonIndex) {
    ensureAudio();
    animateKey(buttonIndex);
    scheduleTone(answerButtonMidi(buttonIndex), audioContext.currentTime + 0.01, 0.5, 0.25);
  }

  function markCorrectAnswerKeys() {
    const correctDegrees = new Set(currentRound.degrees);
    keyButtons.forEach(button => {
      if (correctDegrees.has(Number(button.dataset.answerIndex))) button.classList.add('correct');
    });
  }

  function refreshFeedbackNotation() {
    const answerNames = userAnswers.map(answerButtonName);
    const correctNames = currentRound.degrees.map(index => modeNoteName(session.mode, index));
    const responseTimeText = `${(currentRound.responseSeconds || 0).toFixed(2)}秒`;
    feedbackDetail.textContent = lastRoundCorrect
      ? `${correctNames.join(' → ')} ／ ${currentRound.key.name} ／ ${responseTimeText}`
      : `回答：${answerNames.join(' → ')} ／ 正解：${correctNames.join(' → ')} ／ ${currentRound.key.name} ／ ${responseTimeText}`;
  }

  function evaluateAnswers() {
    state = 'feedback';
    clearPlayback();
    setKeysEnabled(false);
    replayButton.disabled = true;
    clearAnswerButton.disabled = true;
    attempts += 1;
    currentRound.responseSeconds = currentRound.responseStartedAt === null
      ? 0
      : Math.max(0, (performance.now() - currentRound.responseStartedAt) / 1000);
    const responseTimeText = `${currentRound.responseSeconds.toFixed(2)}秒`;

    const positionResults = userAnswers.map((buttonIndex, index) => answerDegreeIndex(buttonIndex) === currentRound.degrees[index]);
    const correct = positionResults.every(Boolean);
    lastRoundCorrect = correct;
    currentRound.intervals.forEach((interval, index) => {
      recordAnswer(
        interval,
        session.mode.intervals[answerDegreeIndex(userAnswers[index])],
        positionResults[index],
        currentRound.keyIndex,
        currentRound.responseSeconds
      );
    });
    recordQuestion(correct, currentRound.playCount, currentRound.responseSeconds);

    const answerNames = userAnswers.map(answerButtonName);
    const correctNames = currentRound.degrees.map(index => modeNoteName(session.mode, index));
    const selectedMidis = userAnswers.map(answerButtonMidi);
    const correctDegreeSet = new Set(currentRound.degrees);

    userAnswers.forEach((buttonIndex, index) => {
      if (!positionResults[index] && !correctDegreeSet.has(answerDegreeIndex(buttonIndex))) keyButtons[buttonIndex].classList.add('wrong');
    });
    markCorrectAnswerKeys();

    ensureAudio();
    const now = audioContext.currentTime + 0.03;
    const isSingleNote = session.sequenceLength === 1;
    if (correct) {
      score += 1;
      streak += 1;
      if (isSingleNote) {
        scheduleTone(selectedMidis[0], now, 0.5, 0.25);
        scheduleTonicResolution(currentRound.intervals[0], selectedMidis[0], now + 0.65);
      } else {
        scheduleSequence(selectedMidis, now);
      }
      feedbackMain.textContent = '正解';
      feedbackDetail.textContent = `${correctNames.join(' → ')} ／ ${currentRound.key.name} ／ ${responseTimeText}`;
      headline.textContent = '正解';
      phaseText.textContent = '正解';
      liveRegion.textContent = `正解。${correctNames.join('、')}です。解答時間は${responseTimeText}です。`;
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
      feedbackDetail.textContent = `回答：${answerNames.join(' → ')} ／ 正解：${correctNames.join(' → ')} ／ ${currentRound.key.name} ／ ${responseTimeText}`;
      headline.textContent = '不正解';
      phaseText.textContent = '不正解';
      liveRegion.textContent = `不正解。正解は${correctNames.join('、')}です。解答時間は${responseTimeText}です。`;
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
    setKeysEnabled(true);
    clearAnswerButton.hidden = true;
    referencePatternButton.hidden = false;
    referenceSpeedControl.hidden = false;
    nextButton.focus();
  }

  function answer(index) {
    if (!currentRound) return;
    if (state === 'feedback') {
      previewAnswerKey(index);
      return;
    }
    if (state !== 'answering') return;
    animateKey(index);
    userAnswers.push(index);
    if (userAnswers.length < session.sequenceLength) {
      ensureAudio();
      scheduleTone(answerButtonMidi(index), audioContext.currentTime + 0.01, 0.28, 0.22);
      headline.textContent = `${userAnswers.length} / ${session.sequenceLength}`;
      statusCopy.textContent = userAnswers.map(answerButtonName).join(' → ');
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
  updateNotationUI();

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

  notationSelect.addEventListener('change', () => {
    notationId = NOTE_NOTATIONS[notationSelect.value] ? notationSelect.value : 'sharp';
    try { localStorage.setItem(NOTATION_STORAGE_KEY, notationId); } catch (_) {}
    updateNotationUI();
  });

  referenceSpeedInput.addEventListener('input', () => {
    referenceNoteSeconds = Number(referenceSpeedInput.value);
    referenceSpeedValue.textContent = `${referenceNoteSeconds.toFixed(2)}秒`;
    try { localStorage.setItem(REFERENCE_SPEED_STORAGE_KEY, String(referenceNoteSeconds)); } catch (_) {}
  });

  trainingMenuButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (button.classList.contains('is-active')) return;
      showTrainingView(button.dataset.trainingView);
    });
  });

  melodyRangeInputs.forEach(input => {
    input.addEventListener('change', () => {
      melodyRangeId = input.value;
      generateMelodyQuestion();
    });
  });

  melodyLoopInputs.forEach(input => {
    input.addEventListener('change', () => {
      melodyLoops = Number(input.value);
      generateMelodyQuestion();
    });
  });

  melodyProgressionSelect.addEventListener('change', () => {
    fixedMelodyProgressionId = melodyProgressionSelect.value;
    generateMelodyQuestion();
  });

  melodyKeySelect.addEventListener('change', () => {
    fixedMelodyKeyIndex = melodyKeySelect.value === 'random' ? null : Number(melodyKeySelect.value);
    generateMelodyQuestion();
  });

  melodyChordSpeed.addEventListener('input', () => {
    melodyChordSeconds = Number(melodyChordSpeed.value);
    melodyChordSpeedValue.textContent = `${melodyChordSeconds.toFixed(1)}秒`;
  });

  melodyReferenceSpeed.addEventListener('input', () => {
    melodyReferenceSeconds = Number(melodyReferenceSpeed.value);
    melodyReferenceSpeedValue.textContent = `${melodyReferenceSeconds.toFixed(2)}秒`;
  });

  melodyChordsButton.addEventListener('click', () => {
    playMelodyTraining(melodyChordsButton, start => scheduleMelodyArrangement(start, false));
  });

  melodyFirstNoteButton.addEventListener('click', () => {
    playMelodyTraining(melodyFirstNoteButton, start => {
      highlightMelodyChord(0, start);
      scheduleTone(melodyQuestion.melody[0].head, start, 0.8, 0.16, 'piano');
      return start + 0.85;
    });
  });

  melodyReferenceButton.addEventListener('click', () => {
    playMelodyTraining(melodyReferenceButton, scheduleMelodyReference);
  });

  melodyAnswerButton.addEventListener('click', () => {
    playMelodyTraining(melodyAnswerButton, start => scheduleMelodyArrangement(start, true));
  });

  melodyNextButton.addEventListener('click', () => {
    stopMelodyPlayback();
    generateMelodyQuestion();
    melodyTimeline.parentElement.scrollLeft = 0;
  });

  document.addEventListener('keydown', event => {
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
    const pressedKey = event.key.length === 1 ? event.key.toLowerCase() : '';
    const pianoBinding = PIANO_KEY_BINDINGS.find(binding => binding.code === event.code || binding.key === pressedKey);
    if (pianoBinding) {
      if (!melodyTrainer.hidden) {
        event.preventDefault();
        playMelodyKeyboardKey(pianoBinding.interval);
        return;
      }
      if (['answering', 'feedback'].includes(state)) {
        const buttonIndex = keyButtons.findIndex(button => pianoBinding.high
          ? button.dataset.high === 'true'
          : button.dataset.high === 'false' && Number(button.dataset.interval) === pianoBinding.interval);
        if (buttonIndex !== -1) {
          event.preventDefault();
          answer(buttonIndex);
        }
        return;
      }
    }
    if (!['answering', 'feedback'].includes(state)) return;
    const number = Number(event.key);
    if (number >= 1 && number <= Math.min(9, keyButtons.length)) {
      event.preventDefault();
      answer(number - 1);
    }
  });
})();
