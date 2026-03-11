/**
 * CHRONO.JS - Version Ultra-Précision (Zéro Lag)
 */
let audioCtx = null;
let requestID = null;
let isRunning = false;
let startTime = 0;
let targetTimeMs = 0;
let alertsScheduled = 0;

window.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
    if(window.AppCore) AppCore.applyTheme();
});

function updateDisplay() {
    const frameInput = document.getElementById('target-frame');
    if (frameInput) {
        const frames = frameInput.value || 0;
        document.getElementById('timer-display').innerText = (frames / 60).toFixed(3);
    }
}

function toggleTimer() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    isRunning ? stopTimer() : startTimer();
}

function startTimer() {
    const targetFrame = parseInt(document.getElementById('target-frame').value) || 0;
    const configAlertSeconds = parseFloat(document.getElementById('alert-seconds').value) || 2;
    const configAlertCount = parseInt(document.getElementById('alert-count').value) || 5;
    
    targetTimeMs = (targetFrame / 60) * 1000; 
    if (targetTimeMs <= 0) return;

    isRunning = true;
    alertsScheduled = 0;
    
    const btn = document.getElementById('start-btn');
    btn.innerText = "STOP";
    btn.style.background = "#e74c3c";
    
    // Temps de départ précis de l'AudioContext (plus fiable que performance.now)
    startTime = audioCtx.currentTime;
    
    // Planification de TOUS les bips dès le départ pour éviter le lag processeur
    const alertPeriodSec = configAlertSeconds;
    const interval = alertPeriodSec / (configAlertCount - 1);
    const totalDurationSec = targetTimeMs / 1000;

    for (let i = 0; i < configAlertCount; i++) {
        const isFinal = (i === configAlertCount - 1);
        // On calcule le moment exact du bip par rapport au début
        const timeToBeep = totalDurationSec - ((configAlertCount - 1 - i) * interval);
        scheduleSound(startTime + timeToBeep, isFinal);
    }

    requestID = requestAnimationFrame(updateUI);
}

function scheduleSound(time, isFinal) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.frequency.value = isFinal ? 1000 : 600;
    gain.gain.value = 0.1;
    
    // La magie est ici : le son est calé sur l'horloge matérielle
    osc.start(time);
    osc.stop(time + 0.1);
}

function updateUI() {
    if (!isRunning) return;

    const elapsed = audioCtx.currentTime - startTime;
    const remaining = (targetTimeMs / 1000) - elapsed;

    if (remaining <= 0) {
        document.getElementById('timer-display').innerText = "0.000";
        stopTimer();
        return;
    }

    document.getElementById('timer-display').innerText = remaining.toFixed(3);
    
    // Flash visuel (on garde le visuel sur le rafraîchissement d'écran)
    // On pourrait synchroniser le flash aussi, mais le son est le plus important.
    
    requestID = requestAnimationFrame(updateUI);
}

function stopTimer() {
    // Note : Arrêter les sons déjà planifiés est complexe, 
    // ici on arrête juste l'affichage et la boucle.
    cancelAnimationFrame(requestID);
    isRunning = false;
    const btn = document.getElementById('start-btn');
    btn.innerText = "DÉMARRER";
    btn.style.background = "";
}

function resetTimer() {
    stopTimer();
    updateDisplay();
}
