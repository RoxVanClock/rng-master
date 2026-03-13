/**
 * Moteur de recherche RNG - Précision PokéFinder
 */

// Initialisation au chargement
window.addEventListener('DOMContentLoaded', () => {
    setupNatures();
    setupLocations();
    refreshProfileInfo();
});

function setupNatures() {
    const container = document.getElementById('nature-list');
    DATA_NATURES.forEach(n => {
        const label = document.createElement('label');
        label.className = "nature-item";
        label.innerHTML = `<input type="checkbox" class="nat-check" value="${n}"> ${n}`;
        container.appendChild(label);
    });
}

function setupLocations() {
    const select = document.getElementById('area-select');
    for (const key in DATA_LOCATIONS) {
        let opt = document.createElement('option');
        opt.value = key;
        opt.innerText = DATA_LOCATIONS[key].name;
        select.appendChild(opt);
    }
}

function refreshProfileInfo() {
    const active = JSON.parse(localStorage.getItem('rng_active_profile'));
    document.getElementById('active-info').innerText = active ? 
        `Profil : ${active.name} (TID:${active.tid} | SID:${active.sid})` : "⚠️ Aucun profil !";
}

// Algorithme LCRNG Standard (PokéFinder)
function lcrng(seed) {
    return (BigInt(seed) * 1103515245n + 24691n) & 0xFFFFFFFFn;
}

function generateFrames() {
    const active = JSON.parse(localStorage.getItem('rng_active_profile'));
    if (!active) return alert("Configure un profil !");

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

    // Seed initiale (0 pour Emeraude / Pile morte)
    let seed = 0n;
    for (let i = 0; i < start; i++) seed = lcrng(seed);

    for (let f = start; f <= end; f++) {
        let tempSeed = seed;
        let p1, p2, pid, iv1, iv2;

        // --- LOGIQUE POKÉFINDER PAR MÉTHODE ---
        if (method === "h1") {
            // H1 : PID puis IVs
            p1 = Number(lcrng(tempSeed) >> 16n);
            p2 = Number(lcrng(lcrng(tempSeed)) >> 16n);
            pid = ((p2 << 16) | p1) >>> 0;
            
            let s_iv1 = lcrng(lcrng(lcrng(tempSeed)));
            let s_iv2 = lcrng(s_iv1);
            iv1 = Number(s_iv1 >> 16n);
            iv2 = Number(s_iv2 >> 16n);
        } else {
            // H2 / H4 : IVs puis PID (Ordre inverse pour le sauvage)
            let s_iv1 = lcrng(tempSeed);
            let s_iv2 = lcrng(s_iv1);
            iv1 = Number(s_iv1 >> 16n);
            iv2 = Number(s_iv2 >> 16n);
            
            p1 = Number(lcrng(s_iv2) >> 16n);
            p2 = Number(lcrng(lcrng(s_iv2)) >> 16n);
            pid = ((p2 << 16) | p1) >>> 0;
        }

        // --- CALCULS FINAUX ---
        let isShiny = ((tid ^ sid) ^ (p1 ^ p2)) < 8;
        let nature = DATA_NATURES[pid % 25];

        // Filtres
        if (onlyShiny && !isShiny) { seed = lcrng(seed); continue; }
        if (selectedNatures.length > 0 && !selectedNatures.includes(nature)) { seed = lcrng(seed); continue; }

        // Calcul des IVs individuels
        let hp = iv1 & 31;
        let atk = (iv1 >> 5) & 31;
        let def = (iv1 >> 10) & 31;
        let spe = iv2 & 31;
        let spa = (iv2 >> 5) & 31;
        let spd = (iv2 >> 10) & 31;

        // Slot de rencontre (PokéFinder utilise un roll spécifique après les IVs)
        let slotRoll = Number(lcrng(lcrng(lcrng(lcrng(tempSeed)))) >> 16n) % 100;
        let slotIdx = [20,40,50,60,70,80,85,90,94,98,99,100].findIndex(t => slotRoll < t);
        
        let pokeName = (method === "h1") ? 
            document.getElementById('h1-target').value : 
            DATA_LOCATIONS[document.getElementById('area-select').value].slots[slotIdx];

        // Rendu
        const row = document.createElement('tr');
        if (isShiny) row.className = "shiny-row";
        row.innerHTML = `
            <td>${f}</td>
            <td>${nature}</td>
            <td>${hp}/${atk}/${def}/${spa}/${spd}/${spe}</td>
            <td>${pokeName}</td>
        `;
        row.onclick = () => {
            localStorage.setItem('temp_target_frame', f);
            alert(`Frame ${f} envoyée au Chrono !`);
        };
        tbody.appendChild(row);

        seed = lcrng(seed); // Avance d'une frame
    }
}
