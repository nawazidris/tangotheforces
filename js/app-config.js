/**
 * App Configuration & Utilities - OPTIMIZED FOR MOBILE PERFORMANCE
 * Implements: IndexedDB caching, local-first strategy, request timeouts, and compression
 */

const GITHUB_USERNAME = 'nawazidris';
const GITHUB_REPO = 'Tango_FC_Apk';
const ONLINE_DATA_BASE_URL = `https://${GITHUB_USERNAME}.github.io/${GITHUB_REPO}/app/src/main/assets/`;
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const REQUEST_TIMEOUT = 2000; // 2 seconds for network requests as per new rule
const DB_NAME = 'TangoFCCache';
const DB_VERSION = 1;

/**
 * Timeout wrapper for any Promise (useful for Firebase)
 */
function withTimeout(promise, ms = REQUEST_TIMEOUT) {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Firebase/Network timeout')), ms)
        )
    ]);
}

// IndexedDB Cache Management
let cacheDB = null;

function initIndexedDB() {
    return new Promise((resolve, reject) => {
        if (cacheDB) {
            resolve(cacheDB);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.warn('[Cache] IndexedDB failed to open:', request.error);
            resolve(null);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('assets')) {
                db.createObjectStore('assets', { keyPath: 'path' });
            }
        };

        request.onsuccess = () => {
            cacheDB = request.result;
            resolve(cacheDB);
        };
    });
}

async function getCacheFromIndexedDB(path) {
    const db = await initIndexedDB();
    if (!db) return null;

    return new Promise((resolve) => {
        const transaction = db.transaction(['assets'], 'readonly');
        const store = transaction.objectStore('assets');
        const request = store.get(path);

        request.onerror = () => resolve(null);
        request.onsuccess = () => {
            const result = request.result;
            if (result && Date.now() - result.timestamp < CACHE_EXPIRY) {
                console.log(`[Cache] Cache HIT for: ${path}`);
                resolve(result.data);
            } else {
                resolve(null);
            }
        };
    });
}

async function setCacheInIndexedDB(path, data) {
    const db = await initIndexedDB();
    if (!db) return;

    return new Promise((resolve) => {
        const transaction = db.transaction(['assets'], 'readwrite');
        const store = transaction.objectStore('assets');
        const request = store.put({
            path,
            data,
            timestamp: Date.now()
        });

        request.onerror = () => {
            console.warn(`[Cache] Failed to cache ${path}`);
            resolve();
        };

        request.onsuccess = () => {
            console.log(`[Cache] Cached: ${path}`);
            resolve();
        };
    });
}

function isAndroidApp() {
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(ua);
    const isWebView = /webview|wv/.test(ua) || window.AndroidWebView !== undefined;
    return isAndroid && (isWebView || typeof window.AndroidWebView !== 'undefined');
}

function getAssetPath(assetPath) {
    if (isAndroidApp()) {
        return `file:///android_asset/${assetPath}`;
    }
    return assetPath;
}

/**
 * Fetch with timeout - prevents hanging on slow networks
 */
function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Fetch timeout')), timeout);

        // Use XHR for local files (file:///) as it's more reliable in older WebViews
        // and correctly handles status 0 as success.
        if (url.startsWith('file:///') || !url.includes('://')) {
            const xhr = new XMLHttpRequest();
            xhr.open(options.method || 'GET', url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    clearTimeout(timer);
                    if (xhr.status === 200 || xhr.status === 0) {
                        resolve({
                            ok: true,
                            status: xhr.status,
                            json: async () => JSON.parse(xhr.responseText),
                            text: async () => xhr.responseText
                        });
                    } else {
                        reject(new Error(`XHR Error: ${xhr.status}`));
                    }
                }
            };
            xhr.onerror = () => {
                clearTimeout(timer);
                reject(new Error('XHR Network Error'));
            };
            xhr.send();
        } else {
            // Standard fetch for online URLs
            fetch(url, options).then(res => {
                clearTimeout(timer);
                resolve(res);
            }).catch(err => {
                clearTimeout(timer);
                reject(err);
            });
        }
    });
}

/**
 * Optimized fetch strategy: Local → Cache → Android Bridge → GitHub (as fallback)
 */
async function fetchAsset(assetPath, options = {}) {
    const isDataFile = assetPath.startsWith('data/');

    // Step 1: Check IndexedDB cache first (instant on mobile)
    if (isDataFile) {
        const cached = await getCacheFromIndexedDB(assetPath);
        if (cached) {
            return {
                ok: true,
                status: 200,
                statusText: 'OK (from cache)',
                json: async () => cached,
                text: async () => JSON.stringify(cached)
            };
        }
    }

    // Step 2: Try local fetch first (file:///android_asset or relative path)
    const localPath = getAssetPath(assetPath);
    try {
        console.log(`[App Config] Fetching from local: ${localPath}`);
        const localResponse = await fetchWithTimeout(localPath, options);

        if (localResponse.ok) {
            if (isDataFile) {
                const data = await localResponse.json();
                // Cache in background
                setCacheInIndexedDB(assetPath, data).catch(() => {});
                return {
                    ok: true,
                    status: 200,
                    statusText: 'OK (local)',
                    json: async () => data,
                    text: async () => JSON.stringify(data)
                };
            }
            return localResponse;
        }
    } catch (error) {
        console.warn(`[App Config] Local fetch failed: ${error.message}`);
    }

    // Step 3: Try Android bridge (faster on app)
    if (typeof window.Android !== 'undefined' && window.Android.isAndroid?.()) {
        try {
            console.log(`[App Config] Trying Android bridge for: ${assetPath}`);
            const assetContent = window.Android.loadAsset(assetPath);
            if (assetContent) {
                if (isDataFile) {
                    const data = JSON.parse(assetContent);
                    setCacheInIndexedDB(assetPath, data).catch(() => {});
                    return {
                        ok: true,
                        status: 200,
                        statusText: 'OK (Android bridge)',
                        json: async () => data,
                        text: async () => assetContent
                    };
                }
                return {
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    json: async () => JSON.parse(assetContent),
                    text: async () => assetContent
                };
            }
        } catch (error) {
            console.error('[App Config] Android bridge failed:', error);
        }
    }

    // Step 4: Last resort - try GitHub (only for data files, with cache enabled)
    if (isDataFile) {
        try {
            console.log(`[App Config] Trying GitHub fetch as fallback: ${assetPath}`);
            const onlineUrl = ONLINE_DATA_BASE_URL + assetPath;
            const onlineResponse = await fetchWithTimeout(onlineUrl, {
                ...options,
                method: options.method || 'GET',
                cache: 'default' // Allow browser caching
            }, REQUEST_TIMEOUT * 2); // Longer timeout for online

            if (onlineResponse.ok) {
                const data = await onlineResponse.json();
                setCacheInIndexedDB(assetPath, data).catch(() => {});
                console.log(`[App Config] Successfully loaded from GitHub: ${assetPath}`);
                return {
                    ok: true,
                    status: 200,
                    statusText: 'OK (GitHub)',
                    json: async () => data,
                    text: async () => JSON.stringify(data)
                };
            }
        } catch (error) {
            console.warn(`[App Config] GitHub fetch failed: ${error.message}`);
        }
    }

    // All strategies failed
    console.error(`[App Config] All fetch strategies failed for ${assetPath}`);
    throw new Error(`Failed to load asset: ${assetPath}`);
}

// Initialize cache DB
document.addEventListener('DOMContentLoaded', () => {
    const env = isAndroidApp() ? 'Android App' : 'Web Browser';
    console.log(`[App Config] Running in: ${env}`);
    console.log(`[App Config] User Agent: ${navigator.userAgent}`);

    initIndexedDB().catch(err => console.error('[Cache] Init failed:', err));
});

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.AppConfig = {
        isAndroidApp,
        getAssetPath,
        fetchAsset,
        withTimeout
    };
}
