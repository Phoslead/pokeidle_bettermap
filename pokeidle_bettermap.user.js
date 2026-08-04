// ==UserScript==
// @name         PokeIdle Better Map
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Agrega indicadores de captura al mapa
// @author       phoslead
// @match        https://poke.idleworld.online/*
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const PREFIX = 'bettermap_';
    
    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = function(key) {
        if (key && key.startsWith(PREFIX)) {
            console.warn(`[PokeIdle Better Map] Se bloqueó un intento de borrar la clave: ${key}`);
            return; 
        }
        return originalRemoveItem.apply(this, arguments);
    };

    const originalClear = localStorage.clear;
    localStorage.clear = function() {
        console.warn(`[PokeIdle Better Map] El juego intentó hacer un clear() completo. Respaldando datos...`);
        
        const misDatos = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(PREFIX)) {
                misDatos[key] = localStorage.getItem(key);
            }
        }
        
        originalClear.apply(this, arguments);
        
        for (const key in misDatos) {
            localStorage.setItem(key, misDatos[key]);
        }
    };

    function initUI() {
        console.log("PokeIdle Better Map: Inicializando UI...");

        const style = document.createElement('style');
        style.innerHTML = `
            .map-window {
                overflow: visible !important;
            }
            .map-window > .map-tip {
                position: absolute !important;
                left: 100% !important;
                bottom: 0px !important;
                top: auto !important;
                right: auto !important;
                margin-left: 15px !important;
                transform: none !important;
                z-index: 999999 !important;
            }
        `;
        document.head.appendChild(style);
    }

    const storageCache = {
        get: function (key, defaultValue) {
            if (typeof GM_getValue !== 'undefined') {
                return GM_getValue(key, defaultValue);
            }
            const val = localStorage.getItem(key);
            return val !== null ? val : defaultValue;
        },
        set: function (key, value) {
            if (typeof GM_setValue !== 'undefined') {
                GM_setValue(key, value);
            } else {
                localStorage.setItem(key, value);
            }
        }
    };

    const CACHE_KEY = 'bettermap_pokemon_data';

    if (typeof GM_setValue !== 'undefined' && localStorage.getItem(CACHE_KEY)) {
        GM_setValue(CACHE_KEY, localStorage.getItem(CACHE_KEY));
        localStorage.removeItem(CACHE_KEY);
    }

    let pokemonDataCache = JSON.parse(storageCache.get(CACHE_KEY, '{}'));

    const SETTINGS_KEY = 'bettermap_settings';
    if (typeof GM_setValue !== 'undefined' && localStorage.getItem(SETTINGS_KEY)) {
        GM_setValue(SETTINGS_KEY, localStorage.getItem(SETTINGS_KEY));
        localStorage.removeItem(SETTINGS_KEY);
    }

    let savedSettings = JSON.parse(storageCache.get(SETTINGS_KEY, '{}'));
    let settings = Object.assign({
        showCaughtIcon: true,
        onlyMissing: false,
        showLock: 'text',
        mapSize: 'normal',
        show100KillsCheck: true,
        onlyMissing100Kills: false
    }, savedSettings);

    if (settings.showCaught !== undefined) {
        settings.showCaughtIcon = settings.showCaught;
        delete settings.showCaught;
    }

    if (settings.mapSize === 'xlarge') {
        settings.mapSize = 'large';
    }

    const interceptorScript = document.createElement('script');
    interceptorScript.textContent = `
        (function() {
            function sendToBetterMap(data) {
                if (!data) return;
                if (Array.isArray(data)) {
                    data.forEach(sendToBetterMap);
                    return;
                }
                if (data.type === undefined && typeof data[0] === 'string' && typeof data[1] === 'object') {
                     sendToBetterMap(data[1]);
                     return;
                }
                if (data.type === 'field-kill') {
                    window.postMessage({ type: 'BETTERMAP_FIELD_KILL', payload: data }, '*');
                } else if (data.type === 'catch-result') {
                    window.postMessage({ type: 'BETTERMAP_CATCH_RESULT', payload: data }, '*');
                }
            }

            // Fetch
            const originalFetch = window.fetch;
            window.fetch = async function(...args) {
                const response = await originalFetch.apply(this, args);
                try {
                    const clone = response.clone();
                    clone.json().then(data => sendToBetterMap(data)).catch(() => {});
                } catch(e) {}
                return response;
            };

            // XHR
            const originalOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function() {
                this.addEventListener('load', function() {
                    try {
                        if (this.responseText) {
                            sendToBetterMap(JSON.parse(this.responseText));
                        }
                    } catch(e) {}
                });
                return originalOpen.apply(this, arguments);
            };

            // WebSocket
            const originalWebSocket = window.WebSocket;
            window.WebSocket = function(url, protocols) {
                const ws = new originalWebSocket(url, protocols);
                ws.addEventListener('message', function(event) {
                    try {
                        let dataStr = event.data;
                        if (typeof dataStr === 'string' && dataStr.startsWith('42')) {
                            dataStr = dataStr.substring(2);
                        }
                        if (typeof dataStr === 'string') {
                            sendToBetterMap(JSON.parse(dataStr));
                        }
                    } catch(e) {}
                });
                return ws;
            };
            Object.assign(window.WebSocket, originalWebSocket);
        })();
    `;

    if (document.head) {
        document.head.appendChild(interceptorScript);
    } else {
        document.documentElement.appendChild(interceptorScript);
    }

    window.addEventListener('message', function (event) {
        if (!event.data) return;
        if (event.data.type === 'BETTERMAP_FIELD_KILL') {
            const data = event.data.payload;
            if (data && data.speciesName) {
                handleFieldKill(data.speciesName);
            }
        } else if (event.data.type === 'BETTERMAP_CATCH_RESULT') {
            const data = event.data.payload;
            if (data && data.success && data.speciesName) {
                handleCatchResult(data.speciesName);
            }
        }
    });

    function handleCatchResult(speciesName) {
        const cacheName = speciesName.toLowerCase().replace(/['’]/g, '').replace(/\s+/g, ' ').trim();
        let foundKey = null;
        for (const k of Object.keys(pokemonDataCache)) {
            const kName = k.toLowerCase().replace(/['’]/g, '').replace(/\s+/g, ' ').trim();
            if (kName === cacheName || (cacheName === 'nidoran male' && kName === 'nidoranma') || (cacheName === 'nidoran female' && kName === 'nidoranfe')) {
                foundKey = k;
                break;
            }
        }

        if (!foundKey) {
            pokemonDataCache[speciesName] = { caught: true, locked: true, kills: 0 };
            storageCache.set(CACHE_KEY, JSON.stringify(pokemonDataCache));
            document.querySelectorAll('.custom-caught-icon').forEach(el => el.remove());

            if (settings.onlyMissing) {
                document.querySelectorAll('.hunt-marker').forEach(el => el.style.display = '');
            }
            injectPokeballIcons();
        } else {
            const data = pokemonDataCache[foundKey];
            if (!data.caught) {
                data.caught = true;
                storageCache.set(CACHE_KEY, JSON.stringify(pokemonDataCache));

                document.querySelectorAll('.custom-caught-icon').forEach(el => el.remove());

                if (settings.onlyMissing) {
                    document.querySelectorAll('.hunt-marker').forEach(el => el.style.display = '');
                }
                injectPokeballIcons();
            }
        }
    }

    function handleFieldKill(speciesName) {
        const cacheName = speciesName.toLowerCase().replace(/['’]/g, '').replace(/\s+/g, ' ').trim();
        let foundKey = null;
        for (const k of Object.keys(pokemonDataCache)) {
            const kName = k.toLowerCase().replace(/['’]/g, '').replace(/\s+/g, ' ').trim();
            if (kName === cacheName || (cacheName === 'nidoran male' && kName === 'nidoranma') || (cacheName === 'nidoran female' && kName === 'nidoranfe')) {
                foundKey = k;
                break;
            }
        }

        if (!foundKey) {
            pokemonDataCache[speciesName] = { caught: false, locked: true, kills: 1 };
            storageCache.set(CACHE_KEY, JSON.stringify(pokemonDataCache));
            document.querySelectorAll('.custom-lock-icon').forEach(el => el.remove());
            injectPokeballIcons();
        } else {
            const data = pokemonDataCache[foundKey];
            if (data.locked && data.kills < 100) {
                data.kills += 1;
                if (data.kills >= 100) {
                    data.locked = false;
                }
                storageCache.set(CACHE_KEY, JSON.stringify(pokemonDataCache));
                document.querySelectorAll('.custom-lock-icon').forEach(el => el.remove());
                injectPokeballIcons();
            }
        }
    }

    function saveSettings() {
        storageCache.set(SETTINGS_KEY, JSON.stringify(settings));

        document.querySelectorAll('.custom-caught-icon, .custom-lock-icon').forEach(el => el.remove());
        document.querySelectorAll('.hunt-marker').forEach(el => el.style.display = '');

        injectPokeballIcons();
        applyMapSize();
    }

    function applyMapSize() {
        const mapAreas = document.querySelector('.map-areas');
        if (!mapAreas) return;

        const mapWin = mapAreas.closest('.map-window');
        if (!mapWin) return;

        if (settings.mapSize === 'normal') {
            mapWin.style.zoom = '1';
        } else if (settings.mapSize === 'large') {
            mapWin.style.zoom = '1.35';
        }
    }

    function isCaught(pokemonName) {
        const dataKey = Object.keys(pokemonDataCache).find(k => k.toLowerCase() === pokemonName.toLowerCase());
        return dataKey ? pokemonDataCache[dataKey].caught : false;
    }

    function scanPokedex() {
        const pokedexEntries = document.querySelectorAll('.dex-cell');

        if (pokedexEntries.length > 0) {
            pokedexEntries.forEach(entry => {
                const nameNode = entry.querySelector('.dex-cell-name');
                const name = nameNode ? nameNode.innerText.trim() : entry.title.trim();
                if (!name) return;

                const isCaught = entry.classList.contains('caught');
                const lockBadge = entry.querySelector('.dex-badge-lock');
                let locked = false;
                let kills = 0;

                if (lockBadge) {
                    locked = true;
                    const match = lockBadge.title.match(/(\d+)\/100/);
                    if (match) kills = parseInt(match[1], 10);
                }

                pokemonDataCache[name] = {
                    caught: isCaught,
                    locked: locked,
                    kills: kills
                };
            });
            storageCache.set(CACHE_KEY, JSON.stringify(pokemonDataCache));
        }
    }

    function injectPokeballIcons() {
        const mapPokemonNodes = document.querySelectorAll('.hunt-marker');

        mapPokemonNodes.forEach(node => {
            const nameNode = node.querySelector('.hunt-name');
            const pokemonName = nameNode ? nameNode.innerText.trim() : '';

            if (!pokemonName) return;

            const dataKey = Object.keys(pokemonDataCache).find(k => {
                let cacheName = k.toLowerCase().replace(/['’]/g, '').replace(/\s+/g, ' ').trim();
                let mapName = pokemonName.toLowerCase().replace(/['’]/g, '').replace(/\s+/g, ' ').trim();

                if (mapName === 'nidoranma') mapName = 'nidoran male';
                if (mapName === 'nidoranfe') mapName = 'nidoran female';
                if (mapName === 'mr. mime') mapName = 'mr. mime';
                if (mapName === 'farfetchd') mapName = 'farfetchd';

                if (cacheName === mapName) return true;

                if (mapName.endsWith(' ' + cacheName)) return true;

                try {
                    const regex = new RegExp('\\b' + cacheName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
                    if (regex.test(mapName)) return true;
                } catch (e) { }

                return false;
            });
            const data = pokemonDataCache[dataKey];

            if (data) {
                let shouldHide = false;
                if (data.caught && settings.onlyMissing) shouldHide = true;
                if ((!data.locked || data.kills >= 100) && settings.onlyMissing100Kills) shouldHide = true;

                if (shouldHide) {
                    node.style.display = 'none';
                    return;
                } else {
                    node.style.display = '';
                }

                if (data.caught && settings.showCaughtIcon && !node.querySelector('.custom-caught-icon')) {
                    const icon = document.createElement('img');
                    icon.src = '/assets/topmenu/pokemon.png';
                    icon.alt = 'Atrapado';
                    icon.className = 'custom-caught-icon';

                    icon.style.position = 'absolute';
                    icon.style.top = '2px';
                    icon.style.right = '8px';
                    icon.style.width = '22px';
                    icon.style.height = '22px';
                    icon.style.zIndex = '10';
                    icon.style.pointerEvents = 'none';
                    icon.style.filter = 'drop-shadow(0px 0px 3px rgba(0,0,0,0.9))';

                    node.appendChild(icon);
                }

                let showLockIcon = false;
                let lockText = '';
                let isCompleted = !data.locked || data.kills >= 100;

                if (isCompleted && settings.show100KillsCheck) {
                    showLockIcon = true;
                    lockText = '✅';
                } else if (!isCompleted && settings.showLock !== 'disabled') {
                    showLockIcon = true;
                    if (settings.showLock === 'text' && data.kills > 0) {
                        lockText = `⚔️ ${data.kills}/100`;
                    } else {
                        lockText = `⚔️`;
                    }
                }

                if (showLockIcon && !node.querySelector('.custom-lock-icon')) {
                    const lockEl = document.createElement('div');
                    lockEl.className = 'custom-lock-icon';

                    lockEl.style.position = 'absolute';
                    lockEl.style.top = '36px';
                    lockEl.style.left = '50%';
                    lockEl.style.transform = 'translateX(-50%)';
                    lockEl.style.background = isCompleted ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.85)';
                    lockEl.style.color = '#fff';
                    lockEl.style.borderRadius = '4px';
                    lockEl.style.fontSize = '9px';
                    lockEl.style.fontWeight = 'bold';
                    lockEl.style.whiteSpace = 'nowrap';
                    lockEl.style.pointerEvents = 'none';
                    lockEl.style.zIndex = '101';
                    lockEl.style.border = '1px solid rgba(255,255,255,0.15)';

                    lockEl.innerText = lockText;
                    lockEl.style.padding = lockText === '⚔️' ? '1px 3px' : '1px 4px';

                    node.appendChild(lockEl);
                }
            }
        });
    }

    function injectBetterMapBadge() {
        if (document.querySelector('.better-map-badge')) return;

        const tabsContainer = document.querySelector('.map-areas');

        if (tabsContainer) {
            const badge = document.createElement('div');
            badge.className = 'better-map-badge';
            badge.innerText = 'Better Map';

            badge.style.color = '#e8c98a';
            badge.style.borderColor = '#b99a58 #7a5c22 #4f3d17';
            badge.style.background = 'linear-gradient(#242e3ce6, #0d131cf2)';
            badge.style.borderRadius = '4px';
            badge.style.padding = '2px 8px';
            badge.style.fontSize = '10.5px';
            badge.style.fontWeight = '800';
            badge.style.boxShadow = 'inset 0 1px #ffffff17, inset 0 -1px 3px #0006';
            badge.style.border = '1px solid';
            badge.style.display = 'inline-flex';
            badge.style.alignItems = 'center';
            badge.style.marginLeft = 'auto';
            badge.style.cursor = 'pointer';
            badge.style.userSelect = 'none';

            badge.onclick = toggleSettingsWindow;

            if (window.getComputedStyle(tabsContainer).display !== 'flex') {
                tabsContainer.style.display = 'flex';
            }
            tabsContainer.style.width = '100%';

            tabsContainer.appendChild(badge);
        }
    }

    function toggleSettingsWindow() {
        let win = document.getElementById('bettermap-settings-win');
        if (win) {
            win.remove();
            return;
        }

        win = document.createElement('div');
        win.id = 'bettermap-settings-win';
        win.style.position = 'fixed';
        win.style.top = '50%';
        win.style.left = '50%';
        win.style.transform = 'translate(-50%, -50%)';
        win.style.zIndex = '99999';
        win.style.background = '#1a1f26';
        win.style.border = '1px solid rgba(216, 184, 113, 0.4)';
        win.style.borderRadius = '6px';
        win.style.padding = '15px';
        win.style.color = '#fff';
        win.style.boxShadow = '0 10px 30px rgba(0,0,0,0.8)';
        win.style.minWidth = '300px';
        win.style.fontFamily = 'inherit';

        win.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(216, 184, 113, 0.2); padding-bottom: 10px; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #d8b871; font-size: 14px; text-transform: uppercase;">Better Map Config</h3>
                <button id="bm-close" style="background: none; border: none; color: #fff; cursor: pointer; font-size: 18px; padding: 0 5px; line-height: 1;">&times;</button>
            </div>

            <div style="margin-bottom: 10px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px;">
                    <input type="checkbox" id="bm-show-caught-icon" ${settings.showCaughtIcon ? 'checked' : ''} style="cursor: pointer;">
                    Show / hide caught pokemon icons
                </label>
            </div>

            <div style="margin-bottom: 10px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px;">
                    <input type="checkbox" id="bm-only-missing" ${settings.onlyMissing ? 'checked' : ''} style="cursor: pointer;">
                    Only missing pokemon to catch
                </label>
            </div>

            <div style="margin-bottom: 10px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px;">
                    <input type="checkbox" id="bm-show-100-check" ${settings.show100KillsCheck ? 'checked' : ''} style="cursor: pointer;">
                    Show / hide 100 kills completed check
                </label>
            </div>

            <div style="margin-bottom: 18px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px;">
                    <input type="checkbox" id="bm-only-missing-100" ${settings.onlyMissing100Kills ? 'checked' : ''} style="cursor: pointer;">
                    Only show pokemon missing 100 kills
                </label>
            </div>

            <div style="margin-bottom: 8px; font-size: 12px; color: #e8c98a; font-weight: bold;">Map Size</div>
            <div style="display: flex; gap: 15px; font-size: 13px; margin-left: 10px; margin-bottom: 18px;">
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                    <input type="radio" name="bm-size" value="normal" ${settings.mapSize === 'normal' ? 'checked' : ''} style="cursor: pointer;">
                    Normal
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                    <input type="radio" name="bm-size" value="large" ${settings.mapSize === 'large' ? 'checked' : ''} style="cursor: pointer;">
                    Large
                </label>
            </div>

            <div style="margin-bottom: 8px; font-size: 12px; color: #e8c98a; font-weight: bold;">Show EXP bonus for 100 defeats</div>
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px; margin-left: 10px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="radio" name="bm-lock" value="text" ${settings.showLock === 'text' ? 'checked' : ''} style="cursor: pointer;">
                    x/100
                </label>
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="radio" name="bm-lock" value="icon" ${settings.showLock === 'icon' ? 'checked' : ''} style="cursor: pointer;">
                    Icon only
                </label>
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="radio" name="bm-lock" value="disabled" ${settings.showLock === 'disabled' ? 'checked' : ''} style="cursor: pointer;">
                    Disabled
                </label>
            </div>
        `;

        document.body.appendChild(win);

        document.getElementById('bm-close').onclick = () => win.remove();

        document.getElementById('bm-show-caught-icon').onchange = (e) => {
            settings.showCaughtIcon = e.target.checked;
            saveSettings();
        };

        document.getElementById('bm-only-missing').onchange = (e) => {
            settings.onlyMissing = e.target.checked;
            saveSettings();
        };

        document.getElementById('bm-show-100-check').onchange = (e) => {
            settings.show100KillsCheck = e.target.checked;
            saveSettings();
        };

        document.getElementById('bm-only-missing-100').onchange = (e) => {
            settings.onlyMissing100Kills = e.target.checked;
            saveSettings();
        };

        const radios = win.querySelectorAll('input[name="bm-lock"]');
        radios.forEach(r => r.onchange = (e) => {
            if (e.target.checked) {
                settings.showLock = e.target.value;
                saveSettings();
            }
        });

        const sizeRadios = win.querySelectorAll('input[name="bm-size"]');
        sizeRadios.forEach(r => r.onchange = (e) => {
            if (e.target.checked) {
                settings.mapSize = e.target.value;
                saveSettings();
            }
        });
    }

    let mapWasOpen = false;

    const observer = new MutationObserver(() => {
        const mapWin = document.querySelector('.map-window');

        if (mapWin && !mapWasOpen) {
            mapWasOpen = true;
            setTimeout(() => {
                const viewport = document.querySelector('.map-viewport');
                if (viewport) {
                    const MULTIPLICADOR_HORIZONTAL = 0.35;
                    const MULTIPLICADOR_VERTICAL = 0.15;

                    viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) * MULTIPLICADOR_HORIZONTAL;
                    viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) * MULTIPLICADOR_VERTICAL;
                }
            }, 100);
        } else if (!mapWin && mapWasOpen) {
            mapWasOpen = false;
        }

        const tooltip = document.querySelector('body > .map-tip');
        if (tooltip && mapWin) {
            mapWin.appendChild(tooltip);
        }

        injectPokeballIcons();

        injectBetterMapBadge();
        scanPokedex();

        applyMapSize();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initUI();
            observer.observe(document.body, { childList: true, subtree: true });
        });
    } else {
        initUI();
        observer.observe(document.body, { childList: true, subtree: true });
    }

})();
