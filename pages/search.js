/**
 * Liste officielle des natures Pokémon (index 0 à 24)
 */
const NATURES = ["Hardi", "Solo", "Brave", "Rigide", "Mauvais", "Assuré", "Docile", "Relax", "Malin", "Lâche", "Timide", "Pressé", "Sérieux", "Jovial", "Naïf", "Modeste", "Doux", "Discret", "Prudent", "Foufou", "Calme", "Gentil", "Malpoli", "Bizarre", "Prudent"];

/**
 * Initialisation au chargement
 */
window.addEventListener('DOMContentLoaded', () => {
    const active = AppCore.getActiveProfile();
    const info = document.getElementById('active-info');
    
    if (active) {
        info.innerText = `Profil actif : ${active.name} (${active.game.toUpperCase()})`;
    } else {
        info.innerHTML = "<b style='color:#e74c3c;'>⚠️ Aucun profil sélectionné !</b>";
    }
});

/**
 * Générateur de nombres aléatoires linéaire (LCRNG)
 * Formule standard GBA : (seed * 0x41C64E6D + 0x6073) & 0xFFFFFFFF
 */
function lcrng(seed) {
    return (BigInt(seed) * 1103515245n + 24691n) & 0xFFFFFFFFn;
}

/**
 * Fonction principale de calcul
 */
function generateFrames() {
    const active = AppCore.getActiveProfile();
    if (!active) return alert("Veuillez sélectionner un profil dans l'onglet Config.");

    const start = parseInt(document.getElementById('f-start').value);
    const end = parseInt(document.getElementById('f-end').value);
    const method = document.getElementById('method').value;
    const tid = parseInt(active.tid);
    const sid = parseInt(active.sid);
    
    const tbody = document.getElementById('results-body');
    const container = document.getElementById('results-area');

    // On vide les anciens résultats et on affiche le conteneur
    tbody.innerHTML = "";
    container.style.display = "block";

    let rows = "";

    // Boucle sur la plage de frames demandée
    for (let f = start; f <= end; f++) {
        let seed = BigInt(f);
        let p1, p2, slotRoll;

        // Application de la méthode de génération choisie
        if (method === 'h1') {
            let s1 = lcrng(seed); p1 = Number(s1 >> 16n);
            let s2 = lcrng(s1);   p2 = Number(s2 >> 16n);
            let s3 = lcrng(s2);   slotRoll = Number(s3 >> 16n) % 100;
        } else if (method === 'h2') {
            let s1 = lcrng(seed);
            let s2 = lcrng(s1);   p1 = Number(s2 >> 16n);
            let s3 = lcrng(s2);   p2 = Number(s3 >> 16n);
            let s4 = lcrng(s3);   slotRoll = Number(s4 >> 16n) % 100;
        } else { // Méthode H4
            let s1 = lcrng(seed); p1 = Number(s1 >> 16n);
            let s2 = lcrng(lcrng(s1)); p2 = Number(s2 >> 16n);
            let s3 = lcrng(s2);   slotRoll = Number(s3 >> 16n) % 100;
        }

        // Calcul du PID final et de la Nature
        const pid = (p2 << 16) | p1;
        const nature = NATURES[Math.abs(pid % 25)];

        // Calcul de la valeur Shiny (XOR entre TID, SID et les deux parties du PID)
        // Si le résultat est inférieur à 8, le Pokémon est Shiny
        const shinyValue = (tid ^ sid) ^ (p1 ^ p2);
        const isShiny = shinyValue < 8;

        // Détermination du Slot de rencontre (0 à 11)
        let slot = 0;
        const thresholds = [20, 40, 50, 60, 70, 80, 85, 90, 94, 98, 99, 100];
        for(let i=0; i<thresholds.length; i++) {
            if(slotRoll < thresholds[i]) { slot = i; break; }
        }

        // Optimisation : On n'affiche que les Shiny ou les 500 premières frames de la recherche
        if (isShiny || (f - start < 500)) {
            const rowClass = isShiny ? 'class="shiny"' : '';
            rows += `<tr ${rowClass}>
                <td>${f}</td>
                <td>${(pid >>> 0).toString(16).toUpperCase()}</td>
                <td>${nature}</td>
                <td>Slot ${slot}</td>
                <td>${isShiny ? "OUI ✨" : "-"}</td>
            </tr>`;
        }
    }

    tbody.innerHTML = rows;
}