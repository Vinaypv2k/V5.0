# Fishing Engineer's Calculator V5.0

V5.0 is a modular, GitHub Pages-ready tubular engineering build.

## Tubular selector
Search flow:
**Category → Size → Weight → Grade → Connection**

Categories included:
- Tubing
- Drill Pipe
- HWDP
- Drill Collars

Selecting a record auto-populates:
- OD
- ID
- wall thickness
- drift ID where available
- nominal linear weight
- grade
- SMYS
- tensile strength reference
- connection
- tool-joint OD/ID where relevant
- body metal area
- calculated pipe-body yield
- source / standard field

## Architecture
- `js/data/tubular-library.js` — independent tubular database
- `js/modules/string-bha.js` — tally calculations
- `js/modules/tubular-strength.js` — strength calculations
- `js/modules/fishing-loads.js` — fishing load calculations
- `js/units.js` — FPS/Metric conversion
- `js/app.js` — UI orchestration only

## Standards/version note
The UI records the intended governing standard family for each record. API's current public information states that API Spec 5CT is at 11th Edition, and API lists Addendum 1 (May 2025) and Errata 3 (June 2026). Drill pipe is governed by API Spec 5DP, while rotary shouldered connections are associated with API 7-2. Users should verify the exact licensed editions adopted by their organization.

## Critical database warning
The included dataset is a **curated starter engineering library**, not a licensed reproduction of proprietary API tables or a manufacturer-certified tubular catalogue. Dimensions, drift, weight, grades, connection ratings, torque, collapse, burst and tensile values required for an actual job must be checked against the field tally, manufacturer data and applicable licensed standard before use.
