/**
 * CONFIG.JS - Version Fix SID Visible
 */

window.addEventListener('DOMContentLoaded', () => {
    displayProfiles();
    if(window.AppCore) AppCore.applyTheme();
});

function saveProfile() {
    const index = parseInt(document.getElementById('edit-index').value);
    const name = document.getElementById('prof-name').value;
    const game = document.getElementById('prof-game').value;
    const tid = document.getElementById('prof-tid').value;
    const sid = document.getElementById('prof-sid').value;
    const isDeadBattery = document.getElementById('prof-dead-battery').checked;

    if (!name || !tid) return alert("Nom et TID obligatoires !");

    let profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");

    const profileData = { 
        id: Date.now().toString(),
        name, game, 
        tid: parseInt(tid), 
        sid: (sid === "" || sid === null) ? 0 : parseInt(sid), 
        isDeadBattery 
    };

    if (index > -1 && profiles[index]) {
        profiles[index] = profileData;
    } else {
        profiles.push(profileData);
        if (profiles.length === 1) localStorage.setItem('rng_active_profile', profileData.id);
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

    const activeProfile = profiles.find(p => p.id == activeId);
    if (activeProfile) {
        activeBox.style.display = "block";
        const s = activeProfile.sid !== undefined ? activeProfile.sid : 0;
        activeInfo.innerHTML = `<strong>${activeProfile.name}</strong><br><small>TID: ${activeProfile.tid} | SID: ${s}</small>`;
    } else {
        activeBox.style.display = "none";
    }

    if (profiles.length === 0) {
        list.innerHTML = "<p style='text-align:center; color:#666;'>Aucun profil.</p>";
        return;
    }

    list.innerHTML = profiles.map((p, i) => {
        const isActive = (p.id == activeId);
        // On sécurise l'affichage du SID
        const sidDisplay = (p.sid !== undefined && p.sid !== null) ? p.sid.toString().padStart(5, '0') : "00000";
        const tidDisplay = p.tid.toString().padStart(5, '0');

        return `
            <div onclick="selectProfile('${p.id}')" class="profile-item ${isActive ? 'active' : ''}">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="flex:1; line-height: 1.4;">
                        <strong style="color:${isActive ? 'var(--game-color)' : '#fff'}; display:block; margin-bottom:4px;">${p.name}</strong>
                        <div style="font-size:0.85rem; color:#bbb;">
                            TID: ${tidDisplay} | SID: ${sidDisplay}
                        </div>
                        <div style="font-size:0.75rem; color:#888;">
                            ${p.game.toUpperCase()} | ${p.isDeadBattery ? '🪫 Pile Morte' : '🔋 Pile OK'}
                        </div>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="action-btn" onclick="handleEdit(event, ${i})" style="color:#3498db;">✏️</button>
                        <button class="action-btn" onclick="handleDelete(event, ${i})" style="color:#e74c3c;">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function selectProfile(id) {
    localStorage.setItem('rng_active_profile', id);
    displayProfiles();
}

function handleEdit(event, index) {
    event.stopPropagation();
    const profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    const p = profiles[index];
    if (!p) return;

    document.getElementById('edit-index').value = index;
    document.getElementById('prof-name').value = p.name;
    document.getElementById('prof-game').value = p.game;
    document.getElementById('prof-tid').value = p.tid;
    document.getElementById('prof-sid').value = p.sid || 0;
    document.getElementById('prof-dead-battery').checked = p.isDeadBattery;

    document.getElementById('form-title').innerText = "✏️ Modifier Profil";
    document.getElementById('save-btn').innerText = "💾 METTRE À JOUR";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleDelete(event, index) {
    event.stopPropagation();
    if(!confirm("Supprimer ?")) return;
    let profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    profiles.splice(index, 1);
    localStorage.setItem('rng_profiles', JSON.stringify(profiles));
    displayProfiles();
}

function resetForm() {
    document.getElementById('edit-index').value = "-1";
    document.getElementById('prof-name').value = "";
    document.getElementById('prof-tid').value = "";
    document.getElementById('prof-sid').value = "";
    document.getElementById('prof-dead-battery').checked = false;
    document.getElementById('form-title').innerText = "👤 Nouveau Profil";
    document.getElementById('save-btn').innerText = "💾 ENREGISTRER LE PROFIL";
}

function handleFileSelect(event) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            const cleaned = data.map(p => ({
                id: Math.random().toString(36).substr(2, 9),
                name: p.name || "Importé",
                game: p.game || "emerald",
                tid: parseInt(p.tid) || 0,
                sid: parseInt(p.sid) || 0,
                isDeadBattery: !!p.isDeadBattery
            }));
            localStorage.setItem('rng_profiles', JSON.stringify(cleaned));
            location.reload(); 
        } catch(err) { alert("Erreur fichier"); }
    };
    reader.readAsText(event.target.files[0]);
}

function exportProfiles() {
    const data = localStorage.getItem('rng_profiles') || "[]";
    const blob = new Blob([data], {type: "application/json"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "rng_profiles.json";
    a.click();
}
function importProfiles() { document.getElementById('import-file').click(); }
