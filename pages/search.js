/**
 * SEARCH.JS - Calculs RNG et Communication
 */
const NATURES = ["Hardi", "Solo", "Brave", "Rigide", "Mauvais", "Assuré", "Docile", "Relax", "Malin", "Lâche", "Timide", "Pressé", "Sérieux", "Jovial", "Naïf", "Modeste", "Doux", "Discret", "Prudent", "Foufou", "Calme", "Gentil", "Malpoli", "Bizarre", "Bizarre"];

function lcrng(seed) {
    return (BigInt(seed) * 1103515245n + 12345n) & 0xFFFFFFFFn;
}

function generateFrames() {
    const start = parseInt(document.getElementById('f-start').value);
    const end = parseInt(document.getElementById('f-end').value);
    const tbody = document.getElementById('results-body');
    const profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    const activeId = localStorage.getItem('rng_active_id');
    const profile = profiles.find(p => p.id == activeId);

    if (!profile) return alert("Veuillez sélectionner un profil dans l'onglet Config !");

    tbody.innerHTML = "";
    document.getElementById('results-area').style.display = "block";

    let seed = 0n; // Émeraude / Pile morte
    // Si tu veux gérer des seeds différentes (Rubis/Saphir pile OK), on l'ajoutera ici.

    // Avancer la seed jusqu'à la frame de départ
    for(let i = 0; i < start; i++) seed = lcrng(seed);

    let html = "";
    for (let f = start; f <= end; f++) {
        seed = lcrng(seed);
        let p1 = Number(seed >> 16n);
        let nextSeed = lcrng(seed);
        let p2 = Number(nextSeed >> 16n);
        
        const pid = (p2 << 16) | p1;
        const nature = NATURES[pid % 25];
        
        // Calcul Shiny
        const shinyValue = (parseInt(profile.tid) ^ parseInt(profile.sid)) ^ (p1 ^ p2);
        const isShiny = shinyValue < 8;

        html += `<tr class="${isShiny ? 'shiny-row' : ''}">
            <td>${f} ${isShiny ? '✨' : ''}</td>
            <td>${nature}</td>
            <td>${pid.toString(16).toUpperCase()}</td>
            <td><button class="btn-mini" onclick="sendToChrono(${f})">TIMER</button></td>
        </tr>`;
    }
    tbody.innerHTML = html;
}

function sendToChrono(frameValue) {
    // Envoie la frame à index.html
    window.parent.postMessage({ type: 'setTargetFrame', value: frameValue }, '*');
}

// Info profil au chargement
window.addEventListener('DOMContentLoaded', () => {
    const profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    const activeId = localStorage.getItem('rng_active_id');
    const profile = profiles.find(p => p.id == activeId);
    if(profile) {
        document.getElementById('active-info').innerText = `Profil: ${profile.name} (TID: ${profile.tid})`;
    } else {
        document.getElementById('active-info').innerHTML = "<b style='color:#e74c3c;'>⚠️ Aucun profil actif</b>";
    }
});
