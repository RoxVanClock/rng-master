/**
 * CONFIG.JS - Version Fix Importation
 */

window.addEventListener('DOMContentLoaded', () => {
    displayProfiles();
    if(window.AppCore) AppCore.applyTheme();
});

function saveProfile() {
    const editId = document.getElementById('edit-id').value;
    const name = document.getElementById('prof-name').value;
    const game = document.getElementById('prof-game').value;
    const tid = document.getElementById('prof-tid').value;
    const sid = document.getElementById('prof-sid').value;
    const isDeadBattery = document.getElementById('prof-dead-battery').checked;

    if (!name || !tid) return alert("Nom et TID obligatoires !");

    let profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");

    if (editId) {
        const idx = profiles.findIndex(p => p.id.toString() === editId.toString());
        if (idx !== -1) {
            profiles[idx] = { id: editId.toString(), name, game, tid: parseInt(tid), sid: parseInt(sid) || 0, isDeadBattery };
        }
    } else {
        const newId = Date.now().toString();
        profiles.push({ id: newId, name, game, tid: parseInt(tid), sid: parseInt(sid) || 0, isDeadBattery });
        if (profiles.length === 1) localStorage.setItem('rng_active_profile', newId);
    }

    localStorage.setItem('rng_profiles', JSON.stringify(profiles));
    resetForm();
    displayProfiles();
}

function displayProfiles() {
    const list = document.getElementById('profile-list');
    const activeBox = document.getElementById('active-profile-display');
    const activeInfo = document.getElementById('active-info');
    
    const profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    const activeId = localStorage.getItem('rng_active_profile');

    const activeProfile = profiles.find(p => p.id.toString() === (activeId || "").toString());
    if (activeProfile) {
        activeBox.style.display = "block";
        activeInfo.innerHTML = `<strong>${activeProfile.name}</strong> (${activeProfile.game.toUpperCase()})`;
    } else {
        activeBox.style.display = "none";
    }

    if (profiles.length === 0) {
        list.innerHTML = "<p style='text-align:center; color:#666;'>Aucun profil.</p>";
        return;
    }

    list.innerHTML = profiles.map(p => {
        const isActive = (activeId && p.id.toString() === activeId.toString());
        return `
            <div onclick="selectProfile('${p.id}')" class="profile-item ${isActive ? 'active' : ''}">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="flex:1;">
                        <strong style="color:${isActive ? 'var(--game-color)' : '#fff'}">${p.name}</strong><br>
                        <span style="font-size:0.8rem; color:#888;">TID: ${p.tid} | ${p.isDeadBattery ? '🪫' : '🔋'}</span>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="action-btn" onclick="handleEdit(event, '${p.id}')" style="color:#3498db;">✏️</button>
                        <button class="action-btn" onclick="handleDelete(event, '${p.id}')" style="color:#e74c3c;">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function selectProfile(id) {
    localStorage.setItem('rng_active_profile', id.toString());
    if (navigator.vibrate) navigator.vibrate(15);
    displayProfiles();
}

function handleEdit(event, id) {
    event.stopPropagation();
    const profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    // On force la comparaison en texte pour les fichiers importés
    const p = profiles.find(p => p.id.toString() === id.toString());
    
    if (!p) return;

    document.getElementById('edit-id').value = p.id.toString();
    document.getElementById('prof-name').value = p.name;
    document.getElementById('prof-game').value = p.game;
    document.getElementById('prof-tid').value = p.tid;
    document.getElementById('prof-sid').value = p.sid;
    document.getElementById('prof-dead-battery').checked = p.isDeadBattery;

    document.getElementById('form-title').innerText = "✏️ Modifier Profil";
    document.getElementById('save-btn').innerText = "💾 METTRE À JOUR";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleDelete(event, id) {
    event.stopPropagation();
    if(!confirm("Supprimer ce profil ?")) return;
    
    let profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    profiles = profiles.filter(p => p.id.toString() !== id.toString());
    localStorage.setItem('rng_profiles', JSON.stringify(profiles));
    
    if(localStorage.getItem('rng_active_profile') === id.toString()) {
        localStorage.removeItem('rng_active_profile');
    }
    displayProfiles();
}

function resetForm() {
    document.getElementById('edit-id').value = "";
    document.getElementById('prof-name').value = "";
    document.getElementById('prof-tid').value = "";
    document.getElementById('prof-sid').value = "";
    document.getElementById('prof-dead-battery').checked = false;
    document.getElementById('form-title').innerText = "👤 Nouveau Profil";
    document.getElementById('save-btn').innerText = "💾 ENREGISTRER LE PROFIL";
}

// GESTION IMPORT AMELIORÉE
function handleFileSelect(event) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            let imported = JSON.parse(e.target.result);
            // On s'assure que chaque profil importé a un ID en texte propre
            const cleaned = imported.map(p => ({
                ...p,
                id: (p.id || Date.now() + Math.random()).toString()
            }));
            localStorage.setItem('rng_profiles', JSON.stringify(cleaned));
            displayProfiles();
            alert("Importation réussie et synchronisée !");
        } catch(err) {
            alert("Erreur lors de la lecture du fichier.");
        }
    };
    reader.readAsText(event.target.files[0]);
}

function exportProfiles() {
    const data = localStorage.getItem('rng_profiles') || "[]";
    const blob = new Blob([data], {type: "application/json"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "rng_backup.json";
    a.click();
}

function importProfiles() { document.getElementById('import-file').click(); }
