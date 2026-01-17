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
const btnSetup = document.getElementById('btnSetup');

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
    // Can generally reset at any time, but standard behavior usually implies stop first or just force it.
    // User requirement: "Reset to 0 (execute when stopped, or if running stopped->reset is ok, consistent behavior)"
    
    // Check if running, if so stop first
    if (isRunning) {
        stopTimer();
    }
    
    elapsedDuration = 0;
    updateDisplay();
    updateButtonStates();
}

function setupTimer() {
    // Requirement: "+1 minute to display initial value (only when stopped)"
    if (isRunning) return;
    
    elapsedDuration += 60000; // 60 seconds * 1000
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
    // Disable Start if running
    btnStart.disabled = isRunning;
    // Disable Stop if not running
    btnStop.disabled = !isRunning;
    // Disable Setup if running
    btnSetup.disabled = isRunning;
}

// --- Event Listeners ---

btnStart.addEventListener('click', startTimer);
btnStop.addEventListener('click', stopTimer);
btnReset.addEventListener('click', resetTimer);
btnSetup.addEventListener('click', setupTimer);

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ignore if user is typing in an input (unlikely here but good practice)
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch(e.code) {
        case 'Space':
            e.preventDefault(); // Prevent scrolling
            toggleTimer();
            break;
        case 'KeyR':
            resetTimer();
            break;
        case 'KeyS':
            setupTimer();
            break;
    }
});

// Init
updateDisplay();
updateButtonStates();

// URL Query Check for "stopwatch" mode?
// User requirement: "Compatible if ?stopwatch is present or not (default to stopwatch)"
// Simply ignores it as it's the only mode.
console.log("EVA SYSTEM READY");
