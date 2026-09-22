import { recentNotifications } from './mockData.js'

const storageKey = 'petrogel.notifications'
const updateEvent = 'petrogel-notifications-updated'

const seededNotifications = [
  ...recentNotifications.map((notification, index) => ({
    id: `seed-${notification.id}`,
    eventType: notification.type === 'alert' ? 'OOS / FAIL QC Test' : 'System Update',
    message: notification.message,
    batchId: notification.message.match(/PB-\d+/)?.[0] ?? '—',
    dateTime: notification.time,
    priority: notification.type === 'alert' ? 'Critical' : 'Normal',
    read: index > 1,
    recipients: notification.type === 'alert' ? 'QC Analyst, Plant Manager' : 'Plant Team',
  })),
  {
    id: 'seed-release',
    eventType: 'Batch Released',
    message: 'Batch PB-2291 released and cleared for dispatch.',
    batchId: 'PB-2291',
    dateTime: '2026-09-10 16:20',
    priority: 'Normal',
    read: false,
    recipients: 'Production, Dispatch',
  },
  {
    id: 'seed-audit',
    eventType: 'Setup Audit Gap',
    message: 'Setup Audit gap recorded on Batch PB-2287; corrective action required.',
    batchId: 'PB-2287',
    dateTime: '2026-09-09 09:15',
    priority: 'High',
    read: false,
    recipients: 'Auditor, Plant Manager',
  },
  {
    id: 'seed-backup',
    eventType: 'Backup / Restore',
    message: 'Nightly portal backup completed successfully.',
    batchId: '—',
    dateTime: '2026-09-09 02:00',
    priority: 'Normal',
    read: true,
    recipients: 'Admin',
  },
]

function readStoredNotifications() {
  if (typeof window === 'undefined') return seededNotifications
  const stored = window.localStorage.getItem(storageKey)
  if (!stored) {
    window.localStorage.setItem(storageKey, JSON.stringify(seededNotifications))
    return seededNotifications
  }
  try {
    return JSON.parse(stored)
  } catch {
    window.localStorage.setItem(storageKey, JSON.stringify(seededNotifications))
    return seededNotifications
  }
}

function writeNotifications(notifications) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(storageKey, JSON.stringify(notifications))
  window.dispatchEvent(new CustomEvent(updateEvent))
}

export function getNotifications() {
  return readStoredNotifications()
}

export function addNotification(notification) {
  const nextNotification = {
    id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    dateTime: new Date().toLocaleString(),
    read: false,
    ...notification,
  }
  writeNotifications([nextNotification, ...readStoredNotifications()])
}

export function markNotificationRead(id) {
  writeNotifications(readStoredNotifications().map((notification) => (
    notification.id === id ? { ...notification, read: true } : notification
  )))
}

export function markAllNotificationsRead() {
  writeNotifications(readStoredNotifications().map((notification) => ({ ...notification, read: true })))
}

export { updateEvent }
