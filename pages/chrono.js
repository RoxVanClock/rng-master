/**
 * CHRONO.JS - Version "Hard-Binded" pour Mobile
 */

(function() {
    let isRunning = false;
    let timerTimeout = null;
    let endTime = 0;
    let currentPhase = "idle";
    const FPS_GBA = 59.7275;

    // Bouton Start/Stop
    window.toggleTimer = function() {
        if (isRunning) {
            stopTimer();
        } else {
            startTimer();
        }
    };

    function startTimer() {
        const preTimerMs = parseFloat(document.getElementById('pre-timer').value) || 0;
        
        isRunning = true;
        document.getElementById('start-btn').innerText = "STOP";
        document.getElementById('start-btn').style.background = "#e74c3c";

        if (preTimerMs > 0) {
            runPhase("pretimer", preTimerMs);
        } else {
            startTargetPhase();
        }
    }

    function runPhase(phase, duration) {
        currentPhase = phase;
        document.getElementById('phase-label').innerText = phase === "pretimer" ? "⚡ PRE-TIMER..." : "🎯 TARGET FRAME...";
        endTime = Date.now() + duration;
        updateDisplay();
    }

    function startTargetPhase() {
        const calib = parseFloat(document.getElementById('calibration').value) || 0;
        const targetFrame = parseInt(document.getElementById('target-frame').value) || 0;
        const duration = (targetFrame / FPS_GBA * 1000) + calib;
        runPhase("target", duration);
    }

    function updateDisplay() {
        if (!isRunning) return;

        const now = Date.now();
        const remaining = endTime - now;

        if (remaining <= 0) {
            if (currentPhase === "pretimer") {
                if (navigator.vibrate) navigator.vibrate(50);
                startTargetPhase();
            } else {
                document.getElementById('timer-val').innerText = "0.00";
                document.getElementById('phase-label').innerText = "TERMINÉ !";
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                stopTimer();
            }
            return;
        }

        document.getElementById('timer-val').innerText = (remaining / 1000).toFixed(2);
        timerTimeout = requestAnimationFrame(updateDisplay);
    }

    function stopTimer() {
        isRunning = false;
        if (timerTimeout) cancelAnimationFrame(timerTimeout);
        document.getElementById('start-btn').innerText = "DÉMARRER";
        document.getElementById('start-btn').style.background = "var(--game-color)";
        document.getElementById('phase-label').innerText = "STOPPÉ";
    }

    // Bouton Update Calibration
    window.updateCalibration = function() {
        const target = parseInt(document.getElementById('target-frame').value);
        const hit = parseInt(document.getElementById('frame-hit').value);
        const currentCalib = parseFloat(document.getElementById('calibration').value) || 0;

        if (!hit) {
            alert("Entre la frame que tu as obtenue !");
            return;
        }

        const diff = target - hit;
        const msDiff = (diff / FPS_GBA) * 1000;
        const newCalib = currentCalib + msDiff;

        const calibInput = document.getElementById('calibration');
        calibInput.value = Math.round(newCalib);
        
        // Confirmation visuelle
        calibInput.style.borderColor = "var(--game-color)";
        setTimeout(() => { calibInput.style.borderColor = ""; }, 500);
    };
})();
