NSD — NITRO STORM DRIFT REPLACEMENT PROJECT

IMPORTANT:
1. Keep your existing assets/images/nsd-logo.svg file. This package deliberately does not replace your logo.
2. Replace the matching files in your GitHub repository with the files from this package.
3. Upload the complete js/ and assets/ subfolders. GitHub paths are case-sensitive.
4. Open the GitHub Pages URL in Chrome and refresh after deployment.

FILES INCLUDED:
index.html
style.css
manifest.json
sw.js
js/main.js
js/cars.js
js/world.js
js/controls.js
js/race.js
js/garage.js
assets/models/car-models.js
assets/textures/texture-generator.js
assets/audio/sound-engine.js

This is a connected playable starter prototype. It uses procedural Three.js cars and city geometry and synthesised browser audio. It is not a production AAA racing game. Three.js is loaded from jsDelivr, so the first load requires internet access. The service worker caches local project files, not the external Three.js CDN module.
