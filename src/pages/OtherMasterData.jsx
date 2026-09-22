import { useMemo, useState } from 'react'
import { FiEdit2, FiPlus, FiSettings, FiUsers } from 'react-icons/fi'
import { addAuditRecord } from '../data/auditStore.js'
import './OtherMasterData.css'

const tabs = ['Customers', 'Raw Materials', 'Machines / Kettles', 'Parameters & Specifications']
const statuses = ['Active', 'Inactive']

export const initialData = {
  Customers: [
    { id: 'CUS-001', name: 'Northstar Industrial Supplies', company: 'Northstar Industrial Supplies Pvt. Ltd.', contact: 'Meera Shah', email: 'meera.shah@example.com', phone: '+91 90000 10001', status: 'Active' },
    { id: 'CUS-002', name: 'Harborline Manufacturing', company: 'Harborline Manufacturing Co.', contact: 'Daniel Cole', email: 'daniel.cole@example.com', phone: '+91 90000 10002', status: 'Active' },
    { id: 'CUS-003', name: 'Westfield Process Systems', company: 'Westfield Process Systems Ltd.', contact: 'Ravi Menon', email: 'ravi.menon@example.com', phone: '+91 90000 10003', status: 'Inactive' },
  ],
  'Raw Materials': [
    { id: 'RM-001', name: 'Base Oil 150N', category: 'Base Oil', unit: 'kg', supplier: 'Demo Materials Co.', status: 'Active' },
    { id: 'RM-002', name: 'Microcrystalline Wax', category: 'Wax', unit: 'kg', supplier: 'Refined Inputs Ltd.', status: 'Active' },
    { id: 'RM-003', name: 'Lithium Soap Thickener', category: 'Thickener', unit: 'kg', supplier: 'Industrial Chemicals Demo', status: 'Active' },
  ],
  'Machines / Kettles': [
    { id: 'MCH-001', name: 'Reactor R-1', type: 'Jacketed Reactor', location: 'Plant 1 - Bay A', capacity: '500 kg', calibration: 'Valid', status: 'Active' },
    { id: 'MCH-002', name: 'Mixer M-3', type: 'High Shear Mixer', location: 'Plant 1 - Bay B', capacity: '750 kg', calibration: 'Due Soon', status: 'Active' },
    { id: 'MCH-003', name: 'Pelletizer P-1', type: 'Pellet Machine', location: 'Plant 2 - Line 1', capacity: '120 kg/hr', calibration: 'Valid', status: 'Active' },
  ],
  'Parameters & Specifications': [
    { id: 'PAR-001', name: 'Viscosity', product: 'Petroleum Jelly / Standard Viscosity', minimum: '150', maximum: '200', unit: 'cSt', method: 'ASTM D445', status: 'Active' },
    { id: 'PAR-002', name: 'Melting Point', product: 'Paraffin Wax / Fully Refined', minimum: '45', maximum: '65', unit: '°C', method: 'ASTM D87', status: 'Active' },
    { id: 'PAR-003', name: 'Density', product: 'Industrial Grease / High Temperature', minimum: '0.86', maximum: '0.92', unit: 'g/cm³', method: 'ASTM D4052', status: 'Active' },
  ],
}

const schemas = {
  Customers: { title: 'Customer Master', icon: FiUsers, idLabel: 'Customer ID', fields: [['name', 'Customer Name'], ['company', 'Company'], ['contact', 'Contact Person'], ['email', 'Email'], ['phone', 'Phone']], columns: [['id', 'Customer ID'], ['name', 'Customer Name'], ['company', 'Company'], ['contact', 'Contact Person'], ['email', 'Email'], ['phone', 'Phone']] },
  'Raw Materials': { title: 'Raw Material Master', icon: FiSettings, idLabel: 'Material Code', fields: [['name', 'Material Name'], ['category', 'Category'], ['unit', 'Unit'], ['supplier', 'Supplier']], columns: [['id', 'Material Code'], ['name', 'Material Name'], ['category', 'Category'], ['unit', 'Unit'], ['supplier', 'Supplier']] },
  'Machines / Kettles': { title: 'Machine / Kettle Master', icon: FiSettings, idLabel: 'Machine ID', fields: [['name', 'Machine Name'], ['type', 'Machine Type'], ['location', 'Location'], ['capacity', 'Capacity'], ['calibration', 'Calibration Status']], columns: [['id', 'Machine ID'], ['name', 'Machine Name'], ['type', 'Machine Type'], ['location', 'Location'], ['capacity', 'Capacity'], ['calibration', 'Calibration Status']] },
  'Parameters & Specifications': { title: 'Parameter & Specification Master', icon: FiSettings, idLabel: 'Parameter Code', fields: [['name', 'Parameter Name'], ['product', 'Product / Variation'], ['minimum', 'Minimum Specification'], ['maximum', 'Maximum Specification'], ['unit', 'Unit'], ['method', 'Test Method']], columns: [['id', 'Parameter Code'], ['name', 'Parameter Name'], ['product', 'Product / Variation'], ['minimum', 'Minimum'], ['maximum', 'Maximum'], ['unit', 'Unit'], ['method', 'Test Method']] },
}

function OtherMasterData() {
  const [activeTab, setActiveTab] = useState(tabs[0])
  const [records, setRecords] = useState(initialData)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [notice, setNotice] = useState('')

  const schema = schemas[activeTab]
  const SectionIcon = schema.icon
  const filteredRecords = useMemo(() => records[activeTab].filter((record) => JSON.stringify(record).toLowerCase().includes(search.toLowerCase()) && (statusFilter === 'All' || record.status === statusFilter)), [activeTab, records, search, statusFilter])
  const openAdd = () => { setEditingId(null); setForm({ id: '', status: 'Active' }); setShowForm(true); setNotice('') }
  const openEdit = (record) => { setEditingId(record.id); setForm(record); setShowForm(true); setNotice('') }
  const updateField = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.value }))

  const saveRecord = (event) => {
    event.preventDefault()
    if (!form.id || !form.name) return
    const next = editingId ? records[activeTab].map((record) => record.id === editingId ? form : record) : [form, ...records[activeTab]]
    setRecords((previous) => ({ ...previous, [activeTab]: next }))
    addAuditRecord({ user: 'System Admin', role: 'Admin', action: editingId ? 'Edit' : 'Create', module: 'Other Master Data', recordId: form.id, description: `${editingId ? 'Updated' : 'Created'} ${activeTab} record ${form.name}.`, status: 'Completed' })
    setNotice(`${editingId ? 'Updated' : 'Added'} ${form.name}.`)
    setShowForm(false); setEditingId(null); setForm({})
  }

  const toggleStatus = (record) => {
    const status = record.status === 'Active' ? 'Inactive' : 'Active'
    setRecords((previous) => ({ ...previous, [activeTab]: previous[activeTab].map((item) => item.id === record.id ? { ...item, status } : item) }))
    addAuditRecord({ user: 'System Admin', role: 'Admin', action: 'Edit', module: 'Other Master Data', recordId: record.id, description: `${status === 'Active' ? 'Activated' : 'Deactivated'} ${activeTab} record ${record.name}.`, status: 'Completed' })
    setNotice(`${record.name} is now ${status.toLowerCase()}.`)
  }

  return (
    <div className="other-master-page">
      <header className="other-master-header"><div><h1>Other Master Data</h1><p>Maintain demonstration master data for customers, materials, plant assets and QC specifications</p></div><div className="master-demo-badge">Mock / Demo Data</div></header>
      {notice && <div className="other-master-notice" role="status">{notice}</div>}
      <nav className="master-tabs" aria-label="Other master data sections">{tabs.map((tab) => <button type="button" className={activeTab === tab ? 'master-tab master-tab-active' : 'master-tab'} key={tab} onClick={() => { setActiveTab(tab); setShowForm(false); setSearch(''); setStatusFilter('All') }}>{tab}</button>)}</nav>
      {showForm && <section className="other-master-panel other-master-form"><div className="panel-header"><SectionIcon className="panel-header-icon" /><h2>{editingId ? `Edit ${schema.title}` : `Add ${schema.title}`}</h2></div><form className="other-form-grid" onSubmit={saveRecord}><label className="form-field"><span>{schema.idLabel}</span><input required value={form.id || ''} onChange={updateField('id')} disabled={Boolean(editingId)} /></label>{schema.fields.map(([field, label]) => <label className="form-field" key={field}><span>{label}</span><input required={field !== 'method' && field !== 'description'} value={form[field] || ''} onChange={updateField(field)} /></label>)}<label className="form-field"><span>Status</span><select value={form.status || 'Active'} onChange={updateField('status')}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><div className="form-actions other-form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save Record</button></div></form></section>}
      <section className="other-master-panel"><div className="panel-header other-list-header"><div className="panel-header-title"><SectionIcon className="panel-header-icon" /><h2>{schema.title}</h2></div><button type="button" className="btn btn-primary other-add-button" onClick={openAdd}><FiPlus /> Add</button></div><div className="other-filter-grid"><label className="form-field"><span>Search</span><input type="search" placeholder={`Search ${activeTab.toLowerCase()}`} value={search} onChange={(event) => setSearch(event.target.value)} /></label><label className="form-field"><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label></div><div className="other-table-wrap"><table className="other-table"><thead><tr>{schema.columns.map(([, label]) => <th key={label}>{label}</th>)}<th>Status</th><th>Actions</th></tr></thead><tbody>{filteredRecords.map((record) => <tr key={record.id}>{schema.columns.map(([field]) => <td key={field}>{field === 'name' ? <strong>{record[field]}</strong> : record[field]}</td>)}<td><span className={`status-badge other-status-${record.status.toLowerCase()}`}>{record.status}</span></td><td><div className="other-actions"><button type="button" className="icon-action" title="Edit record" onClick={() => openEdit(record)}><FiEdit2 /></button><button type="button" className="text-action" onClick={() => toggleStatus(record)}>{record.status === 'Active' ? 'Deactivate' : 'Activate'}</button></div></td></tr>)}</tbody></table>{filteredRecords.length === 0 && <div className="other-empty">No records match the selected filters.</div>}</div></section>
    </div>
  )
}

export default OtherMasterData
