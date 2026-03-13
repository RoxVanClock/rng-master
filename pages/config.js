/**
 * CONFIG.JS - Gestion Profils - VERSION FINALE
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
        // Si c'est le premier, on l'active direct
        if (profiles.length === 1) {
            localStorage.setItem('rng_active_profile', JSON.stringify(profileData));
        }
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
            // On gère si c'est l'ancien format (string) ou le nouveau (objet)
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

    list.innerHTML = profiles.map((p, i) => {
        const isActive = activeProfile && (p.id == activeProfile.id);
        return `
            <div onclick="selectProfile('${p.id}')" class="profile-item ${isActive ? 'active' : ''}" style="border: 1px solid ${isActive ? 'var(--game-color)' : '#333'}; padding:10px; margin-bottom:5px; border-radius:8px; cursor:pointer;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong style="color:${isActive ? 'var(--game-color)' : '#fff'}">${p.name}</strong><br>
                        <small>TID: ${p.tid} | SID: ${p.sid}</small>
                    </div>
                    <button onclick="handleDelete(event, ${i})">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function selectProfile(id) {
    const profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    const found = profiles.find(p => p.id == id);
    if (found) {
        // CRITIQUE : On enregistre TOUT l'objet
        localStorage.setItem('rng_active_profile', JSON.stringify(found));
        displayProfiles();
    }
}

function handleDelete(event, index) {
    event.stopPropagation();
    let profiles = JSON.parse(localStorage.getItem('rng_profiles') || "[]");
    profiles.splice(index, 1);
    localStorage.setItem('rng_profiles', JSON.stringify(profiles));
    displayProfiles();
}

function resetForm() {
    document.getElementById('edit-index').value = "-1";
    document.getElementById('prof-name').value = "";
}
