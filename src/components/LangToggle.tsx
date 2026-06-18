import { useTranslation } from 'react-i18next'
import '../styles/lang-toggle.css'
import { Season } from '../hooks/useSeason'



interface Props {
  activeSeason: Season
  onSwitch: (season: Season) => void;
}
export function LangToggle({activeSeason,onSwitch}:Props) {
  const { i18n } = useTranslation()
  const isSr = i18n.language === 'sr'

  return (
    <button
      className={`lang-toggle ${activeSeason} `}
      onClick={() => i18n.changeLanguage(isSr ? 'en' : 'sr')}
      aria-label="Switch language"
    >
      <span className={`lang-toggle-option ${isSr ? '' : 'lang-toggle-option--active'}`}>EN</span>
      <span className="lang-toggle-divider">|</span>
      <span className={`lang-toggle-option ${isSr ? 'lang-toggle-option--active' : ''}`}>SR</span>
    </button>
  )
}
