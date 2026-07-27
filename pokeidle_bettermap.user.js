// ==UserScript==
// @name         PokeIdle Better Map
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Agrega indicadores de captura al mapa
// @author       phoslead
// @match        https://poke.idleworld.online/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("PokeIdle Better Map: Base cargada correctamente.");

    // Inyectar estilos globales para anclar el tooltip al mapa de forma nativa
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

    // Clave para guardar nuestra lista en el localStorage
    const CACHE_KEY = 'bettermap_pokemon_data';
    // Ahora guardaremos un objeto: { "Bulbasaur": { caught: true, locked: true, kills: 10 } }
    let pokemonDataCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');

    // Clave para guardar configuraciones de la UI
    const SETTINGS_KEY = 'bettermap_settings';

    // Obtenemos los settings o creamos los por defecto
    let savedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    let settings = Object.assign({
        showCaughtIcon: true,
        onlyMissing: false,
        showLock: 'text',
        mapSize: 'normal'
    }, savedSettings);

    // Si veníamos de una versión anterior que usaba "showCaught" para ocultar, la limpiamos/migramos si es necesario.
    if (settings.showCaught !== undefined) {
        settings.showCaughtIcon = settings.showCaught;
        delete settings.showCaught;
    }

    // Si veníamos con el tamaño xlarge, lo migramos a large porque fue removido
    if (settings.mapSize === 'xlarge') {
        settings.mapSize = 'large';
    }

    function saveSettings() {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

        // Limpiamos los íconos actuales y restauramos visibilidad para redibujar
        document.querySelectorAll('.custom-caught-icon, .custom-lock-icon').forEach(el => el.remove());
        document.querySelectorAll('.hunt-marker').forEach(el => el.style.display = '');

        injectPokeballIcons();
        applyMapSize();
    }

    /**
     * Aplica el tamaño seleccionado a la ventana del mapa
     */
    function applyMapSize() {
        const mapAreas = document.querySelector('.map-areas');
        if (!mapAreas) return;

        // Buscamos la ventana contenedora principal
        const mapWin = mapAreas.closest('.map-window');
        if (!mapWin) return;

        // Volvemos a usar zoom ya que el tooltip ahora está fijo por CSS y no le afectará el bug
        if (settings.mapSize === 'normal') {
            mapWin.style.zoom = '1';
        } else if (settings.mapSize === 'large') {
            mapWin.style.zoom = '1.35';
        }
    }

    /**
     * Verifica si un Pokémon está atrapado según nuestro caché.
     */
    function isCaught(pokemonName) {
        const dataKey = Object.keys(pokemonDataCache).find(k => k.toLowerCase() === pokemonName.toLowerCase());
        return dataKey ? pokemonDataCache[dataKey].caught : false;
    }

    /**
     * Escanea la Pokedex para aprender qué Pokémon ya están atrapados.
     */
    function scanPokedex() {
        // Seleccionamos TODOS los botones de Pokémon en la pokedex (atrapados o no)
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
                    // Extraemos los números del title ej: "10/100 kills"
                    const match = lockBadge.title.match(/(\d+)\/100/);
                    if (match) kills = parseInt(match[1], 10);
                }

                // Guardamos o actualizamos la info del Pokémon en el caché
                pokemonDataCache[name] = {
                    caught: isCaught,
                    locked: locked,
                    kills: kills
                };
            });
            localStorage.setItem(CACHE_KEY, JSON.stringify(pokemonDataCache));
        }
    }

    /**
     * Función que busca los nodos de los Pokémon en el mapa y agrega la Pokéball y el Candado
     */
    function injectPokeballIcons() {
        const mapPokemonNodes = document.querySelectorAll('.hunt-marker');

        mapPokemonNodes.forEach(node => {
            const nameNode = node.querySelector('.hunt-name');
            const pokemonName = nameNode ? nameNode.innerText.trim() : '';

            if (!pokemonName) return;

            // Buscamos ignorando mayúsculas y mapeando nombres inconsistentes
            const dataKey = Object.keys(pokemonDataCache).find(k => {
                // Normalizamos espacios y saltos de línea a un solo espacio
                let cacheName = k.toLowerCase().replace(/\s+/g, ' ').trim();
                let mapName = pokemonName.toLowerCase().replace(/\s+/g, ' ').trim();

                // Excepciones conocidas de nombres en el mapa vs pokedex
                if (mapName === 'nidoranma') mapName = 'nidoran male';
                if (mapName === 'nidoranfe') mapName = 'nidoran female';
                if (mapName === 'mr. mime') mapName = 'mr. mime'; // placeholder for future exceptions

                // Si coinciden exactamente
                if (cacheName === mapName) return true;

                // Si el nombre del mapa es una variante con prefijo (ej: "Brave Nidoking", "Taekwondo Hitmonlee")
                // Verificamos si el nombre del mapa termina con " " + el nombre base
                if (mapName.endsWith(' ' + cacheName)) return true;

                // Coincidencia segura por si el prefijo está estructurado de otra forma
                try {
                    const regex = new RegExp('\\b' + cacheName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
                    if (regex.test(mapName)) return true;
                } catch(e) {}

                return false;
            });
            const data = pokemonDataCache[dataKey];

            if (data) {
                // FILTRO: Ocultar atrapados completamente del mapa
                if (data.caught) {
                    if (settings.onlyMissing) {
                        node.style.display = 'none';
                        return; // Si está oculto en el mapa, no le inyectamos los demás iconos
                    } else {
                        node.style.display = '';
                    }
                }

                // INYECTAR POKEBALL
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

                // INYECTAR CANDADO Y CONTADOR
                if (data.locked && settings.showLock !== 'disabled' && !node.querySelector('.custom-lock-icon')) {
                    const lockEl = document.createElement('div');
                    lockEl.className = 'custom-lock-icon';

                    // Posicionarlo entre la imagen y el nombre
                    lockEl.style.position = 'absolute';
                    lockEl.style.top = '36px'; // Justo debajo del círculo (que suele ser de 42px)
                    lockEl.style.left = '50%';
                    lockEl.style.transform = 'translateX(-50%)';
                    lockEl.style.background = 'rgba(0,0,0,0.85)';
                    lockEl.style.color = '#fff';
                    lockEl.style.borderRadius = '4px';
                    lockEl.style.fontSize = '9px';
                    lockEl.style.fontWeight = 'bold';
                    lockEl.style.whiteSpace = 'nowrap';
                    lockEl.style.pointerEvents = 'none';
                    lockEl.style.zIndex = '101';
                    lockEl.style.border = '1px solid rgba(255,255,255,0.15)';

                    // Lógica para mostrar texto o solo candado según la configuración
                    if (settings.showLock === 'text' && data.kills > 0) {
                        lockEl.innerText = `⚔️ ${data.kills}/100`;
                        lockEl.style.padding = '1px 4px';
                    } else {
                        lockEl.innerText = `⚔️`;
                        lockEl.style.padding = '1px 3px';
                    }

                    node.appendChild(lockEl);
                }
            }
        });
    }

    /**
     * Inyecta un botón a la derecha de las pestañas de Zonas (Kanto, Johto, etc.)
     */
    function injectBetterMapBadge() {
        if (document.querySelector('.better-map-badge')) return;

        // El HTML original usa la clase .map-areas para el contenedor
        const tabsContainer = document.querySelector('.map-areas');

        if (tabsContainer) {
            const badge = document.createElement('div');
            badge.className = 'better-map-badge';
            badge.innerText = 'Better Map';

            // Estilos copiados de la "IV badge" de pokeidle_bc.user.js
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
            badge.style.marginLeft = 'auto'; // Lo empuja hacia la derecha
            badge.style.cursor = 'pointer'; // Cambiado a pointer para indicar que es clickeable
            badge.style.userSelect = 'none';

            badge.onclick = toggleSettingsWindow;

            // Nos aseguramos que el contenedor permita marginLeft=auto
            if (window.getComputedStyle(tabsContainer).display !== 'flex') {
                tabsContainer.style.display = 'flex';
            }
            tabsContainer.style.width = '100%';

            tabsContainer.appendChild(badge);
        }
    }

    /**
     * Crea y muestra la ventana de configuración
     */
    function toggleSettingsWindow() {
        let win = document.getElementById('bettermap-settings-win');
        if (win) {
            win.remove();
            return;
        }

        win = document.createElement('div');
        win.id = 'bettermap-settings-win';
        // Estilos para simular una ventana del juego
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

            <div style="margin-bottom: 18px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px;">
                    <input type="checkbox" id="bm-only-missing" ${settings.onlyMissing ? 'checked' : ''} style="cursor: pointer;">
                    Only missing pokemon to catch
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

        // Eventos
        document.getElementById('bm-close').onclick = () => win.remove();

        document.getElementById('bm-show-caught-icon').onchange = (e) => {
            settings.showCaughtIcon = e.target.checked;
            saveSettings();
        };

        document.getElementById('bm-only-missing').onchange = (e) => {
            settings.onlyMissing = e.target.checked;
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

    // Usar un MutationObserver para detectar cambios en la pantalla
    const observer = new MutationObserver(() => {
        const mapWin = document.querySelector('.map-window');

        // Lógica para detectar si el mapa se acaba de abrir y mover la cámara
        if (mapWin && !mapWasOpen) {
            mapWasOpen = true;
            setTimeout(() => {
                const viewport = document.querySelector('.map-viewport');
                if (viewport) {
                    // --- AJUSTA ESTOS VALORES PARA CAMBIAR LA POSICIÓN INICIAL ---
                    // 0.0 = Arriba/Izquierda | 0.5 = Centro exacto | 1.0 = Abajo/Derecha
                    const MULTIPLICADOR_HORIZONTAL = 0.35; // Cambia este número a tu gusto (ej. 0.3)
                    const MULTIPLICADOR_VERTICAL = 0.15; // Cambia este número a tu gusto (ej. 0.8)

                    // Posición horizontal personalizada
                    viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) * MULTIPLICADOR_HORIZONTAL;
                    // Posición vertical personalizada
                    viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) * MULTIPLICADOR_VERTICAL;
                }
            }, 100);
        } else if (!mapWin && mapWasOpen) {
            mapWasOpen = false;
        }

        // Mover el tooltip dentro de la ventana del mapa si aparece en el body
        const tooltip = document.querySelector('body > .map-tip');
        if (tooltip && mapWin) {
            mapWin.appendChild(tooltip);
        }

        // Intentamos inyectar íconos por si estamos en el mapa
        injectPokeballIcons();

        // Intentamos inyectar el badge a la derecha de las zonas
        injectBetterMapBadge();

        // Intentamos escanear la pokedex por si está abierta
        scanPokedex();

        // Mantenemos el tamaño del mapa si está abierto
        applyMapSize();
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
