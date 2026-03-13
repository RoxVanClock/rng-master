/**
 * CONFIG.JS - Gestion Profils + Import/Export
 */

const GAME_COLORS = {
    emerald: '#2ecc71', ruby: '#e74c3c', sapphire: '#3498db', fr: '#e67e22', lg: '#8aad7b'
};

window.addEventListener('DOMContentLoaded', () => {
    displayProfiles();
});

function updateThemeColor(game) {
    const color = GAME_COLORS[game] || '#2ecc71';
    document.documentElement.style.setProperty('--game-color', color);
    localStorage.setItem('rng_theme_color', color);
}

// --- GESTION DES PROFILS ---

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
    const activeRaw = localStorage.getItem('rng_active_profile');
    
    let activeProfile = null;
    if (activeRaw) {
        try {
            const parsed = JSON.parse(activeRaw);
            const activeId = (typeof parsed === 'object') ? parsed.id : parsed;
            activeProfile = profiles.find(p => p.id == activeId);
        } catch(e) {
            activeProfile = profiles.find(p => p.id == activeRaw);
        }
    }

    if (activeProfile) {
        activeBox.style.display = "block";
        updateThemeColor(activeProfile.game);
        activeInfo.innerHTML = `<strong>${activeProfile.name}</strong><br><small>TID: ${activeProfile.tid} | SID: ${activeProfile.sid}</small>`;
    } else {
        activeBox.style.display = "none";
    }

    if (profiles.length === 0) {
        list.innerHTML = "<p style='text-align:center; color:#666;'>Aucun profil enregistré.</p>";
        return;
    }

    list.innerHTML = profiles.map((p, i) => {
        const isActive = activeProfile && (p.id == activeProfile.id);
        return `
            <div onclick="selectProfile('${p.id}')" class="profile-item ${isActive ? 'active' : ''}" 
                 style="border: 1px solid ${isActive ? 'var(--game-color)' : '#333'}; padding:12px; margin-bottom:8px; border-radius:8px; cursor:pointer; background: #1a1a1a;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="flex:1;">
                        <strong style="color:${isActive ? 'var(--game-color)' : '#fff'}">${p.name}</strong><br>
                        <small style="color:#888;">TID: ${p.tid} | SID: ${p.sid} | ${p.game.toUpperCase()}</small>
                    </div>
                    <div style="display:flex; gap:8px;">
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

// --- BOUTONS IMPORT / EXPORT ---

function exportProfiles() {
    const profiles = localStorage.getItem('rng_profiles') || "[]";
    if (profiles === "[]") return alert("Aucun profil à exporter.");

    const blob = new Blob([profiles], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = "mes_profils_rng.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importProfiles() {
    // Cette fonction simule le clic sur l'input type="file" caché
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
                // Optionnel : On active le premier par défaut
                if (data.length > 0) {
                    localStorage.setItem('rng_active_profile', JSON.stringify(data[0]));
                }
                alert("Importation réussie !");
                location.reload(); 
            } else {
                alert("Le fichier n'est pas au bon format.");
            }
        } catch (err) {
            alert("Erreur lors de la lecture du fichier.");
        }
    };
    reader.readAsText(file);
}

// --- UTILITAI
