# Luigi's Pizzeria

CTU CS492 Group project 2 — Luigi's Pizzeria.

This repository is a React + Vite frontend for a pizza ordering experience with a menu, cart, pricing logic, delivery/carryout order flow, and checkout review modal.

## Project notes

- `npm install` installs dependencies.
- `npm run dev` starts the Vite development server.
- `npm run build` creates the production bundle for deployment.
- `npm run preview` serves the built output locally for a final check.

## Project structure

- `src/App.jsx` contains the menu, cart logic, tax estimates, order totals, and UI flow.
- `src/App.css` holds the styling for layout, cards, forms, and modals.
- `src/assets/` contains the visual assets used by the app.

## Notes for future work

- The topping and menu data are intentionally centralized so pricing stays consistent across cart and confirmation UI.
- If you add more menu items or states in the future, keep calculations in the same derived-logic pattern so the state remains predictable.
- The current tax logic uses address-based heuristics for a few common U.S. states and falls back to a default rate.

## Local development

1. Install dependencies with `npm install`.
2. Run `npm run dev`.
3. Open the local Vite URL shown in the terminal, typically `http://localhost:5173/`.

