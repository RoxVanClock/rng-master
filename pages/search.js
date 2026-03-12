const NATURES = ["Hardi", "Solo", "Brave", "Rigide", "Mauvais", "Assuré", "Docile", "Relax", "Malin", "Lâche", "Timide", "Pressé", "Sérieux", "Jovial", "Naïf", "Modeste", "Doux", "Discret", "Prudent", "Foufou", "Calme", "Gentil", "Malpoli", "Bizarre", "Prudent"];

window.addEventListener('DOMContentLoaded', () => {
    // Remplir le sélecteur de natures
    const natSelect = document.getElementById('filter-nature');
    NATURES.forEach(n => {
        let opt = document.createElement('option');
        opt.value = n; opt.innerText = n;
        natSelect.appendChild(opt);
    });

    // Correction de la détection du profil
    refreshProfileInfo();
});

function refreshProfileInfo() {
    const active = JSON.parse(localStorage.getItem('rng_active_profile'));
    const info = document.getElementById('active-info');
    if (active) {
        info.innerText = `Profil : ${active.name} (TID:${active.tid} / SID:${active.sid})`;
    } else {
        info.innerHTML = "<b style='color:#e74c3c;'>⚠️ Aucun profil sélectionné dans Config !</b>";
    }
}

function lcrng(seed) {
    return (BigInt(seed) * 1103515245n + 24691n) & 0xFFFFFFFFn;
}

function generateFrames() {
    const active = JSON.parse(localStorage.getItem('rng_active_profile'));
    if (!active) return alert("Choisis un profil dans l'onglet Config d'abord !");

    const start = parseInt(document.getElementById('f-start').value);
    const end = parseInt(document.getElementById('f-end').value);
    const method = document.getElementById('method').value;
    const fShiny = document.getElementById('filter-shiny').value;
    const fNature = document.getElementById('filter-nature').value;

    const tid = parseInt(active.tid);
    const sid = parseInt(active.sid);
    const initialSeed = active.isDeadBattery ? 0n : 0n; // On pourra gérer d'autres seeds plus tard

    const tbody = document.getElementById('results-body');
    tbody.innerHTML = "";
    document.getElementById('results-area').style.display = "block";

    let currentSeed = initialSeed;
    // Avancer jusqu'à la frame de départ
    for (let i = 0; i < start; i++) { currentSeed = lcrng(currentSeed); }

    for (let f = start; f <= end; f++) {
        let s1 = lcrng(currentSeed);
        let s2 = lcrng(s1);
        let p1 = Number(s1 >> 16n);
        let p2 = Number(s2 >> 16n);
        let pid = ((p2 << 16) | p1) >>> 0;
        
        // --- CALCUL DES IVs ---
        // Les IVs sont générés après le PID dans la plupart des méthodes
        let s3 = lcrng(s2);
        let s4 = lcrng(s3);
        let iv1 = Number(s3 >> 16n);
        let iv2 = Number(s4 >> 16n);

        let hp = iv1 & 31;
        let atk = (iv1 >> 5) & 31;
        let def = (iv1 >> 10) & 31;
        let spe = iv2 & 31;
        let spa = (iv2 >> 5) & 31;
        let spd = (iv2 >> 10) & 31;

        // --- SHINY CHECK ---
        let shinyVal = (tid ^ sid) ^ (p1 ^ p2);
        let isShiny = shinyVal < 8;
        let nature = NATURES[pid % 25];

        // --- FILTRES ---
        if (fShiny === "shiny" && !isShiny) { currentSeed = s1; continue; }
        if (fNature !== "all" && nature !== fNature) { currentSeed = s1; continue; }

        // Slot Roll (simplifié pour l'exemple)
        let slotRoll = Number(lcrng(s4) >> 16n) % 100;

        const row = document.createElement('tr');
        if (isShiny) row.className = "shiny-row";
        
        row.innerHTML = `
            <td>${f}</td>
            <td>${nature}</td>
            <td class="stat-col">${hp}/${atk}/${def}/${spa}/${spd}/${spe}</td>
            <td>${pid.toString(16).toUpperCase()}</td>
            <td>${slotRoll}</td>
        `;

        row.onclick = () => {
            localStorage.setItem('temp_target_frame', f);
            alert(`Frame ${f} envoyée au Chrono !`);
        };

        tbody.appendChild(row);
        currentSeed = s1; // On n'avance que d'une frame à chaque itération de la boucle principale
    }
}
