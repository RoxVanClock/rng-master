/**
 * SEARCH.JS - Calculs RNG Pokémon GBA
 */
const NATURES = ["Hardi", "Solo", "Brave", "Rigide", "Mauvais", "Assuré", "Docile", "Relax", "Malin", "Lâche", "Timide", "Pressé", "Sérieux", "Jovial", "Naïf", "Modeste", "Doux", "Discret", "Prudent", "Foufou", "Calme", "Gentil", "Malpoli", "Bizarre", "Bizarre"];

function lcrng(seed) {
    return (BigInt(seed) * 1103515245n + 12345n) & 0xFFFFFFFFn;
}

function generateFrames() {
    const start = parseInt(document.getElementById('f-start').value);
    const end = parseInt(document.getElementById('f-end').value);
    const tbody = document.querySelector("#results-table tbody");
    const profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    const activeId = localStorage.getItem('rng_active_id');
    const profile = profiles.find(p => p.id == activeId);

    if (!profile) return alert("Choisis un profil dans l'onglet Config !");

    tbody.innerHTML = "";
    document.getElementById('results-area').style.display = "block";

    let seed = 0n; // Emerald / Dead Battery
    for(let i = 0; i < start; i++) seed = lcrng(seed);

    let html = "";
    for (let f = start; f <= end; f++) {
        seed = lcrng(seed);
        let p1 = Number(seed >> 16n);
        let nextSeed = lcrng(seed);
        let p2 = Number(nextSeed >> 16n);
        
        const pid = (p2 << 16) | p1;
        const nature = NATURES[pid % 25];
        const shinyValue = (parseInt(profile.tid) ^ parseInt(profile.sid)) ^ (p1 ^ p2);
        const isShiny = shinyValue < 8;

        html += `<tr class="${isShiny ? 'shiny' : ''}">
            <td>${f} ${isShiny ? '✨' : ''}</td>
            <td>${pid.toString(16).toUpperCase()}</td>
            <td>${nature}</td>
            <td>-</td>
            <td><button class="btn-mini" onclick="sendToChrono(${f})">TIMER</button></td>
        </tr>`;
    }
    tbody.innerHTML = html;
}

function sendToChrono(frameValue) {
    // Parle à l'index pour changer de page et transmettre la frame
    window.parent.postMessage({ type: 'setTargetFrame', value: frameValue }, '*');
}

window.addEventListener('DOMContentLoaded', () => {
    const profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    const activeId = localStorage.getItem('rng_active_id');
    const profile = profiles.find(p => p.id == activeId);
    const info = document.getElementById('active-info');
    
    if (profile) {
        info.innerText = `Profil actif : ${profile.name} (TID: ${profile.tid})`;
    } else {
        info.innerHTML = "<b style='color:#e74c3c;'>⚠️ Aucun profil sélectionné !</b>";
    }
});
