# Mesures de fluidité à froid

Mesures du 2026-09-18 sur le build de production (`npm run build` puis `npm run preview`), avec `npm run mesure`
(`scripts/mesure-fluidite.mjs`). Détail brut : `docs/mesures-fluidite.json`.

## Méthode

- Chaque scénario lance un Chrome neuf avec un profil vierge : ni cache HTTP, ni cache de shaders.
- Puce graphique : ANGLE (Intel, Intel(R) Arc(TM) Pro Graphics (0x00007D55) Direct3D11 vs_5_0 ps_5_0, D3D11) (puce intégrée au processeur).
- La page est chargée, on attend qu'elle soit prête (scène 3D comprise), puis on la fait défiler de haut en bas
  à vitesse constante (1 500 px/s sur ordinateur, 1 100 px/s sur mobile), en relevant la durée de chaque image.
- « Mobile » : écran 390 × 844, densité 3, tactile, processeur ralenti 4 fois (téléphone de milieu de gamme simulé).
  La puce graphique reste celle de l'ordinateur : c'est une approximation, à confirmer sur de vrais téléphones.
- Un « gel » est une image de plus de 50 ms. À 60 Hz, une image normale dure 16,7 ms.

## Défilement

| Scénario | Page | Images/s | Médiane | 95 % | 99 % | Pire image | Gels > 50 ms | Tâches longues |
|---|---|---|---|---|---|---|---|---|
| Démo (/), version 1 puis 2 | `/v1/` | 59 | 16,7 ms | 17,3 ms | 33,2 ms | 49,8 ms | 0 | 0 |
| Démo (/), version 1 puis 2 | `/v2/` | 58,8 | 16,7 ms | 17 ms | 17,1 ms | 133,1 ms | 1 | 0 |
| Version 2 immersive, ordinateur | `/v2/` | 58,2 | 16,7 ms | 17,1 ms | 33,4 ms | 50,1 ms | 1 | 0 |
| Version 2 immersive, mobile (processeur ralenti ×4) | `/v2/` | 49,3 | 16,7 ms | 33,4 ms | 50,1 ms | 400,3 ms | 9 | 0 |
| Version 1 classique, ordinateur | `/v1/` | 59,9 | 16,7 ms | 16,9 ms | 17,1 ms | 17,1 ms | 0 | 0 |
| Version 1 classique, mobile (processeur ralenti ×4) | `/v1/` | 59,3 | 16,7 ms | 16,9 ms | 17 ms | 66,8 ms | 1 | 0 |

## Chargement

| Scénario | Prête après | Tâches longues | Plus longue |
|---|---|---|---|
| Démo (/), version 1 puis 2 | 4,5 s | 4 | 222 ms |
| Version 2 immersive, ordinateur | 1,6 s | 2 | 366 ms |
| Version 2 immersive, mobile (processeur ralenti ×4) | 4,9 s | 10 | 1871 ms |
| Version 1 classique, ordinateur | 0,9 s | 2 | 236 ms |
| Version 1 classique, mobile (processeur ralenti ×4) | 5,1 s | 6 | 1852 ms |

## Lecture

- **Ordinateur, puce intégrée** : 58 à 60 images/s dans les deux versions et dans la démo, aucune tâche longue pendant
  le défilement. La version immersive a une image isolée au-dessus de 50 ms par parcours (133 ms au pire, dans la démo).
- **Scène 3D** : préparée et compilée pendant le chargement ; pendant le défilement, aucune tâche longue n'est relevée.
  Aucune erreur ni avertissement dans la console, dans aucun scénario.
- **Mobile simulé** : la version classique défile à 59 images/s. La version immersive tient 49 images/s en moyenne,
  avec quelques à-coups isolés qui changent de place d'une mesure à l'autre. Le plus net relevé coïncide avec
  l'arrivée du plan OpenStreetMap intégré (cadre externe créé à l'approche de la section).
- **Chargement** : les tâches longues relevées ont lieu pendant le premier affichage (lecture du JavaScript),
  avant toute interaction. Dans la démo, elles sont cachées derrière l'écran de chargement.

## Pistes si besoin

- Remplacer le plan intégré par une image fixe cliquable qui ouvre le plan interactif (plus léger, et aucun
  contenu tiers chargé avant un clic).
- Vérifier sur un vrai téléphone Android de milieu de gamme et sur un iPhone.
