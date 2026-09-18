import Header from './components/Header'
import Hero from './components/Hero'
import Maison from './components/Maison'
import Carte from './components/Carte'
import Lieu from './components/Lieu'
import Soirees from './components/Soirees'
import Infos from './components/Infos'
import Reserver from './components/Reserver'
import Footer from './components/Footer'
import { useReveal } from './hooks/useReveal'

export default function App() {
  useReveal()

  return (
    <>
      <a href="#contenu" className="lien-evitement">
        Aller au contenu
      </a>
      <Header />
      <main id="contenu">
        <Hero />
        <Maison />
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
