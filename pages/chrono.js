(function() {
    let isRunning = false;
    let timerTimeout = null;
    let endTime = 0;
    let currentPhase = "idle"; 
    let counter = 0;
    let lastBeepSecond = -1;
    const FPS_GBA = 59.7275;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function playBeep(freq, duration, vol = 0.1) {
        if (!document.getElementById('enable-sound').checked) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration/1000);
        setTimeout(() => osc.stop(), duration);
    }

    function triggerFlash() {
        const flash = document.getElementById('flash-overlay');
        flash.style.opacity = "0.7";
        setTimeout(() => { flash.style.opacity = "0"; }, 60);
    }

    window.toggleTimer = function() {
        if (isRunning) stopTimer(); else startTimer();
    };

    window.resetCounter = function() {
        counter = 0;
        document.getElementById('count-val').innerText = "0";
    };

    window.resetCalibration = function() {
        document.getElementById('calibration').value = "0";
    };

    function startTimer() {
        isRunning = true;
        lastBeepSecond = -1;
        document.getElementById('start-btn').innerText = "STOP";
        document.getElementById('start-btn').style.background = "#e74c3c";
        
        const preMs = parseFloat(document.getElementById('pre-timer').value) || 0;
        if (preMs > 0) runPhase("PRE-TIMER", preMs); else startTargetPhase();
    }

    function runPhase(phase, duration) {
        currentPhase = phase;
        lastBeepSecond = -1;
        document.getElementById('phase-label').innerText = phase;
        endTime = Date.now() + duration;
        requestAnimationFrame(updateDisplay);
    }

    function startTargetPhase() {
        const calib = parseFloat(document.getElementById('calibration').value) || 0;
        const target = parseInt(document.getElementById('target-frame').value) || 0;
        const duration = (target / FPS_GBA * 1000) + calib;
        runPhase("TARGET", duration);
    }

    function updateDisplay() {
        if (!isRunning) return;
        const now = Date.now();
        const remaining = endTime - now;

        if (remaining <= 0) {
            handlePhaseEnd();
            return;
        }

        // Affichage 3 décimales
        document.getElementById('timer-val').innerText = (remaining / 1000).toFixed(3);

        // Bips de décompte (Eon Style)
        const beepLimit = parseInt(document.getElementById('beep-count').value) || 0;
        const currentSec = Math.ceil(remaining / 1000);
        
        if (currentSec <= beepLimit && currentSec !== lastBeepSecond) {
            lastBeepSecond = currentSec;
            playBeep(440, 60); // Bip normal
            if(document.getElementById('enable-vibrate').checked) navigator.vibrate(40);
        }

        timerTimeout = requestAnimationFrame(updateDisplay);
    }

    function handlePhaseEnd() {
        triggerFlash();
        const vibrate = document.getElementById('enable-vibrate').checked;
        
        if (currentPhase === "PRE-TIMER") {
            if (vibrate) navigator.vibrate(100);
            playBeep(880, 150);
            startTargetPhase();
        } 
        else if (currentPhase === "TARGET") {
            counter++;
            document.getElementById('count-val').innerText = counter;
            if (vibrate) navigator.vibrate([200, 50, 200]);
            playBeep(1000, 250, 0.2); // Bip final plus fort/aigu

            const interval = parseFloat(document.getElementById('interval-val').value) || 0;
            if (interval > 0) {
                runPhase("WAITING", interval * 1000);
            } else {
                stopTimer();
                document.getElementById('timer-val').innerText = "0.000";
            }
        }
        else if (currentPhase === "WAITING") {
            startTargetPhase();
        }
    }

    function stopTimer() {
        isRunning = false;
        cancelAnimationFrame(timerTimeout);
        document.getElementById('start-btn').innerText = "START";
        document.getElementById('start-btn').style.background = "var(--game-color)";
        document.getElementById('phase-label').innerText = "PRÊT";
    }

    window.updateCalibration = function() {
        const target = parseInt(document.getElementById('target-frame').value);
        const hit = parseInt(document.getElementById('frame-hit').value);
        const currentCalib = parseFloat(document.getElementById('calibration').value) || 0;
        if (!hit) return;

        // Formule EonTimer GBA
        const diff = target - hit;
        const msAdjustment = (diff / FPS_GBA) * 1000;
        const newCalib = Math.round(currentCalib + msAdjustment);
        
        document.getElementById('calibration').value = newCalib;
        playBeep(600, 100);
        
        // Petit effet de succès sur l'input
        const input = document.getElementById('calibration');
        input.style.boxShadow = "0 0 10px var(--game-color)";
        setTimeout(() => input.style.boxShadow = "none", 500);
    };
})();
