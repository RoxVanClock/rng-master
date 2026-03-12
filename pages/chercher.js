window.runSearch = function() {
    const start = parseInt(document.getElementById('frame-start').value);
    const end = parseInt(document.getElementById('frame-end').value);
    const resultsBody = document.getElementById('results-body');
    
    // Récupérer le profil actif pour le TID/SID
    const profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    const activeId = localStorage.getItem('rng_active_profile');
    const profile = profiles.find(p => p.id == activeId);

    if (!profile) {
        alert("Veuillez sélectionner un profil dans Config avant de chercher.");
        return;
    }

    resultsBody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Calcul en cours...</td></tr>";

    // Simulation de calcul (On ajoutera le vrai algo LCRNG juste après)
    setTimeout(() => {
        let html = "";
        for (let f = start; f <= end; f++) {
            // Ici on placera l'algo : Seed -> Frame -> PID -> Shiny Check
            const isShiny = checkShinyMock(f, profile.tid, profile.sid);
            
            if (isShiny) {
                html += `
                <tr class="shiny-row">
                    <td>${f}</td>
                    <td>Rigide</td>
                    <td>31/10/24/...</td>
                    <td>✨ OUI</td>
                    <td><button class="btn-send" onclick="sendToChrono(${f})">TIMER</button></td>
                </tr>`;
            }
        }
        resultsBody.innerHTML = html || "<tr><td colspan='5' style='text-align:center;'>Aucun Shiny trouvé.</td></tr>";
    }, 100);
};

function checkShinyMock(frame, tid, sid) {
    // Simulation : 1 chance sur 1000 pour le test
    return Math.random() < 0.005; 
}

function sendToChrono(frame) {
    localStorage.setItem('rng_target_frame', frame);
    alert(`Frame ${frame} envoyée au Chrono !`);
    // Optionnel : rediriger vers le chrono
    // window.parent.loadPage('chrono'); 
}
