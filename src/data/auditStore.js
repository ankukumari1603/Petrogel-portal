const storageKey = 'petrogel.audit-trail'
const updateEvent = 'petrogel-audit-updated'

const seededAuditRecords = [
  { id: 'audit-1', dateTime: '2026-09-10 08:12', user: 'A. Fernandes', role: 'Production Operator', action: 'Create', module: 'Production Instruction', recordId: 'PB-2291', description: 'Production instruction created for Petrogel Lubricating Gel.', status: 'Completed' },
  { id: 'audit-2', dateTime: '2026-09-10 08:20', user: 'A. Fernandes', role: 'Production Operator', action: 'Save Draft', module: 'Production Instruction', recordId: 'PB-2291', description: 'Production instruction saved as draft before QC submission.', status: 'Draft' },
  { id: 'audit-3', dateTime: '2026-09-10 09:05', user: 'R. Gomes', role: 'Auditor', action: 'Complete Audit', module: 'Setup Audit', recordId: 'PB-2291', description: 'Setup checklist completed with no gaps.', status: 'Completed' },
  { id: 'audit-4', dateTime: '2026-09-10 11:18', user: 'S. Kulkarni', role: 'QC Analyst', action: 'OOR/FAIL result', module: 'Random Checks', recordId: 'PB-2287', description: 'Granulator speed 12.6 exceeded the configured 7–11 range.', status: 'Failed' },
  { id: 'audit-5', dateTime: '2026-09-10 15:10', user: 'S. Kulkarni', role: 'QC Analyst', action: 'Complete Test', module: 'In-Process Test', recordId: 'PB-2291', description: 'In-process Appearance test completed with PASS.', status: 'Completed' },
  { id: 'audit-6', dateTime: '2026-09-10 16:05', user: 'R. Gomes', role: 'QC Head', action: 'Workflow Sign-off', module: 'Workflow & Sign-off', recordId: 'PB-2291', description: 'QC Review approved for release workflow.', status: 'Approved' },
  { id: 'audit-7', dateTime: '2026-09-10 16:20', user: 'A. Fernandes', role: 'Plant Manager', action: 'Batch Release', module: 'Final Test & Release', recordId: 'PB-2291', description: 'Batch released after all final QC tests passed.', status: 'Completed' },
  { id: 'audit-8', dateTime: '2026-09-11 02:00', user: 'System Admin', role: 'Admin', action: 'Export/Report generation', module: 'Reports', recordId: '—', description: 'Daily production and QC report generated.', status: 'Completed' },
  { id: 'audit-9', dateTime: '2026-09-11 08:00', user: 'System Admin', role: 'Admin', action: 'Login', module: 'Platform', recordId: '—', description: 'User session started.', status: 'Completed' },
]

function readStoredAudit() {
  if (typeof window === 'undefined') return seededAuditRecords
  const stored = window.localStorage.getItem(storageKey)
  if (!stored) {
    window.localStorage.setItem(storageKey, JSON.stringify(seededAuditRecords))
    return seededAuditRecords
  }
  try {
    return JSON.parse(stored)
  } catch {
    window.localStorage.setItem(storageKey, JSON.stringify(seededAuditRecords))
    return seededAuditRecords
  }
}

export function getAuditRecords() {
  return readStoredAudit()
}

export function addAuditRecord(record) {
  if (typeof window === 'undefined') return
  const nextRecord = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    dateTime: new Date().toLocaleString(),
    status: 'Completed',
    ...record,
  }
  window.localStorage.setItem(storageKey, JSON.stringify([nextRecord, ...readStoredAudit()]))
  window.dispatchEvent(new CustomEvent(updateEvent))
}

export { updateEvent }
