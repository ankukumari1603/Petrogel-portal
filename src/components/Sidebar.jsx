import { NavLink } from 'react-router-dom'
import {
  FiHome,
  FiFileText,
  FiCheckSquare,
  FiClipboard,
  FiUnlock,
  FiBarChart2,
  FiSettings,
  FiDroplet,
  FiSearch,
  FiActivity,
  FiGitBranch,
  FiBell,
  FiFile,
  FiUsers,
  FiPackage,
  FiDatabase,
  FiShare2,
  FiTrendingUp,
  FiBox,
  FiBookOpen,
  FiAlertCircle,
} from 'react-icons/fi'
import './Sidebar.css'

const navItems = [
  { to: '/', label: 'Dashboard', icon: FiHome, end: true },
  { to: '/customers', label: 'Customers', icon: FiUsers },
  { to: '/products', label: 'Products', icon: FiPackage },
  { to: '/formulations', label: 'Formulations', icon: FiBookOpen },
  { to: '/production-management', label: 'Production', icon: FiBox },
  { to: '/inventory', label: 'Inventory', icon: FiDatabase },
  { to: '/requirements', label: 'Customer Requirements', icon: FiClipboard },
  { to: '/production', label: 'Production Instruction', icon: FiFileText },
  { to: '/setup-audit', label: 'Setup Audit', icon: FiClipboard },
  { to: '/random-checks', label: 'Random Checks', icon: FiSearch },
  { to: '/pellet-machine-reading', label: 'Pellet Machine Reading', icon: FiActivity },
  { to: '/qc', label: 'Quality Control', icon: FiCheckSquare },
  { to: '/release', label: 'Final Test & Release', icon: FiUnlock },
  { to: '/workflow', label: 'Workflow & Sign-off', icon: FiGitBranch },
  { to: '/notifications', label: 'Notifications', icon: FiBell },
  { to: '/alerts', label: 'Alerts', icon: FiAlertCircle },
  { to: '/audit-trail', label: 'Audit Trail', icon: FiFile },
  { to: '/users', label: 'Users & Rights', icon: FiUsers },
  { to: '/product-master', label: 'Product & Variation Master', icon: FiPackage },
  { to: '/other-masters', label: 'Other Master Data', icon: FiDatabase },
  { to: '/data-flow', label: 'Single-Entry Data Flow', icon: FiShare2 },
  { to: '/leads', label: 'Leads & Pipeline', icon: FiTrendingUp },
  { to: '/reports', label: 'Reports', icon: FiBarChart2 },
  { to: '/settings', label: 'Settings', icon: FiSettings },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">
          <FiDroplet />
        </span>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">PETROGEL</span>
          <span className="sidebar-brand-sub">Plant &amp; QC Portal</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            aria-label={label}
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' sidebar-link-active' : '')
            }
          >
            <Icon className="sidebar-link-icon" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span>v0.1.0 — Demo Build</span>
      </div>
    </aside>
  )
}

export default Sidebar
