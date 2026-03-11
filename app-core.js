/**
 * AppCore : Utilitaire central partagé entre toutes les pages
 */
const AppCore = {
    // Récupère la liste des profils sauvegardés
    getProfiles: () => {
        return JSON.parse(localStorage.getItem('rng_profiles')) || [];
    },

    // Récupère le profil actif basé sur l'index stocké
    getActiveProfile: () => {
        const profiles = AppCore.getProfiles();
        const index = localStorage.getItem('active_profile_idx');
        return (index !== null && profiles[index]) ? profiles[index] : null;
    },

    // Applique les couleurs du jeu sélectionné au chargement
    applyTheme: () => {
        const active = AppCore.getActiveProfile();
        if (active) {
            // Ajoute la classe (ex: 'ruby') au body pour changer les variables CSS
            document.body.className = active.game;
        }
    }
};

// Exécution automatique quand un onglet finit de charger
window.addEventListener('DOMContentLoaded', AppCore.applyTheme);