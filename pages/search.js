/**
 * SEARCH ENGINE - PROFILE FIX
 */

window.addEventListener('DOMContentLoaded', () => {
    refreshProfileStatus();
    initNatureList();
});

function refreshProfileStatus() {
    const banner = document.getElementById('profile-banner');
    
    // On essaie de lire le profil actif
    let active = JSON.parse(localStorage.getItem('rng_active_profile'));

    // Si c'est vide, on cherche dans la liste globale des profils
    if (!active) {
        const all = JSON.parse(localStorage.getItem('rng_profiles')) || [];
        active = all.find(p => p.active === true);
    }

    if (active && active.tid !== undefined) {
        banner.style.backgroundColor = "rgba(46, 204, 113, 0.1)";
        banner.style.borderColor = "#2ecc71";
        banner.style.color = "#2ecc71";
        banner.innerHTML = `<b>✅ Profil : ${active.name}</b><br>TID: ${active.tid} | SID: ${active.sid}`;
    } else {
        banner.style.backgroundColor = "rgba(231, 76, 60, 0.1)";
        banner.style.borderColor = "#e74c3c";
        banner.style.color = "#e74c3c";
        banner.innerHTML = `<b>⚠️ Aucun profil sélectionné</b><br>Allez dans Config et cliquez sur votre profil.`;
    }
}

function initNatureList() {
    const container = document.getElementById('nature-list');
    if (!container) return;
    const unique = [...new Set(DATA_NATURES)];
    unique.forEach(n => {
        const div = document.createElement('div');
        div.className = "nature-row";
        div.innerHTML = `<span>${n}</span><input type="checkbox" class="nat-check" value="${n}">`;
        container.appendChild(div);
    });
}

function lcrng(seed) {
    return (BigInt(seed) * 1103515245n + 24691n) & 0xFFFFFFFFn;
}

function generateFrames() {
    // On récupère le profil au moment du clic pour être sûr
    let active = JSON.parse(localStorage.getItem('rng_active_profile'));
    if (!active) {
        const all = JSON.parse(localStorage.getItem('rng_profiles')) || [];
        active = all.find(p => p.active === true);
    }

    if (!active) return alert("Veuillez sélectionner un profil dans l'onglet Config.");

    const start = parseInt(document.getElementById('f-start').value) || 0;
    const end = parseInt(document.getElementById('f-end').value) || 5000;
    const selectedNatures = Array.from(document.querySelectorAll('.nat-check:checked')).map(c => c.value);

    const tid = parseInt(active.tid);
    const sid = parseInt(active.sid);
    const tbody = document.getElementById('results-body');
    tbody.innerHTML = "";
    document.getElementById('results-area').style.display = "block";

    let seed = 0n; 
    for (let i = 0; i < start; i++) seed = lcrng(seed);

    for (let f = start; f <= end; f++) {
        let p1 = Number(lcrng(seed) >> 16n);
        let p2 = Number(lcrng(lcrng(seed)) >> 16n);
        let pid = ((p2 << 16) | p1) >>> 0;
        
        let nature = DATA_NATURES[pid % 25];
        if (selectedNatures.length > 0 && !selectedNatures.includes(nature)) {
            seed = lcrng(seed); continue;
        }

        let isShiny = ((tid ^ sid) ^ (p1 ^ p2)) < 8;
        
        const row = document.createElement('tr');
        if (isShiny) row.style.color = "gold";
        row.innerHTML = `<td>${f}</td><td>${nature}</td><td>-</td><td>Fixe</td>`;
        tbody.appendChild(row);
        
        seed = lcrng(seed);
    }
}
