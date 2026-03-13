window.addEventListener('DOMContentLoaded', () => {
    refreshProfileStatus();
    initNatureList();
});

function refreshProfileStatus() {
    const banner = document.getElementById('profile-banner');
    
    // 1. On cherche la clé directe
    let active = JSON.parse(localStorage.getItem('rng_active_profile'));

    // 2. Secours : On cherche dans la liste complète (cas de l'import)
    if (!active) {
        const all = JSON.parse(localStorage.getItem('rng_profiles')) || [];
        active = all.find(p => p.active === true); 
        if(active) localStorage.setItem('rng_active_profile', JSON.stringify(active));
    }

    if (active && active.tid !== undefined) {
        banner.style.backgroundColor = "rgba(46, 204, 113, 0.15)";
        banner.style.borderColor = "#2ecc71";
        banner.style.color = "#2ecc71";
        banner.innerHTML = `<div><b>✅ Profil : ${active.name}</b><br><small style="color:#ccc">TID: ${active.tid} | SID: ${active.sid}</small></div>
                            <button class="refresh-btn" onclick="refreshProfileStatus()">🔄</button>`;
    } else {
        banner.style.backgroundColor = "rgba(231, 76, 60, 0.15)";
        banner.style.borderColor = "#e74c3c";
        banner.style.color = "#e74c3c";
        banner.innerHTML = `<div><b>⚠️ Aucun profil détecté</b><br><small style="color:#ccc">Sélectionnez-le dans Config.</small></div>
                            <button class="refresh-btn" onclick="refreshProfileStatus()">🔄 RÉESSAYER</button>`;
    }
}

function initNatureList() {
    const container = document.getElementById('nature-list');
    if (!container) return;
    // On affiche les 24 natures sans doublon pour l'interface
    const uniqueNatures = [...new Set(DATA_NATURES)];
    container.innerHTML = uniqueNatures.map(n => `
        <div class="nature-row">
            <span>${n}</span>
            <input type="checkbox" class="nat-check" value="${n}">
        </div>
    `).join('');
}

function lcrng(seed) {
    return (BigInt(seed) * 1103515245n + 24691n) & 0xFFFFFFFFn;
}

function generateFrames() {
    const active = JSON.parse(localStorage.getItem('rng_active_profile'));
    if (!active) return alert("Erreur : Aucun profil actif. Cliquez sur le bouton 🔄.");

    const start = parseInt(document.getElementById('f-start').value) || 0;
    const end = parseInt(document.getElementById('f-end').value) || 5000;
    const selectedNatures = Array.from(document.querySelectorAll('.nat-check:checked')).map(c => c.value);

    const tid = parseInt(active.tid);
    const sid = parseInt(active.sid);
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
            seed = lcrng(seed); continue;
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
