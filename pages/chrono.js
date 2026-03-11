/**
 * CHRONO.JS - Version Dynamique
 */

let audioCtx = null;
let requestID = null;
let isRunning = false;
let startTime = 0;
let targetTime = 0;
let alertsDone = 0;

// Variables de réglages dynamiques
let configAlertSeconds = 2;
let configAlertCount = 5;

window.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
    if(window.AppCore) AppCore.applyTheme();
});

function updateDisplay() {
    const frames = document.getElementById('target-frame').value;
    // On met à jour l'affichage principal (Frame / 60)
    document.getElementById('timer-display').innerText = (frames / 60).toFixed(3);
}

function toggleTimer() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    if (isRunning) {
        stopTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    // --- LECTURE DES RÉGLAGES UTILISATEUR ---
    const targetFrame = parseInt(document.getElementById('target-frame').value);
    configAlertSeconds = parseFloat(document.getElementById('alert-seconds').value);
    configAlertCount = parseInt(document.getElementById('alert-count').value);
    
    // Conversion de la frame cible en millisecondes
    targetTime = (targetFrame / 60) * 1000; 
    
    isRunning = true;
    alertsDone = 0;
    document.getElementById('start-btn').innerText = "STOP";
    
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

    // --- LOGIQUE DES BIPS DYNAMIQUE ---
    // On calcule l'intervalle entre chaque bip selon tes réglages
    const alertPeriodMs = configAlertSeconds * 1000; 
    const interval = alertPeriodMs / (configAlertCount - 1);
    
    // Calcul de quand doit sonner le prochain bip
    const nextAlertTime = (configAlertCount - 1 - alertsDone) * interval;

    if (remaining <= nextAlertTime && alertsDone < configAlertCount - 1) {
        triggerAlert(false);
        alertsDone++;
    }

    requestID = requestAnimationFrame(runLoop);
}

function triggerAlert(isFinal) {
    const card = document.getElementById('timer-card');
    
    // Flash visuel
    card.classList.remove('flashing');
    void card.offsetWidth; 
    card.classList.add('flashing');

    // Son
    if (document.getElementById('sound-on').checked) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        // Fréquence plus aiguë pour le bip final
        osc.frequency.value = isFinal ? 1200 : 800;
        gain.gain.value = 0.1;
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    }

    // Vibreur (Spécifique aux mobiles comme ton Pixel)
    if (document.getElementById('vibrate-on').checked && navigator.vibrate) {
        navigator.vibrate(isFinal ? 200 : 50);
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
