/**
 * CHRONO.JS - Logique de précision type EonTimer
 */

let timerInterval = null;
let isRunning = false;
let startTime = 0;
let targetTime = 0;
let phase = "idle"; // idle, pretimer, target

function toggleTimer() {
    if (isRunning) {
        stopTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    const preTimerMs = parseFloat(document.getElementById('pre-timer').value) || 0;
    const calibrationMs = parseFloat(document.getElementById('calibration').value) || 0;
    const targetFrame = parseInt(document.getElementById('target-frame').value) || 0;

    // Calcul du temps de la target : (Frames / 59.7275 FPS) * 1000 + Calibration
    // On utilise 59.7275 pour la précision GBA
    const targetFrameMs = (targetFrame / 59.7275) * 1000;
    
    isRunning = true;
    document.getElementById('start-btn').innerText = "STOP";
    document.getElementById('start-btn').style.background = "#e74c3c";

    startTime = performance.now();
    
    if (preTimerMs > 0) {
        phase = "pretimer";
        document.getElementById('phase-label').innerText = "PRE-TIMER...";
        targetTime = preTimerMs;
    } else {
        phase = "target";
        document.getElementById('phase-label').innerText = "TARGET FRAME...";
        targetTime = targetFrameMs + calibrationMs;
    }

    timerInterval = requestAnimationFrame(updateUI);
}

function updateUI() {
    if (!isRunning) return;

    const now = performance.now();
    const elapsed = now - startTime;
    const remaining = targetTime - elapsed;

    if (remaining <= 0) {
        if (phase === "pretimer") {
            // Passage du Pre-timer à la Target Frame
            if (navigator.vibrate) navigator.vibrate([50]); // Petit bip/vibreur
            phase = "target";
            document.getElementById('phase-label').innerText = "TARGET FRAME...";
            const calibrationMs = parseFloat(document.getElementById('calibration').value) || 0;
            const targetFrame = parseInt(document.getElementById('target-frame').value) || 0;
            targetTime = (targetFrame / 59.7275) * 1000 + calibrationMs;
            startTime = performance.now();
            timerInterval = requestAnimationFrame(updateUI);
        } else {
            // Fin du timer
            document.getElementById('timer-val').innerText = "0.00";
            document.getElementById('phase-label').innerText = "TERMINÉ !";
            if (navigator.vibrate) navigator.vibrate(200);
            stopTimer();
        }
        return;
    }

    document.getElementById('timer-val').innerText = (remaining / 1000).toFixed(2);
    timerInterval = requestAnimationFrame(updateUI);
}

function stopTimer() {
    isRunning = false;
    cancelAnimationFrame(timerInterval);
    document.getElementById('start-btn').innerText = "DÉMARRER";
    document.getElementById('start-btn').style.background = "var(--game-color)";
    phase = "idle";
}

// FONCTION UPDATE : Calcule la nouvelle calibration
function updateCalibration() {
    const targetFrame = parseInt(document.getElementById('target-frame').value);
    const frameHit = parseInt(document.getElementById('frame-hit').value);
    const currentCalibration = parseFloat(document.getElementById('calibration').value) || 0;

    if (!frameHit) return alert("Indique la frame obtenue (Hit) !");

    // Formule EonTimer : Calib = Calib + ((Target - Hit) / 60 * 1000)
    const diff = targetFrame - frameHit;
    const adjustment = (diff / 59.7275) * 1000;
    const newCalibration = currentCalibration + adjustment;

    document.getElementById('calibration').value = newCalibration.toFixed(2);
    
    // Feedback visuel
    if (navigator.vibrate) navigator.vibrate(30);
    alert(`Calibration mise à jour !\nNouvelle valeur : ${newCalibration.toFixed(2)}ms`);
}
