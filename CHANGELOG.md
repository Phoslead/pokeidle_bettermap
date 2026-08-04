# Changelog

All notable changes to the PokeIdle Better Map script will be documented in this file.

## [0.2.1] - 2026-08-04

### Added
- **Tooltip Fix Toggle:** Added a new setting to disable the custom map tooltip CSS injection. This resolves visual conflicts when using third-party launchers/Scripts that implement their own custom tooltip fixes.

## [0.2] - 2026-08-04

### Added
- **100 Kills Tracker:** Shows a sword icon (⚔️) and kill count on map sprites for Pokémon that haven't reached the 100 kills EXP bonus.
- **100 Kills Completion Check:** Once 100 kills are reached, the icon switches to a ✅ . This can be toggled via the new "Show / hide 100 kills completed check" setting.
- **Hide Completed Pokémon:** Added a new setting "Only show pokemon missing 100 kills" to completely hide Pokémon from the map if you already have 100 kills on them.
- **Real-Time Network Interceptor:** The script now silently intercepts game network traffic (`field-kill` and `catch-result`). The map now updates kills and catches instantly in real-time without needing to reopen the Pokédex
- **Launcher Compatibility (PokeGrid):** Added a hybrid `localStorage` wrapper so the script works flawlessly in desktop launchers that require `@grant none`. 
- **Anti-Deletion Shield:** Implemented a monkey-patch to `localStorage.clear()` and `localStorage.removeItem()` that actively blocks the game or launcher from accidentally deleting your cached Pokémon progress.
- **Farfetch'd Fix:** Improved name parsing and normalization to completely ignore apostrophes (e.g., `Farfetch'd` vs `Farfetchd`), fixing bugs where certain Pokémon were not recognized correctly between the map and Pokédex.

### Changed
- The "Show Caught" setting was renamed and migrated properly to prevent bugs.
- "X-Large" map size was deprecated and migrated to "Large".
- Script execution changed to `@run-at document-start` to ensure the network interceptor and localStorage shield load before the game engine initializes.

### Fixed
- Fixed an issue where closing and opening the map caused flickering or duplicate icons.
- Fixed an issue where the map tooltip would detach or behave erratically.
- Fixed a syntax error caused by unescaped backslashes in template literals.
