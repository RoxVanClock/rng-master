(function() {
    let isRunning = false;
    let timerTimeout = null;
    let endTime = 0;
    let currentPhase = "idle"; 
    let counter = 0;
    let beepsPlayed = 0;
    const FPS_GBA = 59.7275;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Affiche la durée en ms dès qu'on change la frame
    window.updateTargetInfo = function() {
        const target = parseInt(document.getElementById('target-frame').value) || 0;
        const calib = parseFloat(document.getElementById('calibration').value) || 0;
        const ms = (target / FPS_GBA * 1000) + calib;
        document.getElementById('duration-info').innerText = `Durée cible : ${Math.round(ms)} ms`;
    };
    window.updateTargetInfo(); // Initialisation

    function playBeep(freq, duration) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration/1000);
        setTimeout(() => osc.stop(), duration);
    }

    function triggerFlash() {
        const flash = document.getElementById('flash-circle');
        flash.style.opacity = "1";
        setTimeout(() => { flash.style.opacity = "0"; }, 80);
    }

    window.toggleTimer = function() {
        if (isRunning) stopTimer(); else startTimer();
    };

    window.resetCounter = function() {
        counter = 0;
        document.getElementById('count-val').innerText = "0";
    };

    function startTimer() {
        isRunning = true;
        beepsPlayed = 0;
        document.getElementById('start-btn').innerText = "STOP";
        document.getElementById('start-btn').style.background = "#e74c3c";
        
        const preMs = parseFloat(document.getElementById('pre-timer').value) || 0;
        if (preMs > 0) runPhase("PRE-TIMER", preMs); else startTargetPhase();
    }

    function runPhase(phase, duration) {
        currentPhase = phase;
        beepsPlayed = 0;
        document.getElementById('phase-label').innerText = phase;
        endTime = Date.now() + duration;
        updateDisplay();
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

        document.getElementById('timer-val').innerText = (remaining / 1000).toFixed(3);

        // --- NOUVELLE LOGIQUE DES BIPS ---
        const totalBeeps = parseInt(document.getElementById('beep-count').value) || 1;
        const startTime = parseFloat(document.getElementById('beep-start').value) * 1000; // Déclenchement en ms
        
        // Intervalle calculé selon le temps de départ choisi
        const interval = startTime / totalBeeps;
        const nextBeepAt = startTime - (beepsPlayed * interval);

        if (remaining <= nextBeepAt && beepsPlayed < totalBeeps) {
            beepsPlayed++;
            playBeep(440, 50);
        }

        timerTimeout = requestAnimationFrame(updateDisplay);
    }

    function handlePhaseEnd() {
        triggerFlash();
        if (currentPhase === "PRE-TIMER") {
            playBeep(880, 150);
            startTargetPhase();
        } else {
            counter++;
            document.getElementById('count-val').innerText = counter;
            playBeep(1200, 200);
            stopTimer();
        }
    }

    function stopTimer() {
        isRunning = false;
        cancelAnimationFrame(timerTimeout);
        document.getElementById('start-btn').innerText = "DÉMARRER";
        document.getElementById('start-btn').style.background = "var(--game-color)";
        document.getElementById('phase-label').innerText = "PRÊT";
        document.getElementById('timer-val').innerText = "0.000";
    }

    window.updateCalibration = function() {
        const target = parseInt(document.getElementById('target-frame').value);
        const hit = parseInt(document.getElementById('frame-hit').value);
        const currentCalib = parseFloat(document.getElementById('calibration').value) || 0;
        if (!hit) return;

        const diff = target - hit;
        const newCalib = Math.round(currentCalib + ((diff / FPS_GBA) * 1000));
        document.getElementById('calibration').value = newCalib;
        window.updateTargetInfo();
        playBeep(600, 50);
    };
})();
