import { useState } from 'react'
import { FiCheckSquare, FiEdit2, FiEye, FiPlus, FiTrash2, FiX } from 'react-icons/fi'
import { usePortalData } from '../data/usePortalData.js'
import { portalData } from '../data/portalData.js'
import { toArray } from '../utils/arrayUtils.js'
import './DataModule.css'

const emptyForm = Object.fromEntries(portalData.qc.fields.map(([key]) => [key, '']))
const resultFor = (actual, minimum, maximum) => actual === '' ? 'PENDING' : Number(actual) >= Number(minimum) && Number(actual) <= Number(maximum) ? 'PASS' : 'FAIL'

function QcModule() {
  const { records, updateRecords } = usePortalData()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [form, setForm] = useState(null)
  const [editing, setEditing] = useState(null)
  const [selected, setSelected] = useState(null)
  const [notice, setNotice] = useState('')
  const qcRecords = toArray(records.qc)
  const filtered = qcRecords.filter((record) => `${Object.values(record).join(' ')}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'All' || record.result === filter))
  const result = form ? resultFor(form.actual, form.minimum, form.maximum) : 'PENDING'
  const openForm = (record = null) => { setEditing(record); setForm(record ? { ...record } : { ...emptyForm }); setSelected(null) }
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  const save = (event) => {
    event.preventDefault()
    if (!form.batch || !form.product || !form.parameter || !form.minimum || !form.maximum || !form.testedBy) { setNotice('Please complete all required QC fields.'); return }
    if (Number(form.minimum) > Number(form.maximum)) { setNotice('Specification minimum cannot exceed maximum.'); return }
    const next = { ...form, id: editing?.id || `QC-${String(qcRecords.length + 1040).padStart(4, '0')}`, result }
    updateRecords('qc', (items) => editing ? items.map((item) => item.id === editing.id ? next : item) : [next, ...items])
    setNotice(`QC test ${editing ? 'updated' : 'recorded'} as ${result}.`); setForm(null); setEditing(null)
  }
  const remove = (record) => { if (window.confirm(`Delete ${record.id}?`)) { updateRecords('qc', (items) => items.filter((item) => item.id !== record.id)); setNotice(`${record.id} deleted.`) } }
  return <div className="data-module"><header className="data-module-header"><div><h1><FiCheckSquare /> Quality Control</h1><p>Enter batch readings and release reliable, automatically evaluated QC results.</p></div><button className="btn btn-primary" onClick={() => openForm()}><FiPlus /> Add QC Test</button></header>{notice && <div className="data-notice" role="status">{notice}</div>}<section className="qc-summary"><div><strong>{qcRecords.filter((item) => item.result === 'PENDING').length}</strong><span>Pending Tests</span></div><div><strong>{qcRecords.filter((item) => item.result === 'PASS').length}</strong><span>Passed</span></div><div><strong>{qcRecords.filter((item) => item.result === 'FAIL').length}</strong><span>Failed</span></div><div><strong>{qcRecords.length}</strong><span>Total Tests</span></div></section><section className="data-panel"><div className="data-toolbar"><input type="search" aria-label="Search QC records" placeholder="Search batch, product or customer..." value={search} onChange={(event) => setSearch(event.target.value)} /><select aria-label="Filter QC result" value={filter} onChange={(event) => setFilter(event.target.value)}><option>All</option>{portalData.qc.statuses.map((item) => <option key={item}>{item}</option>)}</select><span className="record-count">{filtered.length} records</span></div><div className="data-table-wrap"><table className="data-table"><thead><tr>{portalData.qc.columns.map((column) => <th key={column}>{column === 'id' ? 'QC ID' : column.replace(/([A-Z])/g, ' $1')}</th>)}<th>Actions</th></tr></thead><tbody>{filtered.map((record) => <tr key={record.id}>{portalData.qc.columns.map((column) => <td key={column}><span className={column === 'result' ? `status-badge status-${record.result.toLowerCase()}` : ''}>{record[column] || '—'}</span></td>)}<td><div className="row-actions"><button title="View" onClick={() => setSelected(record)}><FiEye /></button><button title="Edit" onClick={() => openForm(record)}><FiEdit2 /></button><button title="Delete" onClick={() => remove(record)}><FiTrash2 /></button></div></td></tr>)}</tbody></table></div></section>{form && <div className="module-modal"><div className="module-modal-card"><button className="modal-close" onClick={() => setForm(null)}><FiX /></button><h2>{editing ? 'Edit' : 'Add'} QC Test</h2><form className="module-form" onSubmit={save}>{portalData.qc.fields.map(([key, label, inputType]) => <label key={key}><span>{label}{['batch', 'product', 'customer', 'parameter', 'minimum', 'maximum', 'testedBy'].includes(key) ? ' *' : ''}</span>{key === 'remarks' ? <textarea rows="2" value={form[key] || ''} onChange={update(key)} /> : <input type={inputType || 'text'} value={form[key] || ''} onChange={update(key)} />}</label>)}<div className="qc-live-result"><span>Calculated Result</span><strong className={`status-badge status-${result.toLowerCase()}`}>{result}</strong></div><div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary">Save QC Test</button></div></form></div></div>}{selected && <div className="module-modal"><div className="module-modal-card"><button className="modal-close" onClick={() => setSelected(null)}><FiX /></button><h2>QC Test Details</h2><dl className="detail-list">{Object.entries(selected).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value || '—'}</dd></div>)}</dl><button className="btn btn-primary" onClick={() => openForm(selected)}>Edit Test</button></div></div>}</div>
}
export default QcModule