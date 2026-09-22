import { useMemo, useState } from 'react'
import { FiSearch, FiList } from 'react-icons/fi'
import {
  operators,
  productionInstructions,
  qcParameters,
  randomChecks,
} from '../data/mockData.js'
import { addNotification } from '../data/notificationStore.js'
import { addAuditRecord } from '../data/auditStore.js'
import './RandomChecks.css'

const emptyForm = {
  batchId: productionInstructions[0]?.id ?? '',
  stage: 'Boiler / Heating',
  checkDateTime: '',
  parameterId: qcParameters[0]?.id ?? '',
  actualValue: '',
  remarks: '',
  tester: operators[0],
}

const productionStages = [
  'Boiler / Heating',
  'Distribution',
  'Granulation',
  'Material Transfer',
  'Final Processing',
]

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
  if (!parameter || actualValue === '' || actualValue === null) return '—'
  const numericValue = parseFloat(actualValue)
  if (Number.isNaN(numericValue)) return '—'
  return numericValue >= parameter.specLow && numericValue <= parameter.specHigh
    ? 'PASS'
    : 'OOR'
}

function RandomChecks() {
  const [form, setForm] = useState(emptyForm)
  const [records, setRecords] = useState(randomChecks)
  const [alertMessage, setAlertMessage] = useState('')

  const selectedInstruction = useMemo(
    () => productionInstructions.find((item) => item.id === form.batchId),
    [form.batchId],
  )

  const selectedParameter = useMemo(
    () => qcParameters.find((item) => item.id === form.parameterId),
    [form.parameterId],
  )

  const result = useMemo(
    () => evaluateResult(selectedParameter, form.actualValue),
    [selectedParameter, form.actualValue],
  )

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const resetForm = () => {
    setForm(emptyForm)
  }

  const saveRecord = (status) => {
    if (!form.batchId || !selectedParameter) return
    if (status === 'Completed' && form.actualValue === '') return

    setRecords((prev) => [
      {
        batchId: form.batchId,
        sampleNo: `RC-${Date.now().toString().slice(-4)}`,
        checkDateTime: form.checkDateTime,
        stage: form.stage,
        parameter: selectedParameter.name,
        specification: formatSpecification(selectedParameter),
        actualValue: form.actualValue
          ? `${form.actualValue}${selectedParameter.unit ? ` ${selectedParameter.unit}` : ''}`
          : '',
        result,
        remarks: form.remarks,
        tester: form.tester,
        status,
      },
      ...prev,
    ])
    setAlertMessage(result === 'OOR'
      ? `OOR alert: ${selectedParameter.name} is outside the configured range for ${form.batchId}.`
      : '')
    if (result === 'OOR') {
      addNotification({
        eventType: 'Machine OOR',
        message: `${selectedParameter.name} is outside range on a random check for ${form.batchId}.`,
        batchId: form.batchId,
        priority: 'Critical',
        recipients: 'Supervisor, Maintenance',
      })
    }
    addAuditRecord({
      user: form.tester,
      role: 'QC Analyst',
      action: result === 'OOR' ? 'OOR/FAIL result' : status === 'Draft' ? 'Save Draft' : 'Complete Test',
      module: 'Random Checks',
      recordId: form.batchId,
      description: `${selectedParameter.name} recorded as ${result}.`,
      status: result === 'OOR' ? 'Failed' : status,
    })
    resetForm()
  }

  return (
    <div className="random-checks">
      <header className="random-checks-header">
        <h1>Random Checks</h1>
        <p>Log in-process random quality checks and automatically flag out-of-range results</p>
      </header>

      {(result === 'OOR' || alertMessage) && (
        <div className="random-check-alert" role="alert">
          <strong>OOR ALERT</strong>
          <span>{alertMessage || `${selectedParameter.name} is outside the configured specification.`}</span>
        </div>
      )}

      <section className="random-checks-panel">
        <div className="panel-header">
          <FiSearch className="panel-header-icon" />
          <h2>New Random Check</h2>
        </div>

        <form className="random-checks-form" onSubmit={(event) => event.preventDefault()}>
          <div className="form-grid">
            <label className="form-field">
              <span>Job / Batch Number</span>
              <select value={form.batchId} onChange={handleChange('batchId')}>
                {productionInstructions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.id}
                  </option>
                ))}
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
                {productionStages.map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Sample Number</span>
              <input
                type="text"
                placeholder="e.g. RC-1049"
                value={form.sampleNo}
                onChange={handleChange('sampleNo')}
              />
            </label>

            <label className="form-field">
              <span>Check Date/Time</span>
              <input
                type="datetime-local"
                value={form.checkDateTime}
                onChange={handleChange('checkDateTime')}
              />
            </label>

            <label className="form-field">
              <span>Parameter</span>
              <select value={form.parameterId} onChange={handleChange('parameterId')}>
                {qcParameters.map((parameter) => (
                  <option key={parameter.id} value={parameter.id}>
                    {parameter.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Specification / Set Point</span>
              <input type="text" value={formatSpecification(selectedParameter)} readOnly />
            </label>

            <label className="form-field">
              <span>Actual Reading</span>
              <input
                type="number"
                step="any"
                placeholder="Enter measured value"
                value={form.actualValue}
                onChange={handleChange('actualValue')}
              />
            </label>

            <label className="form-field">
              <span>Unit</span>
              <input type="text" value={selectedParameter?.unit || '—'} readOnly />
            </label>

            <label className="form-field">
              <span>Result</span>
              <input
                type="text"
                value={result}
                readOnly
                className={`result-input ${resultClass[result]}`}
              />
            </label>

            <label className="form-field">
              <span>Tester</span>
              <select value={form.tester} onChange={handleChange('tester')}>
                {operators.map((operator) => (
                  <option key={operator} value={operator}>
                    {operator}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="form-field form-field-full">
            <span>Remarks</span>
            <textarea
              rows={3}
              placeholder="Observations about this sample check..."
              value={form.remarks}
              onChange={handleChange('remarks')}
            />
          </label>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => saveRecord('Draft')}>
              Save Draft
            </button>
            <button type="button" className="btn btn-primary" onClick={() => saveRecord('Completed')}>
              Complete Check
            </button>
          </div>
        </form>
      </section>

      <section className="random-checks-panel">
        <div className="panel-header">
          <FiList className="panel-header-icon" />
          <h2>Previous Random Checks</h2>
        </div>

        <div className="table-scroll">
          <table className="production-table">
            <thead>
              <tr>
                <th>Job / Batch</th>
                <th>Stage</th>
                <th>Parameter</th>
                <th>Specification</th>
                <th>Actual</th>
                <th>Result</th>
                <th>Tester</th>
                <th>Date / Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={`${record.batchId}-${record.sampleNo}-${index}`}>
                  <td>{record.batchId}</td>
                  <td>{record.stage || '—'}</td>
                  <td>{record.parameter}</td>
                  <td>{record.specification}</td>
                  <td>{record.actualValue || '—'}</td>
                  <td>
                    <span className={`status-badge ${resultClass[record.result] ?? 'status-pending'}`}>
                      {record.result}
                    </span>
                  </td>
                  <td>{record.tester}</td>
                  <td>{record.checkDateTime || '—'}</td>
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

export default RandomChecks
