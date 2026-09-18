import { MAILLON, NB_AMPOULES, RAYON_SALLE } from './disposition'

/*
  Shaders maison du lustre. Pas d'environnement calculé ni de post-traitement : l'éclairage des chaînes est
  évalué par sommet (une vingtaine d'ampoules), les halos sont de simples quads additifs.
  Toutes les sorties passent par la même tonalité (ACES) et la même conversion sRGB que le reste de three.js.
*/

const n = (x: number) => x.toFixed(3)

/** Angles (radians) des murs particuliers de la salle. */
export const ANGLE_NEON = -1.75
export const ANGLE_BAR = -2.6

const COMMUN = /* glsl */ `
  #define NB ${NB_AMPOULES}
  uniform vec3 uAmpoules[NB];
  uniform float uIntensites[NB];
  uniform float uTemps;
  uniform float uSalle;
  uniform vec3 uBrouillard;
  uniform float uDensite;

  vec3 brouiller(vec3 c, float d) {
    return mix(c, uBrouillard, 1.0 - exp(-d * d * uDensite));
  }
`

const SORTIE = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`

/* Chaînes ------------------------------------------------------------------------------------ */

export const chaineVertex = /* glsl */ `
  ${COMMUN}
  uniform float uBalancement;
  attribute vec4 aBrin;   // x, haut, z, longueur
  attribute float aPhase;
  varying vec3 vDiffus;
  varying vec3 vSpec;
  varying float vMetres;
  varying float vPhase;
  varying float vDistance;

  void main() {
    float s = -position.y;
    float L = aBrin.w;
    vec3 axe = vec3(aBrin.x, aBrin.y - s * L, aBrin.z);
    // Balancement de pendule, plus ample vers le bas
    float amplitude = uBalancement * 0.04 * s * s * L;
    axe.x += amplitude * sin(uTemps * 0.85 + aPhase);
    axe.z += amplitude * cos(uTemps * 0.63 + aPhase * 1.7);

    vec3 normale = normalize(vec3(position.x, 0.0, position.z));
    vec3 monde = axe + vec3(position.x, 0.0, position.z);
    vec3 vue = normalize(cameraPosition - monde);

    vec3 diffus = vec3(0.0);
    vec3 spec = vec3(0.0);
    for (int i = 0; i < NB; i++) {
      float intensite = uIntensites[i];
      if (intensite < 0.001) continue;
      vec3 l = uAmpoules[i] - monde;
      float d2 = dot(l, l);
      l *= inversesqrt(d2);
      float attenuation = intensite / (1.0 + d2 * 2.6);
      diffus += attenuation * (0.3 + 0.7 * max(dot(normale, l), 0.0));
      spec += attenuation * pow(max(dot(normale, normalize(l + vue)), 0.0), 26.0);
    }
    // Lumière de la salle renvoyée par les murs, et faible lueur quand tout est éteint
    diffus += uSalle * 0.06 + 0.03;
    spec += 0.07 * pow(max(dot(normale, normalize(vec3(0.6, 0.3, 0.7) + vue)), 0.0), 12.0);

    vDiffus = diffus;
    vSpec = spec;
    vMetres = s * L;
    vPhase = aPhase;
    vec4 mv = viewMatrix * vec4(monde, 1.0);
    vDistance = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

export const chaineFragment = /* glsl */ `
  ${COMMUN}
  uniform float uReflets;
  uniform vec3 uOr;
  varying vec3 vDiffus;
  varying vec3 vSpec;
  varying float vMetres;
  varying float vPhase;
  varying float vDistance;

  void main() {
    // Brins qui frôlent la caméra : effacés en trame fine plutôt que de remplir l'écran
    float proche = smoothstep(0.1, 0.45, vDistance);
    if (proche < 1.0 && fract(52.9829 * fract(dot(gl_FragCoord.xy, vec2(0.06711, 0.00584)))) > proche) discard;
    float m = vMetres / ${n(MAILLON)};
    float f = fract(m);
    // Maillons : creux aux jointures, un maillon sur deux vu de profil
    float maillon = smoothstep(0.0, 0.3, f) * smoothstep(1.0, 0.7, f);
    float profil = mod(floor(m), 2.0);
    float brillance = mix(0.5, 1.0, maillon) * mix(1.0, 0.78, profil);
    // Reflets qui courent le long des chaînes
    float reflet = pow(max(0.0, sin(vMetres * 6.5 - uTemps * 2.2 + vPhase * 5.0)), 22.0) * uReflets;
    vec3 c = uOr * vDiffus * brillance;
    c += uOr * 1.8 * vSpec * (0.25 + 1.3 * maillon) * (1.0 + 2.5 * reflet);
    c += vec3(1.0, 0.78, 0.5) * reflet * vSpec * 1.5;
    gl_FragColor = vec4(brouiller(c, vDistance), 1.0);
    ${SORTIE}
  }
`

/* Anneaux et métal ----------------------------------------------------------------------------- */

export const surfaceVertex = /* glsl */ `
  varying vec3 vMonde;
  varying vec3 vNormale;
  varying float vDistance;
  void main() {
    vec4 monde = modelMatrix * vec4(position, 1.0);
    vMonde = monde.xyz;
    vNormale = normalize(mat3(modelMatrix) * normal);
    vec4 mv = viewMatrix * monde;
    vDistance = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

/** Surface mate éclairée par le lustre dans son ensemble (dalle de la mezzanine, anneaux, plafond). */
export const surfaceFragment = /* glsl */ `
  ${COMMUN}
  uniform vec3 uCouleur;
  uniform float uBrillance;
  varying vec3 vMonde;
  varying vec3 vNormale;
  varying float vDistance;

  void main() {
    vec3 centre = vec3(0.0, 4.2, 0.0);
    vec3 l = centre - vMonde;
    float d2 = dot(l, l);
    l *= inversesqrt(d2);
    vec3 vue = normalize(cameraPosition - vMonde);
    vec3 nrm = normalize(vNormale);
    if (dot(nrm, vue) < 0.0) nrm = -nrm;
    float lumiere = uSalle * 6.0 / (1.0 + d2 * 0.45);
    vec3 c = uCouleur * (lumiere * (0.25 + 0.75 * max(dot(nrm, l), 0.0)) + 0.01);
    c += uCouleur * uBrillance * lumiere * pow(max(dot(nrm, normalize(l + vue)), 0.0), 30.0);
    gl_FragColor = vec4(brouiller(c, vDistance), 1.0);
    ${SORTIE}
  }
`

/* Murs : terracotta, niches en arc, rideau rouge du néon, mur de carreaux lumineux du bar ------- */

export const murFragment = /* glsl */ `
  ${COMMUN}
  uniform vec3 uCouleur;
  uniform float uNiches;
  uniform float uBar;
  uniform float uNeon;
  varying vec3 vMonde;
  varying vec3 vNormale;
  varying float vDistance;

  float ecartAngle(float a, float b) {
    float d = a - b;
    return atan(sin(d), cos(d));
  }

  void main() {
    vec3 p = vMonde;
    float angle = atan(p.z, p.x);
    vec3 nrm = -normalize(vec3(p.x, 0.0, p.z));
    vec3 centre = vec3(0.0, 4.0, 0.0);
    vec3 l = centre - p;
    float d2 = dot(l, l);
    float lumiere = uSalle * 7.0 / (1.0 + d2 * 0.3) * (0.3 + 0.7 * max(dot(nrm, normalize(l)), 0.0));
    // Enduit à la chaux : légères variations
    float grain = 0.9 + 0.1 * sin(angle * 37.0 + p.y * 5.0) * sin(angle * 11.0 - p.y * 3.0);
    vec3 c = uCouleur * grain * (lumiere + 0.02);

    // Rideau rouge derrière le néon (rez-de-chaussée)
    float dNeon = ecartAngle(angle, ${n(ANGLE_NEON)}) * ${n(RAYON_SALLE)};
    float rideau = step(abs(dNeon), 1.9) * step(p.y, 2.95);
    float plis = 0.55 + 0.45 * sin(dNeon * 16.0 + sin(dNeon * 3.0) * 1.5);
    vec3 velours = vec3(0.5, 0.03, 0.02) * plis * (lumiere * 0.7 + uNeon * 1.3 * exp(-pow(p.y - 2.3, 2.0) * 0.8) + 0.01);
    c = mix(c, velours, rideau);

    // Mur de carreaux lumineux derrière le bar
    float dBar = ecartAngle(angle, ${n(ANGLE_BAR)}) * ${n(RAYON_SALLE)};
    float zoneBar = step(abs(dBar), 1.6) * step(0.15, p.y) * step(p.y, 2.85);
    vec2 cel = vec2(dBar, p.y) / 0.54;
    vec2 g = abs(fract(cel) - 0.5);
    float cadre = smoothstep(0.43, 0.49, max(g.x, g.y));
    vec3 carreaux = vec3(1.0, 0.5, 0.18) * (cadre * 3.2 + 0.18) * uBar;
    c += carreaux * zoneBar;

    // Niches en arc rétroéclairées, à l'étage
    float cellule = ${n((Math.PI * 2 * RAYON_SALLE) / 12)};
    float u = (fract(angle / 6.28318 * 12.0 + 0.25) - 0.5) * cellule;
    float y = p.y - 3.75;
    float largeur = 0.36;
    float dans = step(abs(u), largeur) * step(0.0, y) * step(y, 1.1);
    float arche = step(length(vec2(u, y - 1.1)), largeur) * step(1.1, y);
    float niche = max(dans, arche);
    float bord = max(
      step(abs(u), largeur + 0.05) * step(-0.05, y) * step(y, 1.1),
      step(length(vec2(u, y - 1.1)), largeur + 0.05) * step(1.1, y)
    ) - niche;
    float horsZones = step(1.0, abs(ecartAngle(angle, ${n(ANGLE_NEON)}))) * step(1.0, abs(ecartAngle(angle, ${n(ANGLE_BAR)})));
    c += (niche * vec3(0.9, 0.36, 0.12) * 0.55 + bord * vec3(1.0, 0.55, 0.25) * 2.4) * uNiches * horsZones;

    gl_FragColor = vec4(brouiller(c, vDistance), 1.0);
    ${SORTIE}
  }
`

/* Sol du bar : parquet sombre et brillant, flaques de lumière et reflets des ampoules ------------ */

export const solFragment = /* glsl */ `
  ${COMMUN}
  uniform float uNeon;
  uniform float uBar;
  varying vec3 vMonde;
  varying vec3 vNormale;
  varying float vDistance;

  void main() {
    vec3 p = vMonde;
    vec3 vue = normalize(cameraPosition - p);
    vec3 r = reflect(-vue, vec3(0.0, 1.0, 0.0));
    float lames = 0.85 + 0.15 * sin(p.x * 9.0 + sin(p.z * 1.3) * 2.0);
    vec3 bois = vec3(0.16, 0.05, 0.022) * lames;
    vec3 lumiere = vec3(0.0);
    vec3 reflets = vec3(0.0);
    for (int i = 0; i < NB; i++) {
      float intensite = uIntensites[i];
      if (intensite < 0.001) continue;
      vec3 a = uAmpoules[i];
      vec3 l = a - p;
      lumiere += intensite * vec3(1.0, 0.62, 0.3) / (1.0 + dot(l, l) * 0.9);
      vec3 miroir = normalize(vec3(a.x, -a.y, a.z) - p);
      reflets += intensite * vec3(1.0, 0.6, 0.28) * pow(max(dot(r, miroir), 0.0), 900.0) * 3.0;
    }
    vec3 c = bois * (lumiere * 0.9 + uSalle * 0.15 + 0.01) + reflets * 0.5;
    // Lueurs du néon et du bar au pied des murs
    vec2 neon = vec2(cos(${n(ANGLE_NEON)}), sin(${n(ANGLE_NEON)})) * ${n(RAYON_SALLE - 0.2)};
    c += vec3(0.7, 0.03, 0.02) * uNeon * exp(-dot(p.xz - neon, p.xz - neon) * 0.35) * 0.9;
    vec2 bar = vec2(cos(${n(ANGLE_BAR)}), sin(${n(ANGLE_BAR)})) * ${n(RAYON_SALLE - 0.2)};
    c += vec3(0.9, 0.4, 0.14) * uBar * exp(-dot(p.xz - bar, p.xz - bar) * 0.3) * 0.6;
    gl_FragColor = vec4(brouiller(c, vDistance), 1.0);
    ${SORTIE}
  }
`

/* Plafond ---------------------------------------------------------------------------------------- */

export const plafondFragment = /* glsl */ `
  ${COMMUN}
  varying vec3 vMonde;
  varying vec3 vNormale;
  varying float vDistance;
  void main() {
    float r2 = dot(vMonde.xz, vMonde.xz);
    vec3 c = vec3(0.3, 0.1, 0.04) * (uSalle * 1.4 * exp(-r2 * 0.25) + uSalle * 0.12 + 0.005);
    gl_FragColor = vec4(brouiller(c, vDistance), 1.0);
    ${SORTIE}
  }
`

/* Garde-corps vitré de la mezzanine ----------------------------------------------------------- */

export const vitreFragment = /* glsl */ `
  ${COMMUN}
  varying vec3 vMonde;
  varying vec3 vNormale;
  varying float vDistance;
  void main() {
    vec3 vue = normalize(cameraPosition - vMonde);
    float fresnel = pow(1.0 - abs(dot(normalize(vNormale), vue)), 3.0);
    float haut = smoothstep(0.93, 1.0, (vMonde.y - 3.2) / 1.0);
    vec3 c = vec3(1.0, 0.6, 0.3) * (fresnel * 0.35 + haut * 0.8) * (uSalle * 0.6 + 0.02);
    gl_FragColor = vec4(c, 1.0);
    ${SORTIE}
  }
`

/* Ampoules tubes à filament --------------------------------------------------------------------- */

export const ampouleVertex = /* glsl */ `
  ${COMMUN}
  varying vec3 vNormale;
  varying vec3 vVue;
  varying float vIntensite;
  varying float vY;
  varying float vDistance;
  void main() {
    vec3 monde = uAmpoules[gl_InstanceID] + position;
    vNormale = normal;
    vVue = normalize(cameraPosition - monde);
    vIntensite = uIntensites[gl_InstanceID];
    vY = position.y;
    vec4 mv = viewMatrix * vec4(monde, 1.0);
    vDistance = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

export const ampouleFragment = /* glsl */ `
  ${COMMUN}
  varying vec3 vNormale;
  varying vec3 vVue;
  varying float vIntensite;
  varying float vY;
  varying float vDistance;
  void main() {
    float face = abs(dot(normalize(vNormale), vVue));
    float filament = smoothstep(0.7, 1.0, face) * (0.75 + 0.25 * sin(vY * 260.0));
    vec3 eteinte = vec3(0.05, 0.035, 0.025) + vec3(0.25, 0.18, 0.12) * pow(1.0 - face, 3.0) * 0.3;
    vec3 allumee = vec3(1.0, 0.52, 0.2) * (1.6 + 9.0 * filament);
    vec3 c = mix(eteinte, allumee, vIntensite);
    gl_FragColor = vec4(brouiller(c, vDistance * 0.6), 1.0);
    ${SORTIE}
  }
`

/* Halos des ampoules (quads additifs toujours face à la caméra) ----------------------------------- */

export const haloVertex = /* glsl */ `
  ${COMMUN}
  uniform float uTaille;
  uniform vec3 uCentre;
  uniform float uTailleCentre;
  varying vec2 vUv;
  varying float vIntensite;
  varying float vCentre;
  void main() {
    vec3 c;
    float intensite;
    float taille;
    if (gl_InstanceID < NB) {
      c = uAmpoules[gl_InstanceID];
      intensite = uIntensites[gl_InstanceID];
      taille = uTaille;
      vCentre = 0.0;
    } else {
      c = uCentre;
      intensite = uSalle;
      taille = uTailleCentre;
      vCentre = 1.0;
    }
    vec4 mv = viewMatrix * vec4(c, 1.0);
    // Près de la caméra, le halo rétrécit : pas de grand quad plein écran à remplir
    float proche = clamp(-mv.z / 2.2, 0.25, 1.0);
    vec2 forme = vCentre > 0.5 ? vec2(1.0, 1.35) : vec2(0.75, 1.3);
    mv.xy += position.xy * taille * forme * proche * (0.55 + 0.45 * intensite);
    vUv = uv;
    vIntensite = intensite;
    gl_Position = projectionMatrix * mv;
  }
`

export const haloFragment = /* glsl */ `
  uniform float uForce;
  varying vec2 vUv;
  varying float vIntensite;
  varying float vCentre;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    if (d >= 1.0) discard;
    float a = vCentre > 0.5
      ? pow(1.0 - d, 2.4) * 0.22
      : pow(1.0 - d, 2.2) * 0.55 + exp(-d * d * 40.0) * 0.8;
    vec3 c = vec3(1.0, 0.5, 0.2) * a * vIntensite * uForce;
    gl_FragColor = vec4(c, 1.0);
    ${SORTIE}
  }
`

/* Enseigne néon ------------------------------------------------------------------------------------ */

export const neonVertex = /* glsl */ `
  varying vec3 vNormale;
  varying vec3 vVue;
  void main() {
    vec4 monde = modelMatrix * vec4(position, 1.0);
    vNormale = normalize(mat3(modelMatrix) * normal);
    vVue = normalize(cameraPosition - monde.xyz);
    gl_Position = projectionMatrix * viewMatrix * monde;
  }
`

export const neonFragment = /* glsl */ `
  uniform float uNeon;
  uniform float uHalo;
  varying vec3 vNormale;
  varying vec3 vVue;
  void main() {
    float face = abs(dot(normalize(vNormale), vVue));
    vec3 c;
    if (uHalo > 0.5) {
      c = vec3(1.0, 0.08, 0.05) * pow(face, 2.5) * 0.55 * uNeon;
    } else {
      vec3 eteint = vec3(0.12, 0.03, 0.03) * (0.4 + 0.6 * face);
      vec3 allume = mix(vec3(1.0, 0.1, 0.06) * 3.0, vec3(1.0, 0.55, 0.5) * 5.0, pow(face, 4.0));
      c = mix(eteint, allume, uNeon);
    }
    gl_FragColor = vec4(c, 1.0);
    ${SORTIE}
  }
`

