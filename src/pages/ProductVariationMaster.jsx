import { useMemo, useState } from 'react'
import { FiEdit2, FiLayers, FiPlus, FiToggleLeft } from 'react-icons/fi'
import { addAuditRecord } from '../data/auditStore.js'
import './ProductVariationMaster.css'

const categories = ['Petroleum Products', 'Industrial Lubricants', 'Process Materials']
const statuses = ['Active', 'Inactive']

export const seedProducts = [
  { code: 'PG-001', name: 'Petroleum Jelly', category: 'Petroleum Products', description: 'Semi-solid hydrocarbon blend for industrial and technical applications.', status: 'Active' },
  { code: 'PW-002', name: 'Paraffin Wax', category: 'Process Materials', description: 'Refined wax material for controlled industrial processing.', status: 'Active' },
  { code: 'IG-003', name: 'Industrial Grease', category: 'Industrial Lubricants', description: 'Industrial lubrication product for high-load equipment.', status: 'Active' },
  { code: 'HF-004', name: 'Hydraulic Fluid', category: 'Industrial Lubricants', description: 'Industrial hydraulic fluid for plant equipment systems.', status: 'Inactive' },
]

export const seedVariations = [
  { code: 'PG-001-SV', productCode: 'PG-001', name: 'Standard Viscosity', grade: 'Technical Grade', specification: 'Viscosity and appearance as per approved product sheet.', status: 'Active' },
  { code: 'PG-001-HD', productCode: 'PG-001', name: 'Heavy Duty', grade: 'Industrial Grade', specification: 'Higher body formulation for heavy-duty applications.', status: 'Active' },
  { code: 'PW-002-FP', productCode: 'PW-002', name: 'Fully Refined', grade: 'Refined Grade', specification: 'Controlled melting profile and low oil content.', status: 'Active' },
  { code: 'IG-003-HT', productCode: 'IG-003', name: 'High Temperature', grade: 'High Temp Grade', specification: 'High-temperature industrial grease formulation.', status: 'Active' },
  { code: 'HF-004-LF', productCode: 'HF-004', name: 'Low Foam', grade: 'Process Grade', specification: 'Low-foam hydraulic fluid for plant circulation.', status: 'Inactive' },
]

const blankProduct = { code: '', name: '', category: categories[0], description: '', status: 'Active' }
const blankVariation = { code: '', productCode: seedProducts[0].code, name: '', grade: '', specification: '', status: 'Active' }

function ProductVariationMaster() {
  const [products, setProducts] = useState(seedProducts)
  const [variations, setVariations] = useState(seedVariations)
  const [productForm, setProductForm] = useState(blankProduct)
  const [variationForm, setVariationForm] = useState(blankVariation)
  const [productEditCode, setProductEditCode] = useState(null)
  const [variationEditCode, setVariationEditCode] = useState(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [showVariationForm, setShowVariationForm] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [productCodeSearch, setProductCodeSearch] = useState('')
  const [variationSearch, setVariationSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [notice, setNotice] = useState('')

  const productNames = useMemo(() => products.reduce((map, product) => ({ ...map, [product.code]: product.name }), {}), [products])
  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(productSearch.toLowerCase()) && product.code.toLowerCase().includes(productCodeSearch.toLowerCase()) && (statusFilter === 'All' || product.status === statusFilter))
  const filteredVariations = variations.filter((variation) => `${variation.name} ${productNames[variation.productCode] || ''}`.toLowerCase().includes(variationSearch.toLowerCase()) && (statusFilter === 'All' || variation.status === statusFilter))

  const updateProductForm = (field) => (event) => setProductForm((previous) => ({ ...previous, [field]: event.target.value }))
  const updateVariationForm = (field) => (event) => setVariationForm((previous) => ({ ...previous, [field]: event.target.value }))

  const saveProduct = (event) => {
    event.preventDefault()
    if (!productForm.code || !productForm.name) return
    setProducts((previous) => productEditCode ? previous.map((product) => product.code === productEditCode ? productForm : product) : [productForm, ...previous])
    addAuditRecord({ user: 'System Admin', role: 'Admin', action: productEditCode ? 'Edit' : 'Create', module: 'Product & Variation Master', recordId: productForm.code, description: `${productEditCode ? 'Updated' : 'Created'} product ${productForm.name}.`, status: 'Completed' })
    setNotice(`${productEditCode ? 'Updated' : 'Added'} product ${productForm.name}.`)
    setShowProductForm(false); setProductEditCode(null); setProductForm(blankProduct)
  }

  const saveVariation = (event) => {
    event.preventDefault()
    if (!variationForm.code || !variationForm.name) return
    setVariations((previous) => variationEditCode ? previous.map((variation) => variation.code === variationEditCode ? variationForm : variation) : [variationForm, ...previous])
    addAuditRecord({ user: 'System Admin', role: 'Admin', action: variationEditCode ? 'Edit' : 'Create', module: 'Product & Variation Master', recordId: variationForm.code, description: `${variationEditCode ? 'Updated' : 'Created'} variation ${variationForm.name}.`, status: 'Completed' })
    setNotice(`${variationEditCode ? 'Updated' : 'Added'} variation ${variationForm.name}.`)
    setShowVariationForm(false); setVariationEditCode(null); setVariationForm(blankVariation)
  }

  const editProduct = (product) => { setProductEditCode(product.code); setProductForm(product); setShowProductForm(true) }
  const editVariation = (variation) => { setVariationEditCode(variation.code); setVariationForm(variation); setShowVariationForm(true) }
  const toggleProduct = (product) => { const status = product.status === 'Active' ? 'Inactive' : 'Active'; setProducts((previous) => previous.map((item) => item.code === product.code ? { ...item, status } : item)); addAuditRecord({ user: 'System Admin', role: 'Admin', action: 'Edit', module: 'Product & Variation Master', recordId: product.code, description: `${status === 'Active' ? 'Activated' : 'Deactivated'} product ${product.name}.`, status: 'Completed' }); setNotice(`${product.name} is now ${status.toLowerCase()}.`) }
  const toggleVariation = (variation) => { const status = variation.status === 'Active' ? 'Inactive' : 'Active'; setVariations((previous) => previous.map((item) => item.code === variation.code ? { ...item, status } : item)); addAuditRecord({ user: 'System Admin', role: 'Admin', action: 'Edit', module: 'Product & Variation Master', recordId: variation.code, description: `${status === 'Active' ? 'Activated' : 'Deactivated'} variation ${variation.name}.`, status: 'Completed' }); setNotice(`${variation.name} is now ${status.toLowerCase()}.`) }

  return (
    <div className="product-master-page">
      <header className="product-master-header"><div><h1>Product &amp; Variation Master</h1><p>Maintain the controlled product catalogue and approved manufacturing variations</p></div><div className="master-scope-badge"><FiLayers /> Local master data</div></header>
      {notice && <div className="master-notice" role="status">{notice}</div>}

      {showProductForm && <section className="master-panel master-form-panel"><div className="panel-header"><FiLayers className="panel-header-icon" /><h2>{productEditCode ? 'Edit Product' : 'Add Product'}</h2></div><form className="master-form-grid" onSubmit={saveProduct}><label className="form-field"><span>Product Code</span><input required value={productForm.code} onChange={updateProductForm('code')} disabled={Boolean(productEditCode)} /></label><label className="form-field"><span>Product Name</span><input required value={productForm.name} onChange={updateProductForm('name')} /></label><label className="form-field"><span>Product Category</span><select value={productForm.category} onChange={updateProductForm('category')}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="form-field"><span>Status</span><select value={productForm.status} onChange={updateProductForm('status')}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><label className="form-field master-full-field"><span>Description</span><textarea rows={3} value={productForm.description} onChange={updateProductForm('description')} /></label><div className="form-actions master-form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowProductForm(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save Product</button></div></form></section>}

      {showVariationForm && <section className="master-panel master-form-panel"><div className="panel-header"><FiLayers className="panel-header-icon" /><h2>{variationEditCode ? 'Edit Product Variation' : 'Add Product Variation'}</h2></div><form className="master-form-grid" onSubmit={saveVariation}><label className="form-field"><span>Variation Code</span><input required value={variationForm.code} onChange={updateVariationForm('code')} disabled={Boolean(variationEditCode)} /></label><label className="form-field"><span>Product</span><select value={variationForm.productCode} onChange={updateVariationForm('productCode')}>{products.map((product) => <option key={product.code} value={product.code}>{product.name}</option>)}</select></label><label className="form-field"><span>Variation Name</span><input required value={variationForm.name} onChange={updateVariationForm('name')} /></label><label className="form-field"><span>Grade / Type</span><input value={variationForm.grade} onChange={updateVariationForm('grade')} /></label><label className="form-field"><span>Status</span><select value={variationForm.status} onChange={updateVariationForm('status')}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><label className="form-field master-full-field"><span>Specification</span><textarea rows={3} value={variationForm.specification} onChange={updateVariationForm('specification')} /></label><div className="form-actions master-form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowVariationForm(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save Variation</button></div></form></section>}

      <section className="master-panel"><div className="panel-header master-list-header"><div className="panel-header-title"><FiLayers className="panel-header-icon" /><h2>Product Master</h2></div><button type="button" className="btn btn-primary master-add-button" onClick={() => { setProductEditCode(null); setProductForm(blankProduct); setShowProductForm(true) }}><FiPlus /> Add Product</button></div><div className="master-filter-grid"><label className="form-field"><span>Product Name</span><input type="search" placeholder="Search product" value={productSearch} onChange={(event) => setProductSearch(event.target.value)} /></label><label className="form-field"><span>Product Code</span><input type="search" placeholder="Search code" value={productCodeSearch} onChange={(event) => setProductCodeSearch(event.target.value)} /></label><label className="form-field"><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label></div><div className="master-table-wrap"><table className="master-table"><thead><tr><th>Product Code</th><th>Product Name</th><th>Product Category</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filteredProducts.map((product) => <tr key={product.code}><td>{product.code}</td><td><strong>{product.name}</strong></td><td>{product.category}</td><td>{product.description}</td><td><span className={`status-badge master-status-${product.status.toLowerCase()}`}>{product.status}</span></td><td><div className="master-actions"><button type="button" className="icon-action" title="Edit Product" onClick={() => editProduct(product)}><FiEdit2 /></button><button type="button" className="text-action" onClick={() => toggleProduct(product)}>{product.status === 'Active' ? 'Deactivate' : 'Activate'}</button></div></td></tr>)}</tbody></table></div></section>

      <section className="master-panel"><div className="panel-header master-list-header"><div className="panel-header-title"><FiToggleLeft className="panel-header-icon" /><h2>Product Variations</h2></div><button type="button" className="btn btn-primary master-add-button" onClick={() => { setVariationEditCode(null); setVariationForm(blankVariation); setShowVariationForm(true) }}><FiPlus /> Add Variation</button></div><div className="variation-filter-row"><label className="form-field"><span>Variation / Product</span><input type="search" placeholder="Search variation" value={variationSearch} onChange={(event) => setVariationSearch(event.target.value)} /></label></div><div className="master-table-wrap"><table className="master-table variation-table"><thead><tr><th>Variation Code</th><th>Product</th><th>Variation Name</th><th>Grade / Type</th><th>Specification</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filteredVariations.map((variation) => <tr key={variation.code}><td>{variation.code}</td><td>{productNames[variation.productCode]}</td><td><strong>{variation.name}</strong></td><td>{variation.grade}</td><td>{variation.specification}</td><td><span className={`status-badge master-status-${variation.status.toLowerCase()}`}>{variation.status}</span></td><td><div className="master-actions"><button type="button" className="icon-action" title="Edit Variation" onClick={() => editVariation(variation)}><FiEdit2 /></button><button type="button" className="text-action" onClick={() => toggleVariation(variation)}>{variation.status === 'Active' ? 'Deactivate' : 'Activate'}</button></div></td></tr>)}</tbody></table></div></section>
    </div>
  )
}

export default ProductVariationMaster
