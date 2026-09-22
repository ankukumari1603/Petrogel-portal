import { useEffect, useMemo, useState } from 'react'
import { FiAlertCircle, FiBell, FiCheck, FiList } from 'react-icons/fi'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateEvent,
} from '../data/notificationStore.js'
import { addAuditRecord } from '../data/auditStore.js'
import './Notifications.css'

const notificationRules = [
  { event: 'OOS / FAIL QC Test', recipients: 'QC Analyst, Plant Manager', description: 'Raised when an In-Process or Final QC result fails or is out of range.' },
  { event: 'Machine OOR', recipients: 'Supervisor, Maintenance', description: 'Raised when Random Checks or Pellet Machine Reading exceeds configured limits.' },
  { event: 'Setup Audit Gap', recipients: 'Auditor, Plant Manager', description: 'Raised when a setup checklist item is marked Not OK.' },
  { event: 'Batch Released', recipients: 'Production, Dispatch', description: 'Raised when a conforming batch is successfully released.' },
  { event: 'Invoice Overdue', recipients: 'Sales, Accounts', description: 'Reserved rule for overdue customer invoices.' },
  { event: 'Backup / Restore', recipients: 'Admin', description: 'Reports backup and restore activity for platform administration.' },
]

const priorityClass = {
  Critical: 'notification-critical',
  High: 'notification-high',
  Normal: 'notification-normal',
}

function Notifications() {
  const [notifications, setNotifications] = useState(getNotifications)
  const [eventFilter, setEventFilter] = useState('All')
  const [readFilter, setReadFilter] = useState('All')

  useEffect(() => {
    const refresh = () => setNotifications(getNotifications())
    window.addEventListener(updateEvent, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(updateEvent, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const eventTypes = useMemo(
    () => ['All', ...new Set(notifications.map((notification) => notification.eventType))],
    [notifications],
  )
  const filteredNotifications = useMemo(
    () => notifications.filter((notification) => (
      (eventFilter === 'All' || notification.eventType === eventFilter)
      && (readFilter === 'All' || (readFilter === 'Unread' ? !notification.read : notification.read))
    )),
    [eventFilter, notifications, readFilter],
  )

  const unreadCount = notifications.filter((notification) => !notification.read).length
  const criticalCount = notifications.filter((notification) => notification.priority === 'Critical').length

  return (
    <div className="notifications-page">
      <header className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p>Central alert centre for PETROGEL production, QC and platform events</p>
        </div>
        <div className="notification-system-state"><span className="system-dot" /> System online</div>
      </header>

      <section className="notification-summary-grid">
        <article className="notification-summary-card summary-blue"><span>Total notifications</span><strong>{notifications.length}</strong><FiBell /></article>
        <article className="notification-summary-card summary-orange"><span>Unread notifications</span><strong>{unreadCount}</strong><FiAlertCircle /></article>
        <article className="notification-summary-card summary-red"><span>Critical / OOR</span><strong>{criticalCount}</strong><FiAlertCircle /></article>
        <article className="notification-summary-card summary-grey"><span>Showing now</span><strong>{filteredNotifications.length}</strong><FiList /></article>
      </section>

      <section className="notifications-panel">
        <div className="panel-header"><FiBell className="panel-header-icon" /><h2>Notification Rules</h2></div>
        <div className="notification-rules-grid">
          {notificationRules.map((rule) => <article className="notification-rule" key={rule.event}><div><strong>{rule.event}</strong><span>{rule.description}</span></div><small>Notify: {rule.recipients}</small></article>)}
        </div>
      </section>

      <section className="notifications-panel">
        <div className="panel-header notification-centre-header"><div className="panel-header-title"><FiList className="panel-header-icon" /><h2>Notification Centre</h2></div><button type="button" className="btn btn-secondary mark-all-button" onClick={() => { markAllNotificationsRead(); setNotifications(getNotifications()) }}><FiCheck /> Mark All as Read</button></div>
        <div className="notification-filters">
          <label className="form-field"><span>Event Type</span><select value={eventFilter} onChange={(event) => setEventFilter(event.target.value)}>{eventTypes.map((eventType) => <option key={eventType} value={eventType}>{eventType}</option>)}</select></label>
          <label className="form-field"><span>Read Status</span><select value={readFilter} onChange={(event) => setReadFilter(event.target.value)}><option value="All">All notifications</option><option value="Unread">Unread only</option><option value="Read">Read only</option></select></label>
        </div>
        <div className="notification-list">
          {filteredNotifications.map((notification) => <article className={`notification-row${notification.read ? '' : ' notification-row-unread'}`} key={notification.id}><div className={`notification-priority ${priorityClass[notification.priority]}`} title={`${notification.priority} priority`} /><div className="notification-row-main"><div className="notification-row-top"><span className="notification-event">{notification.eventType}</span><span className={`priority-badge ${priorityClass[notification.priority]}`}>{notification.priority}</span></div><p>{notification.message}</p><div className="notification-row-meta"><span>Batch / Job: <b>{notification.batchId || '—'}</b></span><span>{notification.dateTime}</span><span>Notify: {notification.recipients}</span></div></div><div className="notification-row-action">{notification.read ? <span className="read-label"><FiCheck /> Read</span> : <button type="button" className="btn btn-secondary" onClick={() => { markNotificationRead(notification.id); addAuditRecord({ user: 'Plant Manager', role: 'Plant Manager', action: 'Edit', module: 'Notifications', recordId: notification.batchId, description: `Notification marked as read: ${notification.eventType}.`, status: 'Completed' }); setNotifications(getNotifications()) }}>Mark as Read</button>}</div></article>)}
          {filteredNotifications.length === 0 && <div className="notification-empty">No notifications match the selected filters.</div>}
        </div>
      </section>
    </div>
  )
}

export default Notifications
