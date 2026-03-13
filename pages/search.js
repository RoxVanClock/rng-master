/**
 * SEARCH.JS - Moteur de recherche synchronisé
 */

window.addEventListener('DOMContentLoaded', () => {
    refreshProfileStatus();
    initNatureList();
});

function refreshProfileStatus() {
    const banner = document.getElementById('profile-banner');
    if (!banner) return;
    
    // Récupération de l'objet profil actif
    const rawData = localStorage.getItem('rng_active_profile');
    let active = null;

    if (rawData) {
        try {
            active = JSON.parse(rawData);
            // Si ce n'est pas un objet (vieux format), on l'ignore pour forcer l'utilisateur à recliquer
            if (typeof active !== 'object') active = null;
        } catch(e) { active = null; }
    }

    if (active && active.tid !== undefined) {
        banner.style.backgroundColor = "rgba(46, 204, 113, 0.15)";
        banner.style.borderColor = "#2ecc71";
        banner.style.color = "#2ecc71";
        banner.innerHTML = `
            <div style="flex-grow:1; text-align:left;">
                <b>✅ Profil : ${active.name}</b><br>
                <small style="color:#eee">TID: ${active.tid} | SID: ${active.sid || '0'}</small>
            </div>
            <button class="refresh-btn" onclick="refreshProfileStatus()" style="background:none; border:none; color:white; cursor:pointer;">🔄</button>`;
    } else {
        banner.style.backgroundColor = "rgba(231, 76, 60, 0.15)";
        banner.style.borderColor = "#e74c3c";
        banner.style.color = "#e74c3c";
        banner.innerHTML = `
            <div style="flex-grow:1; text-align:left;">
                <b>⚠️ Aucun profil actif</b><br>
                <small style="color:#eee">Cliquez sur un profil dans l'onglet Config.</small>
            </div>
            <button class="refresh-btn" onclick="refreshProfileStatus()" style="background:none; border:none; color:white; cursor:pointer;">🔄</button>`;
    }
}

function initNatureList() {
    const container = document.getElementById('nature-list');
    if (!container) return;
    // On affiche les 24 noms uniques
    const uniqueNatures = [...new Set(DATA_NATURES)];
    container.innerHTML = uniqueNatures.map(n => `
        <div class="nature-row" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #222;">
            <span>${n}</span>
            <input type="checkbox" class="nat-check" value="${n}" style="width:20px; height:20px;">
        </div>
    `).join('');
}

function lcrng(seed) {
    return (BigInt(seed) * 1103515245n + 24691n) & 0xFFFFFFFFn;
}

function generateFrames() {
    const rawData = localStorage.getItem('rng_active_profile');
    let active = null;
    try { active = JSON.parse(rawData); } catch(e) {}

    if (!active || typeof active !== 'object') {
        return alert("Veuillez d'abord sélectionner un profil dans l'onglet Configuration.");
    }

    const start = parseInt(document.getElementById('f-start').value) || 0;
    const end = parseInt(document.getElementById('f-end').value) || 5000;
    const selectedNatures = Array.from(document.querySelectorAll('.nat-check:checked')).map(c => c.value);

    const tid = parseInt(active.tid);
    const sid = parseInt(active.sid || 0);
    const tbody = document.getElementById('results-body');
    tbody.innerHTML = "";
    document.getElementById('results-container').style.display = "block";

    let seed = 0n; 
    for (let i = 0; i < start; i++) seed = lcrng(seed);

    for (let f = start; f <= end; f++) {
        let p1 = Number(lcrng(seed) >> 16n);
        let p2 = Number(lcrng(lcrng(seed)) >> 16n);
        let pid = ((p2 << 16) | p1) >>> 0;
        
        let nature = DATA_NATURES[pid % 25];
        
        if (selectedNatures.length > 0 && !selectedNatures.includes(nature)) {
            seed = lcrng(seed);
            continue;
        }

        let isShiny = ((tid ^ sid) ^ (p1 ^ p2)) < 8;
        
        const row = document.createElement('tr');
        if (isShiny) row.style.backgroundColor = "rgba(255, 215, 0, 0.1)";
        row.innerHTML = `
            <td style="${isShiny ? 'color:gold;font-weight:bold;' : ''}">${f}</td>
            <td>${nature}</td>
            <td style="color:#666;">-</td>
            <td>${isShiny ? '✨ SHINY' : 'Normal'}</td>
        `;
        tbody.appendChild(row);
        seed = lcrng(seed);
    }
}
