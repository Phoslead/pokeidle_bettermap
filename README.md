# Poke Idle - Better Map

An advanced quality-of-life userscript that adds capture indicators, progress trackers, and various improvements to the Poke Idle World map.

---

## ⚡ Features

- **Capture Indicators:** Adds a small Pokéball icon next to Pokémon you have already caught directly on the map.
- **Hide Caught Pokémon:** Option to completely hide Pokémon you've already caught from the map, leaving only the missing ones visible.
- **EXP Bonus Tracker (100 Defeats):** Displays a Sword icon (⚔️) or a text counter (e.g., `10/100`) on map sprites to easily track your progress towards the 100 kills EXP bonus without opening the Pokédex.
- **Map Size Adjustments:** Switch between *Normal* and *Large* map sizes for better visibility.
- **Tooltip Fix:** Custom CSS injection that fixes the native map tooltip position so it no longer gets cut off or behaves erratically when the map is zoomed.
- **In-Game Configuration Menu:** Easy-to-use settings menu accessible via a custom "Better Map" badge next to the map zones tabs.

---
## 📸 Preview & Screenshots
### Add an extra button to the map interface; the "Better Map" button contains the tool's settings.
<img width="920" height="917" alt="image" src="https://github.com/user-attachments/assets/407f0bbc-44a0-4499-8898-e3b54bb92177" />

### Large map size and script settings.
<img width="1209" height="1248" alt="image" src="https://github.com/user-attachments/assets/69c548fc-d5cb-4f00-9a87-babc09f5456f" />

---

## 📖 How to Use

1. **Populate Data:**
   - The script works by reading your Pokédex. Open your Pokédex in the game at least once so the script can scan and cache which Pokémon you've caught and your kill counts.
   - Every time a new Pokémon is caught, the Pokédex must be opened to register the new changes; this is due to the way the game displays information to the player.

2. **Access Settings:**
   - Open the Map window.
   - Look for the **Better Map** badge next to the zone tabs (Kanto, Johto, etc.).
   - Click it to open the configuration window.

3. **Configure Options:**
   - **Show / hide caught pokemon icons:** Toggle the Pokéball icon on caught Pokémon.
   - **Only missing pokemon to catch:** Hide caught Pokémon completely from the map.
   - **Map Size:** Choose between *Normal* or *Large* map views.
   - **Show EXP bonus for 100 defeats:** Choose how you want to display the 100 kills progress (*x/100*, *Icon only*, or *Disabled*).

---
## 🌐 Browser Compatibility

This userscript is compatible with any modern desktop browser running a script manager extension:

| Browser | Recommended Manager Extension |
| :--- | :--- |
| **Google Chrome / Brave / Edge** | [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/) |
| **Mozilla Firefox** | [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/) |
| **Opera / Opera GX** | [Tampermonkey](https://www.tampermonkey.net/) |
| **Safari** | [Tampermonkey](https://www.tampermonkey.net/) |

---

## 📦 Installation

### Option 1: Automatic Installation (Recommended)

1. Make sure you have a script manager extension (such as **[Tampermonkey](https://www.tampermonkey.net/)**) installed in your browser.
2. Click the link below to install the script automatically:

👉 **[INSTALL USERSCRIPT DIRECTLY](https://raw.githubusercontent.com/Phoslead/pokeidle_bettermap/main/pokeidle_bettermap.user.js)** 👈

3. Tampermonkey will prompt an installation tab. Click **"Install"**.
4. Open or refresh the game tab!

---

### Option 2: Manual Installation

If the automatic link does not trigger your script manager, follow these steps:

1. Open your browser's extension panel for **Tampermonkey** and click **"Create a new script..."**.
2. Open the script file from this repository: [`pokeidle_bettermap.user.js`](https://github.com/Phoslead/pokeidle_bettermap/blob/main/pokeidle_bettermap.user.js).
3. Copy the entire JavaScript code.
4. Paste the code inside the Tampermonkey script editor, replacing any default template text.
5. Save the script (**Ctrl + S** or `File -> Save`).
6. Refresh the game tab.

---
