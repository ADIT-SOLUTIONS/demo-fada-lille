# FADA Lille, démo de site (`demo-fada-lille`)

Démo proactive en deux versions pour FADA, restaurant festif, bar et terrasse sur deux étages au 10 rue de Pas à Lille, en face du Nouveau Siècle (prospect, groupe Social Group comme Amor Amor). Terminée le 2026-09-18 et en ligne ; sert aussi de référence technique pour la 3D fluide.

## Contexte AD IT Solutions
- Prospect : FADA (slug `fada-lille`). Fiche et fichiers : Drive ADIT Operations, `02-prospects/fada-lille/` : fiche `CLAUDE.md`, 21 photos de la galerie officielle dans `02-recu-du-client/galerie-officielle/` (droits non réglés). Recherche sourcée : `docs/recherche.md` du dépôt.
- Drive ADIT Operations : `G:\Shared drives\ADIT Operations` chez Jules (Windows), `~/Library/CloudStorage/GoogleDrive-<adresse>/Shared drives/ADIT Operations` chez Achille (Mac).
- Clone local : `C:\dev\demo-fada-lille` chez Jules, `~/dev/demo-fada-lille` chez Achille.
- Méthode : skill `adit:demo-prospect` (démo en deux versions) et `adit:site-vitrine`.

## Stack et commandes
- Vite 8, React 19, TypeScript 5.9, GSAP 3 (`@gsap/react`), Three.js 0.186, polices Fontsource (Anybody, DM Sans, Instrument Serif), `playwright-core` pour la mesure.
- `npm ci`, `npm run dev` (port 5217), `npm run build` (tsc puis vite, sortie `dist/` : `/`, `/v1/`, `/v2/`), `npm run preview -- --port 5218`, `npm run mesure` (fluidité à froid, résultats dans `docs/mesures-fluidite.md`).
- Python : `scripts/images.py` (photos en WebP), `scripts/logo-fada.py` (tracé du logo).
- Pas de `.node-version`.

## Branches et déploiement
- `demo-versions` (par défaut) : seule branche sur GitHub. `docs/demo-versions.md` cite aussi `main` (classique seule) et `version-immersive` (immersive seule), absentes du dépôt distant [À CONFIRMER : jamais poussées ou perdues].
- Render : service statique `fada-lille`, branche `demo-versions`, build `npm ci --include=dev && npm run build`, publié `dist`, https://fada-lille.onrender.com (répond 200 le 2026-10-26).
- ATTENTION : chaque commit poussé sur `demo-versions` est mis en ligne automatiquement.
- `render.yaml` nomme le service `fada-lille-demo`, alors que le service existant s'appelle `fada-lille` : appliquer le Blueprint risque de créer un second service.
- Render affiche déjà le dépôt `ADIT-SOLUTIONS/demo-fada-lille` ; la fiche et la carte des dépôts le disent encore relié à l'ancien dépôt [À CONFIRMER].

## Structure du code
- `index.html` et `selecteur/` : page de démo. L'enseigne FADA se trace puis s'allume pendant le chargement, pastille en bas à gauche, `/#2` ouvre la v2.
- `src/` : version 1 classique « Carte FADA », dont la v2 reprend les sections (`Carte.tsx`, `Soirees.tsx`, `Statut.tsx`...) sauf `Maison.tsx`.
- `src/data/infos.ts` : données partagées par les deux versions (adresse, accès, réservation, cartes PDF, horaires, carte, menu de groupe). Aussi `logo-trace.ts`, `photos.ts`, `src/utils/envoi.ts` (formulaire), `src/utils/horaires.ts`.
- `src-v2/` : version 2 immersive « Nuit ambrée », qui reprend les sections de `src/` avec sa feuille de style et remplace « La maison » par la séquence 3D du lustre de chaînes (`src-v2/components/Lustre.tsx` et `src-v2/components/lustre/`).
- Sources : photos fournies dans `sources/`, cartes PDF officielles du 24/06/2026 dans `sources/cartes/`, logo et motif zèbre dans `sources/marque/`.

## Décisions et points d'attention
- Identité reprise du lieu : brique `#8B2704`, crème beurre `#F3F3CB`, motif tigré, grotesque très grasse pour les noms, serif italique pour les prix.
- Séquence 3D : la caméra part de la mezzanine, traverse le rideau de chaînes et finit face à l'enseigne néon.
- Fluidité (leçons de Maï-Taï) : pas de PMREM, éclairage par sommet dans un shader maison, brins en instances, `compileAsync`, résolution adaptative, photo du vrai lustre en repli.
- Mesure : la v2 tient 49 images/s en mobile simulé, avec des à-coups liés au plan OpenStreetMap intégré. Piste : image fixe cliquable à la place du plan.
- Horaires : quatre versions divergentes (site, Google, TripAdvisor), à faire confirmer.
- Placeholders : `[DOMAINE]`, `[URL_FORMSPREE]`. Quartier à afficher et crédits photo non trouvés.
- `NOM_COMPLET` dans `src/data/infos.ts` contient un tiret demi-cadratin (nom de la marque) : à garder ou non [À CONFIRMER].
- Ne pas recopier les mentions légales de fadalille.fr : elles affichent le SIRET d'une autre société.
- Pages en `noindex` (et `X-Robots-Tag`) : à retirer pour le site définitif. Pas de réécriture de toutes les adresses vers `/index.html`.
- Dépôt public : toujours présenter la démo comme un concept, droits sur logo et photos à régulariser.

## Règles AD IT Solutions
- Diagnostic avant action : répondre aux questions sans modifier le code, attendre le feu vert avant d'implémenter.
- Textes : jamais de tiret cadratin « — », pas de tournures « trop IA », aucune donnée inventée (placeholder `[À COMPLÉTER : …]`).
- Aucun secret dans le dépôt.
- Fin de travail : résumé court (fait, placeholders restants, à vérifier) et mise à jour de ce fichier si une décision change.
