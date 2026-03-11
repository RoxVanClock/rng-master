/**
 * Nom du cache et liste des fichiers à sauvegarder localement
 */
const CACHE_NAME = 'rng-master-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style-core.css',
    './app-core.js',
    './pages/config.html',
    './pages/config.js',
    './pages/search.html',
    './pages/search.js',
    './pages/chrono.html',
    './pages/chrono.js',
    './assets/gs_ball.png' // Ajoute ici toutes tes icônes
];

/**
 * Étape 1 : Installation - On télécharge les fichiers dans le cache
 */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Mise en cache des fichiers...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

/**
 * Étape 2 : Activation - On nettoie les vieux caches si nécessaire
 */
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activé');
});

/**
 * Étape 3 : Interception - On sert les fichiers depuis le cache
 */
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Retourne le fichier du cache, sinon fait la requête réseau
            return response || fetch(event.request);
        })
    );
});