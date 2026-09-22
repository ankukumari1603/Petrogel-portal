import { useMemo, useState } from 'react'
import { FiCheckSquare, FiList } from 'react-icons/fi'
import {
  inProcessTestParameters,
  inProcessTests,
  operators,
  productionInstructions,
} from '../data/mockData.js'
import { addNotification } from '../data/notificationStore.js'
import { addAuditRecord } from '../data/auditStore.js'
import './InProcessTest.css'

const productionStages = ['Pelletizing', 'Granulation', 'Cooling', 'Final Processing']

const emptyForm = {
  batchId: productionInstructions[0]?.id ?? '',
  sampleNo: '',
  stage: 'Final Processing',
  checkDateTime: '',
  parameterId: inProcessTestParameters[0]?.id ?? '',
  actualValue: '',
  remarks: '',
  tester: operators[0],
}

const statusClass = {
  Draft: 'status-draft',
  Completed: 'status-completed',
  'Submitted for QC Review': 'status-review',
}

const resultClass = {
  PASS: 'status-pass',
  'OOR / FAIL': 'status-oor',
  FAIL: 'status-oor',
  '—': 'status-pending',
}

function formatSpecification(parameter) {
  if (!parameter) return ''
  if (parameter.type === 'qualitative') return 'Pass / Fail'
  const unit = parameter.unit ? ` ${parameter.unit}` : ''
  return `${parameter.specLow} – ${parameter.specHigh}${unit}`
}

function evaluateResult(parameter, actualValue) {
  if (!parameter || actualValue === '') return '—'
  if (parameter.type === 'qualitative') return actualValue === 'Pass' ? 'PASS' : 'FAIL'
  const numericValue = parseFloat(actualValue)
  if (Number.isNaN(numericValue)) return '—'
  return numericValue >= parameter.specLow && numericValue <= parameter.specHigh
    ? 'PASS'
    : 'OOR / FAIL'
}

function InProcessTest() {
  const [form, setForm] = useState(emptyForm)
  const [records, setRecords] = useState(inProcessTests)
  const [alertMessage, setAlertMessage] = useState('')

  const selectedInstruction = useMemo(
    () => productionInstructions.find((item) => item.id === form.batchId),
    [form.batchId],
  )
  const selectedParameter = useMemo(
    () => inProcessTestParameters.find((item) => item.id === form.parameterId),
    [form.parameterId],
  )
  const result = useMemo(
    () => evaluateResult(selectedParameter, form.actualValue),
    [selectedParameter, form.actualValue],
  )
  const isFailure = result === 'OOR / FAIL' || result === 'FAIL'

  const handleChange = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }))
  }

  const resetForm = () => setForm(emptyForm)

  const saveRecord = (status) => {
    if (!form.batchId || !selectedParameter) return
    if (status !== 'Draft' && form.actualValue === '') return

    setRecords((previous) => [
      {
        batchId: form.batchId,
        sampleNo: form.sampleNo || `IP-${Date.now().toString().slice(-4)}`,
        parameter: selectedParameter.name,
        specification: formatSpecification(selectedParameter),
        actualValue: form.actualValue
          ? `${form.actualValue}${selectedParameter.type === 'numeric' && selectedParameter.unit ? ` ${selectedParameter.unit}` : ''}`
          : '',
        result,
        tester: form.tester,
        checkDateTime: form.checkDateTime,
        remarks: form.remarks,
        status,
      },
      ...previous,
    ])
    setAlertMessage(isFailure
      ? `QC warning: ${selectedParameter.name} requires review for Batch ${form.batchId}.`
      : '')
    if (isFailure) {
      addNotification({
        eventType: 'OOS / FAIL QC Test',
        message: `${selectedParameter.name} failed or is out of range for ${form.batchId}.`,
        batchId: form.batchId,
        priority: 'Critical',
        recipients: 'QC Analyst, Plant Manager',
      })
    }
    addAuditRecord({
      user: form.tester,
      role: 'QC Analyst',
      action: isFailure ? 'OOR/FAIL result' : status === 'Draft' ? 'Save Draft' : status === 'Submitted for QC Review' ? 'Submit for QC' : 'Complete Test',
      module: 'In-Process Test',
      recordId: form.batchId,
      description: `${selectedParameter.name} recorded as ${result}.`,
      status: isFailure ? 'Failed' : status,
    })
    resetForm()
  }

  return (
    <div className="in-process-test">
      <header className="in-process-test-header">
        <h1>In-Process Test</h1>
        <p>Record in-process quality results and automatically identify out-of-range or failed tests</p>
      </header>

      {(isFailure || alertMessage) && (
        <div className="in-process-alert" role="alert">
          <strong>QC WARNING</strong>
          <span>{alertMessage || `${selectedParameter.name} has a failing result and requires review.`}</span>
        </div>
      )}

      <section className="in-process-panel">
        <div className="panel-header">
          <FiCheckSquare className="panel-header-icon" />
          <h2>New In-Process Test</h2>
        </div>

        <form className="in-process-form" onSubmit={(event) => event.preventDefault()}>
          <div className="form-grid">
            <label className="form-field">
              <span>Job / Batch Number</span>
              <select value={form.batchId} onChange={handleChange('batchId')}>
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
              <span>Sample Number</span>
              <input type="text" placeholder="e.g. IP-2045" value={form.sampleNo} onChange={handleChange('sampleNo')} />
            </label>
            <label className="form-field">
              <span>Production Stage</span>
              <select value={form.stage} onChange={handleChange('stage')}>
                {productionStages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
              </select>
            </label>
            <label className="form-field">
              <span>Test Date / Time</span>
              <input type="datetime-local" value={form.checkDateTime} onChange={handleChange('checkDateTime')} />
            </label>
            <label className="form-field">
              <span>QC Analyst / Tester</span>
              <select value={form.tester} onChange={handleChange('tester')}>
                {operators.map((operator) => <option key={operator} value={operator}>{operator}</option>)}
              </select>
            </label>
          </div>

          <div className="qc-entry">
            <div className="qc-entry-heading">
              <h3>In-Process Test Parameters</h3>
              <span>Numeric limits and qualitative results validate automatically</span>
            </div>
            <div className="qc-entry-grid">
              <label className="form-field">
                <span>Test Parameter</span>
                <select value={form.parameterId} onChange={handleChange('parameterId')}>
                  {inProcessTestParameters.map((parameter) => <option key={parameter.id} value={parameter.id}>{parameter.name}</option>)}
                </select>
              </label>
              {selectedParameter?.type === 'numeric' ? (
                <>
                  <label className="form-field">
                    <span>Specification / Minimum</span>
                    <input type="text" value={selectedParameter.specLow} readOnly />
                  </label>
                  <label className="form-field">
                    <span>Specification / Maximum</span>
                    <input type="text" value={selectedParameter.specHigh} readOnly />
                  </label>
                  <label className="form-field">
                    <span>Actual Result</span>
                    <input type="number" step="any" placeholder="Enter measured value" value={form.actualValue} onChange={handleChange('actualValue')} />
                  </label>
                </>
              ) : (
                <label className="form-field qualitative-field">
                  <span>Actual Result</span>
                  <select value={form.actualValue} onChange={handleChange('actualValue')}>
                    <option value="">Select result</option>
                    {selectedParameter?.options.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
              )}
              <label className="form-field">
                <span>Unit</span>
                <input type="text" value={selectedParameter?.unit || '—'} readOnly />
              </label>
              <label className="form-field">
                <span>Result</span>
                <input type="text" value={result} readOnly className={`result-input ${resultClass[result]}`} />
              </label>
            </div>
          </div>

          <label className="form-field form-field-full">
            <span>Remarks</span>
            <textarea rows={3} placeholder="Observations, method notes or deviations..." value={form.remarks} onChange={handleChange('remarks')} />
          </label>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => saveRecord('Draft')}>Save Draft</button>
            <button type="button" className="btn btn-secondary" onClick={() => saveRecord('Submitted for QC Review')}>Submit for QC Review</button>
            <button type="button" className="btn btn-primary" onClick={() => saveRecord('Completed')}>Complete Test</button>
          </div>
        </form>
      </section>

      <section className="in-process-panel">
        <div className="panel-header">
          <FiList className="panel-header-icon" />
          <h2>Previous In-Process Tests</h2>
        </div>
        <div className="qc-table-wrap">
          <table className="qc-table">
            <thead>
              <tr><th>Batch</th><th>Sample</th><th>Parameter</th><th>Specification</th><th>Actual Result</th><th>Result</th><th>Tester</th><th>Date / Time</th><th>Status</th></tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={`${record.batchId}-${record.sampleNo}-${index}`}>
                  <td>{record.batchId}</td><td>{record.sampleNo}</td><td>{record.parameter}</td><td>{record.specification}</td>
                  <td>{record.actualValue || '—'}</td>
                  <td><span className={`status-badge ${resultClass[record.result]}`}>{record.result}</span></td>
                  <td>{record.tester}</td><td>{record.checkDateTime || '—'}</td>
                  <td><span className={`status-badge ${statusClass[record.status]}`}>{record.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default InProcessTest
