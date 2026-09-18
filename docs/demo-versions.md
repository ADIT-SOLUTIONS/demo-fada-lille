# Démo des maquettes (branche `demo-versions`)

Un seul déploiement pour présenter les deux versions du site aux gérants de FADA.

| Adresse | Rôle | Code |
|---|---|---|
| `/` | Page de démo : écran de chargement, les deux versions, pastille de choix | `index.html`, `selecteur/` |
| `/v1/` | Version 1, Classique « Carte FADA » : identique à `main` | `src/` |
| `/v2/` | Version 2, Immersive « Nuit ambrée » : identique à `version-immersive` | `src-v2/` (+ composants de `src/`) |

## Branches

- `main` : version classique seule, servie à `/`.
- `version-immersive` : version immersive seule, servie à `/`. Elle réutilise les sections de `src/` (même contenu,
  mêmes données `src/data/infos.ts`) avec sa propre feuille de style, et remplace « La maison » par la séquence 3D.
- `demo-versions` : les deux, plus la page de démo.

## Version immersive

- Accueil : enseigne néon tracée sur le contour du logo officiel, décor en parallaxe (photo, halos, brins de chaînes).
- « Deux étages, deux ambiances » : section épinglée, lustre de chaînes en Three.js (`src-v2/components/lustre/`).
  La caméra part de la mezzanine, les ampoules s'allument, elle traverse le rideau de chaînes, sort au-dessus du bar
  et finit en contre-plongée face à l'enseigne néon.
- Titres qui basculent ligne par ligne, photos en relief (pointeur sur ordinateur, défilement sur écran tactile),
  colonnes de photos en parallaxe.

### Fluidité (leçons reprises de Maï-Taï)

- Aucun calcul d'environnement au chargement (pas de PMREM) : éclairage des chaînes évalué par sommet dans un shader maison.
- Scène construite par étapes (la main est rendue au navigateur entre chacune), shaders compilés en parallèle
  (`compileAsync`, extension `KHR_parallel_shader_compile`) et premier rendu à blanc avant l'affichage.
- Tous les brins de chaîne en un seul appel de dessin (instances), halos en quads additifs, pas de post-traitement.
- Définition adaptative : la résolution baisse par paliers si les images s'espacent.
- Rendu seulement quand la section est à l'écran, et jamais quand la version est cachée derrière l'autre dans la démo.
- Perte du contexte WebGL : photo du vrai lustre, puis reconstruction à la restauration.
- Sans WebGL, avec « réduire les animations » ou sur un écran trop bas : photo du vrai lustre et textes à la suite.

## Fonctionnement de la démo

- `index.html` + `selecteur/selecteur.ts` : ouvre `/v1/` et `/v2/` dans deux cadres plein écran superposés,
  l'enseigne FADA se trace au fil du chargement puis s'allume, puis la version 1 s'affiche (ou la 2 avec l'adresse `/#2`).
- `selecteur/cadre.ts`, chargé par chaque version : force le chargement immédiat des images et du plan,
  attend les polices et la scène 3D, envoie sa progression à la démo, et obéit à ses commandes
  (retour en haut, version cachée ou visible). Ouverte seule, une version fonctionne normalement.
- Changer de version remonte la version choisie en haut de page puis l'affiche : rien n'est rechargé.
  La version cachée met ses animations en pause.
- La pastille (bas à gauche, 30 % d'opacité) se masque pendant le chargement et quand le menu mobile est ouvert.

## Mise en ligne sur Render

- Site statique : `render.yaml` à la racine (Blueprint). Sinon, à la main : commande de build `npm ci && npm run build`,
  dossier publié `dist`.
- Ne pas ajouter de règle de réécriture de toutes les adresses vers `/index.html` : `/v1/` et `/v2/` sont de vraies pages.
- Les pages ont une balise `noindex` (et l'en-tête `X-Robots-Tag` sur Render) pour que la démo n'apparaisse pas
  dans Google : elles ne doivent pas être reprises sur le site définitif.
