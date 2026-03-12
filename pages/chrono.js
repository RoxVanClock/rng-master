(function() {
    let isRunning = false;
    let timerTimeout = null;
    let endTime = 0;
    let currentPhase = "idle"; 
    let counter = 0;
    let nextBeepTime = -1; 
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
            nextBeepTime = -1; 
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

        const startSec = parseInt(document.getElementById('beep-start').value) || 0;
        nextBeepTime = startSec * 1000;
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
        
        // Un bip toutes les secondes à partir de beep-start
        if (currentPhase === "TARGET" && nextBeepTime > 0) {
            if (remaining <= nextBeepTime) {
                playBeep(440, 50);
                flashCircle();
                nextBeepTime -= 1000; 
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
            playBeep(1200, 200); 
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
