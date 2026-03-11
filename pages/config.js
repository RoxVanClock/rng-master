/**
 * CONFIG.JS - Version avec Edition et Affichage Actif
 */

window.addEventListener('DOMContentLoaded', () => {
    displayProfiles();
    if(window.AppCore) AppCore.applyTheme();
});

// Gère à la fois l'ajout et la modification
function saveProfile() {
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('prof-name').value;
    const game = document.getElementById('prof-game').value;
    const tid = document.getElementById('prof-tid').value;
    const sid = document.getElementById('prof-sid').value;
    const isDeadBattery = document.getElementById('prof-dead-battery').checked;

    if (!name || !tid) return alert("Nom et TID obligatoires !");

    let profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");

    if (id) {
        // Mode Modification
        const index = profiles.findIndex(p => p.id === id);
        if (index !== -1) {
            profiles[index] = { id, name, game, tid: parseInt(tid), sid: parseInt(sid) || 0, isDeadBattery };
        }
        resetForm();
    } else {
        // Mode Nouveau
        const newId = Date.now().toString();
        profiles.push({ id: newId, name, game, tid: parseInt(tid), sid: parseInt(sid) || 0, isDeadBattery });
        if (profiles.length === 1) localStorage.setItem('rng_active_profile', newId);
        resetForm();
    }

    localStorage.setItem('rng_profiles', JSON.stringify(profiles));
    displayProfiles();
}

function displayProfiles() {
    const list = document.getElementById('profile-list');
    const activeBox = document.getElementById('active-profile-display');
    const activeInfo = document.getElementById('active-info');
    
    const profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    const activeId = localStorage.getItem('rng_active_profile');

    // 1. Mise à jour de l'encadré du profil actif
    const activeProfile = profiles.find(p => p.id === activeId);
    if (activeProfile) {
        activeBox.style.display = "block";
        activeInfo.innerHTML = `
            <strong>${activeProfile.name}</strong><br>
            <small>${activeProfile.game.toUpperCase()} | TID: ${activeProfile.tid}</small>
        `;
    } else {
        activeBox.style.display = "none";
    }

    // 2. Liste des profils
    if (profiles.length === 0) {
        list.innerHTML = "<p style='color:#666; text-align:center;'>Aucun profil.</p>";
        return;
    }

    list.innerHTML = profiles.map(p => {
        const isActive = (p.id === activeId);
        return `
            <div onclick="selectProfile('${p.id}')" class="profile-item ${isActive ? 'active' : ''}" style="cursor:pointer;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="color:${isActive ? 'var(--game-color)' : '#fff'}">${p.name}</strong>
                    <div style="display:flex; gap:10px;">
                        <button onclick="event.stopPropagation(); prepareEdit('${p.id}')" style="background:none; border:none; color:#3498db; font-size:1.2rem;">✏️</button>
                        <button onclick="event.stopPropagation(); deleteProfile('${p.id}')" style="background:none; border:none; color:#e74c3c; font-size:1.2rem;">🗑️</button>
                    </div>
                </div>
                <div style="font-size:0.8rem; color:#888; margin-top:5px;">
                    ${p.game.toUpperCase()} | ${p.isDeadBattery ? '🪫 Pile Morte' : '🔋 Pile OK'} | TID: ${p.tid}
                </div>
            </div>
        `;
    }).join('');
}

function selectProfile(id) {
    localStorage.setItem('rng_active_profile', id);
    if (navigator.vibrate) navigator.vibrate(15);
    displayProfiles();
}

function prepareEdit(id) {
    const profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    const p = profiles.find(p => p.id === id);
    if (!p) return;

    document.getElementById('edit-id').value = p.id;
    document.getElementById('prof-name').value = p.name;
    document.getElementById('prof-game').value = p.game;
    document.getElementById('prof-tid').value = p.tid;
    document.getElementById('prof-sid').value = p.sid;
    document.getElementById('prof-dead-battery').checked = p.isDeadBattery;

    document.getElementById('form-title').innerText = "✏️ Modifier Profil";
    document.getElementById('save-btn').innerText = "💾 METTRE À JOUR";
    document.getElementById('form-card').scrollIntoView({ behavior: 'smooth' });
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

function deleteProfile(id) {
    if(!confirm("Supprimer ce profil ?")) return;
    let profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    profiles = profiles.filter(p => p.id !== id);
    localStorage.setItem('rng_profiles', JSON.stringify(profiles));
    if(localStorage.getItem('rng_active_profile') === id) localStorage.removeItem('rng_active_profile');
    displayProfiles();
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

function handleFileSelect(event) {
    const reader = new FileReader();
    reader.onload = (e) => {
        localStorage.setItem('rng_profiles', e.target.result);
        displayProfiles();
    };
    reader.readAsText(event.target.files[0]);
}
