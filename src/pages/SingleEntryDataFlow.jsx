import { useMemo, useState } from 'react'
import { FiArrowRight, FiDatabase, FiGitBranch } from 'react-icons/fi'
import { initialData } from './OtherMasterData.jsx'
import { seedProducts, seedVariations } from './ProductVariationMaster.jsx'
import { productionInstructions } from '../data/mockData.js'
import './SingleEntryDataFlow.css'

const stages = [
  { name: 'Customer', key: 'customer' },
  { name: 'Product & Variation', key: 'product' },
  { name: 'Raw Material', key: 'rawMaterial' },
  { name: 'Production Instruction', key: 'production' },
  { name: 'QC Testing', key: 'qc' },
  { name: 'Final Test', key: 'final' },
  { name: 'Batch Release', key: 'release' },
  { name: 'Invoice', key: 'invoice' },
]

function SingleEntryDataFlow() {
  const [customerId, setCustomerId] = useState(initialData.Customers[0].id)
  const [productCode, setProductCode] = useState(seedProducts[0].code)
  const [variationCode, setVariationCode] = useState(seedVariations[0].code)
  const [materialId, setMaterialId] = useState(initialData['Raw Materials'][0].id)
  const [batchId, setBatchId] = useState(productionInstructions[0].id)

  const selectedCustomer = initialData.Customers.find((item) => item.id === customerId)
  const selectedProduct = seedProducts.find((item) => item.code === productCode)
  const selectedVariation = seedVariations.find((item) => item.code === variationCode)
  const selectedMaterial = initialData['Raw Materials'].find((item) => item.id === materialId)
  const selectedBatch = productionInstructions.find((item) => item.id === batchId)
  const linkedVariations = seedVariations.filter((variation) => variation.productCode === productCode)

  const progress = useMemo(() => {
    if (selectedBatch?.status === 'Released') return 7
    if (selectedBatch?.status === 'Completed') return 6
    if (selectedBatch?.status === 'In QC') return 4
    if (selectedBatch?.status === 'Draft') return 2
    return 1
  }, [selectedBatch])

  const stageStatus = (index) => {
    if (index < progress) return 'Completed'
    if (index === progress) return 'In Progress'
    return 'Pending'
  }

  const summary = [
    ['Customer', selectedCustomer?.name],
    ['Product', selectedProduct?.name],
    ['Variation', selectedVariation?.name],
    ['Batch / Job ID', selectedBatch?.id],
    ['Current Stage', stages[progress]?.name || 'Invoice'],
    ['QC Status', progress >= 4 ? 'In QC / Reviewed' : 'Pending QC'],
    ['Release Status', progress >= 7 ? 'Released' : 'Pending Release'],
    ['Billing Status', progress >= 7 ? 'Ready for Invoice' : 'Not Started'],
  ]

  return (
    <div className="single-flow-page">
      <header className="single-flow-header"><div><h1>Single-Entry Data Flow</h1><p>Enter or select master data once and follow it through the PETROGEL business process</p></div><div className="flow-reference-badge"><FiDatabase /> Controlled process record</div></header>

      <section className="single-flow-panel flow-selection-panel"><div className="panel-header"><FiDatabase className="panel-header-icon" /><h2>Linked Master Data</h2></div><div className="flow-selection-grid"><label className="form-field"><span>Customer</span><select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>{initialData.Customers.filter((item) => item.status === 'Active').map((item) => <option key={item.id} value={item.id}>{item.id} · {item.name}</option>)}</select></label><label className="form-field"><span>Product</span><select value={productCode} onChange={(event) => { setProductCode(event.target.value); const nextVariation = seedVariations.find((item) => item.productCode === event.target.value); if (nextVariation) setVariationCode(nextVariation.code) }}>{seedProducts.filter((item) => item.status === 'Active').map((item) => <option key={item.code} value={item.code}>{item.code} · {item.name}</option>)}</select></label><label className="form-field"><span>Product Variation</span><select value={variationCode} onChange={(event) => setVariationCode(event.target.value)}>{linkedVariations.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.name}</option>)}</select></label><label className="form-field"><span>Raw Material</span><select value={materialId} onChange={(event) => setMaterialId(event.target.value)}>{initialData['Raw Materials'].filter((item) => item.status === 'Active').map((item) => <option key={item.id} value={item.id}>{item.id} · {item.name}</option>)}</select></label><label className="form-field"><span>Production Instruction / Batch</span><select value={batchId} onChange={(event) => setBatchId(event.target.value)}>{productionInstructions.map((item) => <option key={item.id} value={item.id}>{item.id} · {item.productName}</option>)}</select></label></div><div className="flow-linked-note">Raw material linked: <strong>{selectedMaterial?.name}</strong> · Supplier: {selectedMaterial?.supplier}</div></section>

      <section className="single-flow-panel"><div className="panel-header"><FiGitBranch className="panel-header-icon" /><h2>Process Summary</h2></div><div className="flow-summary-grid">{summary.map(([label, value]) => <div className="flow-summary-item" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></section>

      <section className="single-flow-panel"><div className="panel-header"><FiGitBranch className="panel-header-icon" /><h2>Business Process Timeline</h2></div><div className="flow-timeline">{stages.map((stage, index) => <article className={`flow-stage flow-stage-${stageStatus(index).toLowerCase().replace(' ', '-')}`} key={stage.name}><div className="flow-stage-marker">{index + 1}</div><div className="flow-stage-body"><div className="flow-stage-title"><strong>{stage.name}</strong><span className="flow-status-badge">{stageStatus(index)}</span></div><p>{index === 0 ? selectedCustomer?.company : index === 1 ? `${selectedProduct?.name} · ${selectedVariation?.name}` : index === 2 ? `${selectedMaterial?.name} from ${selectedMaterial?.supplier}` : index === 3 ? `${selectedBatch?.id} · ${selectedBatch?.quantity} · ${selectedBatch?.machine}` : index === 4 ? 'Setup audit, random checks and in-process QC linked.' : index === 5 ? 'Final QC decision linked to batch record.' : index === 6 ? 'Release gate follows final QC and workflow sign-off.' : 'Invoice can be created from the released batch.'}</p></div>{index < stages.length - 1 && <FiArrowRight className="flow-arrow" />}</article>)}</div></section>
    </div>
  )
}

export default SingleEntryDataFlow
