const NATURES = ["Hardi", "Solo", "Brave", "Rigide", "Mauvais", "Assuré", "Docile", "Relax", "Malin", "Lâche", "Timide", "Pressé", "Sérieux", "Jovial", "Naïf", "Modeste", "Doux", "Discret", "Prudent", "Foufou", "Calme", "Gentil", "Malpoli", "Bizarre", "Prudent"];

// Base de données simplifiée pour tester
const LOCATIONS = {
    route101: { name: "Route 101", slots: ["Chenipotte", "Zigzaton", "Chenipotte", "Zigzaton", "Chenipotte", "Chenipotte", "Zigzaton", "Zigzaton", "Zigzaton", "Zigzaton", "Zigzaton", "Zigzaton"] },
    sky_pillar: { name: "Pilier Céleste", slots: ["Nosferalto", "Ténéfix", "Altaria", "Branette", "Terhal", "Claydol", "Ténéfix", "Nosferalto", "Altaria", "Altaria", "Altaria", "Altaria"] }
};

window.addEventListener('DOMContentLoaded', () => {
    // Générer les cases à cocher pour les natures
    const container = document.getElementById('nature-list');
    NATURES.forEach(n => {
        const div = document.createElement('label');
        div.className = "nature-item";
        div.innerHTML = `<input type="checkbox" class="nat-check" value="${n}"> ${n}`;
        container.appendChild(div);
    });

    updateMethodContext();
    refreshProfileInfo();
});

function refreshProfileInfo() {
    const active = JSON.parse(localStorage.getItem('rng_active_profile'));
    document.getElementById('active-info').innerText = active ? 
        `Profil : ${active.name} (TID:${active.tid})` : "⚠️ Aucun profil !";
}

function updateMethodContext() {
    const method = document.getElementById('method').value;
    document.getElementById('h1-options').style.display = method === "h1" ? "block" : "none";
    document.getElementById('h2-h4-options').style.display = method !== "h1" ? "block" : "none";
    updatePokemonList();
}

function updatePokemonList() {
    const area = document.getElementById('area-select').value;
    const pokes = LOCATIONS[area].slots;
    document.getElementById('pokemon-preview').innerText = "Pokémon possibles : " + [...new Set(pokes)].join(", ");
}

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
    
    // Récupérer les natures cochées
    const selectedNatures = Array.from(document.querySelectorAll('.nat-check:checked')).map(c => c.value);

    const tid = parseInt(active.tid);
    const sid = parseInt(active.sid);
    const tbody = document.getElementById('results-body');
    tbody.innerHTML = "";
    document.getElementById('results-area').style.display = "block";

    let currentSeed = 0n; // On part de 0 pour Emeraude/Pile morte
    for (let i = 0; i < start; i++) { currentSeed = lcrng(currentSeed); }

    for (let f = start; f <= end; f++) {
        let s1 = lcrng(currentSeed);
        let s2 = lcrng(s1);
        let p1 = Number(s1 >> 16n);
        let p2 = Number(s2 >> 16n);
        let pid = ((p2 << 16) | p1) >>> 0;
        
        // IVs
        let s3 = lcrng(s2); let s4 = lcrng(s3);
        let iv1 = Number(s3 >> 16n); let iv2 = Number(s4 >> 16n);
        let stats = `${iv1&31}/${(iv1>>5)&31}/${(iv1>>10)&31}/${(iv2>>5)&31}/${(iv2>>10)&31}/${iv2&31}`;

        // Shiny & Nature
        let isShiny = ((tid ^ sid) ^ (p1 ^ p2)) < 8;
        let nature = NATURES[pid % 25];

        // Slot
        let slotRoll = Number(lcrng(s4) >> 16n) % 100;
        let slotIdx = [20,40,50,60,70,80,85,90,94,98,99,100].findIndex(t => slotRoll < t);
        let pokemon = method === "h1" ? document.getElementById('h1-target').value : LOCATIONS[document.getElementById('area-select').value].slots[slotIdx];

        // --- FILTRES ---
        if (onlyShiny && !isShiny) { currentSeed = s1; continue; }
        if (selectedNatures.length > 0 && !selectedNatures.includes(nature)) { currentSeed = s1; continue; }

        const row = document.createElement('tr');
        if (isShiny) row.className = "shiny-row";
        row.innerHTML = `<td>${f}</td><td>${nature}</td><td>${stats}</td><td>${pokemon}</td>`;
        row.onclick = () => {
            localStorage.setItem('temp_target_frame', f);
            alert(`Cible envoyée : Frame ${f}`);
        };
        tbody.appendChild(row);

        currentSeed = s1;
    }
}
