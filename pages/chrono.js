/**
 * CHRONO.JS - Version Ultra-Stable
 */
let audioCtx = null;
let requestID = null;
let isRunning = false;
let startTime = 0;
let targetTime = 0;
let alertsDone = 0;

let configAlertSeconds = 2;
let configAlertCount = 5;

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
    // Débloque l'audio pour Chrome Mobile
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        // Créer un silence rapide pour "réveiller" l'audio sur Pixel
        const buffer = audioCtx.createBuffer(1, 1, 22050);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start(0);
    }
    
    if (isRunning) {
        stopTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    // Récupération sécurisée des valeurs
    const targetFrame = parseInt(document.getElementById('target-frame').value) || 0;
    configAlertSeconds = parseFloat(document.getElementById('alert-seconds').value) || 2;
    configAlertCount = parseInt(document.getElementById('alert-count').value) || 5;
    
    targetTime = (targetFrame / 60) * 1000; 
    
    if (targetTime <= 0) return alert("Règle une frame cible !");

    isRunning = true;
    alertsDone = 0;
    document.getElementById('start-btn').innerText = "STOP";
    document.getElementById('start-btn').style.background = "#e74c3c"; // Rouge quand ça tourne
    
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
        triggerAlert(true); 
        return;
    }

    document.getElementById('timer-display').innerText = (remaining / 1000).toFixed(3);

    // Calcul des bips
    if (configAlertCount > 1) {
        const alertPeriodMs = configAlertSeconds * 1000; 
        const interval = alertPeriodMs / (configAlertCount - 1);
        const nextAlertTime = (configAlertCount - 1 - alertsDone) * interval;

        if (remaining <= nextAlertTime && alertsDone < configAlertCount - 1) {
            triggerAlert(false);
            alertsDone++;
        }
    }

    requestID = requestAnimationFrame(runLoop);
}

function triggerAlert(isFinal) {
    const card = document.getElementById('timer-card');
    if (card) {
        card.classList.remove('flashing');
        void card.offsetWidth; 
        card.classList.add('flashing');
    }

    // Bip sonore
    if (document.getElementById('sound-on').checked && audioCtx) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = isFinal ? 1000 : 600;
        gain.gain.value = 0.1;
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    }

    // Vibreur Pixel
    if (document.getElementById('vibrate-on').checked && navigator.vibrate) {
        navigator.vibrate(isFinal ? [100, 50, 100] : 40);
    }
}

function stopTimer() {
    cancelAnimationFrame(requestID);
    isRunning = false;
    const btn = document.getElementById('start-btn');
    btn.innerText = "DÉMARRER";
    btn.style.background = ""; // Reprend la couleur du thème
}

function resetTimer() {
    stopTimer();
    updateDisplay();
}
