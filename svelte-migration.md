# Migration Plan: HTML → Svelte 5

## Objectif

Migrer l'application pédagogique interactive "IK vs Backprop : La Vallée du Loss" d'un fichier HTML monolithique vers une application Svelte 5 structurée, typée et maintenable.

## Contraintes

- Pas de rendu côté serveur (SPA uniquement)
- TypeScript strict
- Séparer la logique algorithmique du code framework
- Chaque partie de l'interface = un composant
- DaisyUI pour les composants UI ; `stats` pour les paires titre/valeur

---

## Architecture cible

```
src/
├── lib/
│   ├── types.ts          # Types partagés (Vec2, ArmConfig, ArmState)
│   ├── kinematics.ts     # Cinématique pure (pas de Svelte)
│   └── lossLandscape.ts  # Helpers Three.js (création scène, update mesh)
│
├── components/
│   ├── ArmCanvas.svelte     # Canvas 2D — bras robot + cible draggable
│   ├── LossLandscape.svelte # Three.js — surface de loss 3D
│   ├── LossGraph.svelte     # Canvas 2D — historique de convergence
│   ├── Controls.svelte      # Slider LR + bouton reset (DaisyUI)
│   └── Metrics.svelte       # Stats temps réel (DaisyUI stats)
│
├── App.svelte   # État global ($state runes) + boucle d'animation
├── main.ts      # Point d'entrée Vite
└── app.css      # @import tailwindcss + @plugin daisyui
```

---

## Couche algorithmique (`src/lib/`)

### `types.ts`

Interfaces partagées entre la cinématique et les composants :

- `Vec2` — point 2D
- `ArmConfig` — constantes du bras (L1, L2, origin)
- `ArmState` — état courant (theta1, theta2, v1, v2)

### `kinematics.ts`

Fonctions pures, zéro import Svelte :

| Fonction                                    | Description                                  |
| ------------------------------------------- | -------------------------------------------- |
| `forwardKinematics(θ1, θ2, L1, L2, origin)` | Position articulation + effecteur            |
| `computeLoss(endEffector, target)`          | Loss = ½‖pos − cible‖²                       |
| `computeLossAt(θ1, θ2, ...)`                | Loss pour angles arbitraires (surface 3D)    |
| `gradientStep(state, target, ...)`          | Un pas de descente de gradient avec momentum |

Détails du pas de gradient :

- Rétropropagation analytique (règle de chaîne sur la cinématique directe)
- Gradient clipping (norme max = 10) contre les drags rapides
- Momentum avec friction (coeff. 0.96) pour la stabilité

### `lossLandscape.ts`

Helpers Three.js sans état Svelte :

| Fonction                                      | Description                                  |
| --------------------------------------------- | -------------------------------------------- |
| `createLossScene()`                           | Crée scène, caméra, maillage surface, sphère |
| `updateLossScene(objects, θ1, θ2, loss, ...)` | Met à jour les vertices + position sphère    |

La surface est une vue locale (±1 rad) centrée sur les angles courants.  
`Y = min(loss × 0.08, 100)` — le sol (Y=0) représente loss = 0.

---

## Composants Svelte 5

### `App.svelte` — chef d'orchestre

État réactif avec les runes `$state` :

```ts
let theta1 = $state(...)   // angles du bras
let theta2 = $state(...)
let v1 = 0; let v2 = 0    // velocités (non réactives, usage interne)
let target = $state(...)   // cible draggable
let learningRate = $state(0.00025)
let loss = $state(0)
let lossHistory = $state<number[]>([])
```

Boucle unique `requestAnimationFrame` dans `onMount` :

1. `gradientStep` → met à jour les angles
2. `forwardKinematics` + `computeLoss` → calcule le loss courant
3. `lossHistory.push(loss)` → suivi de convergence

### `ArmCanvas.svelte`

- Props : `theta1, theta2, L1, L2, origin, target`
- Callback : `ontargetchange(Vec2)`
- `$effect` redessine le canvas à chaque changement de props
- Listeners souris sur `window` (drag hors canvas géré correctement)

### `LossLandscape.svelte`

- Props : `theta1, theta2, loss, L1, L2, origin, target`
- `onMount` initialise Three.js, pose `isReady = true`
- `$effect` déclenché par `isReady` + props → update mesh + render

### `LossGraph.svelte`

- Props : `lossHistory`
- `$effect` redessine la courbe de convergence (rouge, 200 points)
- Axe Y auto-scaling sur le max de l'historique

### `Controls.svelte`

- DaisyUI `range range-primary` pour le learning rate
- DaisyUI `btn btn-error` pour le reset
- Callbacks : `onlearningratechange`, `onreset`

### `Metrics.svelte`

- DaisyUI `stats stats-vertical` sur fond `bg-neutral`
- 3 stats : Loss (rouge), θ₁ Épaule (bleu), θ₂ Coude (bleu)

---

## Stack technique

| Outil           | Rôle                           |
| --------------- | ------------------------------ |
| Vite 6          | Build + dev server             |
| Svelte 5        | Framework réactif (runes)      |
| TypeScript      | Typage strict                  |
| Tailwind CSS v4 | Utilitaires CSS                |
| DaisyUI v5      | Composants UI                  |
| Three.js        | Rendu 3D de la surface de loss |

Configuration Tailwind v4 (CSS-based, pas de `tailwind.config.js`) :

```css
@import 'tailwindcss';
@plugin "daisyui";
```

---

## Déploiement

GitHub Actions → GitHub Pages (branche `main`, dossier `dist/`).  
Domaine custom conservé via `CNAME` (`bras-robot.nwolff.info`).

Le workflow build avec `npm run build` et publie `dist/` via `actions/deploy-pages`.
