// Charger et afficher les profils au démarrage
window.addEventListener('DOMContentLoaded', renderProfiles);

function addNewProfile() {
    const name = document.getElementById('prof-name').value || "Sans nom";
    const game = document.getElementById('prof-game').value;
    const tid = document.getElementById('prof-tid').value;
    const sid = document.getElementById('prof-sid').value;

    if (!tid || !sid) {
        alert("Le TID et le SID sont nécessaires pour les calculs RNG !");
        return;
    }

    const profiles = AppCore.getProfiles();
    profiles.push({ name, game, tid, sid });
    localStorage.setItem('rng_profiles', JSON.stringify(profiles));

    // Reset les champs
    document.getElementById('prof-name').value = "";
    document.getElementById('prof-tid').value = "";
    document.getElementById('prof-sid').value = "";

    renderProfiles();
}

function renderProfiles() {
    const list = document.getElementById('profile-list');
    const profiles = AppCore.getProfiles();
    const activeIdx = localStorage.getItem('active_profile_idx');

    if (profiles.length === 0) {
        list.innerHTML = "<p style='opacity:0.5; text-align:center;'>Aucun profil trouvé.</p>";
        return;
    }

    list.innerHTML = profiles.map((p, i) => `
        <div class="card" onclick="selectProfile(${i})" 
             style="border: 2px solid ${activeIdx == i ? 'var(--game-color)' : 'transparent'}; cursor:pointer; background: rgba(255,255,255,0.03); margin-bottom: 10px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong>${p.name}</strong><br>
                    <small>${p.game.toUpperCase()} - TID: ${p.tid}</small>
                </div>
                <button class="btn" onclick="event.stopPropagation(); deleteProfile(${i})" 
                        style="width:auto; padding:5px 10px; background:#e74c3c; font-size:12px;">SUPPR.</button>
            </div>
        </div>
    `).join('');
}

function selectProfile(index) {
    localStorage.setItem('active_profile_idx', index);
    // On force app-core à rafraîchir le thème
    AppCore.applyTheme();
    renderProfiles();
}

function deleteProfile(index) {
    if(confirm("Supprimer ce profil définitivement ?")) {
        const profiles = AppCore.getProfiles();
        profiles.splice(index, 1);
        localStorage.setItem('rng_profiles', JSON.stringify(profiles));
        
        // Si on supprime le profil actif, on reset l'index
        const activeIdx = localStorage.getItem('active_profile_idx');
        if (activeIdx == index) localStorage.removeItem('active_profile_idx');
        
        renderProfiles();
    }
}