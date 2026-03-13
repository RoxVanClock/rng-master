/**
 * CONFIG.JS - Gestion Profils + Import/Export
 */

const GAME_COLORS = {
    emerald: '#2ecc71', 
    ruby: '#e74c3c', 
    sapphire: '#3498db', 
    fr: '#e67e22', 
    lg: '#8aad7b'
};

window.addEventListener('DOMContentLoaded', () => {
    displayProfiles();
});

function updateThemeColor(game) {
    const color = GAME_COLORS[game] || '#2ecc71';
    document.documentElement.style.setProperty('--game-color', color);
    localStorage.setItem('rng_theme_color', color);
}

// --- SAUVEGARDE ET AFFICHAGE ---

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
        id: (index > -1 && profiles[index]) ? profiles[index].id : Date.now().toString(),
        name, 
        game, 
        tid: parseInt(tid), 
        sid: (sid === "" || sid === null) ? 0 : parseInt(sid), 
        isDeadBattery 
    };

    if (index > -1 && profiles[index]) {
        profiles[index] = profileData;
    } else {
        profiles.push(profileData);
    }

    localStorage.setItem('rng_profiles', JSON.stringify(profiles));
    // On définit le profil créé/modifié comme actif immédiatement
    localStorage.setItem('rng_active_profile', JSON.stringify(profileData));
    
    resetForm();
    displayProfiles();
}

function displayProfiles() {
    const list = document.getElementById('profile-list');
    const activeBox = document.getElementById('active-profile-display');
    const activeInfo = document.getElementById('active-info');
    
    const profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    const activeRaw = localStorage.getItem('rng_active_profile');
    
    let activeProfile = null;
    if (activeRaw) {
        try {
            activeProfile = JSON.parse(activeRaw);
        } catch(e) { activeProfile = null; }
    }

    // Affichage du bandeau Profil Actif
    if (activeProfile && activeProfile.name) {
        activeBox.style.display = "block";
        updateThemeColor(activeProfile.game);
        activeInfo.innerHTML = `
            <div style="color: var(--game-color); font-weight: bold;">${activeProfile.name}</div>
            <div style="font-size: 0.8rem; color: #eee;">TID: ${activeProfile.tid} | SID: ${activeProfile.sid}</div>
        `;
    } else {
        activeBox.style.display = "none";
    }

    // Liste des profils
    if (profiles.length === 0) {
        list.innerHTML = "<p style='text-align:center; color:#666; font-size:0.8rem;'>Aucun profil enregistré.</p>";
        return;
    }

    list.innerHTML = profiles.map((p, i) => {
        const isActive = activeProfile && (p.id === p.id && p.name === activeProfile.name);
        return `
            <div onclick="selectProfile('${p.id}')" class="profile-item" 
                 style="border: 1px solid ${isActive ? 'var(--game-color)' : '#333'}; 
                        padding:12px; margin-bottom:8px; border-radius:8px; cursor:pointer; 
                        background: ${isActive ? 'rgba(255,255,255,0.05)' : '#1a1a1a'};">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="flex:1;">
                        <strong style="color:${isActive ? 'var(--game-color)' : '#fff'}">${p.name}</strong><br>
                        <small style="color:#888;">TID: ${p.tid} | SID: ${p.sid}</small>
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
    const found = profiles.find(p => p.id == id);
    if (found) {
        localStorage.setItem('rng_active_profile', JSON.stringify(found));
        displayProfiles();
    }
}

// --- IMPORT / EXPORT ---

function exportProfiles() {
    const profiles = localStorage.getItem('rng_profiles') || "[]";
    if (profiles === "[]") return alert("Rien à exporter.");

    const blob = new Blob([profiles], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "rng_profiles.json";
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
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (Array.isArray(data)) {
                localStorage.setItem('rng_profiles', JSON.stringify(data));
                if (data.length > 0) {
                    localStorage.setItem('rng_active_profile', JSON.stringify(data[0]));
                }
                displayProfiles();
                alert("Importation réussie !");
            }
        } catch (err) { alert("Fichier invalide."); }
    };
    reader.readAsText(file);
}

// --- ACTIONS ---

function handleEdit(event, index) {
    event.stopPropagation();
    const profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    const p = profiles[index];
    document.getElementById('edit-index').value = index;
    document.getElementById('prof-name').value = p.name;
    document.getElementById('prof-game').value = p.game;
    document.getElementById('prof-tid').value = p.tid;
    document.getElementById('prof-sid').value = p.sid;
    document.getElementById('prof-dead-battery').checked = p.isDeadBattery;
    document.getElementById('form-title').innerText = "✏️ Modifier Profil";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleDelete(event, index) {
    event.stopPropagation();
    if (!confirm("Supprimer ce profil ?")) return;
    let profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    profiles.splice(index, 1);
    localStorage.setItem('rng_profiles', JSON.stringify(profiles));
    
    // Si on supprime le profil actif, on vide la clé active
    localStorage.removeItem('rng_active_profile');
    
    displayProfiles();
}

function resetForm() {
    document.getElementById('edit-index').value = "-1";
    document.getElementById('prof-name').value = "";
    document.getElementById('prof-tid').value = "";
    document.getElementById('prof-sid').value = "";
    document.getElementById('form-title').innerText = "👤 Nouveau Profil";
}
