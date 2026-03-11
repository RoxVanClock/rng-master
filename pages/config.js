/**
 * CONFIG.JS - Gestion des profils et exports
 */

window.addEventListener('DOMContentLoaded', () => {
    displayProfiles();
    if(window.AppCore) AppCore.applyTheme();
});

// Enregistrer un nouveau profil
function addNewProfile() {
    const name = document.getElementById('prof-name').value;
    const game = document.getElementById('prof-game').value;
    const tid = document.getElementById('prof-tid').value;
    const sid = document.getElementById('prof-sid').value;

    if (!name || !tid) return alert("Nom et TID obligatoires !");

    const newProfile = {
        id: Date.now(),
        name: name,
        game: game,
        tid: parseInt(tid),
        sid: parseInt(sid) || 0
    };

    let profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    profiles.push(newProfile);
    localStorage.setItem('rng_profiles', JSON.stringify(profiles));
    
    // Reset du formulaire
    document.getElementById('prof-name').value = "";
    document.getElementById('prof-tid').value = "";
    document.getElementById('prof-sid').value = "";
    
    displayProfiles();
}

// Afficher la liste des profils
function displayProfiles() {
    const list = document.getElementById('profile-list');
    const profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    
    if (profiles.length === 0) {
        list.innerHTML = "<p style='text-align:center; color:#666;'>Aucun profil trouvé.</p>";
        return;
    }

    list.innerHTML = profiles.map(p => `
        <div style="background:#1a1a1a; padding:12px; border-radius:8px; margin-bottom:10px; border-left: 4px solid var(--game-color);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>${p.name}</strong>
                <button onclick="deleteProfile(${p.id})" style="background:none; border:none; color:#e74c3c; cursor:pointer;">🗑️</button>
            </div>
            <div style="font-size:0.8rem; color:#888;">
                Jeu: ${p.game.toUpperCase()} | TID: ${p.tid} | SID: ${p.sid}
            </div>
        </div>
    `).join('');
}

// Supprimer un profil
function deleteProfile(id) {
    if(!confirm("Supprimer ce profil ?")) return;
    let profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    profiles = profiles.filter(p => p.id !== id);
    localStorage.setItem('rng_profiles', JSON.stringify(profiles));
    displayProfiles();
}

// --- FONCTIONS DE SAUVEGARDE ---

function exportProfiles() {
    const data = localStorage.getItem('rng_profiles') || "[]";
    if(data === "[]") return alert("Rien à exporter !");
    
    const blob = new Blob([data], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rng_profiles_backup.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importProfiles() {
    document.getElementById('import-file').click();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            JSON.parse(content); // Vérification JSON
            localStorage.setItem('rng_profiles', content);
            displayProfiles();
            alert("📦 Importation réussie !");
        } catch (err) {
            alert("❌ Fichier invalide.");
        }
    };
    reader.readAsText(file);
}
