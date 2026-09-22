import { useEffect, useState } from 'react'
import { portalData } from './portalData.js'
import { PortalDataContext } from './PortalContext.js'
import { api } from '../services/api.js'
import { toArray } from '../utils/arrayUtils.js'

const STORAGE_KEY = 'petrogel-portal-demo-data'
const apiTypes = Object.keys(portalData)
const seedRecords = () => Object.fromEntries(Object.entries(portalData).map(([key, config]) => [key, config.seed.map((record) => ({ ...record }))]))
const sanitizeRecords = (source) => Object.fromEntries(apiTypes.map((type) => [type, toArray(source[type])]))

function loadLocalRecords() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved ? sanitizeRecords({ ...seedRecords(), ...JSON.parse(saved) }) : seedRecords()
  } catch {
    return seedRecords()
  }
}

async function fetchRemoteRecords() {
  const entries = await Promise.all(apiTypes.map(async (type) => [type, await api.list(type)]))
  return sanitizeRecords(Object.fromEntries(entries))
}

async function syncChanges(type, previous, next) {
  if (!apiTypes.includes(type) || type === 'alerts') return next
  const previousById = new Map(previous.map((item) => [item.id, item]))
  const nextById = new Map(next.map((item) => [item.id, item]))
  const synced = []
  for (const item of next) {
    const oldItem = previousById.get(item.id)
    if (!oldItem) synced.push(type === 'alerts' ? item : await api.create(type, item))
    else if (JSON.stringify(oldItem) !== JSON.stringify(item)) synced.push(await api.update(type, item.id, item))
    else synced.push(item)
  }
  await Promise.all(previous.filter((item) => !nextById.has(item.id)).map((item) => api.remove(type, item.id)))
  return synced
}

export function PortalDataProvider({ children }) {
  const [records, setRecords] = useState(loadLocalRecords)
  const [loading, setLoading] = useState(true)
  const [backendStatus, setBackendStatus] = useState('connecting')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetchRemoteRecords().then((remote) => { if (active) { setRecords(remote); setBackendStatus('connected'); setError('') } }).catch((connectionError) => { if (active) { setBackendStatus('offline'); setError(`Backend unavailable. Using demo data: ${connectionError.message}`) } }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => { if (!loading) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records)) }, [loading, records])

  const updateRecords = async (type, updater) => {
    const previous = toArray(records[type])
    const next = updater(previous)
    setRecords((current) => ({ ...current, [type]: next }))
    try {
      const synced = await syncChanges(type, previous, next)
      setRecords((current) => ({ ...current, [type]: synced }))
      setBackendStatus('connected')
      setError('')
      return synced
    } catch (syncError) {
      setBackendStatus('offline')
      setError(`Saved locally, but the backend update failed: ${syncError.message}`)
      return next
    }
  }

  return <PortalDataContext.Provider value={{ records, updateRecords, loading, backendStatus, error }}>{children}</PortalDataContext.Provider>
}
