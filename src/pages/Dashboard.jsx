import { FiAlertTriangle, FiBell, FiCheckCircle, FiClipboard, FiLayers, FiPackage, FiUsers } from 'react-icons/fi'
import StatCard from '../components/StatCard.jsx'
import { buildAlerts } from '../data/portalAlerts.js'
import { usePortalData } from '../data/usePortalData.js'
import { toArray } from '../utils/arrayUtils.js'
import './Dashboard.css'

const iconMap = { customers: FiUsers, production: FiLayers, completed: FiCheckCircle, pendingQc: FiClipboard, failedQc: FiAlertTriangle, lowStock: FiPackage, requirements: FiClipboard, alerts: FiBell }
const formatTime = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'

function Dashboard() {
  const { records } = usePortalData()
  const customers = toArray(records.customers)
  const production = toArray(records.production)
  const qc = toArray(records.qc)
  const inventory = toArray(records.inventory)
  const requirements = toArray(records.requirements)
  const alerts = buildAlerts(records)
  const stats = [
    ['customers', 'Total Customers', customers.length, 'blue'],
    ['production', 'Total Production Batches', production.length, 'blue'],
    ['completed', 'Completed Batches', production.filter((item) => item.status === 'Completed').length, 'blue'],
    ['pendingQc', 'Pending QC Tests', qc.filter((item) => item.result === 'PENDING').length, 'orange'],
    ['failedQc', 'Failed QC Tests', qc.filter((item) => item.result === 'FAIL').length, 'orange'],
    ['lowStock', 'Low Stock Items', inventory.filter((item) => item.stockStatus === 'LOW STOCK').length, 'orange'],
    ['requirements', 'Pending Requirements', requirements.filter((item) => !['Completed', 'Approved', 'Rejected'].includes(item.status)).length, 'blue'],
    ['alerts', 'Open Alerts', alerts.filter((item) => item.status === 'Open').length, 'orange'],
  ]
  const activity = [...production.map((item) => ({ date: item.date, label: `${item.batch} production is ${item.status}`, tone: item.status === 'Completed' ? 'success' : 'info' })), ...qc.map((item) => ({ date: item.testDate, label: `${item.id} ${item.result} for ${item.batch}`, tone: item.result === 'FAIL' ? 'alert' : item.result === 'PASS' ? 'success' : 'task' }))].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 6)
  return <div className="dashboard"><header className="dashboard-header"><div><h1>Dashboard</h1><p>Plant production, quality and customer activity overview</p></div><span className="dashboard-date">Live demo data · {formatTime(new Date().toISOString())}</span></header><section className="stat-grid">{stats.map(([id, label, value, accent]) => <StatCard key={id} label={label} value={value} accent={accent} critical={accent === 'orange' && value > 0} icon={iconMap[id]} />)}</section><section className="dashboard-columns"><div className="dashboard-panel"><div className="panel-header"><FiLayers className="panel-header-icon" /><h2>Production Overview</h2></div><div className="overview-row"><span>Completed batches</span><strong>{production.filter((item) => item.status === 'Completed').length} / {production.length}</strong></div><div className="progress-track"><span style={{ width: `${production.length ? production.filter((item) => item.status === 'Completed').length / production.length * 100 : 0}%` }} /></div><div className="overview-row"><span>In production</span><strong>{production.filter((item) => item.status === 'In Production').length}</strong></div><div className="overview-row"><span>Awaiting release</span><strong>{production.filter((item) => item.status === 'Completed').length - qc.filter((item) => item.result === 'PASS').length > 0 ? production.filter((item) => item.status === 'Completed').length - qc.filter((item) => item.result === 'PASS').length : 0}</strong></div></div><div className="dashboard-panel"><div className="panel-header"><FiCheckCircle className="panel-header-icon" /><h2>QC Overview</h2></div><div className="qc-overview"><div><strong className="qc-pass">{qc.filter((item) => item.result === 'PASS').length}</strong><span>Pass</span></div><div><strong className="qc-fail">{qc.filter((item) => item.result === 'FAIL').length}</strong><span>Fail</span></div><div><strong className="qc-pending">{qc.filter((item) => item.result === 'PENDING').length}</strong><span>Pending</span></div></div><div className="mini-bars"><span style={{ height: `${Math.max(10, qc.filter((item) => item.result === 'PASS').length * 22)}%` }} /><span style={{ height: `${Math.max(10, qc.filter((item) => item.result === 'FAIL').length * 22)}%` }} /><span style={{ height: `${Math.max(10, qc.filter((item) => item.result === 'PENDING').length * 22)}%` }} /></div></div></section><section className="dashboard-panel"><div className="panel-header"><FiBell className="panel-header-icon" /><h2>Recent Activity</h2></div><ul className="notification-list">{activity.map((item, index) => <li className="notification-item" key={`${item.label}-${index}`}><span className={`notification-dot dot-${item.tone}`} /><span className="notification-message">{item.label}</span><span className="notification-time">{formatTime(item.date)}</span></li>)}</ul></section></div>
}
export default Dashboard
