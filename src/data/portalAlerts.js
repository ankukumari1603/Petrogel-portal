import { toArray } from '../utils/arrayUtils.js'

export function buildAlerts(records) {
  const alerts = toArray(records.alerts)
  const resolvedIds = new Set(alerts.filter((alert) => alert.status === 'Resolved').map((alert) => alert.id))
  const lowStock = toArray(records.inventory).filter((item) => item.stockStatus === 'LOW STOCK').map((item) => ({ id: `AUTO-STOCK-${item.id}`, type: 'Low Stock', priority: 'High', description: `${item.name} is below minimum stock.`, related: item.id, date: item.updated, status: 'Open' }))
  const failedQc = toArray(records.qc).filter((item) => item.result === 'FAIL').map((item) => ({ id: `AUTO-QC-${item.id}`, type: 'QC Failed', priority: 'High', description: `${item.parameter} failed for ${item.batch}.`, related: item.batch, date: item.testDate, status: 'Open' }))
  const pendingQc = toArray(records.qc).filter((item) => item.result === 'PENDING').map((item) => ({ id: `AUTO-PENDING-${item.id}`, type: 'QC Pending', priority: 'Medium', description: `QC result is pending for ${item.batch}.`, related: item.batch, date: item.testDate, status: 'Open' }))
  const overdue = toArray(records.requirements).filter((item) => item.dueDate < new Date().toISOString().slice(0, 10) && !['Completed', 'Approved', 'Rejected'].includes(item.status)).map((item) => ({ id: `AUTO-REQ-${item.id}`, type: 'Overdue Requirement', priority: 'Medium', description: `${item.id} has passed its due date.`, related: item.customer, date: item.dueDate, status: 'Open' }))
  const delayed = toArray(records.production).filter((item) => item.status === 'On Hold').map((item) => ({ id: `AUTO-PROD-${item.id}`, type: 'Production Delay', priority: 'High', description: `${item.batch} is on hold.`, related: item.batch, date: item.date, status: 'Open' }))
  return [...alerts, ...[...lowStock, ...failedQc, ...pendingQc, ...overdue, ...delayed].filter((alert) => !resolvedIds.has(alert.id))]
}