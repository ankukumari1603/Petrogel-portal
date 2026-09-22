import { useMemo, useState } from 'react'
import { FiCheckCircle, FiGitBranch, FiList } from 'react-icons/fi'
import { productionInstructions, workflowHistory as seededHistory } from '../data/mockData.js'
import { addAuditRecord } from '../data/auditStore.js'
import './WorkflowSignoff.css'

const stageTemplate = [
  { name: 'Production Instruction', person: 'A. Fernandes', role: 'Production Operator', remarks: 'Job instruction issued for production run.' },
  { name: 'Setup Audit', person: 'R. Gomes', role: 'Production Operator', remarks: 'Equipment and material setup verification.' },
  { name: 'Random Checks', person: 'S. Kulkarni', role: 'QC Analyst', remarks: 'In-process random readings and OOR monitoring.' },
  { name: 'Pellet Machine Reading', person: 'M. Pereira', role: 'Production Operator', remarks: 'Pelletizer readings captured during run.' },
  { name: 'In-Process Test', person: 'S. Kulkarni', role: 'QC Analyst', remarks: 'In-process laboratory test results.' },
  { name: 'Final Test', person: 'S. Kulkarni', role: 'QC Analyst', remarks: 'Final QC parameters verified.' },
  { name: 'QC Review', person: 'R. Gomes', role: 'QC Head', remarks: 'Review results and authorize release decision.' },
  { name: 'Batch Release', person: 'A. Fernandes', role: 'Plant Manager', remarks: 'Release batch to warehouse.' },
]

const signoffTemplate = [
  { role: 'Production Operator', name: 'A. Fernandes', stage: 'Production Instruction' },
  { role: 'QC Analyst', name: 'S. Kulkarni', stage: 'In-Process Test' },
  { role: 'QC Head', name: 'R. Gomes', stage: 'QC Review' },
  { role: 'Plant Manager', name: 'A. Fernandes', stage: 'Batch Release' },
]

const initialStages = (batchId) => stageTemplate.map((stage, index) => {
  if (batchId === 'PB-2287' && index >= 2) {
    return { ...stage, status: index === 2 ? 'Failed' : 'On Hold', dateTime: index === 2 ? '2026-09-09 11:18' : '—' }
  }
  if (index < 6) return { ...stage, status: 'Completed', dateTime: `2026-09-${10 - Math.min(index, 4)} 1${index}:0${index}` }
  if (index === 6) return { ...stage, status: 'In Progress', dateTime: '—' }
  return { ...stage, status: 'Pending', dateTime: '—' }
})

const initialSignoffs = () => signoffTemplate.map((signoff, index) => ({
  ...signoff,
  status: index === 0 ? 'Approved' : 'Pending',
  dateTime: index === 0 ? '2026-09-10 08:15' : '—',
}))

const statusClass = {
  Pending: 'workflow-pending',
  'In Progress': 'workflow-progress',
  Completed: 'workflow-completed',
  Approved: 'workflow-completed',
  Failed: 'workflow-failed',
  'On Hold': 'workflow-hold',
  Released: 'workflow-completed',
}

function nowLabel() {
  return new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date())
}

function WorkflowSignoff() {
  const [batchId, setBatchId] = useState(productionInstructions[0]?.id ?? '')
  const [stages, setStages] = useState(() => initialStages(batchId))
  const [signoffs, setSignoffs] = useState(initialSignoffs)
  const [history, setHistory] = useState(seededHistory)
  const [alertMessage, setAlertMessage] = useState('')

  const selectedInstruction = useMemo(
    () => productionInstructions.find((item) => item.id === batchId),
    [batchId],
  )

  const hasFailure = stages.some((stage) => stage.status === 'Failed' || stage.status === 'On Hold')
  const releaseStage = stages[stages.length - 1]
  const overallStatus = releaseStage.status === 'Completed' || releaseStage.status === 'Approved'
    ? 'Released'
    : hasFailure
      ? 'QC Failed / On Hold'
      : stages[6].status === 'Completed' || stages[6].status === 'Approved'
        ? 'Ready for Release'
        : stages.some((stage) => stage.status === 'In Progress')
          ? 'Awaiting QC'
          : 'In Progress'

  const changeBatch = (event) => {
    const nextBatch = event.target.value
    setBatchId(nextBatch)
    setStages(initialStages(nextBatch))
    setSignoffs(initialSignoffs())
    setAlertMessage('')
  }

  const approveStage = (stageIndex, actor = stages[stageIndex].person, role = stages[stageIndex].role) => {
    const stage = stages[stageIndex]
    const previousStage = stages[stageIndex - 1]
    if (stage.status === 'Failed' || stage.status === 'On Hold') {
      setAlertMessage(`${stage.name} is ${stage.status.toLowerCase()} and cannot be approved.`)
      return
    }
    if (previousStage && !['Completed', 'Approved'].includes(previousStage.status)) {
      setAlertMessage(`${stage.name} cannot be approved until ${previousStage.name} is completed.`)
      return
    }
    if (stage.name === 'Batch Release' && hasFailure) {
      setAlertMessage('Batch Release is blocked because this batch has a failed or on-hold QC step.')
      return
    }

    const timestamp = nowLabel()
    setStages((previous) => previous.map((item, index) => index === stageIndex
      ? { ...item, status: stage.name === 'Batch Release' ? 'Completed' : 'Approved', dateTime: timestamp }
      : item))
    setHistory((previous) => [{
      batchId, stage: stage.name, person: actor, role, action: stage.name === 'Batch Release' ? 'Released' : 'Approved', dateTime: timestamp, status: 'Completed',
    }, ...previous])
    addAuditRecord({
      user: actor,
      role,
      action: stage.name === 'Batch Release' ? 'Batch Release' : 'Workflow Sign-off',
      module: 'Workflow & Sign-off',
      recordId: batchId,
      description: `${stage.name} approved in the batch workflow.`,
      status: 'Approved',
    })
    setAlertMessage(`${stage.name} approved and recorded at ${timestamp}.`)
  }

  const approveSignoff = (signoffIndex) => {
    const signoff = signoffs[signoffIndex]
    const stageIndex = stageTemplate.findIndex((stage) => stage.name === signoff.stage)
    approveStage(stageIndex, signoff.name, signoff.role)
    if (stages[stageIndex].status === 'Failed' || stages[stageIndex].status === 'On Hold') return
    const timestamp = nowLabel()
    setSignoffs((previous) => previous.map((item, index) => index === signoffIndex
      ? { ...item, status: 'Approved', dateTime: timestamp }
      : item))
  }

  return (
    <div className="workflow-signoff">
      <header className="workflow-header">
        <div>
          <h1>Workflow &amp; Sign-off</h1>
          <p>Track the complete PETROGEL batch lifecycle, approvals and release controls</p>
        </div>
        <div className={`workflow-overall ${overallStatus === 'Released' ? 'workflow-completed' : hasFailure ? 'workflow-failed' : 'workflow-progress'}`}>
          <span>Overall Batch Status</span>
          <strong>{overallStatus}</strong>
        </div>
      </header>

      {alertMessage && <div className={`workflow-alert${hasFailure ? ' workflow-alert-danger' : ''}`} role="alert"><strong>WORKFLOW NOTICE</strong><span>{alertMessage}</span></div>}

      <section className="workflow-panel workflow-context">
        <div className="panel-header"><FiGitBranch className="panel-header-icon" /><h2>Selected Batch</h2></div>
        <div className="workflow-context-grid">
          <label className="form-field"><span>Job / Batch Number</span><select value={batchId} onChange={changeBatch}>{productionInstructions.map((item) => <option key={item.id} value={item.id}>{item.id}</option>)}</select></label>
          <label className="form-field"><span>Product</span><input value={selectedInstruction?.productName ?? ''} readOnly /></label>
          <label className="form-field"><span>Product Variation</span><input value={selectedInstruction?.variation ?? ''} readOnly /></label>
          <label className="form-field"><span>Batch Quantity</span><input value={selectedInstruction?.quantity ?? ''} readOnly /></label>
        </div>
      </section>

      <section className="workflow-panel">
        <div className="panel-header"><FiGitBranch className="panel-header-icon" /><h2>Batch Workflow Timeline</h2></div>
        <div className="workflow-timeline">
          {stages.map((stage, index) => (
            <article className={`workflow-stage ${statusClass[stage.status]}`} key={stage.name}>
              <div className="workflow-stage-marker">{index + 1}</div>
              <div className="workflow-stage-content">
                <div className="workflow-stage-top"><div><h3>{stage.name}</h3><span>{stage.role} · {stage.person}</span></div><span className={`status-badge ${statusClass[stage.status]}`}>{stage.status}</span></div>
                <div className="workflow-stage-meta"><span><b>Date/Time</b>{stage.dateTime}</span><span><b>Remarks</b>{stage.remarks}</span></div>
                <button type="button" className="btn btn-secondary workflow-approve-button" onClick={() => approveStage(index)} disabled={['Completed', 'Approved', 'Failed', 'On Hold'].includes(stage.status)}>{stage.name === 'Batch Release' ? 'Approve & Release' : 'Approve Stage'}</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-panel">
        <div className="panel-header"><FiCheckCircle className="panel-header-icon" /><h2>Electronic Sign-off</h2></div>
        <div className="signoff-grid">
          {signoffs.map((signoff, index) => (
            <article className="signoff-card" key={signoff.role}>
              <div className="signoff-role">{signoff.role}</div>
              <strong>{signoff.name}</strong>
              <span>Required for: {signoff.stage}</span>
              <div className="signoff-details"><span>Status <b className={statusClass[signoff.status]}>{signoff.status}</b></span><span>Date/Time <b>{signoff.dateTime}</b></span></div>
              <button type="button" className="btn btn-primary" onClick={() => approveSignoff(index)} disabled={signoff.status === 'Approved'}>{signoff.status === 'Approved' ? 'Approved' : 'Sign / Approve'}</button>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-panel">
        <div className="panel-header"><FiList className="panel-header-icon" /><h2>Workflow History</h2></div>
        <div className="workflow-table-wrap"><table className="workflow-table"><thead><tr><th>Batch</th><th>Stage</th><th>Person</th><th>Role</th><th>Action</th><th>Date/Time</th><th>Status</th></tr></thead><tbody>{history.map((record, index) => <tr key={`${record.batchId}-${record.stage}-${index}`}><td>{record.batchId}</td><td>{record.stage}</td><td>{record.person}</td><td>{record.role}</td><td>{record.action}</td><td>{record.dateTime}</td><td><span className={`status-badge ${statusClass[record.status]}`}>{record.status}</span></td></tr>)}</tbody></table></div>
      </section>
    </div>
  )
}

export default WorkflowSignoff
