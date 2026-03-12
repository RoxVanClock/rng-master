(function() {
    let isRunning = false;
    let timerTimeout = null;
    let endTime = 0;
    let currentPhase = "idle"; 
    let counter = 0;
    let nextBeepThreshold = -1; 
    let beepsRemaining = 0;
    let beepInterval = 0;
    const FPS_GBA = 59.7275;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function checkIncomingFrame() {
        const incomingFrame = localStorage.getItem('temp_target_frame');
        if (incomingFrame) {
            document.getElementById('target-frame').value = incomingFrame;
            localStorage.removeItem('temp_target_frame');
            window.updateTargetInfo();
        }
    }

    window.updateTargetInfo = function() {
        const target = parseInt(document.getElementById('target-frame').value) || 0;
        const calib = parseFloat(document.getElementById('calibration').value) || 0;
        const ms = (target / FPS_GBA * 1000) + calib;
        document.getElementById('duration-info').innerText = `Durée cible : ${Math.round(ms)} ms`;
    };

    function playBeep(freq, duration) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = document.getElementById('beep-type').value;
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration/1000);
        osc.stop(audioCtx.currentTime + duration/1000);
    }

    window.toggleTimer = function() {
        if (isRunning) stopTimer(); else startTimer();
    };

    function startTimer() {
        isRunning = true;
        const preTimer = parseInt(document.getElementById('pre-timer').value) || 0;
        document.getElementById('start-btn').innerText = "STOP";
        document.getElementById('start-btn').style.background = "#e74c3c";

        if (preTimer > 0) {
            currentPhase = "PRE-TIMER";
            document.getElementById('phase-label').innerText = "PRE-TIMER";
            endTime = performance.now() + preTimer;
        } else {
            startTargetPhase();
        }
        requestAnimationFrame(updateDisplay);
    }

    function startTargetPhase() {
        currentPhase = "TARGET";
        document.getElementById('phase-label').innerText = "TARGET";
        const target = parseInt(document.getElementById('target-frame').value) || 0;
        const calib = parseFloat(document.getElementById('calibration').value) || 0;
        const targetMs = (target / FPS_GBA * 1000) + calib;
        endTime = performance.now() + targetMs;

        // --- CALCUL DE L'INTERVALLE ---
        const startSec = parseFloat(document.getElementById('beep-start').value) || 0;
        const totalBeeps = parseInt(document.getElementById('num-beeps').value) || 1;
        
        beepsRemaining = totalBeeps;
        // Si on veut 5 bips sur 2 secondes, on a 4 intervalles entre les bips
        // Le 1er bip est à 2s, le dernier à 0s.
        beepInterval = (totalBeeps > 1) ? (startSec * 1000) / (totalBeeps - 1) : 0;
        nextBeepThreshold = startSec * 1000;
    }

    function updateDisplay() {
        if (!isRunning) return;

        const now = performance.now();
        const remaining = endTime - now;

        if (remaining <= 0) {
            handlePhaseEnd();
            return;
        }

        document.getElementById('timer-val').innerText = (remaining / 1000).toFixed(3);
        
        // Logique des bips proportionnels (on joue tous les bips sauf le dernier qui est géré par handlePhaseEnd)
        if (currentPhase === "TARGET" && beepsRemaining > 1) {
            if (remaining <= nextBeepThreshold) {
                playBeep(440, 50);
                flashCircle();
                beepsRemaining--;
                nextBeepThreshold -= beepInterval;
            }
        }

        timerTimeout = requestAnimationFrame(updateDisplay);
    }

    function flashCircle() {
        const flash = document.getElementById('flash-circle');
        flash.style.opacity = "0.5";
        setTimeout(() => flash.style.opacity = "0", 50);
    }

    function handlePhaseEnd() {
        if (currentPhase === "PRE-TIMER") {
            playBeep(880, 150);
            startTargetPhase();
        } else {
            counter++;
            document.getElementById('count-val').innerText = counter;
            playBeep(1200, 200); // Bip final
            flashCircle();
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
        const msDiff = (diff / FPS_GBA) * 1000;
        document.getElementById('calibration').value = (currentCalib + msDiff).toFixed(0);
        window.updateTargetInfo();
    };

    window.updateTargetInfo();
    checkIncomingFrame();
})();
