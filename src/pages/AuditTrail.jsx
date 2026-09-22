import { useEffect, useMemo, useState } from 'react'
import { FiList, FiLock } from 'react-icons/fi'
import { getAuditRecords, updateEvent } from '../data/auditStore.js'
import './AuditTrail.css'

const filters = ['All', 'Production Instruction', 'Setup Audit', 'Random Checks', 'Pellet Machine Reading', 'In-Process Test', 'Final Test & Release', 'Workflow & Sign-off', 'Notifications', 'Platform', 'Reports']
const actions = ['All', 'Create', 'Edit', 'Save Draft', 'Submit for QC', 'Complete Audit', 'Complete Test', 'OOR/FAIL result', 'Batch Hold', 'Batch Release', 'Workflow Sign-off', 'Login', 'Export/Report generation']

const statusClass = {
  Completed: 'audit-status-completed',
  Approved: 'audit-status-approved',
  Failed: 'audit-status-failed',
  Draft: 'audit-status-draft',
}

function AuditTrail() {
  const [records, setRecords] = useState(getAuditRecords)
  const [module, setModule] = useState('All')
  const [action, setAction] = useState('All')
  const [user, setUser] = useState('All')
  const [batchId, setBatchId] = useState('')
  const [date, setDate] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const refresh = () => setRecords(getAuditRecords())
    window.addEventListener(updateEvent, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(updateEvent, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const users = useMemo(() => ['All', ...new Set(records.map((record) => record.user))], [records])
  const filteredRecords = useMemo(() => records.filter((record) => {
    const haystack = Object.values(record).join(' ').toLowerCase()
    return (module === 'All' || record.module === module)
      && (action === 'All' || record.action === action)
      && (user === 'All' || record.user === user)
      && (!batchId || record.recordId.toLowerCase().includes(batchId.toLowerCase()))
      && (!date || record.dateTime.includes(date))
      && (!search || haystack.includes(search.toLowerCase()))
  }), [action, batchId, date, module, records, search, user])

  return (
    <div className="audit-trail-page">
      <header className="audit-trail-header">
        <div><h1>Audit Trail</h1><p>Immutable activity history across production, QC, release and platform operations</p></div>
        <div className="append-only-badge"><FiLock /> Append-only log</div>
      </header>

      <section className="audit-trail-panel">
        <div className="panel-header"><FiList className="panel-header-icon" /><h2>Audit Records</h2></div>
        <div className="audit-filter-grid">
          <label className="form-field audit-search-field"><span>Search audit records</span><input type="search" placeholder="Search user, batch, action or description" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <label className="form-field"><span>Date</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
          <label className="form-field"><span>User</span><select value={user} onChange={(event) => setUser(event.target.value)}>{users.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className="form-field"><span>Module</span><select value={module} onChange={(event) => setModule(event.target.value)}>{filters.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className="form-field"><span>Action</span><select value={action} onChange={(event) => setAction(event.target.value)}>{actions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className="form-field"><span>Batch / Job ID</span><input type="text" placeholder="e.g. PB-2291" value={batchId} onChange={(event) => setBatchId(event.target.value)} /></label>
        </div>
        <div className="audit-result-count">Showing {filteredRecords.length} of {records.length} immutable records</div>
        <div className="audit-table-wrap"><table className="audit-table"><thead><tr><th>Date &amp; Time</th><th>User</th><th>Role</th><th>Action</th><th>Module</th><th>Record / Batch ID</th><th>Description</th><th>Status</th></tr></thead><tbody>{filteredRecords.map((record) => <tr key={record.id}><td>{record.dateTime}</td><td>{record.user}</td><td>{record.role}</td><td><span className="audit-action">{record.action}</span></td><td>{record.module}</td><td>{record.recordId}</td><td>{record.description}</td><td><span className={`status-badge ${statusClass[record.status] || 'audit-status-draft'}`}>{record.status}</span></td></tr>)}</tbody></table>{filteredRecords.length === 0 && <div className="audit-empty">No audit records match the selected filters.</div>}</div>
      </section>
    </div>
  )
}

export default AuditTrail
