/**
 * SEARCH.JS - VERSION SYNCHRO FINALE
 */

window.addEventListener('DOMContentLoaded', () => {
    refreshProfileStatus();
    initNatureList();
});

function refreshProfileStatus() {
    const banner = document.getElementById('profile-banner');
    const raw = localStorage.getItem('rng_active_profile');
    
    if (!raw) {
        banner.innerHTML = "⚠️ Aucun profil. Allez dans Config.";
        banner.style.color = "#e74c3c";
        return;
    }

    try {
        const active = JSON.parse(raw);
        if (active && active.name) {
            banner.style.color = "#2ecc71";
            banner.innerHTML = `✅ <b>Profil : ${active.name}</b> (TID: ${active.tid})`;
        } else {
            banner.innerHTML = "⚠️ Profil mal chargé. Re-cliquez dans Config.";
        }
    } catch(e) {
        banner.innerHTML = "⚠️ Erreur de données. Re-cliquez dans Config.";
    }
}

function initNatureList() {
    const container = document.getElementById('nature-list');
    const natures = ["Hardi", "Solo", "Brave", "Rigide", "Mauvais", "Assuré", "Docile", "Relax", "Malin", "Lâche", "Timide", "Pressé", "Sérieux", "Jovial", "Naïf", "Modeste", "Doux", "Discret", "Prudent", "Foufou", "Calme", "Gentil", "Malpoli", "Bizarre"];
    
    container.innerHTML = natures.map(n => `
        <div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid #222;">
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
    if (!active) return alert("Sélectionnez un profil dans Config !");

    const start = parseInt(document.getElementById('f-start').value) || 0;
    const end = parseInt(document.getElementById('f-end').value) || 5000;
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
        let isShiny = ((tid ^ sid) ^ (p1 ^ p2)) < 8;

        if (isShiny) {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${f}</td><td>Shiny</td><td>✨ SHINY ✨</td>`;
            row.style.color = "gold";
            tbody.appendChild(row);
        }
        seed = lcrng(seed);
    }
    if(tbody.innerHTML === "") tbody.innerHTML = "<tr><td colspan='3'>Aucun Shiny trouvé dans cette zone.</td></tr>";
}
