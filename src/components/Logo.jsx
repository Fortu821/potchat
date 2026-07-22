// src/components/Logo.jsx
import { Link } from 'react-router-dom'
import iconSvg from '../assets/potchat_icon.svg'
import nameSvg from '../assets/potchat_name.svg'

export default function Logo({ variant = 'full', className = '', style = {} }) {
  const logoSrc = variant === 'full' ? nameSvg : iconSvg
  const altText = variant === 'full' ? 'PotChat' : 'PotChat icon'

  return (
    <Link to="/" className={`logo-link ${className}`} style={style}>
      <img src={logoSrc} alt={altText} className="logo-image" />
    </Link>
  )
}