/**
 * MASTER SEARCH ENGINE - POKEFINDER ACCURACY
 */

window.addEventListener('DOMContentLoaded', () => {
    initNatures();
    initLocations();
    updateMethodContext();
    refreshProfile();
});

function initNatures() {
    const list = document.getElementById('nature-list');
    if (!list || typeof DATA_NATURES === 'undefined') return;
    DATA_NATURES.forEach(n => {
        const item = document.createElement('label');
        item.className = "nature-item";
        item.innerHTML = `<input type="checkbox" class="nat-check" value="${n}"> ${n}`;
        list.appendChild(item);
    });
}

function initLocations() {
    const select = document.getElementById('area-select');
    if (!select || typeof DATA_LOCATIONS === 'undefined') return;
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

function refreshProfile() {
    const active = JSON.parse(localStorage.getItem('rng_active_profile'));
    const info = document.getElementById('active-info');
    if (active) {
        info.innerText = `Profil actif : ${active.name} (TID:${active.tid} | SID:${active.sid})`;
    } else {
        info.innerHTML = "<span style='color:red;'>⚠️ Aucun profil configuré !</span>";
    }
}

function lcrng(seed) {
    return (BigInt(seed) * 1103515245n + 24691n) & 0xFFFFFFFFn;
}

function generateFrames() {
    const active = JSON.parse(localStorage.getItem('rng_active_profile'));
    if (!active) return alert("Veuillez d'abord créer un profil dans l'onglet Config.");

    const start = parseInt(document.getElementById('f-start').value);
    const end = parseInt(document.getElementById('f-end').value);
    const method = document.getElementById('method').value;
    const onlyShiny = document.getElementById('filter-shiny').checked;
    const selectedNatures = Array.from(document.querySelectorAll('.nat-check:checked')).map(c => c.value);

    const tid = parseInt(active.tid);
    const sid = parseInt(active.sid);
    const tbody = document.getElementById('results-body');
    tbody.innerHTML = "";
    document.getElementById('results-area').style.display = "block";

    let seed = 0n; // Base Émeraude
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
