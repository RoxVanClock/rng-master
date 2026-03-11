/**
 * CHRONO.JS - Moteur de précision
 * Gère le décompte, les bips sonores et les flashs visuels.
 */

let audioCtx = null;
let requestID = null;
let isRunning = false;
let startTime = 0;
let targetTime = 0;
let alertsDone = 0;

/**
 * Initialisation au chargement
 */
window.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
    // On s'assure que le thème est bien appliqué
    if(window.AppCore) AppCore.applyTheme();
});

function updateDisplay() {
    const frames = document.getElementById('target-frame').value;
    document.getElementById('timer-display').innerText = (frames / 60).toFixed(3);
}

function toggleTimer() {
    // Initialise l'audio au premier clic (obligatoire sur navigateur)
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    if (isRunning) {
        stopTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    isRunning = true;
    document.getElementById('start-btn').innerText = "STOP";
    
    const targetFrame = parseInt(document.getElementById('target-frame').value);
    targetTime = (targetFrame / 60) * 1000; // Conversion en millisecondes
    
    alertsDone = 0;
    startTime = performance.now();
    requestID = requestAnimationFrame(runLoop);
}

function runLoop(now) {
    if (!isRunning) return;

    const elapsed = now - startTime;
    const remaining = targetTime - elapsed;

    if (remaining <= 0) {
        document.getElementById('timer-display').innerText = "0.000";
        stopTimer();
        triggerAlert(true); // Bip final
        return;
    }

    document.getElementById('timer-display').innerText = (remaining / 1000).toFixed(3);

    // Logique des bips (5 derniers bips avant la fin)
    const alertCount = 5;
    const alertTime = 2000; // Les bips commencent 2 secondes avant
    const interval = alertTime / (alertCount - 1);
    
    const nextAlert = (alertCount - 1 - alertsDone) * interval;
    if (remaining <= nextAlert && alertsDone < alertCount - 1) {
        triggerAlert(false);
        alertsDone++;
    }

    requestID = requestAnimationFrame(runLoop);
}

function triggerAlert(isFinal) {
    const card = document.getElementById('timer-card');
    
    // Flash visuel
    card.classList.remove('flashing');
    void card.offsetWidth; // Force le redémarrage de l'animation
    card.classList.add('flashing');

    // Son (Oscillateur pur pour aucune latence)
    if (document.getElementById('sound-on').checked) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = isFinal ? 1000 : 600;
        gain.gain.value = 0.1;
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    }
}

function stopTimer() {
    cancelAnimationFrame(requestID);
    isRunning = false;
    document.getElementById('start-btn').innerText = "DÉMARRER";
}

function resetTimer() {
    stopTimer();
    updateDisplay();
}