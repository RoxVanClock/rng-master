/**
 * APP-CORE.JS - Gestion Globale
 */
const AppCore = {
    updateGlobalTheme: function(color) {
        if (!color) color = localStorage.getItem('rng_theme_color') || '#2ecc71';
        document.documentElement.style.setProperty('--game-color', color);
        localStorage.setItem('rng_theme_color', color);
    },

    applyTheme: function() {
        const savedColor = localStorage.getItem('rng_theme_color');
        if (savedColor) {
            document.documentElement.style.setProperty('--game-color', savedColor);
        }
    }
};

// Gère l'état visuel de la barre de navigation
function setActive(el) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    el.classList.add('active');
}

// Écoute les ordres venant des Iframes (ex: bouton TIMER dans search.js)
window.addEventListener('message', function(event) {
    if (event.data.type === 'setTargetFrame') {
        // On stocke la frame pour que chrono.js puisse la lire
        localStorage.setItem('temp_target_frame', event.data.value);
        
        // On change l'iframe vers le chrono
        const frame = document.getElementById('content-frame');
        frame.src = 'pages/chrono.html';
        
        // On met à jour visuellement le menu sur "Chrono"
        const chronoBtn = document.querySelectorAll('.nav-item')[2];
        setActive(chronoBtn);
    }
});

document.addEventListener('DOMContentLoaded', AppCore.applyTheme);
