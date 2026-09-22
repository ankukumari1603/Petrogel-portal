import { useMemo, useState } from 'react'
import { FiActivity, FiList } from 'react-icons/fi'
import {
  operators,
  pelletMachineParameters,
  pelletMachineReadings,
  productionInstructions,
} from '../data/mockData.js'
import { addNotification } from '../data/notificationStore.js'
import { addAuditRecord } from '../data/auditStore.js'
import './PelletMachineReading.css'

const machines = ['Pelletizer P-1', 'Pelletizer P-2', 'Pelletizer P-3']
const productionStages = ['Pelletizing', 'Granulation', 'Cooling', 'Material Transfer']

const emptyForm = {
  batchId: productionInstructions[0]?.id ?? '',
  stage: 'Pelletizing',
  machine: machines[0],
  checkDateTime: '',
  parameterId: pelletMachineParameters[0]?.id ?? '',
  actualValue: '',
  remarks: '',
  operator: operators[0],
}

const statusClass = {
  Draft: 'status-draft',
  Completed: 'status-completed',
}

const resultClass = {
  PASS: 'status-pass',
  OOR: 'status-oor',
  '—': 'status-pending',
}

function formatSpecification(parameter) {
  if (!parameter) return ''
  const unit = parameter.unit ? ` ${parameter.unit}` : ''
  return `${parameter.specLow} – ${parameter.specHigh}${unit}`
}

function evaluateResult(parameter, actualValue) {
  if (!parameter || actualValue === '') return '—'
  const numericValue = parseFloat(actualValue)
  if (Number.isNaN(numericValue)) return '—'
  return numericValue >= parameter.specLow && numericValue <= parameter.specHigh ? 'PASS' : 'OOR'
}

function PelletMachineReading() {
  const [form, setForm] = useState(emptyForm)
  const [records, setRecords] = useState(pelletMachineReadings)
  const [alertMessage, setAlertMessage] = useState('')

  const selectedInstruction = useMemo(
    () => productionInstructions.find((item) => item.id === form.batchId),
    [form.batchId],
  )
  const selectedParameter = useMemo(
    () => pelletMachineParameters.find((item) => item.id === form.parameterId),
    [form.parameterId],
  )
  const result = useMemo(
    () => evaluateResult(selectedParameter, form.actualValue),
    [selectedParameter, form.actualValue],
  )

  const handleChange = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }))
  }

  const resetForm = () => setForm(emptyForm)

  const saveRecord = (status) => {
    if (!form.batchId || !selectedParameter) return
    if (status === 'Completed' && form.actualValue === '') return

    setRecords((previous) => [
      {
        batchId: form.batchId,
        machine: form.machine,
        parameter: selectedParameter.name,
        specification: formatSpecification(selectedParameter),
        actualValue: form.actualValue
          ? `${form.actualValue}${selectedParameter.unit ? ` ${selectedParameter.unit}` : ''}`
          : '',
        result,
        operator: form.operator,
        checkDateTime: form.checkDateTime,
        remarks: form.remarks,
        status,
      },
      ...previous,
    ])
    setAlertMessage(result === 'OOR'
      ? `OOR alert: ${selectedParameter.name} is outside the configured range for ${form.machine}.`
      : '')
    if (result === 'OOR') {
      addNotification({
        eventType: 'Machine OOR',
        message: `${selectedParameter.name} is outside range on ${form.machine}.`,
        batchId: form.batchId,
        priority: 'Critical',
        recipients: 'Supervisor, Maintenance',
      })
    }
    addAuditRecord({
      user: form.operator,
      role: 'Production Operator',
      action: result === 'OOR' ? 'OOR/FAIL result' : status === 'Draft' ? 'Save Draft' : 'Complete Test',
      module: 'Pellet Machine Reading',
      recordId: form.batchId,
      description: `${selectedParameter.name} recorded as ${result} on ${form.machine}.`,
      status: result === 'OOR' ? 'Failed' : status,
    })
    resetForm()
  }

  return (
    <div className="pellet-reading">
      <header className="pellet-reading-header">
        <h1>Pellet Machine Reading</h1>
        <p>Capture timestamped pelletizer readings and flag machine values outside specification</p>
      </header>

      {(result === 'OOR' || alertMessage) && (
        <div className="pellet-reading-alert" role="alert">
          <strong>OOR ALERT</strong>
          <span>{alertMessage || `${selectedParameter.name} is outside the configured specification.`}</span>
        </div>
      )}

      <section className="pellet-reading-panel">
        <div className="panel-header">
          <FiActivity className="panel-header-icon" />
          <h2>New Machine Reading</h2>
        </div>

        <form className="pellet-reading-form" onSubmit={(event) => event.preventDefault()}>
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
              <span>Production Stage</span>
              <select value={form.stage} onChange={handleChange('stage')}>
                {productionStages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
              </select>
            </label>
            <label className="form-field">
              <span>Machine / Pellet Machine</span>
              <select value={form.machine} onChange={handleChange('machine')}>
                {machines.map((machine) => <option key={machine} value={machine}>{machine}</option>)}
              </select>
            </label>
            <label className="form-field">
              <span>Operator</span>
              <select value={form.operator} onChange={handleChange('operator')}>
                {operators.map((operator) => <option key={operator} value={operator}>{operator}</option>)}
              </select>
            </label>
            <label className="form-field">
              <span>Reading Date / Time</span>
              <input type="datetime-local" value={form.checkDateTime} onChange={handleChange('checkDateTime')} />
            </label>
          </div>

          <div className="machine-reading-entry">
            <div className="entry-heading">
              <h3>Machine Reading Entry</h3>
              <span>Configured limits are evaluated automatically</span>
            </div>
            <div className="reading-grid">
              <label className="form-field">
                <span>Parameter</span>
                <select value={form.parameterId} onChange={handleChange('parameterId')}>
                  {pelletMachineParameters.map((parameter) => <option key={parameter.id} value={parameter.id}>{parameter.name}</option>)}
                </select>
              </label>
              <label className="form-field">
                <span>Minimum Limit</span>
                <input type="text" value={selectedParameter?.specLow ?? '—'} readOnly />
              </label>
              <label className="form-field">
                <span>Maximum Limit</span>
                <input type="text" value={selectedParameter?.specHigh ?? '—'} readOnly />
              </label>
              <label className="form-field">
                <span>Actual Reading</span>
                <input type="number" step="any" placeholder="Enter measured value" value={form.actualValue} onChange={handleChange('actualValue')} />
              </label>
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
            <textarea rows={3} placeholder="Observations about the machine reading..." value={form.remarks} onChange={handleChange('remarks')} />
          </label>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => saveRecord('Draft')}>Save Draft</button>
            <button type="button" className="btn btn-primary" onClick={() => saveRecord('Completed')}>Complete Reading</button>
          </div>
        </form>
      </section>

      <section className="pellet-reading-panel">
        <div className="panel-header">
          <FiList className="panel-header-icon" />
          <h2>Previous Machine Readings</h2>
        </div>
        <div className="machine-reading-table-wrap">
          <table className="machine-reading-table">
            <thead>
              <tr>
                <th>Batch</th><th>Machine</th><th>Parameter</th><th>Specification</th>
                <th>Actual Reading</th><th>Result</th><th>Operator</th><th>Date / Time</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={`${record.batchId}-${record.parameter}-${index}`}>
                  <td>{record.batchId}</td><td>{record.machine}</td><td>{record.parameter}</td>
                  <td>{record.specification}</td><td>{record.actualValue || '—'}</td>
                  <td><span className={`status-badge ${resultClass[record.result]}`}>{record.result}</span></td>
                  <td>{record.operator}</td><td>{record.checkDateTime || '—'}</td>
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

export default PelletMachineReading
