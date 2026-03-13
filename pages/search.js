window.addEventListener('DOMContentLoaded', () => {
    syncNow();
    buildNatureList();
});

// FONCTION UNIQUE DE RÉCUPÉRATION DU PROFIL
function getActiveProfile() {
    // On essaie d'abord la clé spécifique au profil actif
    let active = JSON.parse(localStorage.getItem('rng_active_profile'));
    
    // Si vide, on cherche dans la liste complète le profil marqué 'active: true'
    if (!active || !active.name) {
        const profiles = JSON.parse(localStorage.getItem('rng_profiles')) || [];
        active = profiles.find(p => p.active === true);
        if (active) localStorage.setItem('rng_active_profile', JSON.stringify(active));
    }
    return active;
}

function syncNow() {
    const banner = document.getElementById('status-banner');
    const profile = getActiveProfile();

    if (profile && profile.name) {
        banner.style.borderColor = "#2ecc71";
        banner.style.background = "rgba(46, 204, 113, 0.1)";
        banner.innerHTML = `
            <div style="color:#2ecc71"><b>✅ ${profile.name}</b><br><small style="color:#eee">TID: ${profile.tid} | SID: ${profile.sid}</small></div>
            <button onclick="syncNow()" class="refresh-btn">🔄</button>
        `;
    } else {
        banner.style.borderColor = "#e74c3c";
        banner.style.background = "rgba(231, 76, 60, 0.1)";
        banner.innerHTML = `
            <div style="color:#e74c3c"><b>⚠️ Aucun profil trouvé</b><br><small style="color:#eee">Vérifiez l'onglet Config</small></div>
            <button onclick="syncNow()" class="refresh-btn">🔄</button>
        `;
    }
}

function buildNatureList() {
    const container = document.getElementById('nature-list');
    if (!container) return;
    const unique = [...new Set(DATA_NATURES)];
    container.innerHTML = unique.map(n => `
        <div class="nature-item">
            <span>${n}</span>
            <input type="checkbox" class="nat-check" value="${n}">
        </div>
    `).join('');
}

function lcrng(seed) {
    return (BigInt(seed) * 1103515245n + 24691n) & 0xFFFFFFFFn;
}

function runSearch() {
    const profile = getActiveProfile();
    if (!profile) return alert("Sélectionnez un profil dans l'onglet Config d'abord !");

    const start = parseInt(document.getElementById('f-start').value) || 0;
    const end = parseInt(document.getElementById('f-end').value) || 5000;
    const selectedNatures = Array.from(document.querySelectorAll('.nat-check:checked')).map(c => c.value);

    const tid = parseInt(profile.tid);
    const sid = parseInt(profile.sid);
    const tbody = document.getElementById('results-body');
    
    tbody.innerHTML = "";
    document.getElementById('results-view').style.display = "block";

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
        
        const tr = document.createElement('tr');
        if (isShiny) tr.style.background = "rgba(255, 215, 0, 0.1)";
        tr.innerHTML = `
            <td style="${isShiny ? 'color:gold;font-weight:bold' : ''}">${f}</td>
            <td>${nature}</td>
            <td style="color:#555">--</td>
            <td>${isShiny ? '✨ SHINY' : 'Normal'}</td>
        `;
        tbody.appendChild(tr);
        seed = lcrng(seed);
    }
}
