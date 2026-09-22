import { useMemo, useState } from 'react'
import { FiChevronRight, FiEdit2, FiPlus, FiTarget, FiTrendingUp } from 'react-icons/fi'
import { addAuditRecord } from '../data/auditStore.js'
import './LeadsPipeline.css'

const stages = ['New Lead', 'Contacted', 'Requirement Identified', 'Sample/Trial', 'Quotation', 'Negotiation', 'Won', 'Lost']
const sources = ['Website', 'Referral', 'Trade Show', 'Existing Customer', 'Sales Outreach']
const assignees = ['A. Fernandes', 'R. Gomes', 'S. Kulkarni', 'M. Pereira', 'J. Singh']

const seedLeads = [
  { id: 'LD-1001', company: 'Northstar Industrial Supplies', contact: 'Meera Shah', email: 'meera.shah@example.com', phone: '+91 90000 10001', requirement: 'Petroleum Jelly - Standard Viscosity', source: 'Website', assigned: 'A. Fernandes', created: '2026-09-03', value: 185000, stage: 'New Lead' },
  { id: 'LD-1002', company: 'Harborline Manufacturing', contact: 'Daniel Cole', email: 'daniel.cole@example.com', phone: '+91 90000 10002', requirement: 'High Temperature Industrial Grease', source: 'Trade Show', assigned: 'R. Gomes', created: '2026-09-02', value: 420000, stage: 'Contacted' },
  { id: 'LD-1003', company: 'Westfield Process Systems', contact: 'Ravi Menon', email: 'ravi.menon@example.com', phone: '+91 90000 10003', requirement: 'Paraffin Wax - Fully Refined', source: 'Referral', assigned: 'S. Kulkarni', created: '2026-08-28', value: 275000, stage: 'Requirement Identified' },
  { id: 'LD-1004', company: 'Apex Components Ltd.', contact: 'Nisha Patel', email: 'nisha.patel@example.com', phone: '+91 90000 10004', requirement: 'Hydraulic Fluid - Low Foam', source: 'Existing Customer', assigned: 'M. Pereira', created: '2026-08-22', value: 310000, stage: 'Sample/Trial' },
  { id: 'LD-1005', company: 'Cedar Works Industries', contact: 'Owen Brooks', email: 'owen.brooks@example.com', phone: '+91 90000 10005', requirement: 'Petroleum Jelly - Heavy Duty', source: 'Sales Outreach', assigned: 'A. Fernandes', created: '2026-08-19', value: 525000, stage: 'Quotation' },
  { id: 'LD-1006', company: 'Metroline Equipment', contact: 'Kavita Rao', email: 'kavita.rao@example.com', phone: '+91 90000 10006', requirement: 'Industrial Grease - High Temperature', source: 'Referral', assigned: 'R. Gomes', created: '2026-08-12', value: 680000, stage: 'Negotiation' },
  { id: 'LD-1007', company: 'Granite Process Group', contact: 'Arjun Nair', email: 'arjun.nair@example.com', phone: '+91 90000 10007', requirement: 'Base Oil and Process Materials', source: 'Existing Customer', assigned: 'J. Singh', created: '2026-07-30', value: 740000, stage: 'Won' },
  { id: 'LD-1008', company: 'Bluecrest Trading', contact: 'Sara Khan', email: 'sara.khan@example.com', phone: '+91 90000 10008', requirement: 'Low Foam Hydraulic Fluid', source: 'Website', assigned: 'M. Pereira', created: '2026-07-25', value: 160000, stage: 'Lost' },
]

const blankLead = { company: '', contact: '', email: '', phone: '', requirement: '', source: sources[0], assigned: assignees[0], created: '2026-09-17', value: '', stage: 'New Lead' }

function LeadsPipeline() {
  const [leads, setLeads] = useState(seedLeads)
  const [form, setForm] = useState(blankLead)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('All')
  const [assignedFilter, setAssignedFilter] = useState('All')
  const [sourceFilter, setSourceFilter] = useState('All')
  const [notice, setNotice] = useState('')

  const filteredLeads = useMemo(() => leads.filter((lead) => {
    const query = search.toLowerCase()
    return (!query || `${lead.company} ${lead.contact} ${lead.requirement} ${lead.id}`.toLowerCase().includes(query))
      && (stageFilter === 'All' || lead.stage === stageFilter)
      && (assignedFilter === 'All' || lead.assigned === assignedFilter)
      && (sourceFilter === 'All' || lead.source === sourceFilter)
  }), [assignedFilter, leads, search, sourceFilter, stageFilter])

  const summary = {
    total: leads.length,
    newLeads: leads.filter((lead) => lead.stage === 'New Lead').length,
    active: leads.filter((lead) => !['New Lead', 'Won', 'Lost'].includes(lead.stage)).length,
    won: leads.filter((lead) => lead.stage === 'Won').length,
    lost: leads.filter((lead) => lead.stage === 'Lost').length,
    value: leads.reduce((total, lead) => total + Number(lead.value || 0), 0),
  }

  const updateForm = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.value }))
  const openAdd = () => { setEditingId(null); setForm(blankLead); setShowForm(true); setNotice('') }
  const openEdit = (lead) => { setEditingId(lead.id); setForm({ ...lead, value: String(lead.value) }); setShowForm(true); setNotice('') }

  const saveLead = (event) => {
    event.preventDefault()
    if (!form.company || !form.contact || !form.requirement) return
    const lead = { ...form, id: editingId || `LD-${1001 + leads.length}`, value: Number(form.value || 0) }
    setLeads((previous) => editingId ? previous.map((item) => item.id === editingId ? lead : item) : [lead, ...previous])
    addAuditRecord({ user: 'System Admin', role: 'Sales', action: editingId ? 'Edit' : 'Create', module: 'Leads & Pipeline', recordId: lead.id, description: `${editingId ? 'Updated' : 'Created'} CRM lead for ${lead.company}.`, status: 'Completed' })
    setNotice(`${editingId ? 'Updated' : 'Added'} lead ${lead.id}.`)
    setShowForm(false); setEditingId(null); setForm(blankLead)
  }

  const updateStage = (lead, nextStage) => {
    setLeads((previous) => previous.map((item) => item.id === lead.id ? { ...item, stage: nextStage } : item))
    addAuditRecord({ user: lead.assigned, role: 'Sales', action: nextStage === 'Won' ? 'Create' : 'Edit', module: 'Leads & Pipeline', recordId: lead.id, description: `Lead moved to ${nextStage}.`, status: nextStage === 'Lost' ? 'Failed' : 'Completed' })
    setNotice(`${lead.company} moved to ${nextStage}.`)
  }

  const nextStage = (lead) => {
    const index = stages.indexOf(lead.stage)
    if (index >= 0 && index < stages.length - 3) updateStage(lead, stages[index + 1])
  }

  return (
    <div className="crm-page">
      <header className="crm-header"><div><h1>Leads &amp; Pipeline</h1><p>Track customer opportunities from first contact through quotation, negotiation and conversion</p></div><div className="crm-demo-badge"><FiTarget /> Mock CRM Data</div></header>
      {notice && <div className="crm-notice" role="status">{notice}</div>}

      <section className="crm-summary-grid"><article className="crm-summary-card summary-blue"><span>Total Leads</span><strong>{summary.total}</strong><FiTarget /></article><article className="crm-summary-card summary-orange"><span>New Leads</span><strong>{summary.newLeads}</strong><FiPlus /></article><article className="crm-summary-card summary-blue"><span>Active Opportunities</span><strong>{summary.active}</strong><FiTrendingUp /></article><article className="crm-summary-card summary-green"><span>Won</span><strong>{summary.won}</strong><FiTarget /></article><article className="crm-summary-card summary-red"><span>Lost</span><strong>{summary.lost}</strong><FiTarget /></article><article className="crm-summary-card summary-grey"><span>Total Expected Value</span><strong>₹{summary.value.toLocaleString('en-IN')}</strong><FiTrendingUp /></article></section>

      {showForm && <section className="crm-panel crm-form-panel"><div className="panel-header"><FiTarget className="panel-header-icon" /><h2>{editingId ? 'Edit Lead' : 'Add Lead'}</h2></div><form className="crm-form-grid" onSubmit={saveLead}><label className="form-field"><span>Company / Customer Name</span><input required value={form.company} onChange={updateForm('company')} /></label><label className="form-field"><span>Contact Person</span><input required value={form.contact} onChange={updateForm('contact')} /></label><label className="form-field"><span>Email</span><input type="email" value={form.email} onChange={updateForm('email')} /></label><label className="form-field"><span>Phone</span><input value={form.phone} onChange={updateForm('phone')} /></label><label className="form-field"><span>Product / Requirement</span><input required value={form.requirement} onChange={updateForm('requirement')} /></label><label className="form-field"><span>Lead Source</span><select value={form.source} onChange={updateForm('source')}>{sources.map((source) => <option key={source}>{source}</option>)}</select></label><label className="form-field"><span>Assigned To</span><select value={form.assigned} onChange={updateForm('assigned')}>{assignees.map((assignee) => <option key={assignee}>{assignee}</option>)}</select></label><label className="form-field"><span>Created Date</span><input type="date" value={form.created} onChange={updateForm('created')} /></label><label className="form-field"><span>Expected Value</span><input type="number" min="0" step="1000" value={form.value} onChange={updateForm('value')} /></label><label className="form-field"><span>Pipeline Stage</span><select value={form.stage} onChange={updateForm('stage')}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></label><div className="form-actions crm-form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save Lead</button></div></form></section>}

      <section className="crm-panel"><div className="panel-header crm-pipeline-header"><div className="panel-header-title"><FiTrendingUp className="panel-header-icon" /><h2>Pipeline View</h2></div><button type="button" className="btn btn-primary crm-add-button" onClick={openAdd}><FiPlus /> Add Lead</button></div><div className="crm-filter-grid"><label className="form-field crm-search"><span>Customer / Requirement</span><input type="search" placeholder="Search leads" value={search} onChange={(event) => setSearch(event.target.value)} /></label><label className="form-field"><span>Stage</span><select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}><option>All</option>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></label><label className="form-field"><span>Assigned To</span><select value={assignedFilter} onChange={(event) => setAssignedFilter(event.target.value)}><option>All</option>{assignees.map((assignee) => <option key={assignee}>{assignee}</option>)}</select></label><label className="form-field"><span>Lead Source</span><select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}><option>All</option>{sources.map((source) => <option key={source}>{source}</option>)}</select></label></div><div className="pipeline-board">{stages.map((stage) => { const stageLeads = filteredLeads.filter((lead) => lead.stage === stage); return <div className="pipeline-column" key={stage}><div className="pipeline-column-header"><strong>{stage}</strong><span>{stageLeads.length}</span></div><div className="pipeline-column-body">{stageLeads.map((lead) => <article className={`lead-card lead-card-${stage === 'Won' ? 'won' : stage === 'Lost' ? 'lost' : 'active'}`} key={lead.id}><div className="lead-card-top"><strong>{lead.company}</strong><span>{lead.id}</span></div><p>{lead.requirement}</p><div className="lead-card-meta"><span>Assigned: <b>{lead.assigned}</b></span><strong>₹{Number(lead.value).toLocaleString('en-IN')}</strong></div><div className="lead-card-actions"><button type="button" className="icon-action" title="Edit Lead" onClick={() => openEdit(lead)}><FiEdit2 /></button>{!['Won', 'Lost'].includes(lead.stage) && <button type="button" className="text-action" onClick={() => nextStage(lead)}>Next Stage <FiChevronRight /></button>}{lead.stage !== 'Won' && <button type="button" className="text-action text-action-success" onClick={() => updateStage(lead, 'Won')}>Won</button>}{lead.stage !== 'Lost' && <button type="button" className="text-action text-action-danger" onClick={() => updateStage(lead, 'Lost')}>Lost</button>}</div></article>)}{stageLeads.length === 0 && <div className="pipeline-empty">No leads</div>}</div></div>})}</div></section>
    </div>
  )
}

export default LeadsPipeline
