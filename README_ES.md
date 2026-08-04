# Poke Idle - Better Map

🌍 Languages: [English](README.md) | [Português](README_BR.md) | [Español](README_ES.md)

Un userscript avanzado de calidad de vida que añade indicadores de captura, rastreadores de progreso y diversas mejoras al mapa de Poke Idle World.

---

## ⚡ Características

- **Indicadores de Captura:** Añade un pequeño icono de Pokéball junto a los Pokémon que ya has capturado directamente en el mapa.
- **Ocultar Pokémon Capturados:** Opción para ocultar completamente del mapa los Pokémon que ya has capturado, dejando visibles solo los que te faltan.
- **Rastreador de Bono de EXP (100 Derrotas):** Muestra un icono de Espada (⚔️), un contador de texto (ej. `10/100`) o una marca de finalización (✅) en los sprites del mapa para rastrear fácilmente tu progreso hacia el bono de EXP de 100 derrotas sin abrir la Pokédex.
- **Ajustes de Tamaño del Mapa:** Cambia entre tamaños de mapa *Normal* y *Grande* para una mejor visibilidad.
- **Corrección de Tooltip:** Inyección de CSS personalizado que corrige la posición nativa del tooltip del mapa para que ya no se corte o se comporte de manera errática cuando se hace zoom en el mapa.
- **Menú de Configuración en el Juego:** Menú de ajustes fácil de usar accesible a través de un emblema personalizado "Better Map" junto a las pestañas de las zonas del mapa.

---
## 📸 Vista Previa y Capturas de Pantalla
### Añade un botón adicional a la interfaz del mapa; el botón "Better Map" contiene los ajustes de la herramienta.
<img width="920" height="917" alt="image" src="https://github.com/user-attachments/assets/407f0bbc-44a0-4499-8898-e3b54bb92177" />

### Tamaño de mapa grande y configuración del script.
<img width="1209" height="1248" alt="image" src="https://github.com/user-attachments/assets/69c548fc-d5cb-4f00-9a87-babc09f5456f" />

### Fix Map tooltip.
<img width="965" height="827" alt="image" src="https://github.com/user-attachments/assets/f866b09a-bcc3-4551-b95e-507545bd8b33" />
---

## 📖 Cómo Usar

1. **Rellenar Datos:**
   - Abre tu Pokédex en el juego al menos una vez para que el script pueda escanear y almacenar en caché tus Pokémon capturados actualmente y el conteo de derrotas.
   - **Actualizaciones en Tiempo Real:** Tras el escaneo inicial, el script escucha automáticamente el tráfico de red del juego. Cada vez que derrotes o captures un Pokémon, el mapa se actualizará instantáneamente en tiempo real. No necesitas abrir la Pokédex continuamente.

2. **Acceder a Ajustes:**
   - Abre la ventana del Mapa.
   - Busca el emblema **Better Map** junto a las pestañas de las zonas (Kanto, Johto, etc.).
   - Haz clic en él para abrir la ventana de configuración.

3. **Configurar Opciones:**
   - **Mostrar / ocultar iconos de pokemon capturados:** Activa o desactiva el icono de Pokéball en los Pokémon capturados.
   - **Solo pokemon que faltan por capturar:** Oculta completamente los Pokémon capturados del mapa.
   - **Mostrar / ocultar marca de 100 derrotas completadas:** Activa o desactiva el icono ✅ para los Pokémon que ya has derrotado 100 veces.
   - **Solo mostrar pokemon que les falten 100 derrotas:** Oculta completamente los Pokémon del mapa si ya han alcanzado la meta de 100 derrotas.
   - **Tamaño del Mapa:** Elige entre vistas de mapa *Normal* o *Grande*.
   - **Mostrar bono de EXP por 100 derrotas:** Elige cómo deseas mostrar el progreso de 100 derrotas (*x/100*, *Solo icono* o *Desactivado*).

---
## 🌐 Compatibilidad de Navegador

Este userscript es compatible con cualquier navegador de escritorio moderno que ejecute una extensión de gestor de scripts:

| Navegador | Extensión de Gestor Recomendada |
| :--- | :--- |
| **Google Chrome / Brave / Edge** | [Tampermonkey](https://www.tampermonkey.net/) o [Violentmonkey](https://violentmonkey.github.io/) |
| **Mozilla Firefox** | [Tampermonkey](https://www.tampermonkey.net/) o [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/) |
| **Opera / Opera GX** | [Tampermonkey](https://www.tampermonkey.net/) |
| **Safari** | [Tampermonkey](https://www.tampermonkey.net/) |

---

## 📦 Instalación

### Opción 1: Instalación Automática (Recomendado)

1. Asegúrate de tener una extensión de gestor de scripts (como **[Tampermonkey](https://www.tampermonkey.net/)**) instalada en tu navegador.
2. Haz clic en el siguiente enlace para instalar el script automáticamente:

👉 **[INSTALAR USERSCRIPT DIRECTAMENTE](https://raw.githubusercontent.com/Phoslead/pokeidle_bettermap/main/pokeidle_bettermap.user.js)** 👈

3. Tampermonkey mostrará una pestaña de instalación. Haz clic en **"Instalar"**.
4. ¡Abre o refresca la pestaña del juego!

---

### Opción 2: Instalación Manual

Si el enlace automático no activa tu gestor de scripts, sigue estos pasos:

1. Abre el panel de extensiones de tu navegador para **Tampermonkey** y haz clic en **"Crear un nuevo script..."**.
2. Abre el archivo de script de este repositorio: [`pokeidle_bettermap.user.js`](https://github.com/Phoslead/pokeidle_bettermap/blob/main/pokeidle_bettermap.user.js).
3. Copia todo el código JavaScript.
4. Pega el código dentro del editor de scripts de Tampermonkey, reemplazando cualquier texto de plantilla predeterminado.
5. Guarda el script (**Ctrl + S** o `Archivo -> Guardar`).
6. Refresca la pestaña del juego.

---

### Opción 3: Launchers de Escritorio (ej., [PokeGrid](https://github.com/soufoka/PokeGrid-source))

Si estás jugando a través de un launcher de escritorio dedicado como **PokeGrid** que incluye un gestor de scripts personalizado, debes hacer un pequeño ajuste en el código del script para asegurar la compatibilidad y la protección de datos.

1. Pega el script en el gestor de scripts del launcher.
2. En la parte superior del script, encuentra estas dos líneas en el encabezado:
   ```javascript
   // @grant        GM_getValue
   // @grant        GM_setValue
   ```
3. Cámbialas a:
   ```javascript
   // @grant        none
   ```
4. **Guarda y recarga.**
