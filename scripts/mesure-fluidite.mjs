// Mesure de fluidité « à froid » : chaque scénario lance un Chrome neuf (profil vierge : ni cache HTTP,
// ni cache de shaders), charge la page, attend qu'elle soit prête, puis la fait défiler de haut en bas
// à vitesse constante en relevant la durée de chaque image et les tâches longues du fil principal.
//
// Usage : npm run build && npm run preview -- --port 5218   puis   node scripts/mesure-fluidite.mjs [url]
import { chromium } from 'playwright-core'
import { writeFileSync } from 'node:fs'

const BASE = process.argv[2] ?? 'http://localhost:5218'

const ORDINATEUR = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }
const MOBILE = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36',
}

const SCENARIOS = [
  { nom: 'Démo (/), version 1 puis 2', chemin: '/', appareil: ORDINATEUR, demo: true },
  { nom: 'Version 2 immersive, ordinateur', chemin: '/v2/', appareil: ORDINATEUR },
  { nom: 'Version 2 immersive, mobile (processeur ralenti ×4)', chemin: '/v2/', appareil: MOBILE, ralenti: 4 },
  { nom: 'Version 1 classique, ordinateur', chemin: '/v1/', appareil: ORDINATEUR },
  { nom: 'Version 1 classique, mobile (processeur ralenti ×4)', chemin: '/v1/', appareil: MOBILE, ralenti: 4 },
]

/** Script injecté dans chaque document : relève les images et les tâches longues. */
function espion() {
  const journal = { images: [], taches: [] }
  window.__mesure = journal
  const boucle = (t) => {
    journal.images.push(t)
    requestAnimationFrame(boucle)
  }
  requestAnimationFrame(boucle)
  try {
    new PerformanceObserver((liste) => {
      for (const e of liste.getEntries()) journal.taches.push([e.startTime, e.duration])
    }).observe({ type: 'longtask', buffered: true })
  } catch {}
}

/** Défile toute la page à vitesse constante, en suivant le rythme de l'affichage. */
function defiler(vitesse) {
  return new Promise((resoudre) => {
    const debut = performance.now()
    const depart = window.scrollY
    const fin = document.documentElement.scrollHeight - window.innerHeight
    const pas = (t) => {
      const y = Math.min(fin, depart + ((t - debut) / 1000) * vitesse)
      window.scrollTo(0, y)
      if (y < fin) requestAnimationFrame(pas)
      else setTimeout(() => resoudre({ debut, fin: performance.now() }), 300)
    }
    requestAnimationFrame(pas)
  })
}

function statistiques(images, taches, debut, fin) {
  const t = images.filter((x) => x >= debut && x <= fin)
  const durees = t.slice(1).map((x, i) => x - t[i]).sort((a, b) => a - b)
  const q = (p) => (durees.length ? durees[Math.min(durees.length - 1, Math.floor(p * durees.length))] : 0)
  const longues = taches.filter(([s, d]) => s + d >= debut && s <= fin)
  const duree = (fin - debut) / 1000
  return {
    duree_s: +duree.toFixed(1),
    images: durees.length,
    ips: +(durees.length / duree).toFixed(1),
    mediane_ms: +q(0.5).toFixed(1),
    p95_ms: +q(0.95).toFixed(1),
    p99_ms: +q(0.99).toFixed(1),
    max_ms: +(durees.at(-1) ?? 0).toFixed(1),
    images_sup_34ms: durees.filter((d) => d > 34).length,
    gels_sup_50ms: durees.filter((d) => d > 50).length,
    taches_longues: longues.length,
    tache_max_ms: +Math.max(0, ...longues.map(([, d]) => d)).toFixed(0),
  }
}

async function mesurer(scenario) {
  const navigateur = await chromium.launch({
    channel: 'chrome',
    headless: false,
    // Fenêtre recouverte : Chrome ne doit pas ralentir l'affichage pendant la mesure
    args: ['--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding', '--disable-background-timer-throttling'],
  })
  const contexte = await navigateur.newContext(scenario.appareil)
  await contexte.addInitScript(espion)
  const page = await contexte.newPage()
  const erreurs = []
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && erreurs.push(m.text().slice(0, 160)))
  page.on('pageerror', (e) => erreurs.push(e.message))
  if (scenario.ralenti) {
    const cdp = await contexte.newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: scenario.ralenti })
  }

  const t0 = Date.now()
  await page.goto(BASE + scenario.chemin, { waitUntil: 'domcontentloaded' })
  let cible = page.mainFrame()
  if (scenario.demo) {
    await page.waitForSelector('#demo:not(.demo--chargement)', { state: 'attached', timeout: 90000 })
    await page.waitForTimeout(1400)
    cible = page.frames().find((f) => f.url().includes('/v1/'))
  } else {
    await page.waitForFunction(
      () => {
        const l = document.querySelector('.lustre')
        const pret = !l || !l.classList.contains('lustre--anime') || /lustre--(prete|sans-3d)/.test(l.className)
        return pret && document.readyState === 'complete'
      },
      null,
      { timeout: 90000 },
    )
    await page.waitForTimeout(500)
  }
  const pretApres = Date.now() - t0

  // Phase de chargement : images affichées entre le début et « prêt » (document principal)
  const chargement = await page.evaluate(() => {
    const { images, taches } = window.__mesure
    return { images, taches, fin: performance.now() }
  })
  const statsChargement = statistiques(chargement.images, chargement.taches, 0, chargement.fin)

  const resultats = { scenario: scenario.nom, pret_ms: pretApres, chargement: statsChargement, defilement: [] }
  const vitesse = scenario.appareil.isMobile ? 1100 : 1500
  const cadres = scenario.demo ? ['/v1/', '/v2/'] : [null]
  for (const chemin of cadres) {
    if (chemin === '/v2/') {
      await page.click('.selecteur-version__pastille')
      await page.click('.selecteur-version__choix[data-version="2"]')
      await page.waitForTimeout(800)
      cible = page.frames().find((f) => f.url().includes('/v2/'))
    }
    const { debut, fin } = await cible.evaluate(defiler, vitesse)
    const { images, taches } = await cible.evaluate(() => window.__mesure)
    resultats.defilement.push({ page: chemin ?? scenario.chemin, ...statistiques(images, taches, debut, fin) })
  }

  const gl = await (scenario.demo ? page.frames().find((f) => f.url().includes('/v2/')) : cible).evaluate(() => {
    const canvas = document.querySelector('.lustre__canvas')
    const c = document.createElement('canvas').getContext('webgl2')
    const info = c?.getExtension('WEBGL_debug_renderer_info')
    return {
      gpu: info ? c.getParameter(info.UNMASKED_RENDERER_WEBGL) : 'inconnu',
      definition_finale: canvas && canvas.clientWidth ? +(canvas.width / canvas.clientWidth).toFixed(2) : null,
    }
  })
  resultats.gpu = gl.gpu
  resultats.definition_3d_finale = gl.definition_finale
  resultats.erreurs_console = erreurs
  await navigateur.close()
  return resultats
}

const tous = []
for (const scenario of SCENARIOS) {
  const r = await mesurer(scenario)
  tous.push(r)
  console.log(JSON.stringify(r))
}
writeFileSync('docs/mesures-fluidite.json', JSON.stringify({ date: new Date().toISOString(), base: BASE, resultats: tous }, null, 2))
console.log('Résultats écrits dans docs/mesures-fluidite.json')
