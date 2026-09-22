import { useState } from 'react'
import { FiFileText, FiList } from 'react-icons/fi'
import { machines, operators, productionInstructions } from '../data/mockData.js'
import { addAuditRecord } from '../data/auditStore.js'
import './ProductionInstruction.css'

const emptyForm = {
  batchId: '',
  productName: '',
  variation: '',
  quantity: '',
  productionDate: '',
  machine: machines[0],
  operator: operators[0],
  instructions: '',
}

const statusClass = {
  Draft: 'status-draft',
  'In QC': 'status-in-qc',
  Released: 'status-released',
  Completed: 'status-completed',
}

function ProductionInstruction() {
  const [form, setForm] = useState(emptyForm)
  const [records, setRecords] = useState(productionInstructions)

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const addRecord = (status) => {
    if (!form.batchId || !form.productName) return

    const { batchId, ...rest } = form
    setRecords((prev) => [{ id: batchId, ...rest, status }, ...prev])
    addAuditRecord({
      user: form.operator,
      role: 'Production Operator',
      action: status === 'Draft' ? 'Save Draft' : 'Submit for QC',
      module: 'Production Instruction',
      recordId: batchId,
      description: `${status === 'Draft' ? 'Draft saved' : 'Instruction submitted for QC'} for ${form.productName}.`,
      status: status === 'Draft' ? 'Draft' : 'Completed',
    })
    setForm(emptyForm)
  }

  return (
    <div className="production-instruction">
      <header className="production-header">
        <h1>Production Instruction</h1>
        <p>Create and track production job instructions before they move to QC</p>
      </header>

      <section className="production-panel">
        <div className="panel-header">
          <FiFileText className="panel-header-icon" />
          <h2>New Production Instruction</h2>
        </div>

        <form
          className="production-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="form-grid">
            <label className="form-field">
              <span>Batch ID</span>
              <input
                type="text"
                placeholder="e.g. PB-2301"
                value={form.batchId}
                onChange={handleChange('batchId')}
              />
            </label>

            <label className="form-field">
              <span>Product Name</span>
              <input
                type="text"
                placeholder="e.g. Petrogel Lubricating Gel"
                value={form.productName}
                onChange={handleChange('productName')}
              />
            </label>

            <label className="form-field">
              <span>Product Variation</span>
              <input
                type="text"
                placeholder="e.g. Standard Viscosity"
                value={form.variation}
                onChange={handleChange('variation')}
              />
            </label>

            <label className="form-field">
              <span>Quantity</span>
              <input
                type="text"
                placeholder="e.g. 500 kg"
                value={form.quantity}
                onChange={handleChange('quantity')}
              />
            </label>

            <label className="form-field">
              <span>Production Date</span>
              <input
                type="date"
                value={form.productionDate}
                onChange={handleChange('productionDate')}
              />
            </label>

            <label className="form-field">
              <span>Machine</span>
              <select value={form.machine} onChange={handleChange('machine')}>
                {machines.map((machine) => (
                  <option key={machine} value={machine}>
                    {machine}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Operator</span>
              <select value={form.operator} onChange={handleChange('operator')}>
                {operators.map((operator) => (
                  <option key={operator} value={operator}>
                    {operator}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="form-field form-field-full">
            <span>Process Instructions</span>
            <textarea
              rows={4}
              placeholder="Describe the production process steps..."
              value={form.instructions}
              onChange={handleChange('instructions')}
            />
          </label>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => addRecord('Draft')}
            >
              Save Draft
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => addRecord('In QC')}
            >
              Submit for QC
            </button>
          </div>
        </form>
      </section>

      <section className="production-panel">
        <div className="panel-header">
          <FiList className="panel-header-icon" />
          <h2>Existing Production Instructions</h2>
        </div>

        <div className="table-scroll">
          <table className="production-table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Product</th>
                <th>Variation</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>Machine</th>
                <th>Operator</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.productName}</td>
                  <td>{record.variation}</td>
                  <td>{record.quantity}</td>
                  <td>{record.productionDate}</td>
                  <td>{record.machine}</td>
                  <td>{record.operator}</td>
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

export default ProductionInstruction
