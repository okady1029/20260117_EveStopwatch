/**
 * EVA Stopwatch Application
 * 
 * Core Logic:
 * - Uses Date.now() for accurate time tracking (avoiding setInterval drift).
 * - Maintains state: isRunning, startTime, elapsedDuration.
 * - Updates DOM via requestAnimationFrame loop.
 */

// State
let highlightMode = false; // Not strictly used yet, but good for future expansion
let isRunning = false;
let startTime = 0;
let elapsedDuration = 0; // Time accumulated before current start
let animationFrameId = null;

// DOM Elements
const displayEl = document.getElementById('timeDisplay');
const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');
const btnReset = document.getElementById('btnReset');
const btnMin = document.getElementById('btnMin');
const btnSec = document.getElementById('btnSec');

/**
 * Formats time in MM:SS:CC (Centiseconds)
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted string
 */
function formatTime(ms) {
    const totalCentiseconds = Math.floor(ms / 10);

    const minutes = Math.floor(totalCentiseconds / 6000);
    const seconds = Math.floor((totalCentiseconds % 6000) / 100);
    const centis = totalCentiseconds % 100;

    const mStr = String(minutes).padStart(2, '0');
    const sStr = String(seconds).padStart(2, '0');
    const cStr = String(centis).padStart(2, '0');

    return `${mStr}:${sStr}:${cStr}`;
}

/**
 * Updates the display with current time
 */
function updateDisplay() {
    let currentElapsed = elapsedDuration;
    if (isRunning) {
        currentElapsed = (Date.now() - startTime) + elapsedDuration;
    }

    // Emergency Mode Check: 17 minutes = 17 * 60 * 1000 = 1020000 ms
    const CRITICAL_THRESHOLD = 17 * 60 * 1000;
    if (currentElapsed >= CRITICAL_THRESHOLD) {
        document.body.classList.add('mode-critical');
    } else {
        document.body.classList.remove('mode-critical');
    }

    displayEl.textContent = formatTime(currentElapsed);
}

/**
 * Animation Loop
 */
function tick() {
    if (!isRunning) return;
    updateDisplay();
    animationFrameId = requestAnimationFrame(tick);
}

// --- Actions ---

function startTimer() {
    if (isRunning) return;

    isRunning = true;
    startTime = Date.now();
    tick();

    updateButtonStates();
}

function stopTimer() {
    if (!isRunning) return;

    isRunning = false;
    cancelAnimationFrame(animationFrameId);
    // Accumulate the time that passed during this run
    elapsedDuration += Date.now() - startTime;
    updateDisplay(); // Final clean update

    updateButtonStates();
}

function resetTimer() {
    if (isRunning) {
        stopTimer();
    }

    elapsedDuration = 0;
    updateDisplay();
    updateButtonStates();
}

function addMinute() {
    if (isRunning) return;
    elapsedDuration += 60000;
    updateDisplay();
}

function addSecond() {
    if (isRunning) return;
    elapsedDuration += 1000;
    updateDisplay();
}

function toggleTimer() {
    if (isRunning) {
        stopTimer();
    } else {
        startTimer();
    }
}

function updateButtonStates() {
    btnStart.disabled = isRunning;
    btnStop.disabled = !isRunning;
    btnMin.disabled = isRunning;
    btnSec.disabled = isRunning;
}

// --- Event Listeners ---

btnStart.addEventListener('click', startTimer);
btnStop.addEventListener('click', stopTimer);
btnReset.addEventListener('click', resetTimer);
btnMin.addEventListener('click', addMinute);
btnSec.addEventListener('click', addSecond);

// Episode Count Logic
const episodeDisplay = document.getElementById('episodeDisplay');
let currentEpisode = 1;

function updateEpisode(diff) {
    currentEpisode += diff;
    if (currentEpisode < 1) currentEpisode = 1;
    episodeDisplay.textContent = currentEpisode;
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ignore if user is typing in an input (unlikely here but good practice)
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.code) {
        case 'Space':
            e.preventDefault(); // Prevent scrolling
            toggleTimer();
            break;
        case 'KeyR':
            resetTimer();
            break;
        case 'KeyS':
            // S triggers +1 Minute (was setupTimer)
            addMinute();
            break;
        case 'ArrowUp':
            e.preventDefault();
            updateEpisode(1);
            break;
        case 'ArrowDown':
            e.preventDefault();
            updateEpisode(-1);
            break;
    }
});

// Init
updateDisplay();
updateButtonStates();
console.log("EVA SYSTEM READY");
