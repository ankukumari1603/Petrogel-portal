import { useMemo, useState } from 'react'
import { FiList, FiUnlock } from 'react-icons/fi'
import {
  finalTestReleases,
  inProcessTestParameters,
  operators,
  productionInstructions,
} from '../data/mockData.js'
import { addNotification } from '../data/notificationStore.js'
import { addAuditRecord } from '../data/auditStore.js'
import './FinalTestRelease.css'

const emptyActuals = inProcessTestParameters.reduce((values, parameter) => {
  values[parameter.id] = ''
  return values
}, {})

const emptyRemarks = inProcessTestParameters.reduce((values, parameter) => {
  values[parameter.id] = ''
  return values
}, {})

const emptyForm = {
  batchId: productionInstructions[0]?.id ?? '',
  qcAnalyst: operators[0],
  productionDate: productionInstructions[0]?.productionDate ?? '',
  finalDateTime: '',
  qcDecision: 'HOLD / NOT RELEASED',
  releaseReason: '',
  releasedBy: '',
  releaseDateTime: '',
}

const statusClass = {
  Released: 'release-released',
  'On Hold': 'release-hold',
  'Pending Review': 'release-review',
  'READY FOR RELEASE': 'release-ready',
  'HOLD / NOT RELEASED': 'release-hold',
}

function formatSpecification(parameter) {
  if (parameter.type === 'qualitative') return 'Pass / Fail'
  const unit = parameter.unit ? ` ${parameter.unit}` : ''
  return `${parameter.specLow} – ${parameter.specHigh}${unit}`
}

function getResult(parameter, value) {
  if (!value) return '—'
  if (parameter.type === 'qualitative') return value === 'Pass' ? 'PASS' : 'FAIL'
  const numericValue = parseFloat(value)
  if (Number.isNaN(numericValue)) return 'OOR / FAIL'
  return numericValue >= parameter.specLow && numericValue <= parameter.specHigh ? 'PASS' : 'OOR / FAIL'
}

function FinalTestRelease() {
  const [form, setForm] = useState(emptyForm)
  const [actuals, setActuals] = useState(emptyActuals)
  const [remarks, setRemarks] = useState(emptyRemarks)
  const [records, setRecords] = useState(finalTestReleases)
  const [alertMessage, setAlertMessage] = useState('')

  const selectedInstruction = useMemo(
    () => productionInstructions.find((item) => item.id === form.batchId),
    [form.batchId],
  )

  const results = useMemo(
    () => inProcessTestParameters.reduce((values, parameter) => {
      values[parameter.id] = getResult(parameter, actuals[parameter.id])
      return values
    }, {}),
    [actuals],
  )

  const completedCount = Object.values(results).filter((result) => result === 'PASS').length
  const hasFailure = Object.values(results).some((result) => result === 'OOR / FAIL' || result === 'FAIL')
  const allTestsPass = completedCount === inProcessTestParameters.length
  const overallStatus = allTestsPass ? 'READY FOR RELEASE' : 'HOLD / NOT RELEASED'

  const handleFormChange = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }))
  }

  const handleActualChange = (parameterId) => (event) => {
    setActuals((previous) => ({ ...previous, [parameterId]: event.target.value }))
  }

  const handleRemarkChange = (parameterId) => (event) => {
    setRemarks((previous) => ({ ...previous, [parameterId]: event.target.value }))
  }

  const resetEntry = () => {
    setActuals(emptyActuals)
    setRemarks(emptyRemarks)
    setForm((previous) => ({ ...emptyForm, batchId: previous.batchId, qcAnalyst: previous.qcAnalyst }))
  }

  const saveRecord = (releaseStatus) => {
    if (!form.batchId) return
    if (releaseStatus === 'Released' && !allTestsPass) {
      setAlertMessage('Release blocked: every required final QC test must be PASS before this batch can be released.')
      addNotification({
        eventType: 'OOS / FAIL QC Test',
        message: `Final QC release blocked for ${form.batchId}; one or more required tests failed.`,
        batchId: form.batchId,
        priority: 'Critical',
        recipients: 'QC Analyst, Plant Manager',
      })
      addAuditRecord({
        user: form.qcAnalyst,
        role: 'QC Analyst',
        action: 'Batch Hold',
        module: 'Final Test & Release',
        recordId: form.batchId,
        description: 'Release blocked because final QC contains a failed or incomplete test.',
        status: 'Failed',
      })
      return
    }

    setRecords((previous) => [{
      batchId: form.batchId,
      productName: selectedInstruction?.productName ?? '',
      testsCompleted: `${completedCount} / ${inProcessTestParameters.length}`,
      overallResult: releaseStatus === 'Released' ? 'READY FOR RELEASE' : overallStatus,
      analyst: form.qcAnalyst,
      releaseStatus,
      checkDateTime: form.finalDateTime,
    }, ...previous])
    setAlertMessage(releaseStatus === 'Released'
      ? `Batch ${form.batchId} released successfully.`
      : `Batch ${form.batchId} placed on hold pending QC review.`)
    if (releaseStatus === 'Released') {
      addNotification({
        eventType: 'Batch Released',
        message: `Batch ${form.batchId} released successfully and is ready for dispatch.`,
        batchId: form.batchId,
        priority: 'Normal',
        recipients: 'Production, Dispatch',
      })
    }
    addAuditRecord({
      user: releaseStatus === 'Released' ? (form.releasedBy || form.qcAnalyst) : form.qcAnalyst,
      role: releaseStatus === 'Released' ? 'Plant Manager' : 'QC Analyst',
      action: releaseStatus === 'Released' ? 'Batch Release' : 'Batch Hold',
      module: 'Final Test & Release',
      recordId: form.batchId,
      description: releaseStatus === 'Released' ? 'Batch released after final QC approval.' : 'Batch placed on hold pending review.',
      status: releaseStatus === 'Released' ? 'Completed' : 'Failed',
    })
    resetEntry()
  }

  return (
    <div className="final-test-release">
      <header className="final-test-release-header">
        <h1>Final Test &amp; Release</h1>
        <p>Complete final QC verification and release only conforming PETROGEL batches</p>
      </header>

      {alertMessage && (
        <div className={`final-release-alert${hasFailure ? ' final-release-alert-danger' : ''}`} role="alert">
          <strong>{hasFailure ? 'RELEASE BLOCKED' : 'RELEASE UPDATE'}</strong>
          <span>{alertMessage}</span>
        </div>
      )}

      <section className="final-release-panel">
        <div className="panel-header">
          <FiUnlock className="panel-header-icon" />
          <h2>New Final Test &amp; Release</h2>
        </div>

        <div className="form-grid final-batch-grid">
          <label className="form-field">
            <span>Job / Batch Number</span>
            <select value={form.batchId} onChange={handleFormChange('batchId')}>
              {productionInstructions.map((item) => <option key={item.id} value={item.id}>{item.id}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Product</span>
            <input type="text" value={selectedInstruction?.productName ?? ''} readOnly />
          </label>
          <label className="form-field">
            <span>Product Variation</span>
            <input type="text" value={selectedInstruction?.variation ?? ''} readOnly />
          </label>
          <label className="form-field">
            <span>Batch Quantity</span>
            <input type="text" value={selectedInstruction?.quantity ?? ''} readOnly />
          </label>
          <label className="form-field">
            <span>Production Date</span>
            <input type="date" value={form.productionDate} onChange={handleFormChange('productionDate')} />
          </label>
          <label className="form-field">
            <span>QC Analyst</span>
            <select value={form.qcAnalyst} onChange={handleFormChange('qcAnalyst')}>
              {operators.map((operator) => <option key={operator} value={operator}>{operator}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Final Test Date / Time</span>
            <input type="datetime-local" value={form.finalDateTime} onChange={handleFormChange('finalDateTime')} />
          </label>
        </div>

        <div className="final-test-entry">
          <div className="final-entry-heading">
            <div>
              <h3>Final QC Test Parameters</h3>
              <span>{completedCount} of {inProcessTestParameters.length} required tests passing</span>
            </div>
            <div className={`overall-decision ${statusClass[overallStatus]}`}>
              {overallStatus}
            </div>
          </div>
          <div className="final-parameter-list">
            {inProcessTestParameters.map((parameter) => {
              const result = results[parameter.id]
              const isFailed = result === 'OOR / FAIL' || result === 'FAIL'
              return (
                <div className={`final-parameter-row${isFailed ? ' final-parameter-failed' : ''}`} key={parameter.id}>
                  <div className="final-parameter-name">{parameter.name}</div>
                  <div className="final-parameter-spec">{formatSpecification(parameter)}</div>
                  <div className="final-actual-control">
                    {parameter.type === 'qualitative' ? (
                      <select aria-label={`${parameter.name} actual result`} value={actuals[parameter.id]} onChange={handleActualChange(parameter.id)}>
                        <option value="">Select</option>
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                      </select>
                    ) : (
                      <input aria-label={`${parameter.name} actual result`} type="number" step="any" placeholder="Actual" value={actuals[parameter.id]} onChange={handleActualChange(parameter.id)} />
                    )}
                  </div>
                  <div className="final-parameter-unit">{parameter.unit || '—'}</div>
                  <div className={`final-parameter-result ${result === 'PASS' ? 'result-pass' : ''} ${isFailed ? 'result-failed' : ''}`}>
                    {result}
                  </div>
                  <input className="final-parameter-remark" aria-label={`${parameter.name} remarks`} type="text" placeholder="Remarks" value={remarks[parameter.id]} onChange={handleRemarkChange(parameter.id)} />
                </div>
              )
            })}
          </div>
        </div>

        <section className="release-section">
          <div className="release-section-heading">
            <h3>Overall Batch Decision</h3>
            <span className={`overall-decision ${statusClass[overallStatus]}`}>{overallStatus}</span>
          </div>
          <div className="release-grid">
            <label className="form-field">
              <span>QC Decision</span>
              <input type="text" value={overallStatus} readOnly />
            </label>
            <label className="form-field release-reason-field">
              <span>Release / Hold Reason</span>
              <input type="text" placeholder={hasFailure ? 'Required: explain failed test or deviation' : 'Optional release note'} value={form.releaseReason} onChange={handleFormChange('releaseReason')} />
            </label>
            <label className="form-field">
              <span>Released By</span>
              <input type="text" placeholder="Enter approving user" value={form.releasedBy} onChange={handleFormChange('releasedBy')} />
            </label>
            <label className="form-field">
              <span>Release Date / Time</span>
              <input type="datetime-local" value={form.releaseDateTime} onChange={handleFormChange('releaseDateTime')} />
            </label>
          </div>
          <div className="form-actions final-release-actions">
            <button type="button" className="btn btn-secondary" onClick={() => saveRecord('On Hold')}>Hold Batch</button>
            <button type="button" className="btn btn-primary" disabled={!allTestsPass} onClick={() => saveRecord('Released')}>Release Batch</button>
          </div>
        </section>
      </section>

      <section className="final-release-panel">
        <div className="panel-header">
          <FiList className="panel-header-icon" />
          <h2>Previous Final Tests &amp; Releases</h2>
        </div>
        <div className="final-release-table-wrap">
          <table className="final-release-table">
            <thead>
              <tr><th>Batch</th><th>Product</th><th>Tests Completed</th><th>Overall Result</th><th>QC Analyst</th><th>Release Status</th><th>Date / Time</th></tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={`${record.batchId}-${record.checkDateTime}-${index}`}>
                  <td>{record.batchId}</td><td>{record.productName}</td><td>{record.testsCompleted}</td>
                  <td><span className={`status-badge ${statusClass[record.overallResult]}`}>{record.overallResult}</span></td>
                  <td>{record.analyst}</td><td><span className={`status-badge ${statusClass[record.releaseStatus]}`}>{record.releaseStatus}</span></td>
                  <td>{record.checkDateTime || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default FinalTestRelease
