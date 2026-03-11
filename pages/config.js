/**
 * CONFIG.JS - Gestion des profils, thèmes et exports
 */

window.addEventListener('DOMContentLoaded', () => {
    displayProfiles();
    // Applique le thème global au chargement
    if(window.AppCore) AppCore.applyTheme();
});

// Création d'un profil
function addNewProfile() {
    const name = document.getElementById('prof-name').value;
    const game = document.getElementById('prof-game').value;
    const tid = document.getElementById('prof-tid').value;
    const sid = document.getElementById('prof-sid').value;
    const isDeadBattery = document.getElementById('prof-dead-battery').checked;

    if (!name || !tid) {
        alert("Le nom et le TID sont indispensables !");
        return;
    }

    const newProfile = {
        id: Date.now(),
        name: name,
        game: game,
        tid: parseInt(tid),
        sid: parseInt(sid) || 0,
        isDeadBattery: isDeadBattery
    };

    let profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    profiles.push(newProfile);
    localStorage.setItem('rng_profiles', JSON.stringify(profiles));
    
    // Nettoyage du formulaire
    document.getElementById('prof-name').value = "";
    document.getElementById('prof-tid').value = "";
    document.getElementById('prof-sid').value = "";
    document.getElementById('prof-dead-battery').checked = false;
    
    displayProfiles();
}

// Affichage de la liste
function displayProfiles() {
    const list = document.getElementById('profile-list');
    const profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    
    if (profiles.length === 0) {
        list.innerHTML = "<p style='text-align:center; color:#666;'>Aucun profil créé.</p>";
        return;
    }

    list.innerHTML = profiles.map(p => `
        <div style="background:#1a1a1a; padding:15px; border-radius:10px; margin-bottom:12px; border-left: 5px solid var(--game-color, #2ecc71);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <strong style="font-size:1.1rem;">${p.name}</strong><br>
                    <span style="font-size:0.8rem; color:#aaa;">
                        ${p.game.toUpperCase()} • ${p.isDeadBattery ? '🪫 Pile Morte' : '🔋 Pile OK'}
                    </span>
                </div>
                <button onclick="deleteProfile(${p.id})" style="background:none; border:none; color:#e74c3c; font-size:1.2rem; cursor:pointer;">🗑️</button>
            </div>
            <div style="margin-top:8px; font-family:monospace; background:#222; padding:5px; border-radius:5px; font-size:0.9rem;">
                TID: ${p.tid.toString().padStart(5, '0')} | SID: ${p.sid.toString().padStart(5, '0')}
            </div>
        </div>
    `).join('');
}

// Suppression
function deleteProfile(id) {
    if(!confirm("Supprimer ce profil définitivement ?")) return;
    let profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    profiles = profiles.filter(p => p.id !== id);
    localStorage.setItem('rng_profiles', JSON.stringify(profiles));
    displayProfiles();
}

// --- SYSTÈME D'EXPORT / IMPORT ---

function exportProfiles() {
    const data = localStorage.getItem('rng_profiles') || "[]";
    if(data === "[]") return alert("Aucun profil à exporter.");
    
    const blob = new Blob([data], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rng_backup_${new Date().toLocaleDateString()}.json`;
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
            const parsed = JSON.parse(content);
            if(!Array.isArray(parsed)) throw new Error();
            
            localStorage.setItem('rng_profiles', content);
            displayProfiles();
            alert("✅ Profils restaurés avec succès !");
        } catch (err) {
            alert("❌ Le fichier sélectionné est invalide.");
        }
    };
    reader.readAsText(file);
}
