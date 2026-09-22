import { FiBell, FiChevronDown, FiUser } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { usePortalData } from '../data/usePortalData.js'
import './Topbar.css'

function Topbar() {
  const { backendStatus, error } = usePortalData()
  const connected = backendStatus === 'connected'
  return <header className="topbar"><div className="topbar-context"><span className="topbar-eyebrow">Operations workspace</span><span className={`topbar-status ${connected ? 'topbar-status-online' : 'topbar-status-offline'}`} title={error || 'MongoDB API connected'}><i /> {connected ? 'Plant systems online' : backendStatus === 'connecting' ? 'Connecting to API' : 'Demo data mode'}</span></div><div className="topbar-actions"><Link className="topbar-notifications" to="/notifications" title="Open notifications" aria-label="Open notifications"><FiBell /><span>3</span></Link><div className="topbar-user"><span className="topbar-avatar"><FiUser /></span><span className="topbar-user-copy"><strong>System Admin</strong><small>Administrator</small></span><FiChevronDown className="topbar-chevron" /></div></div></header>
}

export default Topbar