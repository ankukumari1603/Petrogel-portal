import { useState } from 'react'
import { FiSave, FiSettings } from 'react-icons/fi'
import './Settings.css'

function Settings() {
  const [settings, setSettings] = useState({ siteName: 'PETROGEL Plant & QC Portal', timezone: 'Asia/Kolkata', notifications: true, compactTables: false })
  const [notice, setNotice] = useState('')
  const update = (key, value) => setSettings((current) => ({ ...current, [key]: value }))
  return <div className="settings-page"><header className="settings-header"><div><h1>Settings</h1><p>Configure portal defaults for your plant team.</p></div><FiSettings /></header><section className="settings-panel"><label><span>Portal Name</span><input value={settings.siteName} onChange={(event) => update('siteName', event.target.value)} /></label><label><span>Timezone</span><select value={settings.timezone} onChange={(event) => update('timezone', event.target.value)}><option>Asia/Kolkata</option><option>UTC</option><option>Asia/Dubai</option></select></label><label className="setting-toggle"><input type="checkbox" checked={settings.notifications} onChange={(event) => update('notifications', event.target.checked)} /><span>Enable operational notifications</span></label><label className="setting-toggle"><input type="checkbox" checked={settings.compactTables} onChange={(event) => update('compactTables', event.target.checked)} /><span>Use compact data tables</span></label><button className="btn btn-primary" onClick={() => setNotice('Settings saved for this demo session.')}><FiSave /> Save Settings</button>{notice && <div className="data-notice" role="status">{notice}</div>}</section></div>
}
export default Settings