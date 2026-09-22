import { useContext } from 'react'
import { PortalDataContext } from './PortalContext.js'

export function usePortalData() {
  const value = useContext(PortalDataContext)
  if (!value) throw new Error('usePortalData must be used inside PortalDataProvider')
  return value
}