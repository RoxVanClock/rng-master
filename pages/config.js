/**
 * CONFIG.JS - Gestion Profils + Couleurs Dynamiques
 */

const GAME_COLORS = {
    emerald: '#2ecc71', // Vert Emeraude
    ruby: '#e74c3c',    // Rouge
    sapphire: '#3498db', // Bleu
    fr: '#e67e22',      // Orange
    lg: '#8aad7b'       // Vert Sauge (LG)
};

window.addEventListener('DOMContentLoaded', () => {
    displayProfiles();
});

function updateThemeColor(game) {
    const color = GAME_COLORS[game] || '#2ecc71';
    if (window.AppCore && window.AppCore.updateGlobalTheme) {
        window.AppCore.updateGlobalTheme(color);
    } else {
        document.documentElement.style.setProperty('--game-color', color);
        localStorage.setItem('rng_theme_color', color);
    }
}

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
        if (profiles.length === 1) selectProfile(profileData.id);
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
    
    // On essaie de lire l'objet actif
    let activeData = localStorage.getItem('rng_active_profile');
    let activeProfile = null;

    if (activeData) {
        try {
            const parsed = JSON.parse(activeData);
            // Si c'est un objet (nouveau format), on prend son ID, sinon c'était l'ancien format (ID seul)
            const activeId = (typeof parsed === 'object') ? parsed.id : parsed;
            activeProfile = profiles.find(p => p.id == activeId);
        } catch(e) {
            activeProfile = profiles.find(p => p.id == activeData);
        }
    }

    if (activeProfile) {
        activeBox.style.display = "block";
        updateThemeColor(activeProfile.game);
        const s = (activeProfile.sid !== undefined) ? activeProfile.sid.toString().padStart(5, '0') : "00000";
        activeInfo.innerHTML = `<strong>${activeProfile.name}</strong><br><small style="color:#aaa;">TID: ${activeProfile.tid} | SID: ${s}</small>`;
    } else {
        activeBox.style.display = "none";
    }

    if (profiles.length === 0) {
        list.innerHTML = "<p style='text-align:center; color:#666;'>Aucun profil.</p>";
        return;
    }

    list.innerHTML = profiles.map((p, i) => {
        const isActive = activeProfile && (p.id == activeProfile.id);
        const sidDisplay = (p.sid !== undefined) ? p.sid.toString().padStart(5, '0') : "00000";
        return `
            <div onclick="selectProfile('${p.id}')" class="profile-item ${isActive ? 'active' : ''}">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="flex:1; line-height: 1.4;">
                        <strong style="color:${isActive ? 'var(--game-color)' : '#fff'}; display:block;">${p.name}</strong>
                        <div style="font-size:0.85rem; color:#bbb;">TID: ${p.tid} | SID: ${sidDisplay}</div>
                        <div style="font-size:0.75rem; color:#888;">${p.game.toUpperCase()}</div>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="action-btn" onclick="handleEdit(event, ${i})">✏️</button>
                        <button class="action-btn" onclick="handleDelete(event, ${i})">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function selectProfile(id) {
    const profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    const activeProfile = profiles.find(p => p.id == id);
    
    if (activeProfile) {
        // CORRECTION : On stocke l'objet ENTIER pour search.js
        localStorage.setItem('rng_active_profile', JSON.stringify(activeProfile));
        displayProfiles();
    }
}

function handleEdit(event, index) {
    event.stopPropagation();
    const profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    const p = profiles[index];
    document.getElementById('edit-index').value = index;
    document.getElementById('prof-name').value = p.name;
    document.getElementById('prof-game').value = p.game;
    document.getElementById('prof-tid').value = p.tid;
    document.getElementById('prof-sid').value = p.sid || 0;
    document.getElementById('prof-dead-battery').checked = p.isDeadBattery;
    document.getElementById('form-title').innerText = "✏️ Modifier Profil";
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
function handleFileSelect(event) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            localStorage.setItem('rng_profiles', JSON.stringify(data));
            location.reload(); 
        } catch(err) { alert("Erreur lors de l'import"); }
    };
    reader.readAsText(event.target.files[0]);
}
