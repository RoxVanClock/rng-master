/* app-core.js */

// Gère l'état visuel du menu (classe active)
function setActive(el) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    el.classList.add('active');
}

// Écouteur pour la communication entre l'iframe et l'index
window.addEventListener('message', function(event) {
    // Si on reçoit une demande de changement de frame depuis "Chercher"
    if (event.data.type === 'setTargetFrame') {
        const frameValue = event.data.value;
        
        // On stocke temporairement la valeur pour que chrono.js la récupère
        localStorage.setItem('temp_target_frame', frameValue);
        
        // On redirige l'iframe vers le chrono
        const iframe = document.getElementById('content-frame');
        iframe.src = 'pages/chrono.html';
        
        // On met à jour l'icône active dans la barre de navigation
        const chronoBtn = document.querySelectorAll('.nav-item')[2]; // Le 3ème bouton (index 2)
        setActive(chronoBtn);
    }
});
