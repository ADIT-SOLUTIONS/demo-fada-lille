import Header from '../src/components/Header'
import Carte from '../src/components/Carte'
import Lieu from '../src/components/Lieu'
import Soirees from '../src/components/Soirees'
import Infos from '../src/components/Infos'
import Reserver from '../src/components/Reserver'
import Footer from '../src/components/Footer'
import { useReveal } from '../src/hooks/useReveal'
import Hero from './components/Hero'
import Lustre from './components/Lustre'
import { useEffets } from './hooks/useEffets'

/*
  Version immersive « Nuit ambrée » : même contenu que la version classique (mêmes sections et mêmes données),
  habillage de nuit, accueil en néon, séquence 3D du lustre à la place de « La maison », parallaxe et relief.
*/
export default function App() {
  useReveal()
  useEffets()

  return (
    <>
      <a href="#contenu" className="lien-evitement">
        Aller au contenu
      </a>
      <Header />
      <main id="contenu">
        <Hero />
        <Lustre />
        <Carte />
        <Lieu />
        <Soirees />
        <Infos />
        <Reserver />
      </main>
      <Footer />
    </>
  )
}
