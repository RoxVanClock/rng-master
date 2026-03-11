/**
 * APP-CORE.JS - Le Cerveau du Style
 */
const AppCore = {
    // Cette fonction met à jour la couleur partout
    updateGlobalTheme: function(color) {
        if (!color) color = localStorage.getItem('rng_theme_color') || '#2ecc71';
        document.documentElement.style.setProperty('--game-color', color);
        localStorage.setItem('rng_theme_color', color);
    },

    // Appliqué au chargement de chaque page
    applyTheme: function() {
        const savedColor = localStorage.getItem('rng_theme_color');
        if (savedColor) {
            document.documentElement.style.setProperty('--game-color', savedColor);
        }
    }
};

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', AppCore.applyTheme);
