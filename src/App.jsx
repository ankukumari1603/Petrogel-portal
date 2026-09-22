import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ProductionInstruction from './pages/ProductionInstruction.jsx'
import SetupAudit from './pages/SetupAudit.jsx'
import RandomChecks from './pages/RandomChecks.jsx'
import PelletMachineReading from './pages/PelletMachineReading.jsx'
import FinalTestRelease from './pages/FinalTestRelease.jsx'
import WorkflowSignoff from './pages/WorkflowSignoff.jsx'
import Notifications from './pages/Notifications.jsx'
import AuditTrail from './pages/AuditTrail.jsx'
import UserManagement from './pages/UserManagement.jsx'
import ProductVariationMaster from './pages/ProductVariationMaster.jsx'
import OtherMasterData from './pages/OtherMasterData.jsx'
import SingleEntryDataFlow from './pages/SingleEntryDataFlow.jsx'
import LeadsPipeline from './pages/LeadsPipeline.jsx'
import DataModule from './pages/DataModule.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'
import QcModule from './pages/QcModule.jsx'
import { PortalDataProvider } from './data/PortalDataContext.jsx'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <PortalDataProvider>
        <div className="app-shell">
          <Sidebar />
          <main className="app-content">
            <Topbar />
            <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/production" element={<ProductionInstruction />} />
            <Route path="/customers" element={<DataModule type="customers" />} />
            <Route path="/formulations" element={<DataModule type="formulations" />} />
            <Route path="/production-management" element={<DataModule type="production" />} />
            <Route path="/setup-audit" element={<SetupAudit />} />
            <Route path="/random-checks" element={<RandomChecks />} />
            <Route path="/pellet-machine-reading" element={<PelletMachineReading />} />
            <Route path="/qc" element={<QcModule />} />
            <Route path="/release" element={<FinalTestRelease />} />
            <Route path="/workflow" element={<WorkflowSignoff />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/alerts" element={<DataModule type="alerts" />} />
            <Route path="/audit-trail" element={<AuditTrail />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/products" element={<ProductVariationMaster />} />
            <Route path="/product-master" element={<ProductVariationMaster />} />
            <Route path="/laboratory" element={<DataModule type="laboratory" />} />
            <Route path="/inventory" element={<DataModule type="inventory" />} />
            <Route path="/requirements" element={<DataModule type="requirements" />} />
            <Route path="/other-masters" element={<OtherMasterData />} />
            <Route path="/data-flow" element={<SingleEntryDataFlow />} />
            <Route path="/leads" element={<LeadsPipeline />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </PortalDataProvider>
    </BrowserRouter>
  )
}

export default App

