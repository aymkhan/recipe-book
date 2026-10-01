# Recipe Book

A personal recipe app for collecting recipes currently scattered across Notes
and Gmail (including photos of handwritten or screenshotted recipes) into one
organized place.

## What it does

- Store recipes organized by category
- Add new recipes, including photos
- Tag each recipe with one or more labels (e.g. `beef`, `mom`, `vegetarian`)
  so it surfaces under every matching category, not just one
- Pretty, simple UI

## Plan

Start as a responsive web app, then port to native iOS/Android.

- **Frontend:** React + TypeScript, built with Vite
- **Styling:** Tailwind CSS
- **Data:** local persistence first (browser storage), moving to a synced
  backend (e.g. Supabase/Firebase) once the app needs to work across devices
- **Mobile:** wrap the web app with Capacitor, or rebuild the UI in React
  Native/Expo, reusing the same data model
