/**
 * MASTER SEARCH ENGINE - PROFILE FIX
 */

window.addEventListener('DOMContentLoaded', () => {
    syncActiveProfile();
    initNatures();
    initLocations();
    updateMethodContext();
});

function syncActiveProfile() {
    const banner = document.getElementById('profile-banner');
    
    // Tentative 1 : Chercher la clé directe
    let activeProfile = JSON.parse(localStorage.getItem('rng_active_profile'));

    // Tentative 2 : Si vide, chercher dans la liste globale des profils
    if (!activeProfile) {
        const allProfiles = JSON.parse(localStorage.getItem('rng_profiles')) || [];
        // On prend le premier profil ou celui qui contient "Emeraude" si disponible
        activeProfile = allProfiles.find(p => p.active === true) || allProfiles[0];
        
        if (activeProfile) {
            localStorage.setItem('rng_active_profile', JSON.stringify(activeProfile));
        }
    }

    if (activeProfile && activeProfile.name) {
        banner.style.backgroundColor = "rgba(46, 204, 113, 0.1)";
        banner.style.borderColor = "#2ecc71";
        banner.style.color = "#2ecc71";
        banner.innerHTML = `<b>✅ Profil : ${activeProfile.name}</b><br>
                            <span style="color:#eee; font-size:0.75rem;">TID: ${activeProfile.tid} | SID: ${activeProfile.sid}</span>`;
    } else {
        banner.style.backgroundColor = "rgba(231, 76, 60, 0.1)";
        banner.style.borderColor = "#e74c3c";
        banner.style.color = "#e74c3c";
        banner.innerHTML = `<b>⚠️ Aucun profil trouvé</b><br>
                            <span style="color:#eee; font-size:0.75rem;">Créez ou importez un profil dans l'onglet Config.</span>`;
    }
}

function initNatures() {
    const container = document.getElementById('nature-list');
    if (!container || typeof DATA_NATURES === 'undefined') return;
    
    container.innerHTML = ""; 
    DATA_NATURES.forEach(n => {
        const row = document.createElement('div');
        row.className = "nature-row";
        row.innerHTML = `<span>${n}</span><input type="checkbox" class="nat-check" value="${n}">`;
        container.appendChild(row);
    });
}

function initLocations() {
    const select = document.getElementById('area-select');
    if (!select || typeof DATA_LOCATIONS === 'undefined') return;
    select.innerHTML = "";
    for (const key in DATA_LOCATIONS) {
        let opt = document.createElement('option');
        opt.value = key;
        opt.innerText = DATA_LOCATIONS[key].name;
        select.appendChild(opt);
    }
}

function updateMethodContext() {
    const method = document.getElementById('method').value;
    document.getElementById('h1-options').style.display = (method === "h1") ? "block" : "none";
    document.getElementById('h2-h4-options').style.display = (method !== "h1") ? "block" : "none";
}

function lcrng(seed) {
    return (BigInt(seed) * 1103515245n + 24691n) & 0xFFFFFFFFn;
}

function generateFrames() {
    const active = JSON.parse(localStorage.getItem('rng_active_profile'));
    if (!active) {
        alert("Veuillez sélectionner un profil actif dans l'onglet Config !");
        return;
    }

    const start = parseInt(document.getElementById('f-start').value) || 0;
    const end = parseInt(document.getElementById('f-end').value) || 5000;
    const method = document.getElementById('method').value;
    const onlyShiny = document.getElementById('filter-shiny').checked;
    const selectedNatures = Array.from(document.querySelectorAll('.nat-check:checked')).map(c => c.value);

    const tid = parseInt(active.tid);
    const sid = parseInt(active.sid);
    const tbody = document.getElementById('results-body');
    tbody.innerHTML = "";
    document.getElementById('results-area').style.display = "block";

    let seed = 0n; 
    for (let i = 0; i < start; i++) seed = lcrng(seed);

    for (let f = start; f <= end; f++) {
        let tempSeed = seed;
        let p1, p2, pid, iv1, iv2;

        if (method === "h1") {
            p1 = Number(lcrng(tempSeed) >> 16n);
            p2 = Number(lcrng(lcrng(tempSeed)) >> 16n);
            pid = ((p2 << 16) | p1) >>> 0;
            let s_iv1 = lcrng(lcrng(lcrng(tempSeed)));
            let s_iv2 = lcrng(s_iv1);
            iv1 = Number(s_iv1 >> 16n);
            iv2 = Number(s_iv2 >> 16n);
        } else {
            let s_iv1 = lcrng(tempSeed);
            let s_iv2 = lcrng(s_iv1);
            iv1 = Number(s_iv1 >> 16n);
            iv2 = Number(s_iv2 >> 16n);
            p1 = Number(lcrng(s_iv2) >> 16n);
            p2 = Number(lcrng(lcrng(s_iv2)) >> 16n);
            pid = ((p2 << 16) | p1) >>> 0;
        }

        let isShiny = ((tid ^ sid) ^ (p1 ^ p2)) < 8;
        let nature = DATA_NATURES[pid % 25];

        if (onlyShiny && !isShiny) { seed = lcrng(seed); continue; }
        if (selectedNatures.length > 0 && !selectedNatures.includes(nature)) { seed = lcrng(seed); continue; }

        let stats = `${iv1&31}/${(iv1>>5)&31}/${(iv1>>10)&31}/${(iv2>>5)&31}/${(iv2>>10)&31}/${iv2&31}`;
        let slotRoll = Number(lcrng(lcrng(lcrng(lcrng(tempSeed)))) >> 16n) % 100;
        let slotIdx = [20,40,50,60,70,80,85,90,94,98,99,100].findIndex(t => slotRoll < t);
        let pokemon = (method === "h1") ? document.getElementById('h1-target').value : DATA_LOCATIONS[document.getElementById('area-select').value].slots[slotIdx];

        const row = document.createElement('tr');
        if (isShiny) row.className = "shiny-row";
        row.innerHTML = `<td>${f}</td><td>${nature}</td><td>${stats}</td><td>${pokemon}</td>`;
        row.onclick = () => {
            localStorage.setItem('temp_target_frame', f);
            alert(`Frame ${f} envoyée au Chrono !`);
        };
        tbody.appendChild(row);
        seed = lcrng(seed);
    }
}
