import { useMemo, useState } from 'react'
import { FiClipboard, FiList } from 'react-icons/fi'
import {
  auditChecklistTemplate,
  operators,
  productionInstructions,
  setupAudits,
} from '../data/mockData.js'
import { addNotification } from '../data/notificationStore.js'
import { addAuditRecord } from '../data/auditStore.js'
import './SetupAudit.css'

const allItems = auditChecklistTemplate.flatMap((group) => group.items)

const emptyResponses = allItems.reduce((acc, item) => {
  acc[item.id] = null
  return acc
}, {})

const statusClass = {
  Draft: 'status-draft',
  Completed: 'status-completed',
}

function SetupAudit() {
  const [batchId, setBatchId] = useState(productionInstructions[0]?.id ?? '')
  const [responses, setResponses] = useState(emptyResponses)
  const [auditor, setAuditor] = useState(operators[0])
  const [date, setDate] = useState('')
  const [remarks, setRemarks] = useState('')
  const [correctiveAction, setCorrectiveAction] = useState('')
  const [records, setRecords] = useState(setupAudits)

  const selectedInstruction = useMemo(
    () => productionInstructions.find((item) => item.id === batchId),
    [batchId],
  )

  const ncCount = useMemo(
    () => Object.values(responses).filter((value) => value === 'not-ok').length,
    [responses],
  )

  const setItemResponse = (itemId, value) => {
    setResponses((prev) => ({ ...prev, [itemId]: value }))
  }

  const resetForm = () => {
    setResponses(emptyResponses)
    setAuditor(operators[0])
    setDate('')
    setRemarks('')
    setCorrectiveAction('')
  }

  const saveRecord = (status) => {
    if (!batchId || !auditor) return

    setRecords((prev) => [
      {
        batchId,
        productName: selectedInstruction?.productName ?? '',
        auditor,
        date,
        remarks,
        correctiveAction: correctiveAction || '—',
        ncCount,
        status,
      },
      ...prev,
    ])
    if (ncCount > 0) {
      addNotification({
        eventType: 'Setup Audit Gap',
        message: `${ncCount} setup audit gap${ncCount > 1 ? 's' : ''} recorded for ${batchId}.`,
        batchId,
        priority: 'High',
        recipients: 'Auditor, Plant Manager',
      })
    }
    addAuditRecord({
      user: auditor,
      role: 'Auditor',
      action: status === 'Draft' ? 'Save Draft' : 'Complete Audit',
      module: 'Setup Audit',
      recordId: batchId,
      description: `${status} setup audit recorded with ${ncCount} non-conformance${ncCount === 1 ? '' : 's'}.`,
      status: ncCount > 0 ? 'Failed' : status,
    })
    resetForm()
  }

  return (
    <div className="setup-audit">
      <header className="setup-audit-header">
        <h1>Setup Audit</h1>
        <p>Stage-wise setup audit checklist before production run begins</p>
      </header>

      <section className="audit-panel">
        <div className="panel-header">
          <FiClipboard className="panel-header-icon" />
          <h2>New Setup Audit</h2>
        </div>

        <div className="audit-batch-select">
          <label className="form-field">
            <span>Batch ID</span>
            <select value={batchId} onChange={(event) => setBatchId(event.target.value)}>
              {productionInstructions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id}
                </option>
              ))}
            </select>
          </label>

          {selectedInstruction && (
            <div className="audit-instruction-summary">
              <span className="audit-instruction-label">Production Instruction</span>
              <span>
                {selectedInstruction.productName} — {selectedInstruction.variation} (
                {selectedInstruction.quantity}) on {selectedInstruction.machine}
              </span>
            </div>
          )}
        </div>

        <div className="audit-checklist">
          {auditChecklistTemplate.map((group) => (
            <div className="audit-stage" key={group.stage}>
              <h3>{group.stage}</h3>
              {group.items.map((item) => {
                const value = responses[item.id]
                const isNc = value === 'not-ok'
                return (
                  <div
                    className={`audit-item${isNc ? ' audit-item-nc' : ''}`}
                    key={item.id}
                  >
                    <span className="audit-item-text">{item.text}</span>
                    <div className="audit-item-options">
                      <label className="audit-radio">
                        <input
                          type="radio"
                          name={item.id}
                          checked={value === 'ok'}
                          onChange={() => setItemResponse(item.id, 'ok')}
                        />
                        OK
                      </label>
                      <label className="audit-radio">
                        <input
                          type="radio"
                          name={item.id}
                          checked={value === 'not-ok'}
                          onChange={() => setItemResponse(item.id, 'not-ok')}
                        />
                        Not OK
                      </label>
                      {isNc && <span className="nc-badge">NC</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div className="form-grid audit-meta-grid">
          <label className="form-field">
            <span>Auditor</span>
            <select value={auditor} onChange={(event) => setAuditor(event.target.value)}>
              {operators.map((operator) => (
                <option key={operator} value={operator}>
                  {operator}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Date</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>

          <label className="form-field form-field-full">
            <span>Remarks</span>
            <textarea
              rows={3}
              placeholder="General observations about the setup..."
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
            />
          </label>

          <label className="form-field form-field-full">
            <span>Corrective Action</span>
            <textarea
              rows={3}
              placeholder="Required if any checklist item is marked Not OK..."
              value={correctiveAction}
              onChange={(event) => setCorrectiveAction(event.target.value)}
            />
          </label>
        </div>

        {ncCount > 0 && (
          <p className="audit-nc-summary">
            {ncCount} non-conformance{ncCount > 1 ? 's' : ''} raised for this audit.
          </p>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => saveRecord('Draft')}>
            Save Draft
          </button>
          <button type="button" className="btn btn-primary" onClick={() => saveRecord('Completed')}>
            Complete Audit
          </button>
        </div>
      </section>

      <section className="audit-panel">
        <div className="panel-header">
          <FiList className="panel-header-icon" />
          <h2>Previous Audit Records</h2>
        </div>

        <div className="table-scroll">
          <table className="production-table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Product</th>
                <th>Auditor</th>
                <th>Date</th>
                <th>NC Count</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={`${record.batchId}-${record.date}-${index}`}>
                  <td>{record.batchId}</td>
                  <td>{record.productName}</td>
                  <td>{record.auditor}</td>
                  <td>{record.date}</td>
                  <td>{record.ncCount > 0 ? `${record.ncCount} NC` : '—'}</td>
                  <td>
                    <span className={`status-badge ${statusClass[record.status]}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default SetupAudit
