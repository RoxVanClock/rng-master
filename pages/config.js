/**
 * CONFIG.JS - Version Intégrale avec Sélection Forcée
 */

window.addEventListener('DOMContentLoaded', () => {
    displayProfiles();
    if(window.AppCore) AppCore.applyTheme();
});

function addNewProfile() {
    const name = document.getElementById('prof-name').value;
    const game = document.getElementById('prof-game').value;
    const tid = document.getElementById('prof-tid').value;
    const sid = document.getElementById('prof-sid').value;
    const isDeadBattery = document.getElementById('prof-dead-battery').checked;

    if (!name || !tid) return alert("Le nom et le TID sont obligatoires !");

    const newProfile = {
        id: Date.now().toString(),
        name, game, tid: parseInt(tid), sid: parseInt(sid) || 0, isDeadBattery
    };

    let profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    profiles.push(newProfile);
    localStorage.setItem('rng_profiles', JSON.stringify(profiles));
    
    // Si c'est le seul profil, on l'active automatiquement
    if (profiles.length === 1) {
        localStorage.setItem('rng_active_profile', newProfile.id);
    }

    // Reset du formulaire
    document.getElementById('prof-name').value = "";
    document.getElementById('prof-tid').value = "";
    document.getElementById('prof-sid').value = "";
    document.getElementById('prof-dead-battery').checked = false;

    displayProfiles();
}

function displayProfiles() {
    const list = document.getElementById('profile-list');
    const profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    const activeId = localStorage.getItem('rng_active_profile');

    if (profiles.length === 0) {
        list.innerHTML = "<p style='color:#666; text-align:center;'>Aucun profil trouvé.</p>";
        return;
    }

    list.innerHTML = profiles.map(p => {
        const isActive = (p.id === activeId);
        return `
            <div onclick="selectProfile('${p.id}')" 
                 class="profile-item ${isActive ? 'active' : ''}" 
                 style="cursor:pointer; position:relative;">
                
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="color:${isActive ? 'var(--game-color)' : '#fff'}; font-size:1.1rem;">
                        ${isActive ? '✅ ' : ''}${p.name}
                    </strong>
                    <button onclick="event.stopPropagation(); deleteProfile('${p.id}')" 
                            style="background:none; border:none; color:#e74c3c; font-size:1.3rem; padding:10px;">
                        🗑️
                    </button>
                </div>
                
                <div style="font-size:0.85rem; color:#888; margin-top:8px;">
                    Jeu: ${p.game.toUpperCase()} | ${p.isDeadBattery ? '🪫 Pile Morte' : '🔋 Pile OK'}<br>
                    TID: ${p.tid.toString().padStart(5, '0')} | SID: ${p.sid.toString().padStart(5, '0')}
                </div>
            </div>
        `;
    }).join('');
}

function selectProfile(id) {
    localStorage.setItem('rng_active_profile', id);
    if (navigator.vibrate) navigator.vibrate(20); // Petit retour tactile
    displayProfiles();
    alert("Profil activé !"); // Confirmation visuelle
}

function deleteProfile(id) {
    if(!confirm("Supprimer ce profil ?")) return;
    let profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    profiles = profiles.filter(p => p.id !== id);
    localStorage.setItem('rng_profiles', JSON.stringify(profiles));
    
    if(localStorage.getItem('rng_active_profile') === id) {
        localStorage.removeItem('rng_active_profile');
    }
    displayProfiles();
}

// --- GESTION EXPORT / IMPORT ---
function exportProfiles() {
    const data = localStorage.getItem('rng_profiles') || "[]";
    const blob = new Blob([data], {type: "application/json"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "rng_profiles_save.json";
    a.click();
}

function importProfiles() { document.getElementById('import-file').click(); }

function handleFileSelect(event) {
    const reader = new FileReader();
    reader.onload = (e) => {
        localStorage.setItem('rng_profiles', e.target.result);
        displayProfiles();
        alert("Importation réussie !");
    };
    reader.readAsText(event.target.files[0]);
}
