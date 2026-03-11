/**
 * CHRONO.JS - Version Totale (Pre-Timer, Calibration, Intervalle, Feedback)
 */

(function() {
    let isRunning = false;
    let timerTimeout = null;
    let endTime = 0;
    let currentPhase = "idle";
    let counter = 0;
    const FPS_GBA = 59.7275;

    // Audio Context pour les bips (plus fiable sur mobile)
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function beep(freq = 440, duration = 100) {
        if (!document.getElementById('enable-sound').checked) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.start();
        setTimeout(() => osc.stop(), duration);
    }

    window.toggleTimer = function() {
        if (isRunning) stopTimer(); else startTimer();
    };

    window.resetCounter = function() {
        counter = 0;
        document.getElementById('count-val').innerText = counter;
    };

    function startTimer() {
        isRunning = true;
        document.getElementById('start-btn').innerText = "STOP";
        document.getElementById('start-btn').style.background = "#e74c3c";
        
        const preTimerMs = parseFloat(document.getElementById('pre-timer').value) || 0;
        if (preTimerMs > 0) runPhase("pretimer", preTimerMs); else startTargetPhase();
    }

    function runPhase(phase, duration) {
        currentPhase = phase;
        document.getElementById('phase-label').innerText = phase === "pretimer" ? "PRE-TIMER" : "TARGET";
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
            handlePhaseEnd();
            return;
        }

        document.getElementById('timer-val').innerText = (remaining / 1000).toFixed(2);
        timerTimeout = requestAnimationFrame(updateDisplay);
    }

    function handlePhaseEnd() {
        const vibrate = document.getElementById('enable-vibrate').checked;
        
        if (currentPhase === "pretimer") {
            if (vibrate && navigator.vibrate) navigator.vibrate(50);
            beep(660, 100);
            startTargetPhase();
        } else {
            // Fin Target
            counter++;
            document.getElementById('count-val').innerText = counter;
            if (vibrate && navigator.vibrate) navigator.vibrate([100, 50, 100]);
            beep(880, 200);

            const interval = parseFloat(document.getElementById('interval-val').value) || 0;
            if (interval > 0) {
                runPhase("interval", interval * 1000);
                // On boucle sur la target après l'intervalle
                setTimeout(() => { if(isRunning) startTargetPhase(); }, interval * 1000);
            } else {
                stopTimer();
                document.getElementById('timer-val').innerText = "0.00";
            }
        }
    }

    function stopTimer() {
        isRunning = false;
        if (timerTimeout) cancelAnimationFrame(timerTimeout);
        document.getElementById('start-btn').innerText = "DÉMARRER";
        document.getElementById('start-btn').style.background = "var(--game-color)";
        document.getElementById('phase-label').innerText = "PRÊT";
    }

    window.updateCalibration = function() {
        const target = parseInt(document.getElementById('target-frame').value);
        const hit = parseInt(document.getElementById('frame-hit').value);
        const currentCalib = parseFloat(document.getElementById('calibration').value) || 0;
        if (!hit) return alert("Entre ta frame hit !");

        const newCalib = currentCalib + ((target - hit) / FPS_GBA * 1000);
        document.getElementById('calibration').value = Math.round(newCalib);
        beep(550, 50);
    };
})();
