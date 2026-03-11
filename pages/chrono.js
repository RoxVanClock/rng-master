/**
 * CHRONO.JS - Version Ultra-Précision Visuelle et Sonore
 */
let audioCtx = null;
let requestID = null;
let isRunning = false;
let startTime = 0;
let targetTimeMs = 0;
let alertsScheduled = []; // On stocke les temps pour les flasher

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
    alertsScheduled = []; // Réinitialisation de la liste des flashs
    
    const btn = document.getElementById('start-btn');
    btn.innerText = "STOP";
    btn.style.background = "#e74c3c";
    
    startTime = audioCtx.currentTime;
    
    // Planification de TOUS les bips ET stockage des temps de flash
    const alertPeriodSec = configAlertSeconds;
    const interval = alertPeriodSec / (configAlertCount - 1);
    const totalDurationSec = targetTimeMs / 1000;

    for (let i = 0; i < configAlertCount; i++) {
        const isFinal = (i === configAlertCount - 1);
        const timeToBeep = totalDurationSec - ((configAlertCount - 1 - i) * interval);
        const absoluteTime = startTime + timeToBeep;
        
        // Planification sonore matérielle (toujours prioritaire)
        scheduleSound(absoluteTime, isFinal);
        
        // Stockage du temps (en secondes) pour le flash visuel
        alertsScheduled.push({
            time: absoluteTime,
            done: false
        });
    }

    requestID = requestAnimationFrame(updateUI);
}

function scheduleSound(time, isFinal) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    // Fréquences pour un rythme clair
    osc.frequency.setValueAtTime(isFinal ? 1000 : 600, time);
    gain.gain.setValueAtTime(0.1, time);
    
    osc.start(time);
    osc.stop(time + 0.1);
}

function updateUI() {
    if (!isRunning) return;

    const currentTime = audioCtx.currentTime;
    const elapsed = currentTime - startTime;
    const totalDurationSec = targetTimeMs / 1000;
    const remaining = totalDurationSec - elapsed;

    if (remaining <= 0) {
        document.getElementById('timer-display').innerText = "0.000";
        stopTimer();
        return;
    }

    // Affichage précis du temps restant
    document.getElementById('timer-display').innerText = remaining.toFixed(3);
    
    // --- MAGIE VISUELLE SYNCHRONISÉE ---
    // On parcourt les flashs planifiés
    for (let i = 0; i < alertsScheduled.length; i++) {
        const alert = alertsScheduled[i];
        
        // Si le flash n'est pas fait ET qu'on est très proche du son
        // (moins de 16ms, soit une frame d'écran à 60Hz)
        if (!alert.done && (alert.time - currentTime) < 0.016) {
            triggerVisualFlash();
            alert.done = true; // Marquer comme fait pour ne pas reflasher
        }
    }
    
    requestID = requestAnimationFrame(updateUI);
}

function triggerVisualFlash() {
    const card = document.getElementById('timer-card');
    if (card) {
        card.classList.remove('flashing');
        // Astuce pour forcer le redessin de l'animation
        void card.offsetWidth; 
        card.classList.add('flashing');
    }
}

function stopTimer() {
    // Note : Arrêter les sons matériels planifiés est complexe,
    // on arrête ici l'affichage et la boucle.
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
