/**
 * CHRONO.JS - Version Finale (Bips personnalisables)
 */

(function() {
    let isRunning = false;
    let timerTimeout = null;
    let endTime = 0;
    let currentPhase = "idle";
    let counter = 0;
    let lastBeepSecond = -1;
    const FPS_GBA = 59.7275;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function beep(freq, duration) {
        if (!document.getElementById('enable-sound').checked) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration/1000);
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
        lastBeepSecond = -1;
        document.getElementById('start-btn').innerText = "STOP";
        document.getElementById('start-btn').style.background = "#e74c3c";
        
        const preTimerMs = parseFloat(document.getElementById('pre-timer').value) || 0;
        if (preTimerMs > 0) runPhase("pretimer", preTimerMs); else startTargetPhase();
    }

    function runPhase(phase, duration) {
        currentPhase = phase;
        lastBeepSecond = -1;
        document.getElementById('phase-label').innerText = phase;
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

        // --- LOGIQUE DES BIPS PERSONNALISABLES ---
        const beepThreshold = parseInt(document.getElementById('beep-count').value) || 0;
        const currentSecond = Math.ceil(remaining / 1000);
        
        if (currentSecond <= beepThreshold && currentSecond !== lastBeepSecond) {
            lastBeepSecond = currentSecond;
            beep(440, 50); 
        }

        document.getElementById('timer-val').innerText = (remaining / 1000).toFixed(2);
        timerTimeout = requestAnimationFrame(updateDisplay);
    }

    function handlePhaseEnd() {
        const vibrate = document.getElementById('enable-vibrate').checked;
        
        if (currentPhase === "pretimer") {
            if (vibrate) navigator.vibrate(100);
            beep(880, 150);
            startTargetPhase();
        } 
        else if (currentPhase === "target") {
            counter++;
            document.getElementById('count-val').innerText = counter;
            if (vibrate) navigator.vibrate([150, 50, 150]);
            beep(1200, 200);

            const intervalS = parseFloat(document.getElementById('interval-val').value) || 0;
            if (intervalS > 0) {
                runPhase("interval", intervalS * 1000);
            } else {
                stopTimer();
                document.getElementById('timer-val').innerText = "0.00";
            }
        }
        else if (currentPhase === "interval") {
            startTargetPhase();
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
        const input = document.getElementById('calibration');
        input.style.borderColor = "var(--game-color)";
        setTimeout(() => input.style.borderColor = "", 500);
    };
})();
