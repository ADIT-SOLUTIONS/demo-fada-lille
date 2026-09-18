import { ADRESSE, CONTACT, RESEAUX } from '../data/infos'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grille">
          <div className="footer__marque">
            <Logo className="footer__logo" />
            <p>Dining · Drinking · Dancing</p>
            <p className="footer__devise">FADA is the New Siècle.</p>
          </div>

          <div>
            <h2 className="footer__titre">Adresse</h2>
            <p>
              {ADRESSE.rue}
              <br />
              {ADRESSE.cp} {ADRESSE.ville}
              <br />
              {ADRESSE.repere}
            </p>
          </div>

          <div>
            <h2 className="footer__titre">Contact</h2>
            <ul className="footer__liens">
              <li>
                <a href={`tel:${CONTACT.telephoneLien}`}>{CONTACT.telephone}</a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="footer__titre">Suivre</h2>
            <ul className="footer__liens">
              <li>
                <a href={RESEAUX.instagram.url} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
              <li>
                <a href={RESEAUX.tiktok.url} target="_blank" rel="noopener noreferrer">
                  TikTok
                </a>
              </li>
              <li>
                <a href={RESEAUX.facebook.url} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="footer__moderation">L’abus d’alcool est dangereux pour la santé, à consommer avec modération.</p>

        <div className="footer__bas">
          <p>© {new Date().getFullYear()} FADA, Lille</p>
          <p>
            Site réalisé par{' '}
            <a href="https://aditsolutions.be/" target="_blank" rel="noopener noreferrer">
              AD IT Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
